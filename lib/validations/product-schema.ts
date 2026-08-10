import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters")
    .max(50, "Product name must not exceed 50 characters"),

  type: z.enum(["Business", "Education", "Hospital"]),

  description: z
    .string()
    .trim()
    .max(1000, "Description must not exceed 1000 characters")
    .optional()
    .or(z.literal("")),

  status: z.enum(["Active", "Inactive"]),
});

export type ProductFormData = z.infer<typeof productSchema>;