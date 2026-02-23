import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import HomeIndustryExpertsSection from "@/models/HomeIndustryExpertsSection"

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
    await connectDB()

    const body = await req.json()

    let section = await HomeIndustryExpertsSection.findOne()

    if (section) {
      section.sectionTitle = body.sectionTitle
      section.experts = body.experts
      await section.save()
    } else {
      section = await HomeIndustryExpertsSection.create(body)
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