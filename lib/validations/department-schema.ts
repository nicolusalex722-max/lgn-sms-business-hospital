import { z } from "zod";

import type {
  DepartmentStatus,
} from "@/lib/types";


/* -------------------------------------------------------------------------- */
/* Department Status                                                          */
/* -------------------------------------------------------------------------- */

export const departmentStatuses = [
  "Active",
  "Inactive",
] as const;


/* -------------------------------------------------------------------------- */
/* Create Department                                                          */
/* -------------------------------------------------------------------------- */

export const departmentCreateSchema =
  z.object({
    departmentName: z
      .string()
      .trim()
      .min(
        2,
        "Department name is required",
      )
      .max(
        150,
        "Department name must not exceed 150 characters",
      ),

    departmentCode: z
      .string()
      .trim()
      .min(
        2,
        "Department code is required",
      )
      .max(
        50,
        "Department code must not exceed 50 characters",
      )
      .regex(
        /^[A-Za-z0-9_-]+$/,
        "Department code may only contain letters, numbers, hyphens, and underscores",
      ),

    description: z
      .string()
      .trim()
      .max(
        1000,
        "Description must not exceed 1000 characters",
      )
      .nullable()
      .optional(),
  });

export type DepartmentCreateInput =
  z.infer<
    typeof departmentCreateSchema
  >;


/* -------------------------------------------------------------------------- */
/* Update Department                                                          */
/* -------------------------------------------------------------------------- */

export const departmentUpdateSchema =
  departmentCreateSchema.extend({
    status: z.enum(
      ["Active", "Inactive"],
    ),
  });

export type DepartmentUpdateInput =
  z.infer<
    typeof departmentUpdateSchema
  >;