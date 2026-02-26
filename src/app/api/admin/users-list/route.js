import { connectDB } from "@/lib/db"
import User from "@/models/User"

export async function GET(req) {
  try {
    await connectDB()

    const users = await User.find({ isActive: true })
      .select("clerkId email role access isActive createdAt")
      .lean()

    return Response.json({
      users: users.map(u => ({
        // Use Clerk ID for userId because activities.userId stores Clerk IDs
        userId: u.clerkId || (u._id ? String(u._id) : null),
        userName: u.email?.split("@")[0] || u.email,
        userEmail: u.email,
        role: u.role,
      })),
    })
  } catch (err) {
    console.error("Fetch users error:", err)
    return Response.json(
      { error: err.message },
      { status: 500 }
    )
  }
}
