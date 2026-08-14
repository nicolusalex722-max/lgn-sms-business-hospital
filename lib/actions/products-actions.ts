"use server";

import { createSupabaseServerClient } from "@/lib/db/server";
import { productSchema, 
        ProductFormData } from "../validations/product-schema";
import type { Product } from "@/lib/types";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type ProductRow = {
  id: string;
  product_name: string;
  product_type: "business" | "education" | "hospital";
  description: string | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
};

export type ProductActionResult<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.product_name,
    type:
      row.product_type === "business"
        ? "Business"
        : row.product_type === "education"
          ? "Education"
          : "Hospital",
    description: row.description ?? "",
    status: row.status === "active" ? "Active" : "Inactive",
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapProductType(
  type: ProductFormData["type"]
): ProductRow["product_type"] {
  return type.toLowerCase() as ProductRow["product_type"];
}

function mapProductStatus(
  status: ProductFormData["status"]
): ProductRow["status"] {
  return status.toLowerCase() as ProductRow["status"];
}

/* -------------------------------------------------------------------------- */
/* GET ALL PRODUCTS                                                           */
/* -------------------------------------------------------------------------- */

export async function getProducts(): Promise<
  ProductActionResult<Product[]>
> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("products")
      .select(
        `
          id,
          product_name,
          product_type,
          description,
          status,
          created_at,
          updated_at
        `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("getProducts error:", error);

      return {
        success: false,
        error: "Failed to fetch products.",
      };
    }

    const products = (data as ProductRow[]).map(mapProduct);

    return {
      success: true,
      data: products,
    };
  } catch (error) {
    console.error("getProducts unexpected error:", error);

    return {
      success: false,
      error: "Something went wrong while fetching products.",
    };
  }
}

// GET PRODUCT BY ID                                                          

export async function getProductById(
  id: string
): Promise<ProductActionResult<Product>> {
  try {
    if (!id) {
      return {
        success: false,
        error: "Product ID is required.",
      };
    }

    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("products")
      .select(
        `
          id,
          product_name,
          product_type,
          description,
          status,
          created_at,
          updated_at
        `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("getProductById error:", error);

      return {
        success: false,
        error:
          error.code === "PGRST116"
            ? "Product not found."
            : "Failed to fetch product.",
      };
    }

    return {
      success: true,
      data: mapProduct(data as ProductRow),
    };
  } catch (error) {
    console.error("getProductById unexpected error:", error);

    return {
      success: false,
      error: "Something went wrong while fetching the product.",
    };
  }
}

// CREATE PRODUCT                                                             

export async function createProduct(
  input: ProductFormData
): Promise<ProductActionResult<Product>> {
  try {
    // Server-side validation
    const validation = productSchema.safeParse(input);

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message ?? "Invalid product data.",
      };
    }

    const values = validation.data;

    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("products")
      .insert({
        product_name: values.name,
        product_type: mapProductType(values.type),
        description: values.description || null,
        status: mapProductStatus(values.status),
      })
      .select(
        `
          id,
          product_name,
          product_type,
          description,
          status,
          created_at,
          updated_at
        `
      )
      .single();

    if (error) {
      console.error("createProduct error:", error);

      return {
        success: false,
        error: "Failed to create product.",
      };
    }

    return {
      success: true,
      data: mapProduct(data as ProductRow),
    };
  } catch (error) {
    console.error("createProduct unexpected error:", error);

    return {
      success: false,
      error: "Something went wrong while creating the product.",
    };
  }
}

// UPDATE PRODUCT                                                             

export async function updateProduct(
  id: string,
  input: ProductFormData
): Promise<ProductActionResult<Product>> {
  try {
    if (!id) {
      return {
        success: false,
        error: "Product ID is required.",
      };
    }

    // Server-side validation
    const validation = productSchema.safeParse(input);

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message ?? "Invalid product data.",
      };
    }

    const values = validation.data;

    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("products")
      .update({
        product_name: values.name,
        product_type: mapProductType(values.type),
        description: values.description || null,
        status: mapProductStatus(values.status),
      })
      .eq("id", id)
      .select(
        `
          id,
          product_name,
          product_type,
          description,
          status,
          created_at,
          updated_at
        `
      )
      .single();

    if (error) {
      console.error("updateProduct error:", error);

      return {
        success: false,
        error:
          error.code === "PGRST116"
            ? "Product not found."
            : "Failed to update product.",
      };
    }

    return {
      success: true,
      data: mapProduct(data as ProductRow),
    };
  } catch (error) {
    console.error("updateProduct unexpected error:", error);

    return {
      success: false,
      error: "Something went wrong while updating the product.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* DELETE PRODUCT                                                             */
/* -------------------------------------------------------------------------- */

export async function deleteProduct(
  id: string
): Promise<ProductActionResult> {
  try {
    if (!id) {
      return {
        success: false,
        error: "Product ID is required.",
      };
    }

    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("deleteProduct error:", error);

      return {
        success: false,
        error: "Failed to delete product.",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("deleteProduct unexpected error:", error);

    return {
      success: false,
      error: "Something went wrong while deleting the product.",
    };
  }
}