"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  createBranch as createBranchAction,
  deleteBranch as deleteBranchAction,
  getBranchById,
  getBranches,
  toggleBranchStatus as toggleBranchStatusAction,
  updateBranch as updateBranchAction,
} from "@/lib/actions/branches-actions";

import type {
  Branch,
} from "@/lib/types";

import type {
  BranchCreateInput,
  BranchUpdateInput,
} from "@/lib/validations/branches-schema";


/* -------------------------------------------------------------------------- */
/* Hook                                                                       */
/* -------------------------------------------------------------------------- */

export function useBranches() {
  const [
    branches,
    setBranches,
  ] = useState<Branch[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);


  /* ------------------------------------------------------------------------ */
  /* GET ALL BRANCHES                                                         */
  /* ------------------------------------------------------------------------ */

  const fetchBranches =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError(null);

          const result =
            await getBranches();

          if (!result.success) {
            setError(
              result.error ??
                "Failed to fetch branches.",
            );

            return;
          }

          setBranches(
            result.data ?? [],
          );
        } catch (error) {
          console.error(
            "fetchBranches error:",
            error,
          );

          setError(
            "Something went wrong while fetching branches.",
          );
        } finally {
          setLoading(false);
        }
      },
      [],
    );


  /* ------------------------------------------------------------------------ */
  /* GET BRANCH BY ID                                                         */
  /* ------------------------------------------------------------------------ */

  const fetchBranch =
    useCallback(
      async (
        id: string,
      ) => {
        try {
          setError(null);

          const result =
            await getBranchById(
              id,
            );

          if (!result.success) {
            setError(
              result.error ??
                "Failed to fetch branch.",
            );

            return null;
          }

          return (
            result.data ??
            null
          );
        } catch (error) {
          console.error(
            "fetchBranch error:",
            error,
          );

          setError(
            "Something went wrong while fetching the branch.",
          );

          return null;
        }
      },
      [],
    );


  /* ------------------------------------------------------------------------ */
  /* CREATE BRANCH                                                            */
  /* ------------------------------------------------------------------------ */

  const createBranch =
    useCallback(
      async (
        data: BranchCreateInput,
      ) => {
        try {
          setError(null);

          const result =
            await createBranchAction(
              data,
            );

          if (!result.success) {
            setError(
              result.error ??
                "Failed to create branch.",
            );

            return {
              success: false,
              error: result.error,
            };
          }

          /*
           * Add newly created branch
           * to local state immediately.
           */
          if (result.data) {
            setBranches(
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
            "createBranch error:",
            error,
          );

          const message =
            "Something went wrong while creating the branch.";

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
  /* UPDATE BRANCH                                                            */
  /* ------------------------------------------------------------------------ */

  const updateBranch =
    useCallback(
      async (
        id: string,
        data: BranchUpdateInput,
      ) => {
        try {
          setError(null);

          const result =
            await updateBranchAction(
              id,
              data,
            );

          if (!result.success) {
            setError(
              result.error ??
                "Failed to update branch.",
            );

            return {
              success: false,
              error: result.error,
            };
          }

          /*
           * Replace the old branch
           * with the updated branch.
           */
          if (result.data) {
            setBranches(
              (current) =>
                current.map(
                  (branch) =>
                    branch.id === id
                      ? result.data!
                      : branch,
                ),
            );
          }

          return {
            success: true,
            data: result.data,
          };
        } catch (error) {
          console.error(
            "updateBranch error:",
            error,
          );

          const message =
            "Something went wrong while updating the branch.";

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
  /* DELETE BRANCH                                                            */
  /* ------------------------------------------------------------------------ */

  const deleteBranch =
    useCallback(
      async (
        id: string,
      ) => {
        try {
          setError(null);

          const result =
            await deleteBranchAction(
              id,
            );

          if (!result.success) {
            setError(
              result.error ??
                "Failed to delete branch.",
            );

            return {
              success: false,
              error: result.error,
            };
          }

          /*
           * Remove deleted branch
           * from local state.
           */
          setBranches(
            (current) =>
              current.filter(
                (branch) =>
                  branch.id !== id,
              ),
          );

          return {
            success: true,
          };
        } catch (error) {
          console.error(
            "deleteBranch error:",
            error,
          );

          const message =
            "Something went wrong while deleting the branch.";

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
  /* TOGGLE BRANCH STATUS                                                     */
  /* ------------------------------------------------------------------------ */

  const toggleBranchStatus =
    useCallback(
      async (
        id: string,
      ) => {
        try {
          setError(null);

          const result =
            await toggleBranchStatusAction(
              id,
            );

          if (!result.success) {
            setError(
              result.error ??
                "Failed to update branch status.",
            );

            return {
              success: false,
              error: result.error,
            };
          }

          /*
           * Replace the branch with
           * the newly updated version.
           */
          if (result.data) {
            setBranches(
              (current) =>
                current.map(
                  (branch) =>
                    branch.id === id
                      ? result.data!
                      : branch,
                ),
            );
          }

          return {
            success: true,
            data: result.data,
          };
        } catch (error) {
          console.error(
            "toggleBranchStatus error:",
            error,
          );

          const message =
            "Something went wrong while changing the branch status.";

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

  const refreshBranches =
    useCallback(
      async () => {
        await fetchBranches();
      },
      [
        fetchBranches,
      ],
    );


  /* ------------------------------------------------------------------------ */
  /* INITIAL FETCH                                                            */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const initialFetch = window.setTimeout(() => {
      void fetchBranches();
    }, 0);

    return () => window.clearTimeout(initialFetch);
  }, [
    fetchBranches,
  ]);


  /* ------------------------------------------------------------------------ */
  /* RETURN                                                                   */
  /* ------------------------------------------------------------------------ */

  return {
    branches,

    loading,
    error,

    fetchBranches,
    fetchBranch,

    createBranch,
    updateBranch,
    deleteBranch,

    toggleBranchStatus,

    refreshBranches,
  };
}
