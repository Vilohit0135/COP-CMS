import { connectDB } from "@/lib/db"
import Lead from "@/models/leads"

export async function GET(req) {
  try {
    await connectDB()

    const data = await Lead.aggregate([
      {
        $group: {
          _id: "$source",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    return Response.json(data)
  } catch (error) {
    console.error("Leads by source error:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
