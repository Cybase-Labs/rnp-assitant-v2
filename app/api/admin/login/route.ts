import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const key = String(body?.key ?? "").trim();

    const expectedKey = process.env.ADMIN_DASHBOARD_KEY;
    const cookieName = process.env.ADMIN_AUTH_COOKIE || "rtla_admin_auth";

    console.log("LOGIN ROUTE HIT");
    console.log("Provided key:", key ? "[present]" : "[missing]");
    console.log("Expected key exists:", !!expectedKey);

    if (!expectedKey) {
      return NextResponse.json(
        { error: "ADMIN_DASHBOARD_KEY is not configured" },
        { status: 500 }
      );
    }

    if (key !== expectedKey) {
      return NextResponse.json(
        { error: "Invalid admin key" },
        { status: 401 }
      );
    }

    const res = NextResponse.json({ success: true });

    res.cookies.set(cookieName, expectedKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return res;
  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);
    return NextResponse.json(
      { error: "Server error during admin login" },
      { status: 500 }
    );
  }
}