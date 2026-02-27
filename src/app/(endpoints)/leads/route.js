import { connectDB } from "../../../lib/db";
import Leads from "../../../models/leads";

// PUBLIC endpoint - Frontend form submission for leads
export async function POST(req) {
  await connectDB();
  const body = await req.json();

  // Validate required fields
  if (!body.name || !body.email || !body.phone) {
    return Response.json(
      { error: "Name, email, and phone are required" },
      { status: 400 }
    );
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) {
    return Response.json(
      { error: "Invalid email format" },
      { status: 400 }
    );
  }

  try {
    const lead = await Leads.create({
      name: body.name,
      email: body.email,
      phone: body.phone,
      courseOfInterest: body.courseOfInterest || "",
      message: body.message || "",
      source: body.source || "website_form",
    });

    return Response.json(lead, { status: 201 });
  } catch (error) {
    console.error("Error creating lead:", error);
    return Response.json(
      { error: "Failed to create lead", details: error.message },
      { status: 500 }
    );
  }
}
