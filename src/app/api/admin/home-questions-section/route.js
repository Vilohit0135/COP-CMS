import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import HomeQuestionsSection from "@/models/HomeQuestionsSection"

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
    await connectDB()

    const body = await req.json()

    let section = await HomeQuestionsSection.findOne()

    if (section) {
      section.sectionTitle = body.sectionTitle
      section.cards = body.cards
      await section.save()
    } else {
      section = await HomeQuestionsSection.create(body)
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