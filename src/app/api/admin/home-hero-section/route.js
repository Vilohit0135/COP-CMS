import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import HomeHeroSection from "@/models/HomeHeroSection"

// GET Hero Section
export async function GET() {
  try {
    await connectDB()

    const hero = await HomeHeroSection.findOne()

    return NextResponse.json(hero || {})
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch hero section" },
      { status: 500 }
    )
  }
}

// CREATE or UPDATE Hero Section
export async function POST(req) {
  try {
    await connectDB()

    const body = await req.json()

    let hero = await HomeHeroSection.findOne()

    if (hero) {
      hero.slides = body.slides
      await hero.save()
    } else {
      hero = await HomeHeroSection.create(body)
    }

    return NextResponse.json({
      message: "Hero section saved successfully",
      hero
    })
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to save hero section" },
      { status: 500 }
    )
  }
}