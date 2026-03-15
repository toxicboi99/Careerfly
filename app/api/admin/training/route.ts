import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import type { ObjectId } from "mongodb"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type TrainingData = {
  _id?: ObjectId
  legacyId?: string
  studentProfile: {
    interests: string[]
    skills: Record<string, number>
    education: string
    college: string
  }
  careerOutcome: {
    chosenCareer: string
    satisfaction: number
    timeToJob: number
    salary: string
  }
  timestamp: string
}

export async function GET() {
  try {
    const db = await getDb()
    const docs = await db
      .collection<TrainingData>("training_data")
      .find({})
      .sort({ timestamp: -1 })
      .limit(200)
      .toArray()

    const trainingData = docs.map((d) => ({
      ...d,
      id: d._id ? String(d._id) : d.legacyId ?? d.timestamp,
      _id: undefined,
    }))

    return NextResponse.json({ trainingData, total: trainingData.length })
  } catch (error) {
    console.error("Error fetching training data:", error)
    return NextResponse.json({ error: "Failed to fetch training data" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<TrainingData>
    if (!body.studentProfile || !body.careerOutcome) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const entry: TrainingData = {
      studentProfile: {
        interests: body.studentProfile.interests ?? [],
        skills: body.studentProfile.skills ?? {},
        education: body.studentProfile.education ?? "",
        college: body.studentProfile.college ?? "",
      },
      careerOutcome: {
        chosenCareer: body.careerOutcome.chosenCareer ?? "",
        satisfaction: Number(body.careerOutcome.satisfaction ?? 8),
        timeToJob: Number(body.careerOutcome.timeToJob ?? 6),
        salary: body.careerOutcome.salary ?? "",
      },
      timestamp: body.timestamp ?? new Date().toISOString(),
    }

    if (!entry.careerOutcome.chosenCareer) {
      return NextResponse.json({ error: "chosenCareer is required" }, { status: 400 })
    }

    const db = await getDb()
    await db.collection<TrainingData>("training_data").insertOne(entry)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error inserting training data:", error)
    return NextResponse.json({ error: "Failed to insert training data" }, { status: 500 })
  }
}

