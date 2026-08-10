
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  productSchema,
  type ProductFormData,
} from "@/lib/validations/product-schema";

import {
  PRODUCT_TYPES,
  PRODUCT_STATUSES,
  type Product,
} from "@/lib/types";

interface ProductFormProps {
  initialValue?: Product | null;
  onSubmit: (data: ProductFormData) => Promise<{
    success: boolean;
    error?: string;
  }>;
  onCancel: () => void;
}

export default function ProductForm({
  initialValue,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const isEditing = Boolean(initialValue);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialValue?.name ?? "",
      type: initialValue?.type ?? "Business",
      description: initialValue?.description ?? "",
      status: initialValue?.status ?? "Active",
    },
  });

  /* ------------------------------------------------------------------------ */
  /* RESET WHEN EDITING PRODUCT CHANGES                                      */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    reset({
      name: initialValue?.name ?? "",
      type: initialValue?.type ?? "Business",
      description: initialValue?.description ?? "",
      status: initialValue?.status ?? "Active",
    });
  }, [initialValue, reset]);

  /* ------------------------------------------------------------------------ */
  /* SUBMIT                                                                   */
  /* ------------------------------------------------------------------------ */

  const handleFormSubmit = async (data: ProductFormData) => {
    const result = await onSubmit(data);

    if (!result.success) {
      toast.error(
        result.error ??
          `Failed to ${isEditing ? "update" : "create"} product.`,
      );

      return;
    }

    toast.success(
      isEditing
        ? "Product updated successfully."
        : "Product created successfully.",
    );

    reset();
    onCancel();
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex flex-col gap-5"
      noValidate
    >
      {/* Product Name */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="product-name"
          className="text-xs font-medium text-slate-600"
        >
          Product Name
        </label>

        <input
          id="product-name"
          type="text"
          autoFocus
          placeholder="e.g. Sales Management System"
          disabled={isSubmitting}
          {...register("name")}
          className={`px-3 py-2 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed ${
            errors.name
              ? "border-red-400 focus:ring-red-500"
              : "border-slate-300"
          }`}
        />

        {errors.name && (
          <p className="text-xs text-red-500">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Type + Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Type */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="product-type"
            className="text-xs font-medium text-slate-600"
          >
            Type
          </label>

          <select
            id="product-type"
            disabled={isSubmitting}
            {...register("type")}
            className={`px-3 py-2 rounded-lg border text-sm bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed ${
              errors.type
                ? "border-red-400 focus:ring-red-500"
                : "border-slate-300"
            }`}
          >
            {PRODUCT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          {errors.type && (
            <p className="text-xs text-red-500">
              {errors.type.message}
            </p>
          )}
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="product-status"
            className="text-xs font-medium text-slate-600"
          >
            Status
          </label>

          <select
            id="product-status"
            disabled={isSubmitting}
            {...register("status")}
            className={`px-3 py-2 rounded-lg border text-sm bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed ${
              errors.status
                ? "border-red-400 focus:ring-red-500"
                : "border-slate-300"
            }`}
          >
            {PRODUCT_STATUSES.map((status) => (
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
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="product-description"
          className="text-xs font-medium text-slate-600"
        >
          Description
        </label>

        <textarea
          id="product-description"
          rows={4}
          placeholder="Briefly describe this product..."
          disabled={isSubmitting}
          {...register("description")}
          className={`px-3 py-2 rounded-lg border text-sm resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed ${
            errors.description
              ? "border-red-400 focus:ring-red-500"
              : "border-slate-300"
          }`}
        />

        <div className="flex items-start justify-between gap-3">
          {errors.description ? (
            <p className="text-xs text-red-500">
              {errors.description.message}
            </p>
          ) : (
            <span />
          )}

          <span className="text-[11px] text-slate-400">
            Maximum 1000 characters
          </span>
        </div>
      </div>

      {/* Actions */}
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
              : "Add Product"}
        </button>
      </div>
    </form>
  );
}

