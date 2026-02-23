import { connectDB } from "@/lib/db"
import Navbar from "@/models/Navbar"

export async function GET() {
  await connectDB()

  const navItems = await Navbar.find({ isActive: true })
    .sort({ order: 1 })

  return Response.json(navItems)
}