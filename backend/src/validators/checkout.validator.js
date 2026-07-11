import { z } from "zod";

export const checkoutSchema = z.object({
  cardholderName: z.string().min(2, "Cardholder name is required"),
  cardNumber: z
    .string()
    .regex(
      /^\d{16}$/,
      "Card number must be exactly 16 digits, no spaces or dashes",
    ),
  expiryDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Expiry date must be in MM/YY format"),
  cvv: z.string().regex(/^\d{3,4}$/, "CVV must be 3 or 4 digits"),
});
