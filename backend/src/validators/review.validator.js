import { z } from "zod";

export const createReviewSchema = z.object({
  vehicleId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5), // this is because reviews can only be 1 - 5 starts
  comment: z.string().max(1000).optional(),
});
