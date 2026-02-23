import { connectDB } from "../../../../../lib/db";
import Review from "../../../../../models/review";
import { getClerkUserInfo } from "../../../../../lib/clerkHelper";
import { logActivity } from "../../../../../lib/activityLogger";

export async function GET(req, { params }) {
  await connectDB();
  const { id } = await params;
  const review = await Review.findById(id).populate("providerId", "name slug");
  return Response.json(review);
}

export async function PUT(req, { params }) {
  const { userId, userName, userEmail } = await getClerkUserInfo();

  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    ).populate("providerId", "name slug");

    // Log the update activity
    if (userId) {
      await logActivity({
        userId,
        userName,
        userEmail,
        action: "update",
        section: "reviews",
        itemId: id,
        itemName: updatedReview.title,
        details: `Updated review: ${JSON.stringify(body)}`,
      });
    }

    return Response.json(updatedReview);
  } catch (error) {
    console.error("Error updating review:", error);
    return Response.json(
      { error: "Failed to update review", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  const { userId, userName, userEmail } = await getClerkUserInfo();

  try {
    await connectDB();
    const { id } = await params;
    
    const deletedReview = await Review.findByIdAndDelete(id);

    // Log the delete activity
    if (userId) {
      await logActivity({
        userId,
        userName,
        userEmail,
        action: "delete",
        section: "reviews",
        itemId: id,
        itemName: deletedReview.title,
        details: `Deleted review`,
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting review:", error);
    return Response.json(
      { error: "Failed to delete review", details: error.message },
      { status: 500 }
    );
  }
}
