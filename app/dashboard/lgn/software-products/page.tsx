
"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { useProducts } from "@/hooks/use-products";
import type { Product } from "@/lib/types";

import ProductToolbar from "@/components/product-components/ProductToolbar";
import ProductTable from "@/components/product-components/ProductTable";
import ProductForm from "@/components/product-components/ProductForm";
import Modal from "@/components/dashboard/Modal";
import Pagination from "@/components/dashboard/Pegination";

const PAGE_SIZE = 10;

export default function ProductsPage() {
  // PRODUCTS STATE                                                           

  const {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProducts();

  // FILTER STATE                                                             

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  // MODAL STATE                                                              

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  // PAGINATION                                                               

  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.description.toLowerCase().includes(normalizedSearch);

      const matchesType =
        typeFilter === "All" || product.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [products, search, typeFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / PAGE_SIZE),
  );

  useEffect(() => {
    setPage(1);
  }, [search, typeFilter]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;

    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  // MODAL                                                                    

  const openAddModal = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
  };

  // FORM SUBMIT                                                              

  const handleSubmit = async (data: Parameters<typeof createProduct>[0]) => {
    if (editingProduct) {
      return updateProduct(editingProduct.id, data);
    }

    return createProduct(data);
  };

  // DELETE                                                                   */

  const handleDelete = async (
    id: string
  ) => {
    try {
      const result = await deleteProduct(id);
  
      if (!result?.success) {
        toast.error(
          result?.error ?? "Failed to delete product."
        );
  
        return;
      }
  
      toast.success(
        "Product deleted successfully."
      );
    } catch (error) {
      console.error(
        "Product deletion error:",
        error
      );
  
      toast.error(
        "Failed to delete product."
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Products
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage the software products offered on this platform
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Toolbar */}
      <ProductToolbar
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
      />

      {/* Table */}
      <ProductTable
        products={paginated}
        loading={loading}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      {/* Pagination */}
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-xs text-slate-500">
          Showing{" "}
          {filtered.length === 0
            ? 0
            : (page - 1) * PAGE_SIZE + 1}
          &ndash;
          {Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
          {filtered.length}
        </p>

        <Pagination
          page={page}
          totalPages={totalPages}
          pageSize={PAGE_SIZE}
          totalCount={filtered.length}
          itemLabel="products"
          onPageChange={setPage}
          onPageSizeChange={() => {}}
        />
      </div>

      {/* Product Form */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingProduct ? "Edit Product" : "Add Product"}
      >
        <ProductForm
          initialValue={editingProduct}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
}

