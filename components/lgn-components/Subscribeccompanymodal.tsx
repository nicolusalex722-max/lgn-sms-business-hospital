"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  FileCheck2,
  Package,
} from "lucide-react";

import type {
  Company,
  Product,
  Subscription,
  CompanySubscriptionStatus,
} from "@/lib/types";

import {
  COMPANY_SUBSCRIPTION_STATUSES,
} from "@/lib/types";

import { useProducts } from "@/hooks/use-products";
import { useSubscriptions } from "@/hooks/use-subscriptions";

import type { CompanySubscriptionCreateInput } from "@/lib/validations/company-subscription-schema";

interface SubscribeCompanyModalProps {
  company: Company;
  onClose: () => void;
  onSave: (
    data: CompanySubscriptionCreateInput
  ) => Promise<void> | void;
  loading?: boolean;
}

const DEFAULT_STATUS: CompanySubscriptionStatus = "Active";

function formatCurrency(value: number) {
  return `TZS ${value.toLocaleString("en-TZ", {
    maximumFractionDigits: 0,
  })}`;
}

export default function SubscribeCompanyModal({
  company,
  onClose,
  onSave,
  loading = false,
}: SubscribeCompanyModalProps) {
  const {
    products,
    loading: productsLoading,
    error: productsError,
  } = useProducts();

  const {
    subscriptions,
    loading: subscriptionsLoading,
    error: subscriptionsError,
  } = useSubscriptions();

  const [productId, setProductId] = useState("");
  const [subscriptionPlanId, setSubscriptionPlanId] =
    useState("");

  const [status, setStatus] =
    useState<CompanySubscriptionStatus>(
      DEFAULT_STATUS
    );

  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [endDate, setEndDate] = useState("");

  const [validationError, setValidationError] =
    useState<string | null>(null);

  /* -------------------------------------------------------------------------- */
  /* PRODUCTS                                                                   */
  /* -------------------------------------------------------------------------- */

  const activeProducts = useMemo(() => {
    return products.filter(
      (product: Product) =>
        product.status === "Active"
    );
  }, [products]);

  /* -------------------------------------------------------------------------- */
  /* SELECTED PRODUCT                                                           */
  /* -------------------------------------------------------------------------- */

  const selectedProduct = useMemo(() => {
    return products.find(
      (product) => product.id === productId
    );
  }, [products, productId]);

  /* -------------------------------------------------------------------------- */
  /* PLANS                                                                      */
  /* -------------------------------------------------------------------------- */

  const activePlans = useMemo(() => {
    return subscriptions.filter(
      (subscription: Subscription) =>
        subscription.status === "Active" ||
        subscription.status === "Trial"
    );
  }, [subscriptions]);

  /* -------------------------------------------------------------------------- */
  /* SELECTED PLAN                                                              */
  /* -------------------------------------------------------------------------- */

  const selectedPlan = useMemo(() => {
    return subscriptions.find(
      (subscription) =>
        subscription.id === subscriptionPlanId
    );
  }, [subscriptions, subscriptionPlanId]);

  /* -------------------------------------------------------------------------- */
  /* PRODUCT CHANGE                                                             */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    setSubscriptionPlanId("");
  }, [productId]);

  /* -------------------------------------------------------------------------- */
  /* VALIDATION                                                                 */
  /* -------------------------------------------------------------------------- */

  const validate = () => {
    setValidationError(null);

    if (!productId) {
      setValidationError(
        "Please select a product."
      );

      return false;
    }

    if (!subscriptionPlanId) {
      setValidationError(
        "Please select a subscription plan."
      );

      return false;
    }

    if (!startDate) {
      setValidationError(
        "Start date is required."
      );

      return false;
    }

    if (
      endDate &&
      new Date(endDate) < new Date(startDate)
    ) {
      setValidationError(
        "End date cannot be earlier than start date."
      );

      return false;
    }

    return true;
  };

  /* -------------------------------------------------------------------------- */
  /* SAVE                                                                       */
  /* -------------------------------------------------------------------------- */

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    await onSave({
      companyId: company.id,
      productId,
      subscriptionPlanId,
      status,
      startDate,
      endDate: endDate || null,
    });
  };

  const loadingData =
    productsLoading || subscriptionsLoading;

  const dataError =
    productsError || subscriptionsError;

  /* -------------------------------------------------------------------------- */
  /* RENDER                                                                     */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="flex flex-col gap-5">
      {/* Company */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-medium text-slate-400">
          Company
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-800">
          {company.displayName}
        </p>

        <p className="text-xs text-slate-500">
          {company.companyName}
        </p>
      </div>

      {/* Loading */}
      {loadingData && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-sm text-slate-500">
            Loading products and subscription plans...
          </p>
        </div>
      )}

      {/* Data Error */}
      {dataError && (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3"
        >
          <p className="text-sm text-rose-700">
            {dataError}
          </p>
        </div>
      )}

      {/* Validation Error */}
      {validationError && (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3"
        >
          <p className="text-sm text-rose-700">
            {validationError}
          </p>
        </div>
      )}

      {/* Fields */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Product */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">
            Product
          </label>

          <select
            value={productId}
            onChange={(event) =>
              setProductId(event.target.value)
            }
            disabled={loadingData || loading}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
          >
            <option value="">
              Select product
            </option>

            {activeProducts.map((product) => (
              <option
                key={product.id}
                value={product.id}
              >
                {product.name}
              </option>
            ))}
          </select>
        </div>

        {/* Subscription Plan */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">
            Subscription Plan
          </label>

          <select
            value={subscriptionPlanId}
            onChange={(event) =>
              setSubscriptionPlanId(
                event.target.value
              )
            }
            disabled={
              !productId ||
              loadingData ||
              loading
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
          >
            <option value="">
              Select subscription plan
            </option>

            {activePlans.map((plan) => (
              <option
                key={plan.id}
                value={plan.id}
              >
                {plan.plan}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">
            Status
          </label>

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target
                  .value as CompanySubscriptionStatus
              )
            }
            disabled={loading}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {COMPANY_SUBSCRIPTION_STATUSES.map(
              (currentStatus) => (
                <option
                  key={currentStatus}
                  value={currentStatus}
                >
                  {currentStatus}
                </option>
              )
            )}
          </select>
        </div>

        {/* Start Date */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">
            Start Date
          </label>

          <input
            type="date"
            value={startDate}
            onChange={(event) =>
              setStartDate(event.target.value)
            }
            disabled={loading}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* End Date */}
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="text-xs font-medium text-slate-500">
            End Date
          </label>

          <input
            type="date"
            value={endDate}
            min={startDate}
            onChange={(event) =>
              setEndDate(event.target.value)
            }
            disabled={loading}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Selected Plan Summary */}
      {selectedPlan && (
        <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Package className="h-4 w-4 text-indigo-600" />

            <h4 className="text-sm font-semibold text-slate-800">
              Subscription Summary
            </h4>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">
                Product
              </span>

              <span className="font-medium text-slate-800">
                {selectedProduct?.type ?? "-"}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-slate-500">
                Plan
              </span>

              <span className="font-medium text-slate-800">
                {selectedPlan.plan}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-slate-500">
                Billing Cycle
              </span>

              <span className="font-medium text-slate-800">
                {selectedPlan.billingCycle}
              </span>
            </div>

            <div className="flex justify-between gap-4 border-t border-indigo-100 pt-2">
              <span className="font-medium text-slate-600">
                Amount
              </span>

              <span className="font-semibold text-slate-900">
                {formatCurrency(
                  selectedPlan.amount
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />

        <p className="text-xs leading-5 text-slate-500">
          Product, plan, billing cycle and amount are
          managed from their respective master records.
          This subscription only stores the relationship
          between the company, product and plan.
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={
            loading ||
            loadingData ||
            !productId ||
            !subscriptionPlanId
          }
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FileCheck2 className="h-4 w-4" />

          {loading
            ? "Saving..."
            : "Save Subscription"}
        </button>
      </div>
    </div>
  );
}