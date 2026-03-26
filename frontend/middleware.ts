import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that don't need auth
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/onboarding",
];

// Routes only for recruiters
const RECRUITER_ROUTES = [
  "/company",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // get token from cookie (we'll set this on login)
  const token = request.cookies.get("hf_token")?.value;

  // check if public route
  const isPublic = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // not logged in + trying to access protected route
  if (!token && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // already logged in + trying to access auth pages
  if (token && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image  (image optimization)
     * - favicon.ico
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};