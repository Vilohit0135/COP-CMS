import { connectDB } from "../../../../../lib/db"
import Provider from "../../../../../models/provider"

const slugify = (str = "") =>
  str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")

async function uniqueSlug(base, excludeId) {
  if (!base) base = Date.now().toString()
  let slug = base
  let i = 0
  while (await Provider.findOne({ slug, _id: { $ne: excludeId } })) {
    i += 1
    slug = `${base}-${i}`
  }
  return slug
}

export async function GET(req, { params }) {
  await connectDB()
  const provider = await Provider.findById(params.id)
  return Response.json(provider)
}

export async function PUT(req, { params }) {
  await connectDB()
  const body = await req.json()

  // regenerate slug when name/slug provided
  if (body.name || body.slug) {
    const base = slugify(body.name || body.slug || "")
    body.slug = await uniqueSlug(base, params.id)
  }

  const updated = await Provider.findByIdAndUpdate(
    params.id,
    body,
    { new: true }
  )

  return Response.json(updated)
}

export async function DELETE(req, { params }) {
  await connectDB()
  await Provider.findByIdAndDelete(params.id)
  return Response.json({ success: true })
}