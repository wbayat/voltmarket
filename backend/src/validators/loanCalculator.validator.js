import { z } from "zod";

export const loanCalculatorSchema = z.object({
  vehicleId: z.number().int().positive(),
  downPayment: z.number().min(0),
  annualInterestRate: z.number().min(0).max(100),
  loanTermMonths: z
    .number()
    .int()
    .min(12, "Loan term must be at least 12 months")
    .max(120, "Loan term cannot exceed 120 months"),
});
