import { connectDB } from "../../../../lib/db";
import Review from "../../../../models/review";
import { getClerkUserInfo } from "../../../../lib/clerkHelper";
import { logActivity } from "../../../../lib/activityLogger";

// CREATE - Submit a new review from frontend form
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    // Validate required fields
    if (!body.name || !body.email || !body.providerId || !body.rating || !body.title || !body.comment) {
      return Response.json(
        { error: "Name, email, provider, rating, title, and comment are required" },
        { status: 400 }
      );
    }

    const review = await Review.create({
      name: body.name,
      email: body.email,
      providerId: body.providerId,
      rating: body.rating,
      title: body.title,
      comment: body.comment,
      source: body.source || "website_form",
      isActive: false, // Default to inactive
    });

    return Response.json(review, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return Response.json(
      { error: "Failed to create review", details: error.message },
      { status: 500 }
    );
  }
}

// READ ALL - Get all reviews for admin dashboard
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const providerId = searchParams.get("providerId"); // optional filter by provider
    const isActive = searchParams.get("isActive"); // optional filter by status

    let query = {};
    if (providerId) {
      query.providerId = providerId;
    }
    if (isActive !== null) {
      query.isActive = isActive === "true";
    }

    const reviews = await Review.find(query)
      .populate("providerId", "name slug")
      .sort({ createdAt: -1 });

    return Response.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return Response.json(
      { error: "Failed to fetch reviews", details: error.message },
      { status: 500 }
    );
  }
}
