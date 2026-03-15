import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getDb } from "@/lib/mongodb"
import { signAuthToken } from "@/lib/auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type AssessmentData = {
  personalInfo: {
    name: string
    email: string
    password: string
    age: string
    education: string
    college: string
    field: string
  }
  interests: string[]
  skills: Record<string, number>
  preferences: {
    workEnvironment: string
    careerGoals: string
    timeCommitment: string
  }
  experience: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AssessmentData
    const name = body.personalInfo?.name?.trim()
    const emailRaw = body.personalInfo?.email ?? ""
    const passwordRaw = body.personalInfo?.password ?? ""
    const email = emailRaw.toLowerCase().trim()

    if (!name || !email || !passwordRaw) {
      return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 })
    }

    const db = await getDb()
    const usersCol = db.collection("users")
    const profilesCol = db.collection("dashboard_profiles")

    const existingUser = await usersCol.findOne<{ _id: unknown; role: "admin" | "student" }>({ email })

    const passwordHash = await bcrypt.hash(passwordRaw, 10)

    let userId: unknown
    let role: "admin" | "student" = "student"

    if (existingUser) {
      userId = existingUser._id
      role = existingUser.role
      await usersCol.updateOne(
        { _id: existingUser._id },
        {
          $set: {
            name,
            passwordHash,
          },
        },
      )
    } else {
      const insertRes = await usersCol.insertOne({
        email,
        name,
        role: "student" as const,
        passwordHash,
      })
      userId = insertRes.insertedId
      role = "student"
    }

    // Very simple profile based on assessment answers
    const profile = {
      userId,
      name,
      completionDate: new Date().toISOString().slice(0, 10),
      overallMatch: 85,
      topCareerPaths: [
        {
          title: body.personalInfo.field || "Recommended Career Path",
          match: 90,
          description: "Personalized career suggestion based on your assessment responses.",
          skills: Object.keys(body.skills || {}),
          averageSalary: "₹8-20 LPA",
          growth: "High",
          demandLevel: "High",
          timeToEntry: "6-12 months",
          learningPath: [
            "Build core fundamentals in your chosen field",
            "Work on real-world projects and internships",
            "Create a strong portfolio or resume",
            "Apply to targeted roles in your preferred industry",
          ],
        },
      ],
      skillGaps: Object.entries(body.skills || {}).map(([skill, level]) => ({
        skill,
        currentLevel: level,
        requiredLevel: 5,
        priority: level >= 3 ? "Medium" : "High",
      })),
      recommendedCourses: [] as {
        title: string
        provider: string
        duration: string
        rating: number
        price: string
      }[],
      industryInsights: [
        {
          title: "Personalized insights coming soon",
          description:
            "Your assessment has been saved. Future updates will use your data to generate more specific insights.",
          date: new Date().toISOString().slice(0, 10),
        },
      ],
      assessment: body,
    }

    await profilesCol.updateOne({ userId }, { $set: profile }, { upsert: true })

    const token = signAuthToken({
      userId: String(userId),
      email,
      role,
      name,
    })

    const res = NextResponse.json({ ok: true })
    res.cookies.set("careerly_auth", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    return res
  } catch (error) {
    console.error("Error submitting assessment:", error)
    return NextResponse.json({ error: "Failed to submit assessment" }, { status: 500 })
  }
}

