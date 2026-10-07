import { newsletterSchema } from "@/lib/validation/newsletter";

export async function POST(request: Request) {
  let input: unknown;
  try { input = await request.json(); }
  catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  const parsed = newsletterSchema.safeParse(input);
  if (!parsed.success) return Response.json({ error: "Please check your email and consent." }, { status: 400 });
  const endpoint = process.env.NEWSLETTER_ENDPOINT;
  if (!endpoint) return Response.json({ error: "Sign-ups are not open yet." }, { status: 503 });
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(process.env.NEWSLETTER_API_KEY ? { Authorization: `Bearer ${process.env.NEWSLETTER_API_KEY}` } : {}) },
      body: JSON.stringify({ email: parsed.data.email, consent: true }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return Response.json({ error: "Please try again later." }, { status: 503 });
    return Response.json({ subscribed: true });
  } catch { return Response.json({ error: "Please try again later." }, { status: 503 }); }
}
