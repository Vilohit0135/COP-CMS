import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import HomeProgramExpertsSection from "@/models/HomeProgramExpertsSection"

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
    await connectDB()

    const body = await req.json()

    let section = await HomeProgramExpertsSection.findOne()

    if (section) {
      section.sectionTitle = body.sectionTitle
      section.experts = body.experts
      await section.save()
    } else {
      section = await HomeProgramExpertsSection.create(body)
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