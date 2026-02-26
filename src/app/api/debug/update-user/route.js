import { connectDB } from "@/lib/db"
import User from "@/models/User"

export async function POST(req) {
  try {
    await connectDB()

    const result = await User.findOneAndUpdate(
      { clerkId: "user_3A4AEIyycZYcWvtAtkWo9CiG9DO" },
      {
        $set: {
          access: [
            "pages",
            "blogs",
            "providers",
            "courses",
            "specializations",
            "leads",
            "reviews",
            "users",
            "activities",
            "degree-types",
            "provider-courses",
            "home-hero-section",
            "home-industry-experts-section",
            "home-program-experts-section",
            "home-questions-section",
            "navbar",
          ],
        },
      },
      { new: true }
    )

    return Response.json({
      message: "User updated successfully",
      user: result,
    })
  } catch (err) {
    console.error("Update error:", err)
    return Response.json(
      { error: err.message },
      { status: 500 }
    )
  }
}
