import { connectDB } from "../../../../../lib/db"
import Course from "../../../../../models/course"

export async function GET(req, { params }) {
  await connectDB()
  const course = await Course.findById(params.id).populate("degreeTypeId")
  return Response.json(course)
}

export async function PUT(req, context) {
  await connectDB();

  const { id } = await context.params;
  const body = await req.json();

  const updated = await Course.findByIdAndUpdate(
    id,
    body,
    { returnDocument: "after" }
  ).populate("degreeTypeId");

  return Response.json(updated);
}

export async function DELETE(req, context) {
  await connectDB();

  const { id } = await context.params;

  const deleted = await Course.findByIdAndDelete(id);

  return Response.json({ success: true });
}