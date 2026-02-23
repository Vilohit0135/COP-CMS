import { connectDB } from "../../../../../lib/db"
import DegreeType from "../../../../../models/degreeType"
import { getClerkUserInfo } from "../../../../../lib/clerkHelper";
import { logActivity } from "../../../../../lib/activityLogger";

export async function GET(req, { params }) {
  await connectDB()
  const degree = await DegreeType.findById(params.id)
  return Response.json(degree)
}

export async function PUT(req, context) {
  const { userId, userName, userEmail } = await getClerkUserInfo();
  
  await connectDB();

  const { id } = await context.params;
  const body = await req.json();

  const updated = await DegreeType.findByIdAndUpdate(
    id,
    body,
    { new: true }
  );

  // Log the update activity
  if (userId) {
    await logActivity({
      userId,
      userName,
      userEmail,
      action: "update",
      section: "degree-types",
      itemId: id,
      itemName: updated.name,
      details: `Updated degree type: ${JSON.stringify(body)}`,
    });
  }

  return Response.json(updated);
}

export async function DELETE(req, context) {
  const { userId, userName, userEmail } = await getClerkUserInfo();
  
  await connectDB();

  const { id } = await context.params;

  console.log("Deleting ID:", id);

  const deleted = await DegreeType.findByIdAndDelete(id);

  console.log("Deleted DegreeType:", deleted);

  // Log the delete activity
  if (userId) {
    await logActivity({
      userId,
      userName,
      userEmail,
      action: "delete",
      section: "degree-types",
      itemId: id,
      itemName: deleted.name,
      details: `Deleted degree type`,
    });
  }

  return Response.json({ success: true });
}