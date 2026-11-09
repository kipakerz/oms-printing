import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const role = token?.role;

    // Protect /admin routes - only ADMIN role allowed
    if (path.startsWith("/admin") && role !== "ADMIN") {
      if (role === "PRODUKSI") {
        return NextResponse.redirect(new URL("/produksi/dashboard", req.url));
      }
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Protect /produksi routes - only PRODUKSI (and ADMIN if needed) allowed
    if (path.startsWith("/produksi") && role !== "PRODUKSI" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/produksi/:path*"],
};
