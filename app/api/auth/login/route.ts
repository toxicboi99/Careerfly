import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getDb } from "@/lib/mongodb"
import { signAuthToken } from "@/lib/auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type UserDoc = {
  _id: unknown
  email: string
  name?: string
  role: "admin" | "student"
  passwordHash: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string }
    const email = (body.email ?? "").toLowerCase().trim()
    const password = body.password ?? ""

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const db = await getDb()
    const user = await db.collection<UserDoc>("users").findOne({ email })
    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })

    const token = signAuthToken({
      userId: String(user._id),
      email: user.email,
      role: user.role,
      name: user.name,
    })

    const res = NextResponse.json({ ok: true, role: user.role })
    res.cookies.set("careerly_auth", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })
    return res
  } catch (error) {
    console.error("Error logging in:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}

