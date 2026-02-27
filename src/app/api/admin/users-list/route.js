import { connectDB } from "@/lib/db"
import User from "@/models/User"

export async function GET(req) {
  try {
    await connectDB()

    const users = await User.find({ isActive: true })
      .select("clerkId _id email role access isActive createdAt")
      .lean()

    const mappedUsers = users.map(u => {
      const userId = u.clerkId || (u._id ? String(u._id) : null);
      console.log("User mapping:", { clerkId: u.clerkId, _id: u._id, resultingUserId: userId });
      return {
        userId: userId,
        userName: u.email?.split("@")[0] || u.email,
        userEmail: u.email,
        role: u.role,
        access: u.access || [],
      };
    });

    console.log("Final mapped users:", mappedUsers);

    return Response.json({
      users: mappedUsers,
    })
  } catch (err) {
    console.error("Fetch users error:", err)
    return Response.json(
      { error: err.message },
      { status: 500 }
    )
  }
}
