import { z } from "zod";

import { companyCreateSchema } from "./company-schema";
import { companyAdminCreateSchema } from "./company-admin-schema";

/* -------------------------------------------------------------------------- */
/* Create Company + Initial Company Admin                                    */
/* -------------------------------------------------------------------------- */

/**
 * Schema used when SuperAdmin creates a new company
 * together with its first CompanyAdmin.
 *
 * Database flow:
 *
 * company
 *   ↓
 * public.companies
 *
 * admin.email + admin.password
 *   ↓
 * Supabase Auth (auth.users)
 *
 * auth.users.id + company.id
 *   ↓
 * public.company_admins
 *
 * The admin password is NEVER stored in public.company_admins.
 */
export const companyWithAdminCreateSchema = z
  .object({
    company: companyCreateSchema,

    admin: companyAdminCreateSchema,
  })
  .strict();

/* -------------------------------------------------------------------------- */
/* Type                                                                       */
/* -------------------------------------------------------------------------- */

export type CompanyWithAdminCreateInput = z.infer<
  typeof companyWithAdminCreateSchema
>;