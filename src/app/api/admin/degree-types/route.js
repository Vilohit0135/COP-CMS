import { connectDB } from "../../../../lib/db";
import DegreeType from "../../../../models/degreeType";

// CREATE
export async function POST(req) {
  await connectDB();
  const body = await req.json();

  const slug = body.name
    .toLowerCase()
    .replace(/\s+/g, "-");

  const degree = await DegreeType.create({
    ...body,
    slug,
  });

  return Response.json(degree);
}


// READ ALL
export async function GET() {
  await connectDB()
  const degrees = await DegreeType.find().sort({ order: 1 })
  return Response.json(degrees)
}