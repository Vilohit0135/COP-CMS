import { connectDB } from "../../../../lib/db";
import ProviderCourse from "../../../../models/providerCourse"
import { getClerkUserInfo } from "../../../../lib/clerkHelper";
import { logActivity } from "../../../../lib/activityLogger";

export async function POST(req) {
  const { userId, userName, userEmail } = await getClerkUserInfo();
  
  await connectDB()
  const body = await req.json()
  console.log("[provider-courses POST] body:", body)
  const entry = await ProviderCourse.create(body)
    .then((doc) => doc.populate(["degreeTypeId", "courseId", "specializationId"]))

  console.log("[provider-courses POST] created:", entry)

  // Log the create activity
  if (userId) {
    await logActivity({
      userId,
      userName,
      userEmail,
      action: "create",
      section: "provider-courses",
      itemId: entry._id,
      itemName: entry.providerName || "Provider Course",
      details: `Created new provider course`,
    });
  }

  return Response.json(entry)
}

export async function GET() {
  await connectDB()

  const entries = await ProviderCourse.find()
    .populate("degreeTypeId")
    .populate("courseId")
    .populate("specializationId")

  return Response.json(entries)
}