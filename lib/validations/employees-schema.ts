import { z } from "zod";

/* -------------------------------------------------------------------------- */
/* Employee Create Schema                                                     */
/* -------------------------------------------------------------------------- */

export const employeeCreateSchema = z.object({
  employeeNumber: z
    .string()
    .trim()
    .min(
      1,
      "Employee number is required",
    )
    .max(
      50,
      "Employee number must not exceed 50 characters",
    ),

  firstName: z
    .string()
    .trim()
    .min(
      2,
      "First name is required",
    )
    .max(
      100,
      "First name must not exceed 100 characters",
    ),

  middleName: z
    .string()
    .trim()
    .max(
      100,
      "Middle name must not exceed 100 characters",
    )
    .nullable()
    .optional(),

  lastName: z
    .string()
    .trim()
    .min(
      2,
      "Last name is required",
    )
    .max(
      100,
      "Last name must not exceed 100 characters",
    ),

  email: z
    .string()
    .trim()
    .email(
      "Please enter a valid email address",
    )
    .max(
      255,
      "Email must not exceed 255 characters",
    )
    .nullable()
    .optional(),

  phone: z
    .string()
    .trim()
    .min(
      10,
      "Phone number must contain at least 10 characters",
    )
    .max(
      30,
      "Phone number must not exceed 30 characters",
    )
    .regex(
      /^[0-9+\-\s()]+$/,
      "Please enter a valid phone number",
    )
    .nullable()
    .optional(),

  departmentId: z
    .string()
    .uuid(
      "Invalid department",
    )
    .nullable()
    .optional(),

  branchId: z
    .string()
    .uuid(
      "Invalid branch",
    )
    .nullable()
    .optional(),

  position: z
    .string()
    .trim()
    .min(
      2,
      "Position is required",
    )
    .max(
      150,
      "Position must not exceed 150 characters",
    ),

  salary: z
    .number()
    .nonnegative(
      "Salary cannot be negative",
    )
    .nullable()
    .optional(),

  birthdate: z
    .string()
    .trim()
    .nullable()
    .optional(),

  nextOfKinName: z
    .string()
    .trim()
    .max(
      200,
      "Next of kin name must not exceed 200 characters",
    )
    .nullable()
    .optional(),

  nextOfKinPhone: z
    .string()
    .trim()
    .max(
      30,
      "Next of kin phone must not exceed 30 characters",
    )
    .regex(
      /^[0-9+\-\s()]+$/,
      "Please enter a valid next of kin phone number",
    )
    .nullable()
    .optional(),

  guarantorName: z
    .string()
    .trim()
    .max(
      200,
      "Guarantor name must not exceed 200 characters",
    )
    .nullable()
    .optional(),

  guarantorPhone: z
    .string()
    .trim()
    .max(
      30,
      "Guarantor phone must not exceed 30 characters",
    )
    .regex(
      /^[0-9+\-\s()]+$/,
      "Please enter a valid guarantor phone number",
    )
    .nullable()
    .optional(),
});

/* -------------------------------------------------------------------------- */
/* Employee Update Schema                                                     */
/* -------------------------------------------------------------------------- */

export const employeeUpdateSchema =
  employeeCreateSchema.extend({
    status: z.enum([
      "Active",
      "Inactive",
      "Suspended",
    ]),
  });

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type EmployeeCreateInput =
  z.infer<typeof employeeCreateSchema>;

export type EmployeeUpdateInput =
  z.infer<typeof employeeUpdateSchema>;