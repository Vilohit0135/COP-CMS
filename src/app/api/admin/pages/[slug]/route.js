import { connectDB } from "../../../../../lib/db";
import Page from "../../../../../models/Page";
import { getClerkUserInfo } from "../../../../../lib/clerkHelper";
import { logActivity } from "../../../../../lib/activityLogger";
import { NextResponse } from "next/server";

// GET SINGLE PAGE
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { slug } = await params;

    const page = await Page.findOne({ slug });

    if (!page) {
      return NextResponse.json(
        { error: "Page not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error fetching page:", error);
    return NextResponse.json(
      { error: "Failed to fetch page", details: error.message },
      { status: 500 }
    );
  }
}

// UPDATE PAGE
export async function PUT(req, { params }) {
  try {
    const { userId, userName, userEmail } = await getClerkUserInfo();
    await connectDB();
    const { slug } = await params;

    const body = await req.json();

    const page = await Page.findOneAndUpdate(
      { slug },
      {
        title: body.title,
        description: body.description,
        sections: body.sections,
        isPublished: body.isPublished,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!page) {
      return NextResponse.json(
        { error: "Page not found" },
        { status: 404 }
      );
    }

    // Log the update activity
    if (userId) {
      await logActivity({
        userId,
        userName,
        userEmail,
        action: "update",
        section: "pages",
        itemId: page._id,
        itemName: page.title,
        details: `Updated page: ${page.title}`,
      });
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error updating page:", error);
    return NextResponse.json(
      { error: "Failed to update page", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE PAGE
export async function DELETE(req, { params }) {
  try {
    const { userId, userName, userEmail } = await getClerkUserInfo();
    await connectDB();
    const { slug } = await params;

    const page = await Page.findOneAndDelete({ slug });

    if (!page) {
      return NextResponse.json(
        { error: "Page not found" },
        { status: 404 }
      );
    }

    // Log the delete activity
    if (userId) {
      await logActivity({
        userId,
        userName,
        userEmail,
        action: "delete",
        section: "pages",
        itemId: page._id,
        itemName: page.title,
        details: `Deleted page: ${page.title}`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting page:", error);
    return NextResponse.json(
      { error: "Failed to delete page", details: error.message },
      { status: 500 }
    );
  }
}
