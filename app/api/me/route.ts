import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { ObjectId } from "mongodb"
import { verifyAuthToken } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type UserDoc = {
  _id: ObjectId
  email: string
  name?: string
  role: "admin" | "student"
}

export async function GET() {
  try {
    const token = cookies().get("careerly_auth")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const payload = verifyAuthToken(token)
    const db = await getDb()

    const userId = new ObjectId(payload.userId)
    const user = await db.collection<UserDoc>("users").findOne({ _id: userId }, { projection: { passwordHash: 0 } as any })
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    let dashboardProfile: unknown = null
    if (user.role === "student") {
      dashboardProfile = await db.collection("dashboard_profiles").findOne({ userId }, { projection: { _id: 0 } })
    }

    return NextResponse.json({
      user: { email: user.email, name: user.name, role: user.role, userId: String(user._id) },
      dashboardProfile,
    })
  } catch (error) {
    console.error("Error in /api/me:", error)
    return NextResponse.json({ error: "Failed to load user" }, { status: 500 })
  }
}

