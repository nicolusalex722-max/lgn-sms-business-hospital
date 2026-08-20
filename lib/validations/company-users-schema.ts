import { z } from "zod";

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

export const COMPANY_USER_ROLES = [
  "User",
] as const;

export const COMPANY_USER_STATUSES = [
  "Active",
  "Inactive",
  "Suspended",
] as const;

/* -------------------------------------------------------------------------- */
/* Create Company User                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Creates an application login account for an existing employee.
 *
 * The employee must already exist and belong to the
 * currently authenticated CompanyAdmin's company.
 */
export const companyUserCreateSchema = z.object({
  employeeId: z
    .string()
    .uuid("Invalid employee ID."),

  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .max(
      255,
      "Email must not exceed 255 characters.",
    ),

  phone: z
    .string()
    .trim()
    .min(
      10,
      "Phone number must contain at least 10 characters.",
    )
    .max(
      30,
      "Phone number must not exceed 30 characters.",
    )
    .regex(
      /^[0-9+\-\s()]+$/,
      "Please enter a valid phone number.",
    ),

  displayName: z
    .string()
    .trim()
    .min(
      2,
      "Display name is required.",
    )
    .max(
      150,
      "Display name must not exceed 150 characters.",
    ),

  role: z.enum(
    COMPANY_USER_ROLES,
  ),

  /*
   * The role ID of an existing role from the company's
   * roles table. This is used for role assignment via
   * company_user_roles.
   */
  roleId: z
    .string()
    .uuid("Invalid role ID.")
    .optional(),

  password: z
    .string()
    .min(
      8,
      "Password must contain at least 8 characters.",
    )
    .max(
      100,
      "Password must not exceed 100 characters.",
    ),
});

/* -------------------------------------------------------------------------- */
/* Update Company User                                                        */
/* -------------------------------------------------------------------------- */

export const companyUserUpdateSchema =
  z.object({
    email: z
      .string()
      .trim()
      .email(
        "Please enter a valid email address.",
      )
      .max(
        255,
        "Email must not exceed 255 characters.",
      ),

    phone: z
      .string()
      .trim()
      .min(
        10,
        "Phone number must contain at least 10 characters.",
      )
      .max(
        30,
        "Phone number must not exceed 30 characters.",
      )
      .regex(
        /^[0-9+\-\s()]+$/,
        "Please enter a valid phone number.",
      ),

    displayName: z
      .string()
      .trim()
      .min(
        2,
        "Display name is required.",
      )
      .max(
        150,
        "Display name must not exceed 150 characters.",
      ),

    role: z.enum(
      COMPANY_USER_ROLES,
    ),

    /*
     * The role ID of an existing role from the company's
     * roles table. Used for role assignment via
     * company_user_roles.
     */
    roleId: z
      .string()
      .uuid("Invalid role ID.")
      .optional(),

    status: z.enum(
      COMPANY_USER_STATUSES,
    ),
  });

/* -------------------------------------------------------------------------- */
/* Export Types                                                               */
/* -------------------------------------------------------------------------- */

export type CompanyUserCreateInput =
  z.infer<
    typeof companyUserCreateSchema
  >;

export type CompanyUserUpdateInput =
  z.infer<
    typeof companyUserUpdateSchema
  >;