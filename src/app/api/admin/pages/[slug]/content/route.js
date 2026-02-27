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
    const page = await Page.findOne({ slug }).lean();
    const rawItems = await PageContent.find({ pageSlug: slug }).sort({
      sectionApiId: 1,
      itemIndex: 1,
    });

    // Backfill sectionApiId when missing (old records using sectionIndex)
    const contentItems = rawItems.map((item) => {
      if (!item.sectionApiId && typeof item.sectionIndex === "number" && page) {
        const sec = page.sections[item.sectionIndex];
        if (sec && sec.apiIdentifier) {
          item = item.toObject();
          item.sectionApiId = sec.apiIdentifier;
        }
      }
      return item;
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
    let { sectionApiId, itemIndex = 0, values, originalItemIndex, sectionIndex } = body;

    // Validate page exists
    const page = await Page.findOne({ slug });
    if (!page) {
      return Response.json({ error: "Page not found" }, { status: 404 });
    }

    // if sectionApiId not provided but sectionIndex is, convert using page data
    if (!sectionApiId && typeof sectionIndex !== "undefined" && page) {
      const sec = page.sections[sectionIndex];
      if (sec && sec.apiIdentifier) sectionApiId = sec.apiIdentifier;
    }

    // Determine existing content record
    let content = null;
    if (originalItemIndex !== undefined && originalItemIndex !== itemIndex) {
      // editing an existing item but changing its order
      content = await PageContent.findOne({
        pageSlug: slug,
        sectionApiId,
        itemIndex: originalItemIndex,
      });
    }
    if (!content) {
      content = await PageContent.findOne({
        pageSlug: slug,
        sectionApiId,
        itemIndex,
      });
    }

    let action = "create";
    if (content) {
      content.values = values;
      // update index if it's been changed
      if (originalItemIndex !== undefined && originalItemIndex !== itemIndex) {
        content.itemIndex = itemIndex;
      }
      action = "update";
    } else {
      content = new PageContent({
        pageSlug: slug,
        sectionApiId,
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
      description: `${action}d content for page "${page.title}" section ${sectionApiId}`,
      reference: `${slug}-${sectionApiId}-${itemIndex}`,
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

    let { sectionApiId, itemIndex = 0, sectionIndex } = await req.json();

    // Validate page exists
    const page = await Page.findOne({ slug });
    if (!page) {
      return Response.json({ error: "Page not found" }, { status: 404 });
    }

    if (!sectionApiId && typeof sectionIndex !== "undefined" && page) {
      const sec = page.sections[sectionIndex];
      if (sec && sec.apiIdentifier) sectionApiId = sec.apiIdentifier;
    }

    const result = await PageContent.deleteOne({
      pageSlug: slug,
      sectionApiId,
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
      description: `deleted content for page "${page.title}" section ${sectionApiId}`,
      reference: `${slug}-${sectionApiId}-${itemIndex}`,
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
