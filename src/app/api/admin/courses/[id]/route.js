import { connectDB } from "../../../../../lib/db"
import Course from "../../../../../models/course"
import { getClerkUserInfo } from "../../../../../lib/clerkHelper";
import { logActivity } from "../../../../../lib/activityLogger";
import DegreeType from "../../../../../models/degreeType"

export async function GET(req, { params }) {
  await connectDB()
  const course = await Course.findById(params.id).populate("degreeTypeId")
  return Response.json(course)
}

export async function PUT(req, context) {
  const { userId, userName, userEmail } = await getClerkUserInfo();
  
  await connectDB();

  const { id } = await context.params;
  const body = await req.json();

  const updated = await Course.findByIdAndUpdate(
    id,
    body,
    { new: true }
  ).populate("degreeTypeId");

  // Log the update activity
  if (userId) {
    await logActivity({
      userId,
      userName,
      userEmail,
      action: "update",
      section: "courses",
      itemId: id,
      itemName: updated.name,
      details: `Updated course: ${JSON.stringify(body)}`,
    });
  }

  return Response.json(updated);
}

export async function DELETE(req, context) {
  const { userId, userName, userEmail } = await getClerkUserInfo();
  
  await connectDB();

  const { id } = await context.params;

  const deleted = await Course.findByIdAndDelete(id);

  // Log the delete activity
  if (userId) {
    await logActivity({
      userId,
      userName,
      userEmail,
      action: "delete",
      section: "courses",
      itemId: id,
      itemName: deleted.name,
      details: `Deleted course`,
    });
  }

  return Response.json({ success: true });
}