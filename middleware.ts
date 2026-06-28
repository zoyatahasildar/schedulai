// middleware.ts
// Protects dashboard and admin PAGES only.
// API routes enforce their own auth internally (getServerSession), so the
// PUBLIC booking flow stays reachable by guests who are not logged in:
//   - GET  /api/booking/slots   (guest views open times)
//   - POST /api/booking         (guest creates a booking)
//   - GET  /api/availability/slots
// Dashboard-only actions inside those routes (list/cancel bookings, save
// availability) still check the session inside the handler.
// Owned by: Lead

export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
  ],
};
