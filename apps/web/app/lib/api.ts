export type LinkItem = { id: string; title: string; url: string; kind: string; clicks: number; enabled: boolean };
export type Profile = { username: string; displayName: string; bio: string; published: boolean; links: LinkItem[] };
const API_BASE = (typeof window !== "undefined" ? (window as Window & { ENV?: { API_URL?: string } }).ENV?.API_URL : undefined) ?? "";

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}/api/v1${path}`, {
    ...options,
    credentials: "include",
    headers: { "content-type": "application/json", ...options.headers },
  });
  const payload: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof payload === "object" && payload !== null && "message" in payload && typeof payload.message === "string" ? payload.message : "Something went wrong. Please try again.";
    throw new Error(message);
  }
  return payload as T;
}
