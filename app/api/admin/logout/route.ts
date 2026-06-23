import { NextResponse } from "next/server";

export async function POST() {
  const cookieName = process.env.ADMIN_AUTH_COOKIE || "rtla_admin_auth";

  const res = NextResponse.json({ success: true });
  res.cookies.set(cookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return res;
}