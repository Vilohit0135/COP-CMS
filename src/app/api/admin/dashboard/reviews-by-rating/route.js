import { connectDB } from "@/lib/db"
import Review from "@/models/review"

export async function GET(req) {
  try {
    await connectDB()

    const data = await Review.aggregate([
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    return Response.json(data)
  } catch (error) {
    console.error("Reviews by rating error:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
