import { connectDB } from "../../../../../lib/db"
import DegreeType from "../../../../../models/degreeType"

export async function GET(req, { params }) {
  await connectDB()
  const degree = await DegreeType.findById(params.id)
  return Response.json(degree)
}

export async function PUT(req, context) {
  await connectDB();

  const { id } = await context.params;   // 🔥 IMPORTANT FIX
  const body = await req.json();

  const updated = await DegreeType.findByIdAndUpdate(
    id,
    body,
    { returnDocument: "after" }   // 🔥 also fixing mongoose warning
  );

  return Response.json(updated);
}

export async function DELETE(req, context) {
  await connectDB();

  const { id } = await context.params;   // 🔥 IMPORTANT FIX

  console.log("Deleting ID:", id);

  const deleted = await DegreeType.findByIdAndDelete(id);

  console.log("Deleted DegreeType:", deleted);

  return Response.json({ success: true });
}