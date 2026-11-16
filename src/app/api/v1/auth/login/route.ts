import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { signJwt } from "@/lib/auth/jwt";

// Default fallback users when DB is initializing or offline
const FALLBACK_USERS = [
  {
    id: "usr-admin-001",
    username: "admin",
    email: "admin@nu.ac.th",
    password: "Password123!",
    firstName: "ผู้ดูแลระบบ",
    lastName: "อุทยานฯ",
    role: "admin",
    roles: ["admin", "staff"],
    department: "อุทยานวิทยาศาสตร์มหาวิทยาลัยนเรศวร",
    avatarUrl: null,
    status: "active",
  },
  {
    id: "usr-nitipong-002",
    username: "nitipong",
    email: "nitipongj@nu.ac.th",
    password: "Password123!",
    firstName: "นิติพงศ์",
    lastName: "จิตรีโภชน์",
    role: "researcher",
    roles: ["researcher"],
    department: "ภาควิชาอุตสาหกรรมเกษตร คณะเกษตรศาสตร์ฯ มหาวิทยาลัยนเรศวร",
    avatarUrl: null,
    status: "active",
  },
  {
    id: "usr-worawut-003",
    username: "worawut",
    email: "wg.kriangkrai@gmail.com",
    password: "Password123!",
    firstName: "วรวุฒิ",
    lastName: "เกรียงไกร",
    role: "researcher",
    roles: ["researcher"],
    department: "ภาควิชาเทคโนโลยีเภสัชกรรม คณะเภสัชศาสตร์ มหาวิทยาลัยนเรศวร",
    avatarUrl: null,
    status: "active",
  },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password, rememberMe } = body || {};

    if (!username || !password) {
      return NextResponse.json(
        {
          code: "VALIDATION_FAILED",
          message: "กรุณากรอกอีเมล/ชื่อผู้ใช้ และรหัสผ่าน",
          fieldErrors: {
            username: !username ? ["กรุณากรอกอีเมลหรือชื่อผู้ใช้"] : undefined,
            password: !password ? ["กรุณากรอกรหัสผ่าน"] : undefined,
          },
        },
        { status: 422 }
      );
    }

    const cleanUsername = String(username).trim().toLowerCase();
    let authenticatedUser: any = null;

    // 1. Try querying Supabase
    try {
      const rows = await sql`
        SELECT * FROM users
        WHERE LOWER(username) = ${cleanUsername} OR LOWER(email) = ${cleanUsername}
        LIMIT 1
      `;
      if (rows.length > 0) {
        const dbUser = rows[0];
        const isValid = verifyPassword(password, dbUser.password_hash);
        if (isValid) {
          authenticatedUser = {
            id: dbUser.id,
            username: dbUser.username,
            email: dbUser.email,
            firstName: dbUser.first_name,
            lastName: dbUser.last_name,
            role: dbUser.role,
            roles: dbUser.roles || [dbUser.role],
            department: dbUser.department || "",
            avatarUrl: dbUser.avatar_url || null,
            status: dbUser.status,
          };
        }
      }
    } catch (dbErr) {
      console.warn("[Auth API] DB query error, checking fallback accounts:", dbErr);
    }

    // 2. Fallback check for initial dev/seed accounts
    if (!authenticatedUser) {
      const fallback = FALLBACK_USERS.find(
        (u) =>
          u.username.toLowerCase() === cleanUsername ||
          u.email.toLowerCase() === cleanUsername
      );
      if (fallback && fallback.password === password) {
        authenticatedUser = {
          id: fallback.id,
          username: fallback.username,
          email: fallback.email,
          firstName: fallback.firstName,
          lastName: fallback.lastName,
          role: fallback.role,
          roles: fallback.roles,
          department: fallback.department,
          avatarUrl: fallback.avatarUrl,
          status: fallback.status,
        };
      }
    }

    if (!authenticatedUser) {
      return NextResponse.json(
        {
          code: "INVALID_CREDENTIALS",
          message: "อีเมล ชื่อผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง",
        },
        { status: 401 }
      );
    }

    const durationSeconds = rememberMe ? 86400 * 30 : 86400;
    const accessToken = signJwt(
      {
        userId: authenticatedUser.id,
        username: authenticatedUser.username,
        email: authenticatedUser.email,
        role: authenticatedUser.role,
        roles: authenticatedUser.roles,
      },
      durationSeconds
    );

    const expiresAt = new Date(Date.now() + durationSeconds * 1000).toISOString();

    const response = NextResponse.json({
      accessToken,
      tokenType: "Bearer",
      expiresAt,
      user: authenticatedUser,
    });

    response.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: durationSeconds,
    });

    return response;
  } catch (error: any) {
    console.error("[Auth API] Login exception:", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
