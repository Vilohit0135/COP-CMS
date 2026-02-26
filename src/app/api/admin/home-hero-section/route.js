import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import HomeHeroSection from "@/models/HomeHeroSection"
import { getClerkUserInfo } from "@/lib/clerkHelper";
import { logActivity } from "@/lib/activityLogger";

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
    const { userId, userName, userEmail } = await getClerkUserInfo();
    
    await connectDB()

    const body = await req.json()

    let hero = await HomeHeroSection.findOne()

    if (hero) {
      hero.slides = body.slides
      await hero.save()
      
      // Log the update activity
      if (userId) {
        await logActivity({
          userId,
          userName,
          userEmail,
          action: "update",
          section: "home-hero-section",
          itemId: hero._id,
          itemName: "Hero Section",
          details: `Updated hero section with ${body.slides.length} slides`,
        });
      }
    } else {
      hero = await HomeHeroSection.create(body)
      
      // Log the create activity
      if (userId) {
        await logActivity({
          userId,
          userName,
          userEmail,
          action: "create",
          section: "home-hero-section",
          itemId: hero._id,
          itemName: "Hero Section",
          details: `Created hero section with ${body.slides.length} slides`,
        });
      }
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