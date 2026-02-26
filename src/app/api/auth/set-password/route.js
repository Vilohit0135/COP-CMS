import { NextResponse } from "next/server"
import crypto from "crypto"
import { clerkClient } from "@clerk/nextjs/server"
import Invite from "@/models/Invite"
import User from "@/models/User"
import { connectDB } from "@/lib/db"

// Constant-time string comparison to prevent timing attacks
function constantTimeCompare(a, b) {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

export async function POST(req) {
  try {
    await connectDB()

    const body = await req.json()
    const { email, token, password } = body

    if (!email || !token || !password) {
      return NextResponse.json(
        { error: "Email, token, and password are required" },
        { status: 400 }
      )
    }

    // Find the invite
    const invite = await Invite.findOne({ email })
    if (!invite) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      )
    }

    // Check if token is expired
    if (new Date() > invite.passwordSetupExpiresAt) {
      await Invite.deleteOne({ _id: invite._id })
      return NextResponse.json(
        { error: "Invitation has expired. Please request a new one." },
        { status: 410 }
      )
    }

    // Verify token using constant-time comparison
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex")

    if (!constantTimeCompare(tokenHash, invite.passwordSetupTokenHash)) {
      return NextResponse.json(
        { error: "Invalid invitation token" },
        { status: 401 }
      )
    }

    // Create or update user in Clerk
    const clerk = await clerkClient()
    let clerkUser

    try {
      // Try to find existing user
      const existingUsers = await clerk.users.getUserList({
        emailAddress: [email],
      })

      if (existingUsers.data.length > 0) {
        // Update existing user
        clerkUser = existingUsers.data[0]
        // Update password in Clerk
        await clerk.users.updateUser(clerkUser.id, {
          password,
        })
        console.log(`✓ Updated Clerk user: ${clerkUser.id}`)
      } else {
        // Create new user in Clerk
        try {
          clerkUser = await clerk.users.createUser({
            emailAddress: [email],
            password,
          })
          console.log(`✓ Created Clerk user: ${clerkUser.id}`)
        } catch (createErr) {
          console.error("❌ Clerk createUser error:", {
            message: createErr.message,
            code: createErr.code,
            status: createErr.status,
            errors: createErr.errors,
          })
          throw createErr
        }
      }
    } catch (clerkErr) {
      console.error("❌ Clerk error:", {
        message: clerkErr.message,
        code: clerkErr.code,
        status: clerkErr.status,
        errors: clerkErr.errors,
        fullError: clerkErr,
      })
      return NextResponse.json(
        { error: `Failed to create/update user account: ${clerkErr.message}` },
        { status: 500 }
      )
    }

    // Update or create User document in MongoDB
    const user = await User.findOneAndUpdate(
      { clerkId: clerkUser.id },
      {
        clerkId: clerkUser.id,
        email,
        role: invite.role, // Use role from invite ("admin" or "viewer")
        access: invite.access,
        isActive: true,
        metadata: {
          invitedAt: invite.createdAt,
          acceptedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    )

    // Mark invite as accepted and delete it
    await Invite.deleteOne({ _id: invite._id })

    return NextResponse.json(
      {
        success: true,
        message: "Password set successfully. You can now log in.",
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    )
  } catch (err) {
    console.error("❌ Set password error:", err.message)
    return NextResponse.json(
      { error: "Failed to set password" },
      { status: 500 }
    )
  }
}
