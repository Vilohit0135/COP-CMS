import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import HomeQuestionsSection from "@/models/HomeQuestionsSection"
import { getClerkUserInfo } from "@/lib/clerkHelper"
import { logActivity } from "@/lib/activityLogger"

// GET Questions Section
export async function GET() {
  try {
    await connectDB()

    const section = await HomeQuestionsSection.findOne()

    return NextResponse.json(section || {})
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch questions section" },
      { status: 500 }
    )
  }
}

// CREATE or UPDATE Questions Section
export async function POST(req) {
  try {
    const { userId, userName, userEmail } = await getClerkUserInfo()
    
    await connectDB()

    const body = await req.json()

    let section = await HomeQuestionsSection.findOne()

    if (section) {
      section.sectionTitle = body.sectionTitle
      section.cards = body.cards
      await section.save()
      
      // Log the update activity
      if (userId) {
        await logActivity({
          userId,
          userName,
          userEmail,
          action: "update",
          section: "home-questions-section",
          itemId: section._id,
          itemName: "Questions Section",
          details: `Updated questions section with ${body.cards.length} question cards`,
        })
      }
    } else {
      section = await HomeQuestionsSection.create(body)
      
      // Log the create activity
      if (userId) {
        await logActivity({
          userId,
          userName,
          userEmail,
          action: "create",
          section: "home-questions-section",
          itemId: section._id,
          itemName: "Questions Section",
          details: `Created questions section with ${body.cards.length} question cards`,
        })
      }
    }

    return NextResponse.json({
      message: "Questions section saved successfully",
      section
    })
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to save questions section" },
      { status: 500 }
    )
  }
}