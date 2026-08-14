import { z } from "zod";

import {
  COMPANY_ADMIN_STATUSES,
} from "@/lib/types";

/**
 * Company Admin Status
 */
export const companyAdminStatusSchema = z.enum(
  COMPANY_ADMIN_STATUSES as [
    (typeof COMPANY_ADMIN_STATUSES)[number],
    ...(typeof COMPANY_ADMIN_STATUSES)[number][],
  ],
);

/**
 * Create Company Admin
 */
export const companyAdminCreateSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Admin email is required.")
    .email("Please enter a valid admin email address.")
    .max(255, "Admin email cannot exceed 255 characters."),

  password: z
    .string()
    .min(8, "Password must contain at least 8 characters.")
    .max(72, "Password cannot exceed 72 characters."),
});

/**
 * Update Company Admin
 */
export const companyAdminUpdateSchema = z.object({
  status: companyAdminStatusSchema,
});

/**
 * Inferred Types
 */
export type CompanyAdminCreateInput = z.infer<
  typeof companyAdminCreateSchema
>;

export type CompanyAdminUpdateInput = z.infer<
  typeof companyAdminUpdateSchema
>;

export type CompanyAdminStatusInput = z.infer<
  typeof companyAdminStatusSchema
>;