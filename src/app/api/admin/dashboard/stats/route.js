import { connectDB } from "@/lib/db"
import Course from "@/models/course"
import Provider from "@/models/provider"
import Lead from "@/models/leads"
import Review from "@/models/review"

export async function GET(req) {
  try {
    await connectDB()

    const [courses, providers, leads, reviews] = await Promise.all([
      Course.countDocuments(),
      Provider.countDocuments(),
      Lead.countDocuments(),
      Review.countDocuments(),
    ])

    return Response.json({
      courses,
      providers,
      leads,
      reviews,
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
