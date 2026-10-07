export const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");
export const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
