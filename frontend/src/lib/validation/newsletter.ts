import { z } from "zod";

export const newsletterSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(254, "Email address is too long."),
  consent: z.boolean().refine(Boolean, "Please agree to receive the newsletter."),
});
export type NewsletterValues = z.infer<typeof newsletterSchema>;
