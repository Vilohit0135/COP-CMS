import AdminSidebar from "./components/AdminSidebar"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function AdminLayout({ children }) {
  const clerkUser = await currentUser()

  // Only logged-in users can access /admin
  if (!clerkUser) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
}