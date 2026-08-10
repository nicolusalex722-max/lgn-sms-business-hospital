
"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import type { Product } from "@/lib/types";

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

const TYPE_STYLES: Record<Product["type"], string> = {
  Business: "bg-indigo-50 text-indigo-700",
  Education: "bg-sky-50 text-sky-700",
  Hospital: "bg-teal-50 text-teal-700",
};

const STATUS_STYLES: Record<Product["status"], string> = {
  Active: "border-emerald-300 text-emerald-700 bg-white",
  Inactive: "border-slate-300 text-slate-500 bg-white",
};

function TypeBadge({ type }: { type: Product["type"] }) {
  const style = TYPE_STYLES[type];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${style}`}
    >
      {type}
    </span>
  );
}

function StatusBadge({ status }: { status: Product["status"] }) {
  const style = STATUS_STYLES[status];

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${style}`}
    >
      {status}
    </span>
  );
}

function ProductTableSkeleton() {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="w-12 px-4 py-3">
                <div className="h-4 w-4 rounded bg-slate-200 animate-pulse" />
              </th>

              {[
                "Product Name",
                "Type",
                "Description",
                "Status",
                "Actions",
              ].map((heading) => (
                <th
                  key={heading}
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-500"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {[1, 2, 3, 4].map((row) => (
              <tr key={row}>
                <td className="px-4 py-4">
                  <div className="h-4 w-4 rounded bg-slate-200 animate-pulse" />
                </td>

                <td className="px-4 py-4">
                  <div className="h-4 w-36 rounded bg-slate-200 animate-pulse" />
                </td>

                <td className="px-4 py-4">
                  <div className="h-6 w-20 rounded-full bg-slate-200 animate-pulse" />
                </td>

                <td className="px-4 py-4">
                  <div className="h-4 w-48 rounded bg-slate-200 animate-pulse" />
                </td>

                <td className="px-4 py-4">
                  <div className="h-6 w-20 rounded-full bg-slate-200 animate-pulse" />
                </td>

                <td className="px-4 py-4">
                  <div className="flex gap-2">
                    <div className="h-8 w-8 rounded-lg bg-slate-200 animate-pulse" />
                    <div className="h-8 w-8 rounded-lg bg-slate-200 animate-pulse" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ProductTable({
  products,
  onEdit,
  onDelete,
  loading = false,
}: ProductTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allSelected =
    products.length > 0 && selected.size === products.length;

  const toggleAll = () => {
    setSelected(
      allSelected ? new Set() : new Set(products.map((product) => product.id))
    );
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  if (loading) {
    return <ProductTableSkeleton />;
  }

  if (products.length === 0) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50">
        <div className="text-center">
          <p className="text-sm font-medium text-slate-600">
            No products found
          </p>

          <p className="mt-1 text-xs text-slate-400">
            No products match your search.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="w-12 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Select all products"
                  className="h-4 w-4 cursor-pointer rounded accent-indigo-600"
                />
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                Product Name
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                Type
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                Description
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                Status
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {products.map((product) => (
              <tr
                key={product.id}
                className="transition-colors hover:bg-slate-50/70"
              >
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selected.has(product.id)}
                    onChange={() => toggleOne(product.id)}
                    aria-label={`Select ${product.name}`}
                    className="h-4 w-4 cursor-pointer rounded accent-indigo-600"
                  />
                </td>

                <td className="px-4 py-4">
                  <div className="text-sm font-medium text-slate-800">
                    {product.name}
                  </div>
                </td>

                <td className="px-4 py-4">
                  <TypeBadge type={product.type} />
                </td>

                <td className="max-w-[320px] px-4 py-4">
                  <p className="truncate text-sm text-slate-500">
                    {product.description || "—"}
                  </p>
                </td>

                <td className="px-4 py-4">
                  <StatusBadge status={product.status} />
                </td>

                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(product)}
                      aria-label={`Edit ${product.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-indigo-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(product.id)}
                      aria-label={`Delete ${product.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-medium text-slate-600">
            {selected.size}{" "}
            {selected.size === 1 ? "product" : "products"} selected
          </p>

          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="text-xs font-medium text-slate-500 hover:text-slate-800"
          >
            Clear selection
          </button>
        </div>
      )}
    </div>
  );
}

