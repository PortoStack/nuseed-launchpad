import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifyJwt } from "@/lib/auth/jwt";

export async function GET(req: NextRequest) {
  try {
    let token = req.cookies.get("access_token")?.value;
    if (!token) {
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json(
        { code: "UNAUTHENTICATED", message: "User is not authenticated" },
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

    let user: any = null;

    try {
      const rows = await sql`
        SELECT id, username, email, first_name, last_name, role, roles, department, avatar_url, status
        FROM users
        WHERE id = ${payload.userId}
        LIMIT 1
      `;
      if (rows.length > 0) {
        const row = rows[0];
        user = {
          id: row.id,
          username: row.username,
          email: row.email,
          firstName: row.first_name,
          lastName: row.last_name,
          role: row.role,
          roles: row.roles || [row.role],
          department: row.department || "",
          avatarUrl: row.avatar_url || null,
          status: row.status,
        };
      }
    } catch {
      // If DB is offline, reconstruct user object from verified JWT payload
    }

    if (!user) {
      user = {
        id: payload.userId,
        username: payload.username,
        email: payload.email,
        firstName: payload.username === "admin" ? "ผู้ดูแลระบบ" : payload.username,
        lastName: payload.username === "admin" ? "อุทยานฯ" : "",
        role: payload.role,
        roles: payload.roles,
        department: "",
        avatarUrl: null,
        status: "active",
      };
    }

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
