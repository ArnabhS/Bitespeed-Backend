import type { IdentifyRequest, IdentifyResponse } from "../types/identify";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export async function identify(payload: IdentifyRequest): Promise<IdentifyResponse> {
  const res = await fetch(`${BASE_URL}/api/identify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error ?? "Something went wrong.");
  }

  return data as IdentifyResponse;
}
