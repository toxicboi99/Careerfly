import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import type { College } from "@/lib/college-data"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(_: Request, context: { params: { id: string } }) {
  try {
    const id = context.params.id
    const db = await getDb()

    const college = await db.collection<College>("colleges").findOne({ id }, { projection: { _id: 0 } })
    if (!college) return NextResponse.json({ error: "College not found" }, { status: 404 })

    return NextResponse.json({ college })
  } catch (error) {
    console.error("Error fetching college:", error)
    return NextResponse.json({ error: "Failed to fetch college" }, { status: 500 })
  }
}

