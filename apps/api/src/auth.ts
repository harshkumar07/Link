import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const jwtSecret = process.env["JWT_SECRET"];
const issuer = "link-api";
const tokenTtlSeconds = 60 * 60 * 24 * 7;

if (process.env["NODE_ENV"] === "production" && (!jwtSecret || jwtSecret.length < 32)) {
  throw new Error("JWT_SECRET must be configured with at least 32 characters in production.");
}

const secret = jwtSecret && jwtSecret.length >= 32 ? jwtSecret : "development-only-secret-change-before-production";

type JwtPayload = { sub: string; email: string; iat: number; exp: number; iss: string };
export type AuthUser = { id: string; email: string; name: string; passwordHash: string; salt: string };
const users = new Map<string, AuthUser>();
const userByEmail = new Map<string, string>();

function encode(value: unknown): string { return Buffer.from(JSON.stringify(value)).toString("base64url"); }
function signature(input: string): string { return createHmac("sha256", secret).update(input).digest("base64url"); }

export function issueToken(user: Pick<AuthUser, "id" | "email">): string {
  const now = Math.floor(Date.now() / 1000);
  const header = encode({ alg: "HS256", typ: "JWT" });
  const payload: JwtPayload = { sub: user.id, email: user.email, iat: now, exp: now + tokenTtlSeconds, iss: issuer };
  const body = `${header}.${encode(payload)}`;
  return `${body}.${signature(body)}`;
}

export function verifyToken(token: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) return null;
  const body = `${parts[0]}.${parts[1]}`;
  const expected = Buffer.from(signature(body));
  const actual = Buffer.from(parts[2]);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as JwtPayload;
    if (payload.iss !== issuer || typeof payload.sub !== "string" || typeof payload.exp !== "number" || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch { return null; }
}

export async function hashPassword(password: string, salt = randomBytes(16).toString("hex")): Promise<{ salt: string; hash: string }> {
  const derived = await scrypt(password, salt, 64) as Buffer;
  return { salt, hash: derived.toString("hex") };
}
export async function verifyPassword(password: string, salt: string, hash: string): Promise<boolean> {
  const actual = await hashPassword(password, salt);
  const expectedBytes = Buffer.from(hash, "hex");
  const actualBytes = Buffer.from(actual.hash, "hex");
  return expectedBytes.length === actualBytes.length && timingSafeEqual(expectedBytes, actualBytes);
}
export function findUserByEmail(email: string): AuthUser | undefined { const id = userByEmail.get(email.toLowerCase()); return id ? users.get(id) : undefined; }
export function findUserById(id: string): AuthUser | undefined { return users.get(id); }
export async function createUser(email: string, name: string, password: string): Promise<AuthUser> {
  const normalizedEmail = email.trim().toLowerCase();
  if (userByEmail.has(normalizedEmail)) throw new Error("An account with this email already exists.");
  const credentials = await hashPassword(password);
  const user: AuthUser = { id: randomBytes(16).toString("hex"), email: normalizedEmail, name: name.trim(), passwordHash: credentials.hash, salt: credentials.salt };
  users.set(user.id, user); userByEmail.set(normalizedEmail, user.id);
  return user;
}
