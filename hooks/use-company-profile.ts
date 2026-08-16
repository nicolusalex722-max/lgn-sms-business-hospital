"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getMyCompanyProfile,
  refreshMyCompanyProfile,
  updateMyCompanyProfile,
} from "@/lib/actions/company-profile";

import type {
  Company,
} from "@/lib/types";

import type {
  CompanyProfileUpdateInput,
} from "@/lib/validations/company-profile-schema";

/* -------------------------------------------------------------------------- */
/* Hook                                                                       */
/* -------------------------------------------------------------------------- */

export function useCompanyProfile() {
  const [company, setCompany] =
    useState<Company | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [updating, setUpdating] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  /* ------------------------------------------------------------------------ */
  /* GET MY COMPANY PROFILE                                                   */
  /* ------------------------------------------------------------------------ */

  const fetchCompanyProfile =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const result =
          await getMyCompanyProfile();

        if (!result.success) {
          setError(
            result.error ??
              "Failed to fetch company profile.",
          );

          return null;
        }

        const companyData =
          result.data ?? null;

        setCompany(
          companyData,
        );

        return companyData;
      } catch (error) {
        console.error(
          "fetchCompanyProfile error:",
          error,
        );

        const message =
          "Something went wrong while fetching your company profile.";

        setError(message);

        return null;
      } finally {
        setLoading(false);
      }
    }, []);

  /* ------------------------------------------------------------------------ */
  /* UPDATE MY COMPANY PROFILE                                                */
  /* ------------------------------------------------------------------------ */

  const updateCompanyProfile =
    useCallback(
      async (
        data: CompanyProfileUpdateInput,
      ) => {
        try {
          setUpdating(true);
          setError(null);
          setSuccessMessage(null);

          const result =
            await updateMyCompanyProfile(
              data,
            );

          if (!result.success) {
            setError(
              result.error ??
                "Failed to update company profile.",
            );

            return {
              success: false,
              error: result.error,
            };
          }

          if (result.data) {
            setCompany(
              result.data,
            );
          }

          setSuccessMessage(
            "Company profile updated successfully.",
          );

          return {
            success: true,
            data: result.data,
          };
        } catch (error) {
          console.error(
            "updateCompanyProfile error:",
            error,
          );

          const message =
            "Something went wrong while updating your company profile.";

          setError(message);

          return {
            success: false,
            error: message,
          };
        } finally {
          setUpdating(false);
        }
      },
      [],
    );

  /* ------------------------------------------------------------------------ */
  /* REFRESH                                                                  */
  /* ------------------------------------------------------------------------ */

  const refreshCompanyProfile =
    useCallback(async () => {
      try {
        setError(null);

        const result =
          await refreshMyCompanyProfile();

        if (!result.success) {
          setError(
            result.error ??
              "Failed to refresh company profile.",
          );

          return null;
        }

        const companyData =
          result.data ?? null;

        setCompany(
          companyData,
        );

        return companyData;
      } catch (error) {
        console.error(
          "refreshCompanyProfile error:",
          error,
        );

        const message =
          "Something went wrong while refreshing your company profile.";

        setError(message);

        return null;
      }
    }, []);

  /* ------------------------------------------------------------------------ */
  /* CLEAR MESSAGES                                                           */
  /* ------------------------------------------------------------------------ */

  const clearMessages =
    useCallback(() => {
      setError(null);
      setSuccessMessage(null);
    }, []);

  /* ------------------------------------------------------------------------ */
  /* INITIAL FETCH                                                            */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const initialFetch = window.setTimeout(() => {
      void fetchCompanyProfile();
    }, 0);

    return () => window.clearTimeout(initialFetch);
  }, [fetchCompanyProfile]);

  /* ------------------------------------------------------------------------ */
  /* RETURN                                                                   */
  /* ------------------------------------------------------------------------ */

  return {
    /*
     * Current authenticated
     * CompanyAdmin's company.
     */
    company,

    /*
     * Loading state for initial
     * profile retrieval.
     */
    loading,

    /*
     * Loading state specifically
     * for profile update.
     */
    updating,

    /*
     * Error returned from actions.
     */
    error,

    /*
     * Success message after update.
     */
    successMessage,

    /*
     * Fetch current company profile.
     */
    fetchCompanyProfile,

    /*
     * Update current company profile.
     */
    updateCompanyProfile,

    /*
     * Refresh current company profile.
     */
    refreshCompanyProfile,

    /*
     * Clear UI messages.
     */
    clearMessages,
  };
}
