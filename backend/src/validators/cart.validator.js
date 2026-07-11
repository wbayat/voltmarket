import { z } from "zod";

export const addToCartSchema = z.object({
  vehicleId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(10).default(1),
  // new customization options
  selectedColor: z.string().min(1, "selectedColor is required"),
  selectedInteriorColor: z.string().min(1, "selectedInteriorColor is required"),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(10).optional(),
  selectedColor: z.string().min(1).optional(),
  selectedInteriorColor: z.string().min(1).optional(),
});
