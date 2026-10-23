import Fastify, { type FastifyReply, type FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import { z } from "zod";
import { createUser, findUserByEmail, findUserById, issueToken, verifyPassword, verifyToken } from "./auth.js";

type LinkRecord = { id: string; title: string; url: string; kind: string; clicks: number; enabled: boolean; position: number };
type ProfileRecord = { userId: string; username: string; displayName: string; bio: string; published: boolean; template: "stack" | "profile" | "cards" | "minimal" | "gradient"; theme: "sage" | "midnight" | "blush" | "ocean" | "lavender" | "sunshine"; linkStyle: "soft" | "outline" | "solid"; baseColor: string; links: LinkRecord[] };
const profiles = new Map<string, ProfileRecord>();
const profileByUsername = new Map<string, string>();
const cookieName = "link_session";
const emailSchema = z.string().trim().email().max(254);
const passwordSchema = z.string().min(8).max(128);
const slugSchema = z.string().trim().toLowerCase().regex(/^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/);
const linkInput = z.object({ title: z.string().trim().min(1).max(70), url: z.string().trim().max(2048).refine((value) => { try { const parsed = new URL(value); return ["http:", "https:", "mailto:", "tel:"].includes(parsed.protocol); } catch { return false; } }), kind: z.string().trim().min(1).max(30).default("Website"), enabled: z.boolean().optional() }).partial({ enabled: true });
const profilePatch = z.object({ username: slugSchema.optional(), displayName: z.string().trim().min(1).max(80).optional(), bio: z.string().trim().max(280).optional(), published: z.boolean().optional(), template: z.enum(["stack", "profile", "cards", "minimal", "gradient"]).optional(), theme: z.enum(["sage", "midnight", "blush", "ocean", "lavender", "sunshine"]).optional(), linkStyle: z.enum(["soft", "outline", "solid"]).optional(), baseColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional() });

function setSession(reply: FastifyReply, token: string) {
  const secure = process.env["NODE_ENV"] === "production" ? "; Secure" : "";
  reply.header("set-cookie", `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${secure}`);
}
function clearSession(reply: FastifyReply) { reply.header("set-cookie", `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`); }
function cookie(request: FastifyRequest): string | undefined {
  const raw = request.headers.cookie;
  if (!raw) return undefined;
  return raw.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
}
function authUser(request: FastifyRequest) {
  const bearer = request.headers.authorization?.startsWith("Bearer ") ? request.headers.authorization.slice(7) : undefined;
  const token = bearer ?? cookie(request);
  const payload = token ? verifyToken(token) : null;
  return payload ? findUserById(payload.sub) : undefined;
}
function publicProfile(profile: ProfileRecord) {
  return { username: profile.username, displayName: profile.displayName, bio: profile.bio, published: profile.published, template: profile.template, theme: profile.theme, linkStyle: profile.linkStyle, baseColor: profile.baseColor, links: profile.links.filter((link) => link.enabled).sort((a, b) => a.position - b.position).map(({ id, title, url, kind, clicks, enabled }) => ({ id, title, url, kind, clicks, enabled })) };
}
function seedProfile(userId: string, displayName: string) {
  const base = (displayName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 25) || "creator");
  let username = base; let suffix = 1;
  while (profileByUsername.has(username)) { username = `${base}-${suffix++}`; }
  const profile: ProfileRecord = { userId, username, displayName, bio: "A little bit about me goes here.", published: false, template: "stack", theme: "sage", linkStyle: "soft", baseColor: "#f7f8f3", links: [] };
  profiles.set(userId, profile); profileByUsername.set(username, userId);
  return profile;
}
export function buildApp() {
  const app = Fastify({ logger: { level: process.env["NODE_ENV"] === "production" ? "info" : "debug", redact: ["req.headers.authorization", "req.headers.cookie"] }, trustProxy: true });
  app.register(cors, { origin: process.env["WEB_ORIGIN"]?.split(",") ?? true, credentials: true });
  app.get("/health", async () => ({ status: "ok", service: "link-api" }));
  app.get("/api/v1/health", async () => ({ status: "ok", service: "link-api", version: "v1" }));

  app.post("/api/v1/auth/register", async (request, reply) => {
    const parsed = z.object({ email: emailSchema, password: passwordSchema, name: z.string().trim().min(1).max(80) }).safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ message: "Enter a valid name, email and password (at least 8 characters)." });
    try {
      const user = await createUser(parsed.data.email, parsed.data.name, parsed.data.password);
      seedProfile(user.id, user.name);
      setSession(reply, issueToken(user));
      return reply.code(201).send({ user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
      return reply.code(409).send({ message: error instanceof Error ? error.message : "Unable to create account." });
    }
  });
  app.post("/api/v1/auth/login", async (request, reply) => {
    const parsed = z.object({ email: emailSchema, password: passwordSchema }).safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ message: "Enter a valid email and password." });
    const user = findUserByEmail(parsed.data.email);
    if (!user || !(await verifyPassword(parsed.data.password, user.salt, user.passwordHash))) return reply.code(401).send({ message: "Email or password is incorrect." });
    setSession(reply, issueToken(user));
    return { user: { id: user.id, email: user.email, name: user.name } };
  });
  app.post("/api/v1/auth/logout", async (_request, reply) => { clearSession(reply); return { ok: true }; });
  app.get("/api/v1/auth/me", async (request, reply) => {
    const user = authUser(request);
    if (!user) return reply.code(401).send({ message: "Please sign in to continue." });
    return { user: { id: user.id, email: user.email, name: user.name } };
  });

  app.get("/api/v1/profile/me", async (request, reply) => {
    const user = authUser(request);
    if (!user) return reply.code(401).send({ message: "Please sign in to continue." });
    let profile = profiles.get(user.id);
    if (!profile) profile = seedProfile(user.id, user.name);
    return { ...publicProfile(profile), links: profile.links.slice().sort((a, b) => a.position - b.position) };
  });
  app.patch("/api/v1/profile/me", async (request, reply) => {
    const user = authUser(request);
    if (!user) return reply.code(401).send({ message: "Please sign in to continue." });
    const parsed = profilePatch.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ message: "Profile details are invalid." });
    const profile = profiles.get(user.id) ?? seedProfile(user.id, user.name);
    if (parsed.data.username && parsed.data.username !== profile.username) {
      const owner = profileByUsername.get(parsed.data.username);
      if (owner && owner !== user.id) return reply.code(409).send({ message: "That username is already taken." });
      profileByUsername.delete(profile.username); profileByUsername.set(parsed.data.username, user.id); profile.username = parsed.data.username;
    }
    if (parsed.data.displayName !== undefined) profile.displayName = parsed.data.displayName;
    if (parsed.data.bio !== undefined) profile.bio = parsed.data.bio;
    if (parsed.data.published !== undefined) profile.published = parsed.data.published;
    if (parsed.data.template !== undefined) profile.template = parsed.data.template;
    if (parsed.data.theme !== undefined) profile.theme = parsed.data.theme;
    if (parsed.data.linkStyle !== undefined) profile.linkStyle = parsed.data.linkStyle;
    if (parsed.data.baseColor !== undefined) profile.baseColor = parsed.data.baseColor;
    profiles.set(user.id, profile);
    return { ...publicProfile(profile), links: profile.links.slice().sort((a, b) => a.position - b.position) };
  });
  app.post("/api/v1/profile/me/links", async (request, reply) => {
    const user = authUser(request);
    if (!user) return reply.code(401).send({ message: "Please sign in to continue." });
    const parsed = linkInput.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ message: "Enter a title and a valid destination URL." });
    const profile = profiles.get(user.id) ?? seedProfile(user.id, user.name);
    const link: LinkRecord = { id: crypto.randomUUID(), title: parsed.data.title!, url: parsed.data.url!, kind: parsed.data.kind ?? "Website", clicks: 0, enabled: parsed.data.enabled ?? true, position: profile.links.length };
    profile.links.push(link); profiles.set(user.id, profile);
    return reply.code(201).send({ link });
  });
  app.patch("/api/v1/profile/me/links/:linkId", async (request, reply) => {
    const user = authUser(request);
    if (!user) return reply.code(401).send({ message: "Please sign in to continue." });
    const params = z.object({ linkId: z.string().min(1) }).safeParse(request.params);
    const parsed = linkInput.partial().safeParse(request.body);
    if (!params.success || !parsed.success) return reply.code(400).send({ message: "Link details are invalid." });
    const profile = profiles.get(user.id);
    const link = profile?.links.find((item) => item.id === params.data.linkId);
    if (!profile || !link) return reply.code(404).send({ message: "Link not found." });
    Object.assign(link, parsed.data);
    return { link };
  });
  app.delete("/api/v1/profile/me/links/:linkId", async (request, reply) => {
    const user = authUser(request);
    if (!user) return reply.code(401).send({ message: "Please sign in to continue." });
    const params = z.object({ linkId: z.string().min(1) }).safeParse(request.params);
    if (!params.success) return reply.code(400).send({ message: "Link id is invalid." });
    const profile = profiles.get(user.id);
    if (!profile) return reply.code(404).send({ message: "Link not found." });
    const originalLength = profile.links.length;
    profile.links = profile.links.filter((link) => link.id !== params.data.linkId);
    if (profile.links.length === originalLength) return reply.code(404).send({ message: "Link not found." });
    profile.links.forEach((link, index) => { link.position = index; });
    return { ok: true };
  });
  app.get("/api/v1/public/:username", async (request, reply) => {
    const parsed = z.object({ username: slugSchema }).safeParse(request.params);
    if (!parsed.success) return reply.code(404).send({ message: "Profile not found." });
    const userId = profileByUsername.get(parsed.data.username);
    const profile = userId ? profiles.get(userId) : undefined;
    if (!profile || !profile.published) return reply.code(404).send({ message: "Profile not found." });
    return publicProfile(profile);
  });
  return app;
}
