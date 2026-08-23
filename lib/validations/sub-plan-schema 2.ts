import { z } from "zod";

export const subscriptionSchema = z.object({
  plan: z
    .string()
    .trim()
    .min(2, "Plan name must be at least 2 characters.")
    .max(100, "Plan name must not exceed 100 characters."),

  status: z.enum([
    "Active",
    "Trial",
    "Expired",
    "Cancelled",
  ]),

  amount: z
    .number()
    .finite("Amount must be a valid number.")
    .min(0, "Amount cannot be negative."),

  billingCycle: z.enum([
    "Monthly",
    "Quarterly",
    "Yearly",
  ]),

  startDate: z
    .string()
    .min(1, "Start date is required.")
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "Start date must be a valid date."
    ),
});

export type SubscriptionFormData = z.infer<
  typeof subscriptionSchema
>;