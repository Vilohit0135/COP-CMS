import { connectDB } from "../../../../../lib/db"
import ProviderCourse from "../../../../../models/providerCourse"

export async function GET(req, { params }) {
  await connectDB()
  const { id } = await params
  const providerCourse = await ProviderCourse.findById(id)
    .populate("degreeTypeId")
    .populate("courseId")
    .populate("specializationId")
  return Response.json(providerCourse)
}

export async function PUT(req, { params }) {
  await connectDB()
  const { id } = await params
  const body = await req.json()
  console.log("[provider-courses PUT] id:", id)
  console.log("[provider-courses PUT] body:", body)

  const updated = await ProviderCourse.findByIdAndUpdate(
    id,
    body,
    { returnDocument: "after", runValidators: true }
  )
    .populate("degreeTypeId")
    .populate("courseId")
    .populate("specializationId")

  console.log("[provider-courses PUT] updated:", updated)

  return Response.json(updated)
}

export async function DELETE(req, { params }) {
  await connectDB()
  const { id } = await params
  await ProviderCourse.findByIdAndDelete(id)
  return Response.json({ success: true })
}