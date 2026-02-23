import { connectDB } from "../../../../lib/db";
import Leads from "../../../../models/leads";
import { getClerkUserInfo } from "../../../../lib/clerkHelper";
import { logActivity } from "../../../../lib/activityLogger";

// CREATE - Submit a new lead from frontend form
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

  const lead = await Leads.create({
    name: body.name,
    email: body.email,
    phone: body.phone,
    courseOfInterest: body.courseOfInterest || "",
    message: body.message || "",
    source: body.source || "website_form",
  });

  return Response.json(lead, { status: 201 });
}

// READ ALL - Get all leads for admin dashboard
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // optional filter

    let query = {};
    if (status) {
      query.callStatus = status;
    }

    const leads = await Leads.find(query).sort({ createdAt: -1 });
    
    return Response.json(leads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    return Response.json(
      { error: "Failed to fetch leads", details: error.message },
      { status: 500 }
    );
  }
}
