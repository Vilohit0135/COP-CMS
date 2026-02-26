import { auth } from "@clerk/nextjs/server"
import { connectDB } from "@/lib/db"
import User from "@/models/User"

export async function GET(req) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return Response.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    await connectDB()

    const user = await User.findOne({ clerkId: userId })

    if (!user) {
      return Response.json(
        {
          message: "User not found in database",
          clerkId: userId,
        },
        { status: 404 }
      )
    }

    return Response.json({
      clerkId: user.clerkId,
      email: user.email,
      role: user.role,
      access: user.access,
      isActive: user.isActive,
      createdAt: user.createdAt,
    })
  } catch (err) {
    console.error("Debug error:", err)
    return Response.json(
      { error: err.message },
      { status: 500 }
    )
  }
}
