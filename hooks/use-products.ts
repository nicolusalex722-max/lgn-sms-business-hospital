"use client";

import { useCallback, useEffect, useState } from "react";

import {
  createProduct as createProductAction,
  deleteProduct as deleteProductAction,
  getProductById,
  getProducts,
  updateProduct as updateProductAction,
} from "@/lib/actions/products-actions";

import type { Product } from "@/lib/types";
import type { ProductFormData } from "@/lib/validations/product-schema";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

//GET ALL PRODUCTS                                                         */
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getProducts();

      if (!result.success) {
        setError(result.error ?? "Failed to fetch products.");
        return;
      }

      setProducts(result.data ?? []);
    } catch (error) {
      console.error("fetchProducts error:", error);

      setError("Something went wrong while fetching products.");
    } finally {
      setLoading(false);
    }
  }, []);

  //GET PRODUCT BY ID                                                       
  const fetchProduct = useCallback(async (id: string) => {
    try {
      setError(null);

      const result = await getProductById(id);

      if (!result.success) {
        setError(result.error ?? "Failed to fetch product.");
        return null;
      }

      return result.data ?? null;
    } catch (error) {
      console.error("fetchProduct error:", error);

      setError("Something went wrong while fetching the product.");

      return null;
    }
  }, []);

  // CREATE PRODUCT                                                           

  const createProduct = useCallback(async (data: ProductFormData) => {
    try {
      setError(null);

      const result = await createProductAction(data);

      if (!result.success) {
        setError(result.error ?? "Failed to create product.");
        return {
          success: false,
          error: result.error,
        };
      }

      if (result.data) {
        setProducts((current) => [result.data!, ...current]);
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error("createProduct error:", error);

      const message = "Something went wrong while creating the product.";

      setError(message);

      return {
        success: false,
        error: message,
      };
    }
  }, []);

  /* ------------------------------------------------------------------------ */
  /* UPDATE PRODUCT                                                           */
  /* ------------------------------------------------------------------------ */

  const updateProduct = useCallback(
    async (id: string, data: ProductFormData) => {
      try {
        setError(null);

        const result = await updateProductAction(id, data);

        if (!result.success) {
          setError(result.error ?? "Failed to update product.");

          return {
            success: false,
            error: result.error,
          };
        }

        if (result.data) {
          setProducts((current) =>
            current.map((product) =>
              product.id === id ? result.data! : product
            )
          );
        }

        return {
          success: true,
          data: result.data,
        };
      } catch (error) {
        console.error("updateProduct error:", error);

        const message = "Something went wrong while updating the product.";

        setError(message);

        return {
          success: false,
          error: message,
        };
      }
    },
    []
  );

  /* ------------------------------------------------------------------------ */
  /* DELETE PRODUCT                                                           */
  /* ------------------------------------------------------------------------ */

  const deleteProduct = useCallback(async (id: string) => {
    try {
      setError(null);

      const result = await deleteProductAction(id);

      if (!result.success) {
        setError(result.error ?? "Failed to delete product.");

        return {
          success: false,
          error: result.error,
        };
      }

      setProducts((current) =>
        current.filter((product) => product.id !== id)
      );

      return {
        success: true,
      };
    } catch (error) {
      console.error("deleteProduct error:", error);

      const message = "Something went wrong while deleting the product.";

      setError(message);

      return {
        success: false,
        error: message,
      };
    }
  }, []);

  /* ------------------------------------------------------------------------ */
  /* REFRESH                                                                  */
  /* ------------------------------------------------------------------------ */

  const refreshProducts = useCallback(async () => {
    await fetchProducts();
  }, [fetchProducts]);

  /* ------------------------------------------------------------------------ */
  /* INITIAL FETCH                                                            */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /* ------------------------------------------------------------------------ */
  /* RETURN                                                                   */
  /* ------------------------------------------------------------------------ */

  return {
    products,

    loading,
    error,

    fetchProducts,
    fetchProduct,

    createProduct,
    updateProduct,
    deleteProduct,

    refreshProducts,
  };
}