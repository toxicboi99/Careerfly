import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type ModelMetrics = {
  _id: "current"
  accuracy: number
  totalPredictions: number
  successfulPlacements: number
  averageSatisfaction: number
  lastTrainingDate: string
  modelVersion: string
}

export async function GET() {
  try {
    const db = await getDb()
    const metrics = await db
      .collection<ModelMetrics>("model_metrics")
      .findOne({ _id: "current" }, { projection: { _id: 0 } })

    return NextResponse.json({ metrics: metrics ?? null })
  } catch (error) {
    console.error("Error fetching metrics:", error)
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 })
  }
}

export async function POST() {
  try {
    const db = await getDb()
    const col = db.collection<ModelMetrics>("model_metrics")

    const existing = await col.findOne({ _id: "current" })
    const now = new Date().toISOString()

    const nextAccuracy = Math.min(99.9, (existing?.accuracy ?? 85) + 0.5)
    const nextTotal = (existing?.totalPredictions ?? 0) + 50
    const nextSuccessful = (existing?.successfulPlacements ?? 0) + 45
    const nextSatisfaction = Math.min(10, (existing?.averageSatisfaction ?? 8) + 0.1)

    const nextVersion = (() => {
      const v = existing?.modelVersion ?? "v1.0.0"
      const num = Number.parseFloat(v.replace(/^v/, ""))
      if (!Number.isFinite(num)) return "v1.0.0"
      return `v${(num + 0.1).toFixed(1)}`
    })()

    await col.updateOne(
      { _id: "current" },
      {
        $set: {
          _id: "current",
          accuracy: nextAccuracy,
          totalPredictions: nextTotal,
          successfulPlacements: nextSuccessful,
          averageSatisfaction: nextSatisfaction,
          lastTrainingDate: now,
          modelVersion: nextVersion,
        },
      },
      { upsert: true },
    )

    const updated = await col.findOne({ _id: "current" }, { projection: { _id: 0 } })
    return NextResponse.json({ metrics: updated ?? null })
  } catch (error) {
    console.error("Error training/updating metrics:", error)
    return NextResponse.json({ error: "Failed to update metrics" }, { status: 500 })
  }
}

