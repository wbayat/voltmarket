import { z } from "zod";

export const addToCartSchema = z.object({
  vehicleId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(10).default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(10),
});
