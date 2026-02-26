import { connectDB } from "../../../../lib/db";
import Page from "../../../../models/Page";
import { getClerkUserInfo } from "../../../../lib/clerkHelper";
import { logActivity } from "../../../../lib/activityLogger";
import { NextResponse } from "next/server";

// GET ALL PAGES
export async function GET() {
  try {
    await connectDB();
    const pages = await Page.find().sort({ createdAt: -1 });
    return NextResponse.json(pages);
  } catch (error) {
    console.error("Error fetching pages:", error);
    return NextResponse.json(
      { error: "Failed to fetch pages", details: error.message },
      { status: 500 }
    );
  }
}

// CREATE NEW PAGE
export async function POST(req) {
  try {
    const { userId, userName, userEmail } = await getClerkUserInfo();
    await connectDB();

    const body = await req.json();

    // Validate required fields
    if (!body.title || !body.slug) {
      return NextResponse.json(
        { error: "Title and slug are required" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingPage = await Page.findOne({ slug: body.slug });
    if (existingPage) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 400 }
      );
    }

    const page = await Page.create({
      title: body.title,
      slug: body.slug,
      description: body.description || "",
      sections: [],
      isPublished: false,
    });

    // Log the create activity
    if (userId) {
      await logActivity({
        userId,
        userName,
        userEmail,
        action: "create",
        section: "pages",
        itemId: page._id,
        itemName: page.title,
        details: `Created new page: ${page.title}`,
      });
    }

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error("Error creating page:", error);
    return NextResponse.json(
      { error: "Failed to create page", details: error.message },
      { status: 500 }
    );
  }
}
