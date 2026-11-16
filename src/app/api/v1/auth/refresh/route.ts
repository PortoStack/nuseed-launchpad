import { NextRequest, NextResponse } from "next/server";
import { verifyJwt, signJwt } from "@/lib/auth/jwt";

export async function POST(req: NextRequest) {
  let token = req.cookies.get("access_token")?.value;
  if (!token) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return NextResponse.json(
      { code: "UNAUTHENTICATED", message: "No active session token found" },
      { status: 401 }
    );
  }

  const payload = verifyJwt(token);
  if (!payload) {
    return NextResponse.json(
      { code: "TOKEN_EXPIRED", message: "Session token is invalid or expired" },
      { status: 401 }
    );
  }

  const newAccessToken = signJwt({
    userId: payload.userId,
    username: payload.username,
    email: payload.email,
    role: payload.role,
    roles: payload.roles,
  });

  const expiresAt = new Date(Date.now() + 86400 * 1000).toISOString();
  const response = NextResponse.json({ accessToken: newAccessToken, expiresAt });

  response.cookies.set("access_token", newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 86400,
  });

  return response;
}
