import { connectDB } from "../../../../../lib/db"
import Provider from "../../../../../models/provider"
import { getClerkUserInfo } from "../../../../../lib/clerkHelper";
import { logActivity } from "../../../../../lib/activityLogger";

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
  const { userId, userName, userEmail } = await getClerkUserInfo();
  
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

  // Log the update activity
  if (userId) {
    await logActivity({
      userId,
      userName,
      userEmail,
      action: "update",
      section: "providers",
      itemId: params.id,
      itemName: updated.name,
      details: `Updated provider: ${JSON.stringify(body)}`,
    });
  }

  return Response.json(updated)
}

export async function DELETE(req, { params }) {
  const { userId, userName, userEmail } = await getClerkUserInfo();
  
  await connectDB()
  const deleted = await Provider.findByIdAndDelete(params.id)

  // Log the delete activity
  if (userId) {
    await logActivity({
      userId,
      userName,
      userEmail,
      action: "delete",
      section: "providers",
      itemId: params.id,
      itemName: deleted.name,
      details: `Deleted provider`,
    });
  }

  return Response.json({ success: true })
}