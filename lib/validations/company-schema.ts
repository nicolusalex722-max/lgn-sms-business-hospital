import { z } from "zod";



export const companyCreateSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(2, "Company name is required")
    .max(150, "Company name must not exceed 150 characters"),

  displayName: z
    .string()
    .trim()
    .min(2, "Display name is required")
    .max(150, "Display name must not exceed 150 characters"),

  email: z
    .string()
    .trim()
    .email("Please enter a valid company email address")
    .max(255, "Email must not exceed 255 characters"),

  phone: z
  .string()
  .trim()
  .min(10, "Phone number must contain at least 10 characters")
  .max(30, "Phone number must not exceed 30 characters")
  .regex(
    /^[0-9+\-\s()]+$/,
    "Please enter a valid phone number",
  ),

  address: z
  .string()
  .trim()
  .max(50, "Address must not exceed 50 characters")
  .nullable()
  .optional(),

  tin: z
    .string()
    .trim()
    .max(50, "TIN must not exceed 50 characters")
    .nullable()
    .optional(),

  registrationNumber: z
    .string()
    .trim()
    .max(100, "Registration number must not exceed 100 characters")
    .nullable()
    .optional(),
});

export const companyUpdateSchema = companyCreateSchema.extend({
  status: z.enum(["Active", "Inactive", "Suspended"]),
});

export type CompanyCreateInput = z.infer<typeof companyCreateSchema>;

export type CompanyUpdateInput = z.infer<typeof companyUpdateSchema>;