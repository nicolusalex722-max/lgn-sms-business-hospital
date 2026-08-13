
"use client";

import { useCallback, useEffect, useState } from "react";

import {
  createCompanySubscription as createCompanySubscriptionAction,
  deleteCompanySubscription as deleteCompanySubscriptionAction,
  getCompanySubscriptionById,
  getCompanySubscriptions,
  getCompanySubscriptionsByCompanyId,
  updateCompanySubscription as updateCompanySubscriptionAction,
} from "@/lib/actions/company-subscription";

import type { CompanySubscription } from "@/lib/types";

import type {
  CompanySubscriptionCreateInput,
  CompanySubscriptionUpdateInput,
} from "@/lib/validations/company-subscription-schema";

export function useCompanySubscriptions() {
  const [companySubscriptions, setCompanySubscriptions] = useState<
    CompanySubscription[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // GET ALL COMPANY SUBSCRIPTIONS                                            

  const fetchCompanySubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getCompanySubscriptions();

      if (!result.success) {
        setError(
          result.error ?? "Failed to fetch company subscriptions."
        );
        return;
      }

      setCompanySubscriptions(result.data ?? []);
    } catch (error) {
      console.error(
        "fetchCompanySubscriptions error:",
        error
      );

      setError(
        "Something went wrong while fetching company subscriptions."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // GET COMPANY SUBSCRIPTIONS BY COMPANY ID                                  

  const fetchCompanySubscriptionsByCompanyId = useCallback(
    async (companyId: string) => {
      try {
        setError(null);

        const result =
          await getCompanySubscriptionsByCompanyId(companyId);

        if (!result.success) {
          setError(
            result.error ??
              "Failed to fetch company subscriptions."
          );

          return null;
        }

        return result.data ?? [];
      } catch (error) {
        console.error(
          "fetchCompanySubscriptionsByCompanyId error:",
          error
        );

        setError(
          "Something went wrong while fetching company subscriptions."
        );

        return null;
      }
    },
    []
  );

  /* ------------------------------------------------------------------------ */
  /* GET COMPANY SUBSCRIPTION BY ID                                           */
  /* ------------------------------------------------------------------------ */

  const fetchCompanySubscription = useCallback(
    async (id: string) => {
      try {
        setError(null);

        const result = await getCompanySubscriptionById(id);

        if (!result.success) {
          setError(
            result.error ??
              "Failed to fetch company subscription."
          );

          return null;
        }

        return result.data ?? null;
      } catch (error) {
        console.error(
          "fetchCompanySubscription error:",
          error
        );

        setError(
          "Something went wrong while fetching the company subscription."
        );

        return null;
      }
    },
    []
  );

  // CREATE COMPANY SUBSCRIPTION                                              

  const createCompanySubscription = useCallback(
    async (data: CompanySubscriptionCreateInput) => {
      try {
        setError(null);

        const result =
          await createCompanySubscriptionAction(data);

        if (!result.success) {
          setError(
            result.error ??
              "Failed to create company subscription."
          );

          return {
            success: false,
            error: result.error,
          };
        }

        if (result.data) {
          setCompanySubscriptions((current) => [
            result.data!,
            ...current,
          ]);
        }

        return {
          success: true,
          data: result.data,
        };
      } catch (error) {
        console.error(
          "createCompanySubscription error:",
          error
        );

        const message =
          "Something went wrong while creating the company subscription.";

        setError(message);

        return {
          success: false,
          error: message,
        };
      }
    },
    []
  );

  // UPDATE COMPANY SUBSCRIPTION                                              

  const updateCompanySubscription = useCallback(
    async (
      id: string,
      data: CompanySubscriptionUpdateInput
    ) => {
      try {
        setError(null);

        const result =
          await updateCompanySubscriptionAction(id, data);

        if (!result.success) {
          setError(
            result.error ??
              "Failed to update company subscription."
          );

          return {
            success: false,
            error: result.error,
          };
        }

        if (result.data) {
          setCompanySubscriptions((current) =>
            current.map((subscription) =>
              subscription.id === id
                ? result.data!
                : subscription
            )
          );
        }

        return {
          success: true,
          data: result.data,
        };
      } catch (error) {
        console.error(
          "updateCompanySubscription error:",
          error
        );

        const message =
          "Something went wrong while updating the company subscription.";

        setError(message);

        return {
          success: false,
          error: message,
        };
      }
    },
    []
  );

  // DELETE COMPANY SUBSCRIPTION                                              

  const deleteCompanySubscription = useCallback(
    async (id: string) => {
      try {
        setError(null);

        const result =
          await deleteCompanySubscriptionAction(id);

        if (!result.success) {
          setError(
            result.error ??
              "Failed to delete company subscription."
          );

          return {
            success: false,
            error: result.error,
          };
        }

        setCompanySubscriptions((current) =>
          current.filter(
            (subscription) => subscription.id !== id
          )
        );

        return {
          success: true,
        };
      } catch (error) {
        console.error(
          "deleteCompanySubscription error:",
          error
        );

        const message =
          "Something went wrong while deleting the company subscription.";

        setError(message);

        return {
          success: false,
          error: message,
        };
      }
    },
    []
  );

  // REFRESH                                                                 

  const refreshCompanySubscriptions = useCallback(async () => {
    await fetchCompanySubscriptions();
  }, [fetchCompanySubscriptions]);

  // INITIAL FETCH                                                            */

  useEffect(() => {
    fetchCompanySubscriptions();
  }, [fetchCompanySubscriptions]);

  // RETURN                                                                   */

  return {
    companySubscriptions,

    loading,
    error,

    fetchCompanySubscriptions,
    fetchCompanySubscriptionsByCompanyId,
    fetchCompanySubscription,

    createCompanySubscription,
    updateCompanySubscription,
    deleteCompanySubscription,

    refreshCompanySubscriptions,
  };
}

