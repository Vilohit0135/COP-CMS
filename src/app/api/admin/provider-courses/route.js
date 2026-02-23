import { connectDB } from "../../../../lib/db";
import ProviderCourse from "../../../../models/providerCourse"

export async function POST(req) {
  await connectDB()
  const body = await req.json()
  console.log("[provider-courses POST] body:", body)
  const entry = await ProviderCourse.create(body)
    .then((doc) => doc.populate(["degreeTypeId", "courseId", "specializationId"]))

  console.log("[provider-courses POST] created:", entry)
  return Response.json(entry)
}

export async function GET() {
  await connectDB()

  const entries = await ProviderCourse.find()
    .populate("degreeTypeId")
    .populate("courseId")
    .populate("specializationId")

  return Response.json(entries)
}