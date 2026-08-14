"use client";

import { useCallback, useEffect, useState } from "react";

import {
  createCompany as createCompanyAction,
  createCompanyWithAdmin as createCompanyWithAdminAction,
  deleteCompany as deleteCompanyAction,
  getCompanies,
  getCompanyById,
  updateCompany as updateCompanyAction,
} from "@/lib/actions/company-actions";

import type { Company } from "@/lib/types";

import type {
  CompanyCreateInput,
  CompanyUpdateInput,
} from "@/lib/validations/company-schema";

import type { CompanyAdminCreateInput } from "@/lib/validations/company-admin-schema";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Payload used when creating a company together with
 * its initial company administrator.
 *
 * Company:
 *   -> public.companies
 *
 * Admin:
 *   -> auth.users
 *   -> public.company_admins
 *
 * Password is only used during Auth account creation.
 * It is never stored in public.company_admins.
 */
export type CompanyWithAdminCreateInput = {
  company: CompanyCreateInput;
  admin: CompanyAdminCreateInput;
};

/* -------------------------------------------------------------------------- */
/* Hook                                                                       */
/* -------------------------------------------------------------------------- */

export function useCompanies() {
  const [companies, setCompanies] =
    useState<Company[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  /* ------------------------------------------------------------------------ */
  /* GET ALL COMPANIES                                                        */
  /* ------------------------------------------------------------------------ */

  const fetchCompanies = useCallback(
    async () => {
      try {
        setLoading(true);
        setError(null);

        const result =
          await getCompanies();

        if (!result.success) {
          setError(
            result.error ??
              "Failed to fetch companies.",
          );

          return;
        }

        setCompanies(
          result.data ?? [],
        );
      } catch (error) {
        console.error(
          "fetchCompanies error:",
          error,
        );

        setError(
          "Something went wrong while fetching companies.",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /* ------------------------------------------------------------------------ */
  /* GET COMPANY BY ID                                                        */
  /* ------------------------------------------------------------------------ */

  const fetchCompany = useCallback(
    async (id: string) => {
      try {
        setError(null);

        const result =
          await getCompanyById(id);

        if (!result.success) {
          setError(
            result.error ??
              "Failed to fetch company.",
          );

          return null;
        }

        return result.data ?? null;
      } catch (error) {
        console.error(
          "fetchCompany error:",
          error,
        );

        setError(
          "Something went wrong while fetching the company.",
        );

        return null;
      }
    },
    [],
  );

  /* ------------------------------------------------------------------------ */
  /* CREATE COMPANY                                                           */
  /* ------------------------------------------------------------------------ */

  /**
   * Company-only creation.
   *
   * This creates a record in:
   *
   *   public.companies
   *
   * It does NOT create a company administrator.
   *
   * For the normal onboarding flow use:
   *
   *   createCompanyWithAdmin()
   */
  const createCompany = useCallback(
    async (data: CompanyCreateInput) => {
      try {
        setError(null);

        const result =
          await createCompanyAction(
            data,
          );

        if (!result.success) {
          setError(
            result.error ??
              "Failed to create company.",
          );

          return {
            success: false,
            error: result.error,
          };
        }

        if (result.data) {
          setCompanies(
            (current) => [
              result.data!,
              ...current,
            ],
          );
        }

        return {
          success: true,
          data: result.data,
        };
      } catch (error) {
        console.error(
          "createCompany error:",
          error,
        );

        const message =
          "Something went wrong while creating the company.";

        setError(message);

        return {
          success: false,
          error: message,
        };
      }
    },
    [],
  );

  /* ------------------------------------------------------------------------ */
  /* CREATE COMPANY + INITIAL ADMIN                                          */
  /* ------------------------------------------------------------------------ */

  /**
   * Creates a complete company onboarding:
   *
   * 1. public.companies
   * 2. auth.users
   * 3. public.company_admins
   *
   * The company_admins row stores:
   *
   *   auth_user_id
   *   company_id
   *   status
   *
   * The password is NEVER stored in company_admins.
   *
   * This is the method used by CompanyWizardShell.
   */
  const createCompanyWithAdmin =
    useCallback(
      async (
        data: CompanyWithAdminCreateInput,
      ) => {
        try {
          setError(null);

          const result =
            await createCompanyWithAdminAction(
              data,
            );

          if (!result.success) {
            setError(
              result.error ??
                "Failed to create company and company admin.",
            );

            return {
              success: false,
              error: result.error,
            };
          }

          /*
           * The action returns the newly
           * created company.
           *
           * Add it to the local list so the
           * company table updates immediately
           * without another fetch.
           */
          if (result.data) {
            setCompanies(
              (current) => [
                result.data!,
                ...current,
              ],
            );
          }

          return {
            success: true,
            data: result.data,
          };
        } catch (error) {
          console.error(
            "createCompanyWithAdmin error:",
            error,
          );

          const message =
            "Something went wrong while creating the company and admin.";

          setError(message);

          return {
            success: false,
            error: message,
          };
        }
      },
      [],
    );

  /* ------------------------------------------------------------------------ */
  /* UPDATE COMPANY                                                           */
  /* ------------------------------------------------------------------------ */

  const updateCompany =
    useCallback(
      async (
        id: string,
        data: CompanyUpdateInput,
      ) => {
        try {
          setError(null);

          const result =
            await updateCompanyAction(
              id,
              data,
            );

          if (!result.success) {
            setError(
              result.error ??
                "Failed to update company.",
            );

            return {
              success: false,
              error: result.error,
            };
          }

          if (result.data) {
            setCompanies(
              (current) =>
                current.map(
                  (company) =>
                    company.id === id
                      ? result.data!
                      : company,
                ),
            );
          }

          return {
            success: true,
            data: result.data,
          };
        } catch (error) {
          console.error(
            "updateCompany error:",
            error,
          );

          const message =
            "Something went wrong while updating the company.";

          setError(message);

          return {
            success: false,
            error: message,
          };
        }
      },
      [],
    );

  /* ------------------------------------------------------------------------ */
  /* DELETE COMPANY                                                           */
  /* ------------------------------------------------------------------------ */

  const deleteCompany =
    useCallback(
      async (id: string) => {
        try {
          setError(null);

          const result =
            await deleteCompanyAction(
              id,
            );

          if (!result.success) {
            setError(
              result.error ??
                "Failed to delete company.",
            );

            return {
              success: false,
              error: result.error,
            };
          }

          setCompanies(
            (current) =>
              current.filter(
                (company) =>
                  company.id !== id,
              ),
          );

          return {
            success: true,
          };
        } catch (error) {
          console.error(
            "deleteCompany error:",
            error,
          );

          const message =
            "Something went wrong while deleting the company.";

          setError(message);

          return {
            success: false,
            error: message,
          };
        }
      },
      [],
    );

  /* ------------------------------------------------------------------------ */
  /* REFRESH                                                                  */
  /* ------------------------------------------------------------------------ */

  const refreshCompanies =
    useCallback(
      async () => {
        await fetchCompanies();
      },
      [fetchCompanies],
    );

  /* ------------------------------------------------------------------------ */
  /* INITIAL FETCH                                                             */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  /* ------------------------------------------------------------------------ */
  /* RETURN                                                                   */
  /* ------------------------------------------------------------------------ */

  return {
    companies,

    loading,
    error,

    fetchCompanies,
    fetchCompany,

    /*
     * Company-only creation.
     */
    createCompany,

    /*
     * Company onboarding creation.
     *
     * CompanyWizardShell should use this.
     */
    createCompanyWithAdmin,

    updateCompany,
    deleteCompany,

    refreshCompanies,
  };
}