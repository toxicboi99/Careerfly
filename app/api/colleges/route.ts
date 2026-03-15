import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { getCollegeRecommendations, type College } from "@/lib/college-data"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const interests = searchParams.get("interests")?.split(",") || []
    const location = searchParams.get("location") || undefined
    const recommend = searchParams.get("recommend") === "true"

    const db = await getDb()
    const colleges = (await db
      .collection<College>("colleges")
      .find({}, { projection: { _id: 0 } })
      .toArray()) as College[]

    if (recommend && interests.length > 0) {
      const recommendations = getCollegeRecommendations(interests, location, colleges)
      return NextResponse.json({ colleges: recommendations, total: recommendations.length })
    }

    return NextResponse.json({ colleges, total: colleges.length })
  } catch (error) {
    console.error("Error fetching colleges:", error)
    return NextResponse.json({ error: "Failed to fetch colleges" }, { status: 500 })
  }
}
