import type { NewsletterValues } from "@/lib/validation/newsletter";

export async function subscribeNewsletter(values: NewsletterValues) {
  const response = await fetch("/api/newsletter", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values), signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error(response.status === 503 ? "Newsletter sign-ups are temporarily unavailable. Please try again later." : "We couldn't save your subscription. Please try again.");
}
