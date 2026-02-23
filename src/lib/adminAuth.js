import { auth } from "@clerk/nextjs/server"

export async function requireAuth() {
  const { userId } = auth()

  if (!userId) {
    return { error: "Unauthorized", status: 401 }
  }

  return { userId }
}