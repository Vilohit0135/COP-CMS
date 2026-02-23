import { connectDB } from "../../../../../lib/db"
import Specialization from "../../../../../models/specialization"

export async function GET(req, { params }) {
  await connectDB()
  const specialization = await Specialization.findById(params.id).populate("courseId")
  return Response.json(specialization)
}

export async function PUT(req, context) {
  await connectDB();

  const { id } = await context.params;
  const body = await req.json();

  const updated = await Specialization.findByIdAndUpdate(
    id,
    body,
    { returnDocument: "after" }
  ).populate("courseId");

  return Response.json(updated);
}

export async function DELETE(req, context) {
  await connectDB();

  const { id } = await context.params;

  const deleted = await Specialization.findByIdAndDelete(id);

  return Response.json({ success: true });
}