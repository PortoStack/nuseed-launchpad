import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./lib/i18n/routing";
import { verifyEdgeJwt } from "./lib/auth/edge-jwt";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip static assets, internal Next.js requests, and public APIs
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // 2. Parse language prefix (e.g. /th/matching -> locale='th', subPath='/matching')
  const localeMatch = pathname.match(/^\/(th|en)(\/.*)?$/);

  // If path does not have locale prefix, run intlMiddleware to redirect to /th/... or /en/...
  if (!localeMatch) {
    return intlMiddleware(request);
  }

  const locale = localeMatch[1];
  const subPath = localeMatch[2] || "/";

  // 3. Check if route is public
  const isAuthPage = subPath === "/login" || subPath.startsWith("/login");
  const isPublicPage =
    isAuthPage || subPath.startsWith("/accept-invitation");

  // 4. Check if auth protection is disabled for development
  if (process.env.DISABLE_AUTH_PROTECT === "true") {
    return intlMiddleware(request);
  }

  // 5. Verify JWT authentication cookie
  const token = request.cookies.get("access_token")?.value;
  const user = token ? await verifyEdgeJwt(token) : null;

  // 6. If user is NOT authenticated:
  if (!user) {
    // If attempting to access a protected page
    if (!isPublicPage && subPath !== "/") {
      const returnTo = pathname + request.nextUrl.search;
      const loginUrl = new URL(
        `/${locale}/login?returnTo=${encodeURIComponent(returnTo)}`,
        request.url
      );
      return NextResponse.redirect(loginUrl);
    }
  }

  // 7. If user IS authenticated:
  if (user) {
    // Prevent authenticated user from visiting login page again
    if (isAuthPage) {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    }
  }

  // 8. Run standard next-intl routing
  return intlMiddleware(request);
}

export const config = {
  // Match internationalized pathnames, root, and any un-prefixed app paths
  matcher: ["/", "/(th|en)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
