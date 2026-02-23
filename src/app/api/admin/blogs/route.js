import { NextResponse } from "next/server"
import { connectDB } from "../../../../lib/db";
import Blog from "../../../../models/blogs"
import { getClerkUserInfo } from "../../../../lib/clerkHelper";
import { logActivity } from "../../../../lib/activityLogger";

// GET ALL BLOGS (Admin)
export async function GET() {
  try {
    await connectDB()

    const blogs = await Blog.find().sort({ createdAt: -1 })

    return NextResponse.json({ data: blogs })
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch blogs" },
      { status: 500 }
    )
  }
}

// CREATE BLOG
export async function POST(request) {
  try {
    const { userId, userName, userEmail } = await getClerkUserInfo();
    
    await connectDB()

    const body = await request.json()

    const newBlog = await Blog.create(body)

    // Log the create activity
    if (userId) {
      await logActivity({
        userId,
        userName,
        userEmail,
        action: "create",
        section: "blogs",
        itemId: newBlog._id,
        itemName: newBlog.title,
        details: `Created new blog: ${newBlog.title}`,
      });
    }

    return NextResponse.json(
      { message: "Blog created", data: newBlog },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to create blog" },
      { status: 500 }
    )
  }
}