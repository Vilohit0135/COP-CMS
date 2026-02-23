import { connectDB } from "../../../../../lib/db"
import ProviderCourse from "../../../../../models/providerCourse"
import { getClerkUserInfo } from "../../../../../lib/clerkHelper";
import { logActivity } from "../../../../../lib/activityLogger";

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
  const { userId, userName, userEmail } = await getClerkUserInfo();
  
  await connectDB()
  const { id } = await params
  const body = await req.json()
  console.log("[provider-courses PUT] id:", id)
  console.log("[provider-courses PUT] body:", body)

  const updated = await ProviderCourse.findByIdAndUpdate(
    id,
    body,
    { new: true, runValidators: true }
  )
    .populate("degreeTypeId")
    .populate("courseId")
    .populate("specializationId")

  console.log("[provider-courses PUT] updated:", updated)

  // Log the update activity
  if (userId) {
    await logActivity({
      userId,
      userName,
      userEmail,
      action: "update",
      section: "provider-courses",
      itemId: id,
      itemName: updated.providerName || "Provider Course",
      details: `Updated provider course: ${JSON.stringify(body)}`,
    });
  }

  return Response.json(updated)
}

export async function DELETE(req, { params }) {
  const { userId, userName, userEmail } = await getClerkUserInfo();
  
  await connectDB()
  const { id } = await params
  const deleted = await ProviderCourse.findByIdAndDelete(id)

  // Log the delete activity
  if (userId) {
    await logActivity({
      userId,
      userName,
      userEmail,
      action: "delete",
      section: "provider-courses",
      itemId: id,
      itemName: deleted.providerName || "Provider Course",
      details: `Deleted provider course`,
    });
  }

  return Response.json({ success: true })
}