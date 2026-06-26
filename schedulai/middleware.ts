// middleware.ts
// Protects dashboard and admin routes
// Owned by: Lead

export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/booking/:path*",
    "/api/availability/:path*",
    "/api/admin/:path*",
  ],
};
