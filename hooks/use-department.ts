"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  createDepartment as createDepartmentAction,
  deleteDepartment as deleteDepartmentAction,
  getDepartmentById,
  getDepartments,
  toggleDepartmentStatus as toggleDepartmentStatusAction,
  updateDepartment as updateDepartmentAction,
} from "@/lib/actions/department-actions";

import type {
  Department,
} from "@/lib/types";

import type {
  DepartmentCreateInput,
  DepartmentUpdateInput,
} from "@/lib/validations/department-schema";

/* -------------------------------------------------------------------------- */
/* Hook                                                                       */
/* -------------------------------------------------------------------------- */

export function useDepartments() {
  const [
    departments,
    setDepartments,
  ] = useState<Department[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  /* ------------------------------------------------------------------------ */
  /* GET ALL DEPARTMENTS                                                      */
  /* ------------------------------------------------------------------------ */

  const fetchDepartments =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError(null);

          const result =
            await getDepartments();

          if (!result.success) {
            setError(
              result.error ??
                "Failed to fetch departments.",
            );

            return;
          }

          setDepartments(
            result.data ?? [],
          );
        } catch (error) {
          console.error(
            "fetchDepartments error:",
            error,
          );

          setError(
            "Something went wrong while fetching departments.",
          );
        } finally {
          setLoading(false);
        }
      },
      [],
    );

  /* ------------------------------------------------------------------------ */
  /* GET DEPARTMENT BY ID                                                     */
  /* ------------------------------------------------------------------------ */

  const fetchDepartment =
    useCallback(
      async (
        id: string,
      ) => {
        try {
          setError(null);

          const result =
            await getDepartmentById(
              id,
            );

          if (!result.success) {
            setError(
              result.error ??
                "Failed to fetch department.",
            );

            return null;
          }

          return (
            result.data ??
            null
          );
        } catch (error) {
          console.error(
            "fetchDepartment error:",
            error,
          );

          setError(
            "Something went wrong while fetching the department.",
          );

          return null;
        }
      },
      [],
    );

  /* ------------------------------------------------------------------------ */
  /* CREATE DEPARTMENT                                                        */
  /* ------------------------------------------------------------------------ */

  const createDepartment =
    useCallback(
      async (
        data: DepartmentCreateInput,
      ) => {
        try {
          setError(null);

          const result =
            await createDepartmentAction(
              data,
            );

          if (!result.success) {
            setError(
              result.error ??
                "Failed to create department.",
            );

            return {
              success: false,
              error: result.error,
            };
          }

          /*
           * Add the newly created department
           * to the local state immediately.
           *
           * No additional GET request is required.
           */
          if (result.data) {
            setDepartments(
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
            "createDepartment error:",
            error,
          );

          const message =
            "Something went wrong while creating the department.";

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
  /* UPDATE DEPARTMENT                                                        */
  /* ------------------------------------------------------------------------ */

  const updateDepartment =
    useCallback(
      async (
        id: string,
        data: DepartmentUpdateInput,
      ) => {
        try {
          setError(null);

          const result =
            await updateDepartmentAction(
              id,
              data,
            );

          if (!result.success) {
            setError(
              result.error ??
                "Failed to update department.",
            );

            return {
              success: false,
              error: result.error,
            };
          }

          /*
           * Replace the old department
           * with the updated department.
           */
          if (result.data) {
            setDepartments(
              (current) =>
                current.map(
                  (department) =>
                    department.id === id
                      ? result.data!
                      : department,
                ),
            );
          }

          return {
            success: true,
            data: result.data,
          };
        } catch (error) {
          console.error(
            "updateDepartment error:",
            error,
          );

          const message =
            "Something went wrong while updating the department.";

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
  /* DELETE DEPARTMENT                                                        */
  /* ------------------------------------------------------------------------ */

  const deleteDepartment =
    useCallback(
      async (
        id: string,
      ) => {
        try {
          setError(null);

          const result =
            await deleteDepartmentAction(
              id,
            );

          if (!result.success) {
            setError(
              result.error ??
                "Failed to delete department.",
            );

            return {
              success: false,
              error: result.error,
            };
          }

          /*
           * Remove the deleted department
           * from local state.
           */
          setDepartments(
            (current) =>
              current.filter(
                (department) =>
                  department.id !== id,
              ),
          );

          return {
            success: true,
          };
        } catch (error) {
          console.error(
            "deleteDepartment error:",
            error,
          );

          const message =
            "Something went wrong while deleting the department.";

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
  /* TOGGLE DEPARTMENT STATUS                                                 */
  /* ------------------------------------------------------------------------ */

  const toggleDepartmentStatus =
    useCallback(
      async (
        id: string,
      ) => {
        try {
          setError(null);

          const result =
            await toggleDepartmentStatusAction(
              id,
            );

          if (!result.success) {
            setError(
              result.error ??
                "Failed to update department status.",
            );

            return {
              success: false,
              error: result.error,
            };
          }

          /*
           * Replace the department with
           * the newly updated version.
           */
          if (result.data) {
            setDepartments(
              (current) =>
                current.map(
                  (department) =>
                    department.id === id
                      ? result.data!
                      : department,
                ),
            );
          }

          return {
            success: true,
            data: result.data,
          };
        } catch (error) {
          console.error(
            "toggleDepartmentStatus error:",
            error,
          );

          const message =
            "Something went wrong while changing the department status.";

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

  const refreshDepartments =
    useCallback(
      async () => {
        await fetchDepartments();
      },
      [
        fetchDepartments,
      ],
    );

  /* ------------------------------------------------------------------------ */
  /* INITIAL FETCH                                                            */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const initialFetch = window.setTimeout(() => {
      void fetchDepartments();
    }, 0);

    return () => window.clearTimeout(initialFetch);
  }, [
    fetchDepartments,
  ]);

  /* ------------------------------------------------------------------------ */
  /* RETURN                                                                   */
  /* ------------------------------------------------------------------------ */

  return {
    departments,

    loading,
    error,

    fetchDepartments,
    fetchDepartment,

    createDepartment,
    updateDepartment,
    deleteDepartment,

    toggleDepartmentStatus,

    refreshDepartments,
  };
}
