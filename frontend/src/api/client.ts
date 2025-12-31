import { cfg } from "../config";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${cfg.backendUrl}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "API error");
  return data as T;
}
