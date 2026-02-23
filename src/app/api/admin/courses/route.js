import { connectDB } from "../../../../lib/db";
import Course from "../../../../models/course"

// CREATE
export async function POST(req) {
  await connectDB()
  const body = await req.json()

  const course = await Course.create(body)

  return Response.json(course)
}

// READ ALL
export async function GET() {
  await connectDB()

  const courses = await Course.find()
    .populate("degreeTypeId")

  return Response.json(courses)
}