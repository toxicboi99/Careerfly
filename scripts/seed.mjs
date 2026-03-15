import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"
import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, "..")

function requiredEnv(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing ${name} in environment`)
  return value
}

async function readJson(relPath) {
  const abs = path.join(projectRoot, relPath)
  const raw = await fs.readFile(abs, "utf8")
  return JSON.parse(raw)
}

async function main() {
  const uri = requiredEnv("MONGODB_URI")
  const dbName = process.env.MONGODB_DB

  const client = new MongoClient(uri)
  await client.connect()
  const db = dbName ? client.db(dbName) : client.db()

  const colleges = await readJson("seed-data/colleges.json")
  const outcomes = await readJson("seed-data/college-outcomes.json")
  const trainingData = await readJson("seed-data/admin-training-data.json")
  const metrics = await readJson("seed-data/admin-model-metrics.json")
  const dashboardProfile = await readJson("seed-data/dashboard-profile.json")

  const collegesCol = db.collection("colleges")
  const outcomesCol = db.collection("college_outcomes")
  const trainingCol = db.collection("training_data")
  const metricsCol = db.collection("model_metrics")
  const usersCol = db.collection("users")
  const dashboardCol = db.collection("dashboard_profiles")

  await Promise.all([
    collegesCol.createIndex({ id: 1 }, { unique: true }),
    outcomesCol.createIndex({ collegeId: 1 }, { unique: true }),
    usersCol.createIndex({ email: 1 }, { unique: true }),
    dashboardCol.createIndex({ userId: 1 }, { unique: true }),
    trainingCol.createIndex({ timestamp: -1 }),
  ])

  // Seed colleges (upsert)
  for (const c of colleges) {
    await collegesCol.updateOne({ id: c.id }, { $set: c }, { upsert: true })
  }

  // Seed outcomes (upsert)
  for (const o of outcomes) {
    await outcomesCol.updateOne({ collegeId: o.collegeId }, { $set: o }, { upsert: true })
  }

  // Seed metrics (single doc)
  await metricsCol.updateOne({ _id: "current" }, { $set: { _id: "current", ...metrics } }, { upsert: true })

  // Seed training data (idempotent-ish via legacyId)
  for (const entry of trainingData) {
    await trainingCol.updateOne(
      { legacyId: entry.legacyId },
      { $set: { ...entry } },
      { upsert: true },
    )
  }

  // Seed users
  const adminEmail = "admin@careerly.com"
  const studentEmail = "student@example.com"

  const [adminHash, studentHash] = await Promise.all([bcrypt.hash("admin123", 10), bcrypt.hash("password", 10)])

  await usersCol.updateOne(
    { email: adminEmail },
    { $set: { email: adminEmail, name: "Admin User", role: "admin", passwordHash: adminHash } },
    { upsert: true },
  )
  await usersCol.updateOne(
    { email: studentEmail },
    {
      $set: {
        email: studentEmail,
        name: dashboardProfile.name ?? "Student",
        role: "student",
        passwordHash: studentHash,
      },
    },
    { upsert: true },
  )

  const studentDoc = await usersCol.findOne({ email: studentEmail })
  const studentId = studentDoc?._id
  if (!studentId) throw new Error("Failed to seed student user")

  // Seed dashboard profile tied to the student
  await dashboardCol.updateOne(
    { userId: studentId },
    { $set: { userId: studentId, ...dashboardProfile } },
    { upsert: true },
  )

  await client.close()

  console.log("Seed complete.")
  console.log("Demo accounts:")
  console.log(`- admin:   ${adminEmail} / admin123`)
  console.log(`- student: ${studentEmail} / password`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

