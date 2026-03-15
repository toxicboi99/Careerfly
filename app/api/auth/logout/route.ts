import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST() {
  try {
    const res = NextResponse.json({ ok: true })
    res.cookies.set("careerly_auth", "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    })
    return res
  } catch (error) {
    console.error("Error logging out:", error)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}

