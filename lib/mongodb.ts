import { MongoClient } from "mongodb"

declare global {
  // eslint-disable-next-line no-var
  var __mongoClientPromise: Promise<MongoClient> | undefined
}

function getMongoUri() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error("Missing MONGODB_URI in environment")
  return uri
}

export function getMongoClientPromise(): Promise<MongoClient> {
  if (!global.__mongoClientPromise) {
    global.__mongoClientPromise = new MongoClient(getMongoUri()).connect()
  }
  return global.__mongoClientPromise
}

export async function getDb() {
  const connectedClient = await getMongoClientPromise()
  const dbName = process.env.MONGODB_DB
  return dbName ? connectedClient.db(dbName) : connectedClient.db()
}

