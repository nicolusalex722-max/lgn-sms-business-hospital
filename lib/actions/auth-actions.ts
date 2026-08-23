"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "../db/server";

import {
  loginSchema,
  type LoginInput,
} from "../validations/auth-schema";

/**
 * ============================================================
 * USER LOGIN
 * ============================================================
 */
export async function userLogin(input: LoginInput) {
  /**
   * ----------------------------------------------------------
   * 1. VALIDATE INPUT
   * ----------------------------------------------------------
   */
  const validated = loginSchema.safeParse(input);

  if (!validated.success) {
    return {
      success: false,
      message: "Invalid login data.",
    };
  }

  const {
    email,
    password,
  } = validated.data;

  /**
   * ----------------------------------------------------------
   * 2. CREATE SUPABASE SERVER CLIENT
   * ----------------------------------------------------------
   */
  const supabase =
    await createSupabaseServerClient();

  /**
   * ----------------------------------------------------------
   * 3. AUTHENTICATE USER
   * ----------------------------------------------------------
   */
  const {
    data,
    error,
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  /**
   * ----------------------------------------------------------
   * 4. HANDLE LOGIN ERROR
   * ----------------------------------------------------------
   */
  if (error || !data.session || !data.user) {
    console.error(
      "[userLogin] Supabase login error:",
      error,
    );

    return {
      success: false,
      message:
        "Invalid email or password. Please try again.",
    };
  }

  /**
   * ----------------------------------------------------------
   * 5. SUCCESS
   * ----------------------------------------------------------
   */
  return {
    success: true,
    message: "Login successful.",
    data: {
      user: data.user,
      session: data.session,
    },
  };
}

/**
 * ============================================================
 * USER LOGOUT
 * ============================================================
 *
 * This is a Server Action.
 *
 * The Sidebar submits directly to this function:
 *
 * <form action={logoutAdmin}>
 *
 * Supabase will invalidate the current authentication session.
 * The SSR client will update the authentication cookies.
 * Finally, the browser is redirected to /login.
 */
export async function logoutAdmin() {
  /**
   * ----------------------------------------------------------
   * 1. CREATE SUPABASE SERVER CLIENT
   * ----------------------------------------------------------
   */
  const supabase =
    await createSupabaseServerClient();

  /**
   * ----------------------------------------------------------
   * 2. SIGN OUT
   * ----------------------------------------------------------
   *
   * This invalidates the current Supabase authentication
   * session.
   */
  const {
    error,
  } = await supabase.auth.signOut();

  /**
   * ----------------------------------------------------------
   * 3. HANDLE LOGOUT ERROR
   * ----------------------------------------------------------
   */
  if (error) {
    console.error(
      "[logoutAdmin] Supabase signOut error:",
      error,
    );

    throw new Error(
      "Unable to sign out. Please try again.",
    );
  }

  /**
   * ----------------------------------------------------------
   * 4. REDIRECT TO LOGIN
   * ----------------------------------------------------------
   *
   * IMPORTANT:
   *
   * redirect() throws internally in Next.js.
   *
   * Therefore this must be the final operation.
   */
  redirect("/login");
}