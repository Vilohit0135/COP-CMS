import { currentUser } from "@clerk/nextjs/server";
import PageContent from "@/models/PageContent";
import Page from "@/models/Page";
import Activity from "@/models/Activity";
import { logActivity } from "@/lib/activityLogger";
import { connectDB } from "@/lib/db";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { slug } = await params;

    // Fetch all content for this page
    const contentItems = await PageContent.find({ pageSlug: slug }).sort({
      sectionIndex: 1,
      itemIndex: 1,
    });

    return Response.json(contentItems);
  } catch (error) {
    console.error("Error fetching page content:", error);
    return Response.json(
      { error: "Failed to fetch page content" },
      { status: 500 }
    );
  }
}

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { slug } = await params;
    const user = await currentUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { sectionIndex, itemIndex = 0, values } = body;

    // Validate page exists
    const page = await Page.findOne({ slug });
    if (!page) {
      return Response.json({ error: "Page not found" }, { status: 404 });
    }

    // Check if content already exists
    let content = await PageContent.findOne({
      pageSlug: slug,
      sectionIndex,
      itemIndex,
    });

    let action = "create";
    if (content) {
      content.values = values;
      action = "update";
    } else {
      content = new PageContent({
        pageSlug: slug,
        sectionIndex,
        itemIndex,
        values,
      });
    }

    await content.save();

    // Log activity
    await logActivity({
      userId: user.id,
      userName: user.fullName || "Admin User",
      userEmail: user.primaryEmailAddress?.emailAddress,
      section: "page-content",
      action,
      description: `${action}d content for page "${page.title}" section ${sectionIndex}`,
      reference: `${slug}-${sectionIndex}-${itemIndex}`,
    });

    return Response.json(content, { status: 201 });
  } catch (error) {
    console.error("Error saving page content:", error);
    return Response.json(
      { error: "Failed to save page content" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { slug } = await params;
    const user = await currentUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sectionIndex, itemIndex = 0 } = await req.json();

    // Validate page exists
    const page = await Page.findOne({ slug });
    if (!page) {
      return Response.json({ error: "Page not found" }, { status: 404 });
    }

    const result = await PageContent.deleteOne({
      pageSlug: slug,
      sectionIndex,
      itemIndex,
    });

    if (result.deletedCount === 0) {
      return Response.json(
        { error: "Content not found" },
        { status: 404 }
      );
    }

    // Log activity
    await logActivity({
      userId: user.id,
      userName: user.fullName || "Admin User",
      userEmail: user.primaryEmailAddress?.emailAddress,
      section: "page-content",
      action: "delete",
      description: `deleted content for page "${page.title}" section ${sectionIndex}`,
      reference: `${slug}-${sectionIndex}-${itemIndex}`,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting page content:", error);
    return Response.json(
      { error: "Failed to delete page content" },
      { status: 500 }
    );
  }
}
