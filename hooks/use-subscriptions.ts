"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  createSubscription as createSubscriptionAction,
  deleteSubscription as deleteSubscriptionAction,
  getSubscriptionById,
  getSubscriptions,
  updateSubscription as updateSubscriptionAction,
} from "@/lib/actions/subscription-actions";

import type { Subscription } from "@/lib/types";
import type { SubscriptionFormData } from "@/lib/validations/sub-plan-schema";

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] =
    useState<Subscription[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  // GET ALL

  const fetchSubscriptions = useCallback(
    async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await getSubscriptions();

        if (!result.success) {
          setError(
            result.error ??
              "Failed to fetch subscription plans."
          );
          return;
        }

        setSubscriptions(result.data ?? []);
      } catch (error) {
        console.error(
          "fetchSubscriptions error:",
          error
        );

        setError(
          "Something went wrong while fetching subscription plans."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // GET BY ID

  const fetchSubscription = useCallback(
    async (id: string) => {
      try {
        setError(null);

        const result =
          await getSubscriptionById(id);

        if (!result.success) {
          setError(
            result.error ??
              "Failed to fetch subscription plan."
          );

          return null;
        }

        return result.data ?? null;
      } catch (error) {
        console.error(
          "fetchSubscription error:",
          error
        );

        setError(
          "Something went wrong while fetching the subscription plan."
        );

        return null;
      }
    },
    []
  );

  // CREATE

  const createSubscription = useCallback(
    async (data: SubscriptionFormData) => {
      try {
        setError(null);

        const result =
          await createSubscriptionAction(data);

        if (!result.success) {
          setError(
            result.error ??
              "Failed to create subscription plan."
          );

          return {
            success: false,
            error: result.error,
          };
        }

        if (result.data) {
          setSubscriptions((current) => [
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
          "createSubscription error:",
          error
        );

        const message =
          "Something went wrong while creating the subscription plan.";

        setError(message);

        return {
          success: false,
          error: message,
        };
      }
    },
    []
  );

  // UPDATE

  const updateSubscription = useCallback(
    async (
      id: string,
      data: SubscriptionFormData
    ) => {
      try {
        setError(null);

        const result =
          await updateSubscriptionAction(
            id,
            data
          );

        if (!result.success) {
          setError(
            result.error ??
              "Failed to update subscription plan."
          );

          return {
            success: false,
            error: result.error,
          };
        }

        if (result.data) {
          setSubscriptions((current) =>
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
          "updateSubscription error:",
          error
        );

        const message =
          "Something went wrong while updating the subscription plan.";

        setError(message);

        return {
          success: false,
          error: message,
        };
      }
    },
    []
  );

  // DELETE

  const deleteSubscription = useCallback(
    async (id: string) => {
      try {
        setError(null);

        const result =
          await deleteSubscriptionAction(id);

        if (!result.success) {
          setError(
            result.error ??
              "Failed to delete subscription plan."
          );

          return {
            success: false,
            error: result.error,
          };
        }

        setSubscriptions((current) =>
          current.filter(
            (subscription) =>
              subscription.id !== id
          )
        );

        return {
          success: true,
        };
      } catch (error) {
        console.error(
          "deleteSubscription error:",
          error
        );

        const message =
          "Something went wrong while deleting the subscription plan.";

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

  const refreshSubscriptions = useCallback(
    async () => {
      await fetchSubscriptions();
    },
    [fetchSubscriptions]
  );

  // INITIAL FETCH

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  return {
    subscriptions,

    loading,
    error,

    fetchSubscriptions,
    fetchSubscription,

    createSubscription,
    updateSubscription,
    deleteSubscription,

    refreshSubscriptions,
  };
}