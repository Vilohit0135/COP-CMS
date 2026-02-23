import { connectDB } from "../../../../../lib/db";
import Leads from "../../../../../models/leads";
import { getClerkUserInfo } from "../../../../../lib/clerkHelper";
import { logActivity } from "../../../../../lib/activityLogger";

// GET single lead
export async function GET(req, context) {
  try {
    await connectDB();
    const { id } = await context.params;

    const lead = await Leads.findById(id);

    if (!lead) {
      return Response.json({ error: "Lead not found" }, { status: 404 });
    }

    return Response.json(lead);
  } catch (error) {
    console.error("Error fetching lead:", error);
    return Response.json(
      { error: "Failed to fetch lead", details: error.message },
      { status: 500 }
    );
  }
}

// UPDATE lead
export async function PUT(req, context) {
  try {
    const { userId, userName, userEmail } = await getClerkUserInfo();
    
    await connectDB();
    const { id } = await context.params;

    const body = await req.json();

    const updated = await Leads.findByIdAndUpdate(
      id,
      { ...body, lastUpdated: new Date() },
      { new: true }
    );

    if (!updated) {
      return Response.json({ error: "Lead not found" }, { status: 404 });
    }

    // Log the update activity
    if (userId) {
      await logActivity({
        userId,
        userName,
        userEmail,
        action: "update",
        section: "leads",
        itemId: id,
        itemName: updated.name,
        details: `Updated lead: ${JSON.stringify(body)}`,
      });
    }

    return Response.json(updated);
  } catch (error) {
    console.error("Error updating lead:", error);
    return Response.json(
      { error: "Failed to update lead", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE lead
export async function DELETE(req, context) {
  try {
    const { userId, userName, userEmail } = await getClerkUserInfo();
    
    await connectDB();
    const { id } = await context.params;

    const deleted = await Leads.findByIdAndDelete(id);

    if (!deleted) {
      return Response.json({ error: "Lead not found" }, { status: 404 });
    }

    // Log the delete activity
    if (userId) {
      await logActivity({
        userId,
        userName,
        userEmail,
        action: "delete",
        section: "leads",
        itemId: id,
        itemName: deleted.name,
        details: `Deleted lead`,
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return Response.json(
      { error: "Failed to delete lead", details: error.message },
      { status: 500 }
    );
  }
}