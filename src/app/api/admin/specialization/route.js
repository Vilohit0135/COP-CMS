import { connectDB } from "../../../../lib/db";
import Specialization from "../../../../models/specialization"
import Course from "../../../../models/course" // Import to register model for populate

export async function POST(req) {
  await connectDB()
  const body = await req.json()
  const slug = body.name
    .toLowerCase()
    .replace(/\s+/g, "-");
  const specialization = await Specialization.create({...body, slug})
  await specialization.populate("courseId")
  return Response.json(specialization)
}

export async function GET(req) {
  await connectDB()
  const url = new URL(req.url)
  const courseId = url.searchParams.get("courseId")

  const filter = {}
  if (courseId) filter.courseId = courseId

  const specs = await Specialization.find(filter)
    .populate("courseId")
    .sort({ order: 1 })

  return Response.json(specs)
}