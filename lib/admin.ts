import { auth } from "./auth"

export async function isAdmin(): Promise<boolean> {
  try {
    const session = await auth()
    return session?.user?.role === "admin"
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

export async function requireAdmin() {
  const isUserAdmin = await isAdmin()
  if (!isUserAdmin) {
    throw new Error("Unauthorized: Admin access required")
  }
  return true
}