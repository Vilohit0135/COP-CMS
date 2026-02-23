import { connectDB } from "../../../../lib/db";
import DegreeType from "../../../../models/degreeType";
import { getClerkUserInfo } from "../../../../lib/clerkHelper";
import { logActivity } from "../../../../lib/activityLogger";

// CREATE
export async function POST(req) {
  const { userId, userName, userEmail } = await getClerkUserInfo();
  
  await connectDB();
  const body = await req.json();

  const slug = body.name
    .toLowerCase()
    .replace(/\s+/g, "-");

  const degree = await DegreeType.create({
    ...body,
    slug,
  });

  // Log the create activity
  if (userId) {
    await logActivity({
      userId,
      userName,
      userEmail,
      action: "create",
      section: "degree-types",
      itemId: degree._id,
      itemName: degree.name,
      details: `Created new degree type: ${degree.name}`,
    });
  }

  return Response.json(degree);
}


// READ ALL
export async function GET() {
  await connectDB()
  const degrees = await DegreeType.find().sort({ order: 1 })
  
  return Response.json(degrees)
}