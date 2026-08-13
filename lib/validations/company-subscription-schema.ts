
import { z } from "zod";

/* -------------------------------------------------------------------------- */
/* Status                                                                     */
/* -------------------------------------------------------------------------- */

export const COMPANY_SUBSCRIPTION_STATUSES = [
  "Active",
  "Trial",
  "Suspended",
  "Expired",
  "Cancelled",
] as const;

export const companySubscriptionStatusSchema = z.enum(
  COMPANY_SUBSCRIPTION_STATUSES
);

/* -------------------------------------------------------------------------- */
/* ID                                                                         */
/* -------------------------------------------------------------------------- */

const uuidSchema = z
  .string()
  .uuid("Invalid ID.");

/* -------------------------------------------------------------------------- */
/* Date                                                                       */
/* -------------------------------------------------------------------------- */

const dateSchema = z
  .string()
  .trim()
  .min(1, "Date is required.")
  .refine(
    (value) => !Number.isNaN(Date.parse(value)),
    "Invalid date."
  );

/* -------------------------------------------------------------------------- */
/* Create                                                                     */
/* -------------------------------------------------------------------------- */

export const companySubscriptionCreateSchema = z.object({
  companyId: uuidSchema,

  productId: uuidSchema,

  subscriptionPlanId: uuidSchema,

  status: companySubscriptionStatusSchema.default("Active"),

  startDate: dateSchema,

  endDate: dateSchema
    .optional()
    .nullable()
    .or(z.literal("")),
});

/* -------------------------------------------------------------------------- */
/* Update                                                                     */
/* -------------------------------------------------------------------------- */

export const companySubscriptionUpdateSchema = z.object({
  companyId: uuidSchema,

  productId: uuidSchema,

  subscriptionPlanId: uuidSchema,

  status: companySubscriptionStatusSchema,

  startDate: dateSchema,

  endDate: dateSchema
    .optional()
    .nullable()
    .or(z.literal("")),
});

/* -------------------------------------------------------------------------- */
/* Form Data Types                                                            */
/* -------------------------------------------------------------------------- */

export type CompanySubscriptionCreateInput = z.infer<
  typeof companySubscriptionCreateSchema
>;

export type CompanySubscriptionUpdateInput = z.infer<
  typeof companySubscriptionUpdateSchema
>;

/* -------------------------------------------------------------------------- */
/* Shared Input Type                                                          */
/* -------------------------------------------------------------------------- */

export type CompanySubscriptionFormData =
  CompanySubscriptionCreateInput;

