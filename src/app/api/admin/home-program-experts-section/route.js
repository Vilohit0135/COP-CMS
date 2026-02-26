import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import HomeProgramExpertsSection from "@/models/HomeProgramExpertsSection"
import { getClerkUserInfo } from "@/lib/clerkHelper"
import { logActivity } from "@/lib/activityLogger"

// GET Section
export async function GET() {
  try {
    await connectDB()

    const section = await HomeProgramExpertsSection.findOne()

    return NextResponse.json(section || {})
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch program experts section" },
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

    let section = await HomeProgramExpertsSection.findOne()

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
          section: "home-program-experts-section",
          itemId: section._id,
          itemName: "Program Experts Section",
          details: `Updated program experts section with ${body.experts.length} experts`,
        })
      }
    } else {
      section = await HomeProgramExpertsSection.create(body)
      
      // Log the create activity
      if (userId) {
        await logActivity({
          userId,
          userName,
          userEmail,
          action: "create",
          section: "home-program-experts-section",
          itemId: section._id,
          itemName: "Program Experts Section",
          details: `Created program experts section with ${body.experts.length} experts`,
        })
      }
    }

    return NextResponse.json({
      message: "Program experts section saved successfully",
      section
    })
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to save program experts section" },
      { status: 500 }
    )
  }
}