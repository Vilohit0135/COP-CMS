import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Blog from "@/models/blogs"

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
    await connectDB()

    const body = await request.json()

    const newBlog = await Blog.create(body)

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