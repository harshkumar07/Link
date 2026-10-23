import { describe, expect, it } from "vitest";
import { hashPassword, issueToken, verifyPassword, verifyToken } from "./auth.js";

describe("JWT and password helpers", () => {
  it("issues and verifies a signed token", () => {
    const token = issueToken({ id: "user-1", email: "person@example.com" });
    expect(verifyToken(token)?.sub).toBe("user-1");
    expect(verifyToken(`${token}x`)).toBeNull();
  });
  it("hashes passwords and verifies only the correct password", async () => {
    const credentials = await hashPassword("correct horse battery");
    expect(await verifyPassword("correct horse battery", credentials.salt, credentials.hash)).toBe(true);
    expect(await verifyPassword("incorrect password", credentials.salt, credentials.hash)).toBe(false);
  });
});
