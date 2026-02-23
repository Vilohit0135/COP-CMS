import { connectDB } from "../../../../../lib/db"
import Specialization from "../../../../../models/specialization"
import { getClerkUserInfo } from "../../../../../lib/clerkHelper";
import { logActivity } from "../../../../../lib/activityLogger";

export async function GET(req, { params }) {
  await connectDB()
  const specialization = await Specialization.findById(params.id).populate("courseId")
  return Response.json(specialization)
}

export async function PUT(req, context) {
  const { userId, userName, userEmail } = await getClerkUserInfo();
  
  await connectDB();

  const { id } = await context.params;
  const body = await req.json();

  const updated = await Specialization.findByIdAndUpdate(
    id,
    body,
    { new: true }
  ).populate("courseId");

  // Log the update activity
  if (userId) {
    await logActivity({
      userId,
      userName,
      userEmail,
      action: "update",
      section: "specializations",
      itemId: id,
      itemName: updated.name,
      details: `Updated specialization: ${JSON.stringify(body)}`,
    });
  }

  return Response.json(updated);
}

export async function DELETE(req, context) {
  const { userId, userName, userEmail } = await getClerkUserInfo();
  
  await connectDB();

  const { id } = await context.params;

  const deleted = await Specialization.findByIdAndDelete(id);

  // Log the delete activity
  if (userId) {
    await logActivity({
      userId,
      userName,
      userEmail,
      action: "delete",
      section: "specializations",
      itemId: id,
      itemName: deleted.name,
      details: `Deleted specialization`,
    });
  }

  return Response.json({ success: true });
}