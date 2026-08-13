import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must contain at least 8 characters")
  .max(72, "Password must not exceed 72 characters")
  .regex(
    /[A-Z]/,
    "Password must contain at least one uppercase letter",
  )
  .regex(
    /[a-z]/,
    "Password must contain at least one lowercase letter",
  )
  .regex(
    /[0-9]/,
    "Password must contain at least one number",
  );

const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must contain at least 3 characters")
  .max(100, "Username must not exceed 100 characters")
  .regex(
    /^[a-zA-Z0-9._-]+$/,
    "Username can only contain letters, numbers, dots, underscores, and hyphens",
  );

const emailSchema = z
  .string()
  .trim()
  .email("Please enter a valid email address")
  .max(255, "Email must not exceed 255 characters");

const roleSchema = z.literal("User");

const statusSchema = z.enum([
  "Active",
  "Inactive",
  "Suspended",
]);

/**
 * Create Company User
 *
 * Used when a Company Admin registers a new user.
 *
 * companyId, authUserId and createdBy are intentionally
 * excluded because they must be generated/resolved by
 * the backend from the authenticated Company Admin.
 */
export const companyUserCreateSchema = z.object({
  username: usernameSchema,

  email: emailSchema,

  password: passwordSchema,

  role: roleSchema,

  status: statusSchema.default("Active"),
});

/**
 * Update Company User
 *
 * Password is optional because updating a user does not
 * necessarily mean changing their password.
 */
export const companyUserUpdateSchema = z.object({
  username: usernameSchema,

  email: emailSchema,

  role: roleSchema,

  status: statusSchema,
});

/**
 * Optional schema for changing a user's password separately.
 *
 * This should be used by a dedicated password-change action
 * rather than the normal user update action.
 */
export const companyUserPasswordSchema = z.object({
  password: passwordSchema,

  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  },
);

/**
 * TypeScript types inferred directly from Zod schemas.
 */
export type CompanyUserCreateInput = z.infer<
  typeof companyUserCreateSchema
>;

export type CompanyUserUpdateInput = z.infer<
  typeof companyUserUpdateSchema
>;

export type CompanyUserPasswordInput = z.infer<
  typeof companyUserPasswordSchema
>;