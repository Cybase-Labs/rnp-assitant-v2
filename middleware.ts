import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const cookieName = process.env.ADMIN_AUTH_COOKIE || "rtla_admin_auth";
  const expectedKey = process.env.ADMIN_DASHBOARD_KEY;
  const cookieValue = req.cookies.get(cookieName)?.value;

  if (!expectedKey || cookieValue !== expectedKey) {
    const loginUrl = new URL("/admin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};