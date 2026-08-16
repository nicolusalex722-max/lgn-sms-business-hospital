import { z } from "zod";

/* -------------------------------------------------------------------------- */
/* Branch Status                                                              */
/* -------------------------------------------------------------------------- */

export const branchStatuses = [
  "Active",
  "Inactive",
] as const;


/* -------------------------------------------------------------------------- */
/* Create Branch                                                              */
/* -------------------------------------------------------------------------- */

export const branchCreateSchema =
  z.object({
    branchName: z
      .string()
      .trim()
      .min(
        2,
        "Branch name is required",
      )
      .max(
        150,
        "Branch name must not exceed 150 characters",
      ),

    branchCode: z
      .string()
      .trim()
      .min(
        2,
        "Branch code is required",
      )
      .max(
        50,
        "Branch code must not exceed 50 characters",
      )
      .regex(
        /^[A-Za-z0-9_-]+$/,
        "Branch code may only contain letters, numbers, hyphens, and underscores",
      ),

    location: z
      .string()
      .trim()
      .max(
        500,
        "Location must not exceed 500 characters",
      )
      .nullable()
      .optional(),
  });


export type BranchCreateInput =
  z.infer<
    typeof branchCreateSchema
  >;


/* -------------------------------------------------------------------------- */
/* Update Branch                                                              */
/* -------------------------------------------------------------------------- */

export const branchUpdateSchema =
  branchCreateSchema.extend({
    status: z.enum(
      branchStatuses,
    ),
  });


export type BranchUpdateInput =
  z.infer<
    typeof branchUpdateSchema
  >;