"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  createEmployee as createEmployeeAction,
  deleteEmployee as deleteEmployeeAction,
  getEmployeeById,
  getEmployees,
  updateEmployee as updateEmployeeAction,
} from "@/lib/actions/employees-actions";

import type {
  Employee,
} from "@/lib/types";

import type {
  EmployeeCreateInput,
  EmployeeUpdateInput,
} from "@/lib/validations/employees-schema";

/* -------------------------------------------------------------------------- */
/* Hook                                                                       */
/* -------------------------------------------------------------------------- */

export function useEmployees() {
  const [employees, setEmployees] =
    useState<Employee[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  /* ------------------------------------------------------------------------ */
  /* GET ALL EMPLOYEES                                                        */
  /* ------------------------------------------------------------------------ */

  const fetchEmployees =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const result =
          await getEmployees();

        if (!result.success) {
          setError(
            result.error ??
              "Failed to fetch employees.",
          );

          return;
        }

        setEmployees(
          result.data ?? [],
        );
      } catch (error) {
        console.error(
          "fetchEmployees error:",
          error,
        );

        setError(
          "Something went wrong while fetching employees.",
        );
      } finally {
        setLoading(false);
      }
    }, []);

  /* ------------------------------------------------------------------------ */
  /* GET EMPLOYEE BY ID                                                       */
  /* ------------------------------------------------------------------------ */

  const fetchEmployee =
    useCallback(
      async (id: string) => {
        try {
          setError(null);

          const result =
            await getEmployeeById(id);

          if (!result.success) {
            setError(
              result.error ??
                "Failed to fetch employee.",
            );

            return null;
          }

          return result.data ?? null;
        } catch (error) {
          console.error(
            "fetchEmployee error:",
            error,
          );

          setError(
            "Something went wrong while fetching the employee.",
          );

          return null;
        }
      },
      [],
    );

  /* ------------------------------------------------------------------------ */
  /* CREATE EMPLOYEE                                                          */
  /* ------------------------------------------------------------------------ */

  const createEmployee =
    useCallback(
      async (
        data: EmployeeCreateInput,
      ) => {
        try {
          setError(null);

          const result =
            await createEmployeeAction(
              data,
            );

          if (!result.success) {
            setError(
              result.error ??
                "Failed to create employee.",
            );

            return {
              success: false,
              error: result.error,
            };
          }

          if (result.data) {
            setEmployees(
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
            "createEmployee error:",
            error,
          );

          const message =
            "Something went wrong while creating the employee.";

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
  /* UPDATE EMPLOYEE                                                          */
  /* ------------------------------------------------------------------------ */

  const updateEmployee =
    useCallback(
      async (
        id: string,
        data: EmployeeUpdateInput,
      ) => {
        try {
          setError(null);

          const result =
            await updateEmployeeAction(
              id,
              data,
            );

          if (!result.success) {
            setError(
              result.error ??
                "Failed to update employee.",
            );

            return {
              success: false,
              error: result.error,
            };
          }

          if (result.data) {
            setEmployees(
              (current) =>
                current.map(
                  (employee) =>
                    employee.id === id
                      ? result.data!
                      : employee,
                ),
            );
          }

          return {
            success: true,
            data: result.data,
          };
        } catch (error) {
          console.error(
            "updateEmployee error:",
            error,
          );

          const message =
            "Something went wrong while updating the employee.";

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
  /* DELETE EMPLOYEE                                                          */
  /* ------------------------------------------------------------------------ */

  const deleteEmployee =
    useCallback(
      async (id: string) => {
        try {
          setError(null);

          const result =
            await deleteEmployeeAction(
              id,
            );

          if (!result.success) {
            setError(
              result.error ??
                "Failed to delete employee.",
            );

            return {
              success: false,
              error: result.error,
            };
          }

          setEmployees(
            (current) =>
              current.filter(
                (employee) =>
                  employee.id !== id,
              ),
          );

          return {
            success: true,
          };
        } catch (error) {
          console.error(
            "deleteEmployee error:",
            error,
          );

          const message =
            "Something went wrong while deleting the employee.";

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

  const refreshEmployees =
    useCallback(async () => {
      await fetchEmployees();
    }, [fetchEmployees]);

  /* ------------------------------------------------------------------------ */
  /* INITIAL FETCH                                                            */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const initialFetch = window.setTimeout(() => {
      void fetchEmployees();
    }, 0);

    return () => window.clearTimeout(initialFetch);
  }, [fetchEmployees]);

  /* ------------------------------------------------------------------------ */
  /* RETURN                                                                   */
  /* ------------------------------------------------------------------------ */

  return {
    employees,

    loading,
    error,

    fetchEmployees,
    fetchEmployee,

    createEmployee,
    updateEmployee,
    deleteEmployee,

    refreshEmployees,
  };
}
