import jwt from "jsonwebtoken"

export type AuthUser = {
  userId: string
  email: string
  role: "admin" | "student"
  name?: string
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("Missing JWT_SECRET in environment")
  return secret
}

export function signAuthToken(user: AuthUser) {
  return jwt.sign(user, getJwtSecret(), { expiresIn: "7d" })
}

export function verifyAuthToken(token: string): AuthUser {
  return jwt.verify(token, getJwtSecret()) as AuthUser
}

