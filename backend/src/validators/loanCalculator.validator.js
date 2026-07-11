import { z } from 'zod';

export const loanCalculatorSchema = z.object({
    vehicleId: z.number().int().positive(),
    downPayment: z.number().min(0),
    annualInterestRate: z.number().min(0).max(100),
    loanTermMonths: z.number().int().min(1).max(120),
});