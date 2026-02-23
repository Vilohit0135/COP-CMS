import { connectDB } from "../../../../lib/db"
import Provider from "../../../../models/provider"

const slugify = (str = "") =>
  str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")

async function uniqueSlug(base) {
  if (!base) base = Date.now().toString()
  let slug = base
  let i = 0
  while (await Provider.findOne({ slug })) {
    i += 1
    slug = `${base}-${i}`
  }
  return slug
}

export async function POST(req) {
  await connectDB()
  const body = await req.json()

  const base = slugify(body.name || body.slug || "")
  const slug = await uniqueSlug(base)

  const provider = await Provider.create({ ...body, slug })
  return Response.json(provider)
}

export async function GET() {
  await connectDB()
  const providers = await Provider.find().sort({ createdAt: -1 })
  return Response.json(providers)
}