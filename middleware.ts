import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * ============================================================
 * SUPABASE AUTH MIDDLEWARE
 * ============================================================
 *
 * Responsibilities:
 *
 * 1. Create a Supabase SSR client.
 * 2. Read authentication cookies from the request.
 * 3. Write refreshed authentication cookies to the response.
 * 4. Validate/refresh the current Supabase session.
 * 5. Protect /dashboard routes.
 *
 * IMPORTANT:
 *
 * Do not remove supabase.auth.getUser().
 *
 * getUser() is what forces Supabase to validate the current
 * authentication session and refresh it when necessary.
 */

export async function middleware(request: NextRequest) {
  /**
   * Start with a normal Next.js response.
   *
   * Supabase may modify this response when authentication
   * cookies need to be refreshed.
   */
  let response = NextResponse.next({
    request,
  });

  /**
   * Create Supabase SSR client.
   */
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        /**
         * ------------------------------------------------------
         * GET COOKIES
         * ------------------------------------------------------
         */
        getAll() {
          return request.cookies.getAll();
        },

        /**
         * ------------------------------------------------------
         * SET COOKIES
         * ------------------------------------------------------
         *
         * Supabase can refresh the session and return new
         * authentication cookies.
         *
         * We must write those cookies to BOTH:
         *
         * 1. request.cookies
         * 2. response.cookies
         *
         * This is important for Supabase SSR session handling.
         */
        setAll(cookiesToSet) {
          cookiesToSet.forEach(
            ({ name, value, options }) => {
              /**
               * Update the request cookie so subsequent
               * operations in this middleware see the new
               * value.
               */
              request.cookies.set(name, value);

              /**
               * Send the updated cookie to the browser.
               */
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

  /**
   * ==========================================================
   * VALIDATE CURRENT USER
   * ==========================================================
   *
   * IMPORTANT:
   *
   * Use getUser(), not getSession(), when validating the
   * authenticated user on the server.
   */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  /**
   * ==========================================================
   * PROTECT DASHBOARD ROUTES
   * ==========================================================
   *
   * If there is no authenticated Supabase user and the user
   * attempts to access /dashboard, redirect to /login.
   */
  if (
    !user &&
    request.nextUrl.pathname.startsWith("/dashboard")
  ) {
    const loginUrl = request.nextUrl.clone();

    loginUrl.pathname = "/login";

    /**
     * Remember where the user was trying to go.
     *
     * Your login page can optionally use this later.
     */
    loginUrl.searchParams.set(
      "redirectTo",
      request.nextUrl.pathname,
    );

    return NextResponse.redirect(loginUrl);
  }

  /**
   * Return the response containing any refreshed Supabase
   * authentication cookies.
   */
  return response;
}

/**
 * ============================================================
 * MIDDLEWARE MATCHER
 * ============================================================
 *
 * Run middleware for application routes while excluding:
 *
 * - Next.js static files
 * - Next.js image optimizer
 * - favicon
 * - common image assets
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};