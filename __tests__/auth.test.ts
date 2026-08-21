import { describe, it, expect } from "vitest"
import { hashPassword, verifyPassword } from "../src/lib/auth/password"
import { signToken, verifyToken } from "../src/lib/auth/jwt"

describe("Password Hashing", () => {
  it("should hash and verify passwords", async () => {
    const hash = await hashPassword("Test@123")
    expect(hash).toBeDefined()
    expect(hash).not.toBe("Test@123")
    const valid = await verifyPassword("Test@123", hash)
    expect(valid).toBe(true)
    const invalid = await verifyPassword("Wrong@123", hash)
    expect(invalid).toBe(false)
  })
})

describe("JWT Tokens", () => {
  it("should sign and verify tokens", () => {
    const payload = { userId: "test123", email: "test@example.com", role: "user" }
    const token = signToken(payload)
    expect(token).toBeDefined()
    const decoded = verifyToken(token)
    expect(decoded).toBeDefined()
    expect(decoded?.userId).toBe("test123")
    expect(decoded?.email).toBe("test@example.com")
  })

  it("should reject invalid tokens", () => {
    const result = verifyToken("invalid-token")
    expect(result).toBeNull()
  })
})
