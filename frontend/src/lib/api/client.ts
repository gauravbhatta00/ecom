import { apiBaseUrl } from "../config";

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) { super(message); this.name = "ApiError"; }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  const response = await fetch(`${apiBaseUrl}${path}`, { ...options, headers });
  if (!response.ok) throw new ApiError("We couldn't load this information. Please try again.", response.status);
  return response.json() as Promise<T>;
}
