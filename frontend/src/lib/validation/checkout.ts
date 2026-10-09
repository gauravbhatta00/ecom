import { z } from "zod";
export const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(150, "Use at most 150 characters."),
  address: z.string().trim().min(8, "Enter a complete delivery address.").max(500, "Use at most 500 characters."),
  phone: z.string().trim().regex(/^\+?[\d\s()-]+$/, "Enter a valid phone number.").transform(value => value.replace(/\D/g, "")).pipe(z.string().min(10, "Use at least 10 digits.").max(15, "Use at most 15 digits.")),
  payment_method: z.literal("COD"),
});

