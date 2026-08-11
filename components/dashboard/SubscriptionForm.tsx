
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  subscriptionSchema,
  type SubscriptionFormData,
} from "@/lib/validations/sub-plan-schema";

import {
  BILLING_CYCLES,
  SUBSCRIPTION_STATUSES,
  type Subscription,
} from "@/lib/types";

interface SubscriptionFormProps {
  initialValue?: Subscription | null;

  onSubmit: (data: SubscriptionFormData) => Promise<{
    success: boolean;
    error?: string;
  }>;

  onCancel: () => void;
}

export default function SubscriptionForm({
  initialValue,
  onSubmit,
  onCancel,
}: SubscriptionFormProps) {
  const isEditing = Boolean(initialValue);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),

    defaultValues: {
      plan: initialValue?.plan ?? "",
      status: initialValue?.status ?? "Active",
      amount: initialValue?.amount ?? 0,
      billingCycle: initialValue?.billingCycle ?? "Monthly",
      startDate:
        initialValue?.startDate ??
        new Date().toISOString().split("T")[0],
    },
  });

  /*
   * ------------------------------------------------------------------------
   * RESET WHEN EDITING SUBSCRIPTION CHANGES
   * ------------------------------------------------------------------------
   */

  useEffect(() => {
    reset({
      plan: initialValue?.plan ?? "",
      status: initialValue?.status ?? "Active",
      amount: initialValue?.amount ?? 0,
      billingCycle: initialValue?.billingCycle ?? "Monthly",
      startDate:
        initialValue?.startDate ??
        new Date().toISOString().split("T")[0],
    });
  }, [initialValue, reset]);

  /*
   * ------------------------------------------------------------------------
   * SUBMIT
   * ------------------------------------------------------------------------
   */

  const handleFormSubmit = async (data: SubscriptionFormData) => {
    try {
      const result = await onSubmit(data);

      if (!result?.success) {
        toast.error(
          result?.error ??
            `Failed to ${
              isEditing ? "update" : "create"
            } subscription.`,
        );

        return;
      }

      toast.success(
        isEditing
          ? "Subscription updated successfully."
          : "Subscription created successfully.",
      );

      reset();
      onCancel();
    } catch (error) {
      console.error("Subscription form submission error:", error);

      toast.error(
        `Failed to ${
          isEditing ? "update" : "create"
        } subscription.`,
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex flex-col gap-5"
      noValidate
    >
      {/* ------------------------------------------------------------------ */}
      {/* Plan                                                               */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="subscription-plan"
          className="text-xs font-medium text-slate-600"
        >
          Plan Name
        </label>

        <input
          id="subscription-plan"
          type="text"
          autoFocus
          placeholder="e.g. Premium"
          disabled={isSubmitting}
          {...register("plan")}
          className={`px-3 py-2 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed ${
            errors.plan
              ? "border-red-400 focus:ring-red-500"
              : "border-slate-300"
          }`}
        />

        {errors.plan && (
          <p className="text-xs text-red-500">
            {errors.plan.message}
          </p>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Status + Amount                                                    */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Status */}

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="subscription-status"
            className="text-xs font-medium text-slate-600"
          >
            Status
          </label>

          <select
            id="subscription-status"
            disabled={isSubmitting}
            {...register("status")}
            className={`px-3 py-2 rounded-lg border text-sm bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed ${
              errors.status
                ? "border-red-400 focus:ring-red-500"
                : "border-slate-300"
            }`}
          >
            {SUBSCRIPTION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          {errors.status && (
            <p className="text-xs text-red-500">
              {errors.status.message}
            </p>
          )}
        </div>

        {/* Amount */}

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="subscription-amount"
            className="text-xs font-medium text-slate-600"
          >
            Amount (TZS)
          </label>

          <input
            id="subscription-amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 50000"
            disabled={isSubmitting}
            {...register("amount", {
              valueAsNumber: true,
            })}
            className={`px-3 py-2 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed ${
              errors.amount
                ? "border-red-400 focus:ring-red-500"
                : "border-slate-300"
            }`}
          />

          {errors.amount && (
            <p className="text-xs text-red-500">
              {errors.amount.message}
            </p>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Billing Cycle + Start Date                                         */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Billing Cycle */}

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="subscription-billing-cycle"
            className="text-xs font-medium text-slate-600"
          >
            Billing Cycle
          </label>

          <select
            id="subscription-billing-cycle"
            disabled={isSubmitting}
            {...register("billingCycle")}
            className={`px-3 py-2 rounded-lg border text-sm bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed ${
              errors.billingCycle
                ? "border-red-400 focus:ring-red-500"
                : "border-slate-300"
            }`}
          >
            {BILLING_CYCLES.map((cycle) => (
              <option key={cycle} value={cycle}>
                {cycle}
              </option>
            ))}
          </select>

          {errors.billingCycle && (
            <p className="text-xs text-red-500">
              {errors.billingCycle.message}
            </p>
          )}
        </div>

        {/* Start Date */}

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="subscription-start-date"
            className="text-xs font-medium text-slate-600"
          >
            Start Date
          </label>

          <input
            id="subscription-start-date"
            type="date"
            disabled={isSubmitting}
            {...register("startDate")}
            className={`px-3 py-2 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed ${
              errors.startDate
                ? "border-red-400 focus:ring-red-500"
                : "border-slate-300"
            }`}
          />

          {errors.startDate && (
            <p className="text-xs text-red-500">
              {errors.startDate.message}
            </p>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Actions                                                            */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting && (
            <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
          )}

          {isSubmitting
            ? isEditing
              ? "Saving..."
              : "Adding..."
            : isEditing
              ? "Save Changes"
              : "Add Subscription"}
        </button>
      </div>
    </form>
  );
}

