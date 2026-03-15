import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type CollegeOutcomes = {
  collegeId: string
  topCareerPaths: string[]
  industryDistribution: { industry: string; percentage: number }[]
  averageSalaryByField: { field: string; salary: string }[]
}

export async function GET(_: Request, context: { params: { id: string } }) {
  try {
    const collegeId = context.params.id
    const db = await getDb()

    const outcomes = await db
      .collection<CollegeOutcomes>("college_outcomes")
      .findOne({ collegeId }, { projection: { _id: 0 } })

    return NextResponse.json({ outcomes: outcomes ?? null })
  } catch (error) {
    console.error("Error fetching college outcomes:", error)
    return NextResponse.json({ error: "Failed to fetch outcomes" }, { status: 500 })
  }
}

