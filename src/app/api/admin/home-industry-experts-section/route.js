import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import HomeIndustryExpertsSection from "@/models/HomeIndustryExpertsSection"
import { getClerkUserInfo } from "@/lib/clerkHelper"
import { logActivity } from "@/lib/activityLogger"

// GET Section
export async function GET() {
  try {
    await connectDB()

    const section = await HomeIndustryExpertsSection.findOne()

    return NextResponse.json(section || {})
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch industry experts section" },
      { status: 500 }
    )
  }
}

// CREATE or UPDATE Section
export async function POST(req) {
  try {
    const { userId, userName, userEmail } = await getClerkUserInfo()
    
    await connectDB()

    const body = await req.json()

    let section = await HomeIndustryExpertsSection.findOne()

    if (section) {
      section.sectionTitle = body.sectionTitle
      section.experts = body.experts
      await section.save()
      
      // Log the update activity
      if (userId) {
        await logActivity({
          userId,
          userName,
          userEmail,
          action: "update",
          section: "home-industry-experts-section",
          itemId: section._id,
          itemName: "Industry Experts Section",
          details: `Updated industry experts section with ${body.experts.length} experts`,
        })
      }
    } else {
      section = await HomeIndustryExpertsSection.create(body)
      
      // Log the create activity
      if (userId) {
        await logActivity({
          userId,
          userName,
          userEmail,
          action: "create",
          section: "home-industry-experts-section",
          itemId: section._id,
          itemName: "Industry Experts Section",
          details: `Created industry experts section with ${body.experts.length} experts`,
        })
      }
    }

    return NextResponse.json({
      message: "Industry experts section saved successfully",
      section
    })
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to save industry experts section" },
      { status: 500 }
    )
  }
}