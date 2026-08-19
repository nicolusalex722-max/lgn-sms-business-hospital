"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  createCompanyUser as createCompanyUserAction,
  deleteCompanyUser as deleteCompanyUserAction,
  getCompanyUserById,
  getCompanyUsers,
  updateCompanyUser as updateCompanyUserAction,
  updateCompanyUserStatus as updateCompanyUserStatusAction,
} from "@/lib/actions/company-users-actions";

import type {
  CompanyUser,
  CompanyUserStatus,
} from "@/lib/types";

import type {
  CompanyUserCreateInput,
  CompanyUserUpdateInput,
} from "@/lib/validations/company-users-schema";

/* -------------------------------------------------------------------------- */
/* Hook                                                                       */
/* -------------------------------------------------------------------------- */

export function useCompanyUsers() {
  const [companyUsers, setCompanyUsers] =
    useState<CompanyUser[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  /* ------------------------------------------------------------------------ */
  /* GET ALL USERS                                                            */
  /* ------------------------------------------------------------------------ */

  const fetchCompanyUsers =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const result =
          await getCompanyUsers();

        if (!result.success) {
          setError(
            result.error ??
              "Failed to fetch company users.",
          );

          return;
        }

        setCompanyUsers(
          result.data ?? [],
        );
      } catch (error) {
        console.error(
          "fetchCompanyUsers error:",
          error,
        );

        setError(
          "Something went wrong while fetching company users.",
        );
      } finally {
        setLoading(false);
      }
    }, []);

  /* ------------------------------------------------------------------------ */
  /* GET USER BY ID                                                           */
  /* ------------------------------------------------------------------------ */

  const fetchCompanyUser =
    useCallback(
      async (id: string) => {
        try {
          setError(null);

          const result =
            await getCompanyUserById(
              id,
            );

          if (!result.success) {
            setError(
              result.error ??
                "Failed to fetch company user.",
            );

            return null;
          }

          return result.data ?? null;
        } catch (error) {
          console.error(
            "fetchCompanyUser error:",
            error,
          );

          setError(
            "Something went wrong while fetching the company user.",
          );

          return null;
        }
      },
      [],
    );

  /* ------------------------------------------------------------------------ */
  /* CREATE USER                                                              */
  /* ------------------------------------------------------------------------ */

  const createCompanyUser =
    useCallback(
      async (
        data: CompanyUserCreateInput,
      ) => {
        try {
          setError(null);

          const result =
            await createCompanyUserAction(
              data,
            );

          if (!result.success) {
            setError(
              result.error ??
                "Failed to create company user.",
            );

            return {
              success: false,
              error: result.error,
            };
          }

          if (result.data) {
            setCompanyUsers(
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
            "createCompanyUser error:",
            error,
          );

          const message =
            "Something went wrong while creating the company user.";

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
  /* UPDATE USER                                                              */
  /* ------------------------------------------------------------------------ */

  const updateCompanyUser =
    useCallback(
      async (
        id: string,
        data: CompanyUserUpdateInput,
      ) => {
        try {
          setError(null);

          const result =
            await updateCompanyUserAction(
              id,
              data,
            );

          if (!result.success) {
            setError(
              result.error ??
                "Failed to update company user.",
            );

            return {
              success: false,
              error: result.error,
            };
          }

          if (result.data) {
            setCompanyUsers(
              (current) =>
                current.map(
                  (companyUser) =>
                    companyUser.id === id
                      ? result.data!
                      : companyUser,
                ),
            );
          }

          return {
            success: true,
            data: result.data,
          };
        } catch (error) {
          console.error(
            "updateCompanyUser error:",
            error,
          );

          const message =
            "Something went wrong while updating the company user.";

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
  /* UPDATE STATUS                                                            */
  /* ------------------------------------------------------------------------ */

  const updateCompanyUserStatus =
    useCallback(
      async (
        id: string,
        status: CompanyUserStatus,
      ) => {
        try {
          setError(null);

          const result =
            await updateCompanyUserStatusAction(
              id,
              status,
            );

          if (!result.success) {
            setError(
              result.error ??
                "Failed to update company user status.",
            );

            return {
              success: false,
              error: result.error,
            };
          }

          if (result.data) {
            setCompanyUsers(
              (current) =>
                current.map(
                  (companyUser) =>
                    companyUser.id === id
                      ? result.data!
                      : companyUser,
                ),
            );
          }

          return {
            success: true,
            data: result.data,
          };
        } catch (error) {
          console.error(
            "updateCompanyUserStatus error:",
            error,
          );

          const message =
            "Something went wrong while updating the company user status.";

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
  /* DELETE USER                                                              */
  /* ------------------------------------------------------------------------ */

  const deleteCompanyUser =
    useCallback(
      async (id: string) => {
        try {
          setError(null);

          const result =
            await deleteCompanyUserAction(
              id,
            );

          if (!result.success) {
            setError(
              result.error ??
                "Failed to delete company user.",
            );

            return {
              success: false,
              error: result.error,
            };
          }

          setCompanyUsers(
            (current) =>
              current.filter(
                (companyUser) =>
                  companyUser.id !== id,
              ),
          );

          return {
            success: true,
          };
        } catch (error) {
          console.error(
            "deleteCompanyUser error:",
            error,
          );

          const message =
            "Something went wrong while deleting the company user.";

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

  const refreshCompanyUsers =
    useCallback(async () => {
      await fetchCompanyUsers();
    }, [fetchCompanyUsers]);

  /* ------------------------------------------------------------------------ */
  /* INITIAL FETCH                                                            */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    fetchCompanyUsers();
  }, [fetchCompanyUsers]);

  /* ------------------------------------------------------------------------ */
  /* RETURN                                                                   */
  /* ------------------------------------------------------------------------ */

  return {
    companyUsers,

    loading,
    error,

    fetchCompanyUsers,
    fetchCompanyUser,

    createCompanyUser,

    updateCompanyUser,
    updateCompanyUserStatus,

    deleteCompanyUser,

    refreshCompanyUsers,
  };
}