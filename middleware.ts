import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(
            ({ name, value, options }) => {
              request.cookies.set(name, value);
              response.cookies.set(
                name,
                value,
                options,
              );
            },
          );
        },
      },
    },
  );

  /*
   * IMPORTANT:
   *
   * getUser() forces Supabase to validate/refresh
   * the current authentication session.
   *
   * Do not remove this call.
   */
  await supabase.auth.getUser();

  return response;
}

/* -------------------------------------------------------------------------- */
/* Middleware Matcher                                                         */
/* -------------------------------------------------------------------------- */

export const config = {
  matcher: [
    /*
     * Run middleware for application routes.
     *
     * Static files and Next.js internals are excluded.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};