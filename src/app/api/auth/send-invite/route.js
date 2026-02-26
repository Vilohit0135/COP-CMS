import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import crypto from "crypto"
import Invite from "@/models/Invite"
import { connectDB } from "@/lib/db"

export async function POST(req) {
  try {
    await connectDB()

    const body = await req.json()
    const { email, access = [], role = "viewer" } = body

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Generate raw token (send in email)
    const rawToken = crypto.randomBytes(32).toString("hex")

    // Hash token for storage (verify later using constant-time comparison)
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex")

    // Token valid for 72 hours
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000)

    // Create or update invite
    let invite = await Invite.findOneAndUpdate(
      { email },
      {
        access,
        role,
        passwordSetupTokenHash: tokenHash,
        passwordSetupExpiresAt: expiresAt,
        status: "pending",
      },
      { upsert: true, new: true }
    )

    // Send email with set-password link
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const setPasswordLink = `${baseUrl}/set-password?email=${encodeURIComponent(
      email
    )}&token=${rawToken}`

    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@cop.local",
      to: email,
      subject: "You are invited to COP CMS Admin",
      html: `
        <h2>You've been invited to COP CMS</h2>
        <p>You were invited to join the admin dashboard.</p>
        <p><a href="${setPasswordLink}">Set your password here</a> (valid for 72 hours)</p>
        <p>If the link doesn't work, paste this token on the Set Password page:</p>
        <p><code style="font-size:12px;word-break:break-all;background:#f0f0f0;padding:8px;">${rawToken}</code></p>
      `,
    })

    return NextResponse.json(
      {
        success: true,
        message: "Invitation sent successfully",
        invite: {
          email: invite.email,
          role: invite.role,
          access: invite.access,
          status: invite.status,
        },
      },
      { status: 201 }
    )
  } catch (err) {
    console.error("❌ Send invite error:", err.message)
    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    )
  }
}
