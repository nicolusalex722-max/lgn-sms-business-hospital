import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/* -------------------------------------------------------------------------- */
/* Authenticated Server Client                                                */
/* -------------------------------------------------------------------------- */

/**
 * Server client used for normal authenticated requests.
 *
 * This client:
 * - Reads the Supabase auth session from cookies.
 * - Runs queries as the authenticated user.
 * - Allows PostgreSQL RLS policies to protect tenant data.
 *
 * DO NOT use SUPABASE_SERVICE_ROLE_KEY here.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },

        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(
              ({ name, value, options }) => {
                cookieStore.set(
                  name,
                  value,
                  options
                );
              }
            );
          } catch {
            /*
             * setAll can be called from a Server Component
             * where cookies cannot be modified.
             *
             * In that case middleware should normally
             * handle session refresh.
             */
          }
        },
      },
    }
  );
}

/* -------------------------------------------------------------------------- */
/* Service Role / Admin Client                                                */
/* -------------------------------------------------------------------------- */

/**
 * Privileged Supabase client.
 *
 * This client bypasses RLS.
 *
 * ONLY use this for trusted server-side operations such as:
 * - auth.admin.createUser()
 * - auth.admin.updateUserById()
 * - auth.admin.deleteUser()
 *
 * NEVER expose this client to the browser.
 * NEVER use it for normal tenant queries.
 */
export function createSupabaseAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },

        setAll() {
          /*
           * Admin client does not use browser auth cookies.
           */
        },
      },
    }
  );
}