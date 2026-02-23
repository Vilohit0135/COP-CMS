import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Blog from "@/models/blogs"

// ===============================
// GET SINGLE BLOG
// ===============================
export async function GET(request, context) {
  try {
    await connectDB()

    const { slug } = await context.params

    const blog = await Blog.findOne({ slug })

    if (!blog) {
      return NextResponse.json(
        { message: "Blog not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: blog })

  } catch (error) {
    console.error("GET BLOG ERROR:", error)
    return NextResponse.json(
      { message: "Failed to fetch blog" },
      { status: 500 }
    )
  }
}


// ===============================
// UPDATE BLOG
// ===============================
export async function PUT(request, context) {
  try {
    await connectDB()

    const { slug } = await context.params
    const body = await request.json()

    const updatedBlog = await Blog.findOneAndUpdate(
      { slug },
      { $set: body },
      { new: true }
    )

    if (!updatedBlog) {
      return NextResponse.json(
        { message: "Blog not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: "Blog updated successfully",
      data: updatedBlog
    })

  } catch (error) {
    console.error("UPDATE BLOG ERROR:", error)
    return NextResponse.json(
      { message: error.message || "Failed to update blog" },
      { status: 500 }
    )
  }
}


// ===============================
// DELETE BLOG
// ===============================
export async function DELETE(request, context) {
  try {
    await connectDB()

    const { slug } = await context.params

    const deletedBlog = await Blog.findOneAndDelete({ slug })

    if (!deletedBlog) {
      return NextResponse.json(
        { message: "Blog not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: "Blog deleted successfully"
    })

  } catch (error) {
    console.error("DELETE BLOG ERROR:", error)
    return NextResponse.json(
      { message: "Failed to delete blog" },
      { status: 500 }
    )
  }
}

// POST /api/admin/blogs/[slug]/blocks

export async function POST(request, context) {
  try {
    await connectDB()

    const { slug } = await context.params
    const newBlock = await request.json()

    const updatedBlog = await Blog.findOneAndUpdate(
      { slug },
      {
        $push: {
          content: newBlock   // ✅ adds to end
        }
      },
      { new: true }
    )

    if (!updatedBlog) {
      return NextResponse.json(
        { message: "Blog not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: "Block added successfully",
      data: updatedBlog
    })

  } catch (error) {
    return NextResponse.json(
      { message: "Failed to add block" },
      { status: 500 }
    )
  }
}


// ===============================
// REMOVE CONTENT BLOCK
// ===============================
export async function PATCH(request, context) {
  try {
    await connectDB()

    const { slug } = await context.params
    const { blockId } = await request.json()

    if (!blockId) {
      return NextResponse.json(
        { message: "Block ID is required" },
        { status: 400 }
      )
    }

    const updatedBlog = await Blog.findOneAndUpdate(
      { slug },
      {
        $pull: {
          content: { _id: blockId }   // ✅ removes specific block
        }
      },
      { new: true }
    )

    if (!updatedBlog) {
      return NextResponse.json(
        { message: "Blog not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: "Block removed successfully",
      data: updatedBlog
    })

  } catch (error) {
    console.error("REMOVE BLOCK ERROR:", error)

    return NextResponse.json(
      { message: "Failed to remove block" },
      { status: 500 }
    )
  }
}