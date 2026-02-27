import { connectDB } from "@/lib/db"
import User from "@/models/User"

export async function PUT(req, { params }) {
  try {
    const { id } = await params
    console.log("PUT request received with params:", { id })
    const { access, isActive, role } = await req.json()

    if (!id) {
      console.error("PUT Error: id is missing or falsy", id)
      return Response.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    await connectDB()

    const updateData = {}
    if (access !== undefined) {
      updateData.access = access
    }
    if (isActive !== undefined) {
      updateData.isActive = isActive
    }
    if (role !== undefined) {
      updateData.role = role
    }

    const user = await User.findOneAndUpdate(
      { clerkId: id },
      updateData,
      { new: true }
    )

    if (!user) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return Response.json({
      success: true,
      message: "User updated successfully",
      user: {
        userId: user.clerkId,
        email: user.email,
        role: user.role,
        access: user.access,
        isActive: user.isActive,
      },
    })
  } catch (err) {
    console.error("Update user error:", err)
    return Response.json(
      { error: err.message },
      { status: 500 }
    )
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params
    console.log("DELETE request received with params:", { id })

    if (!id) {
      console.error("DELETE Error: id is missing or falsy", id)
      return Response.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    await connectDB()

    const user = await User.findOneAndDelete({ clerkId: id })

    if (!user) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return Response.json({
      success: true,
      message: `User ${user.email} has been deleted`,
    })
  } catch (err) {
    console.error("Delete user error:", err)
    return Response.json(
      { error: err.message },
      { status: 500 }
    )
  }
}
