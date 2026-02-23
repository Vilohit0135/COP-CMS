import { connectDB } from "../../../../lib/db";
import Specialization from "../../../../models/specialization"
import Course from "../../../../models/course"
import { getClerkUserInfo } from "../../../../lib/clerkHelper";
import { logActivity } from "../../../../lib/activityLogger";

export async function POST(req) {
  const { userId, userName, userEmail } = await getClerkUserInfo();
  
  await connectDB()
  const body = await req.json()
  const slug = body.name
    .toLowerCase()
    .replace(/\s+/g, "-");
  const specialization = await Specialization.create({...body, slug})
  await specialization.populate("courseId")

  // Log the create activity
  if (userId) {
    await logActivity({
      userId,
      userName,
      userEmail,
      action: "create",
      section: "specializations",
      itemId: specialization._id,
      itemName: specialization.name,
      details: `Created new specialization: ${specialization.name}`,
    });
  }

  return Response.json(specialization)
}

export async function GET(req) {
  await connectDB()
  const url = new URL(req.url)
  const courseId = url.searchParams.get("courseId")

  const filter = {}
  if (courseId) filter.courseId = courseId

  const specs = await Specialization.find(filter)
    .populate("courseId")
    .sort({ order: 1 })

  return Response.json(specs)
}