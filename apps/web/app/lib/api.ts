export type LinkItem = { id: string; title: string; url: string; kind: string; clicks: number; enabled: boolean };
export type Profile = { username: string; displayName: string; bio: string; published: boolean; template?: "stack" | "profile" | "cards" | "minimal" | "gradient"; theme?: "sage" | "midnight" | "blush" | "ocean" | "lavender" | "sunshine"; linkStyle?: "soft" | "outline" | "solid"; links: LinkItem[] };
const API_BASE = import.meta.env["VITE_API_URL"] ?? (import.meta.env.DEV ? "http://localhost:3001" : "");

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("content-type")) headers.set("content-type", "application/json");
  const response = await fetch(`${API_BASE}/api/v1${path}`, {
    ...options,
    credentials: "include",
    headers,
  });
  const payload: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof payload === "object" && payload !== null && "message" in payload && typeof payload.message === "string" ? payload.message : "Something went wrong. Please try again.";
    throw new Error(message);
  }
  return payload as T;
}
