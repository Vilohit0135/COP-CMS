import { connectDB } from "../../../../lib/db";
import Course from "../../../../models/course"
import { getClerkUserInfo } from "../../../../lib/clerkHelper";
import { logActivity } from "../../../../lib/activityLogger";

// CREATE
export async function POST(req) {
  const { userId, userName, userEmail } = await getClerkUserInfo();
  
  await connectDB()
  const body = await req.json()

  const course = await Course.create(body)

  // Log the create activity
  if (userId) {
    await logActivity({
      userId,
      userName,
      userEmail,
      action: "create",
      section: "courses",
      itemId: course._id,
      itemName: course.name,
      details: `Created new course: ${course.name}`,
    });
  }

  return Response.json(course)
}

// READ ALL
export async function GET() {
  await connectDB()

  const courses = await Course.find()
    .populate("degreeTypeId")

  return Response.json(courses)
}