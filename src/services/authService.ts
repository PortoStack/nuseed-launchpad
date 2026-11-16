import type { CurrentUser } from "@/types/user";

export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
  user: CurrentUser;
}

export interface RefreshResponse {
  accessToken: string;
  expiresAt: string;
}

let inMemoryToken: string | null = null;

export function setAccessToken(token: string | null) {
  inMemoryToken = token;
}

export function getAccessToken(): string | null {
  return inMemoryToken;
}

export function clearAccessToken() {
  inMemoryToken = null;
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const res = await fetch("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
      credentials: "include",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw err;
    }

    const data: LoginResponse = await res.json();
    setAccessToken(data.accessToken);
    return data;
  },

  logout: async (): Promise<void> => {
    try {
      await fetch("/api/v1/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      clearAccessToken();
    }
  },

  refresh: async (): Promise<RefreshResponse> => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (inMemoryToken) {
      headers["Authorization"] = `Bearer ${inMemoryToken}`;
    }

    const res = await fetch("/api/v1/auth/refresh", {
      method: "POST",
      headers,
      credentials: "include",
    });

    if (!res.ok) {
      clearAccessToken();
      throw new Error("Failed to refresh token");
    }

    const data: RefreshResponse = await res.json();
    setAccessToken(data.accessToken);
    return data;
  },

  getCurrentUser: async (): Promise<CurrentUser> => {
    const headers: Record<string, string> = {};
    if (inMemoryToken) {
      headers["Authorization"] = `Bearer ${inMemoryToken}`;
    }

    const res = await fetch("/api/v1/auth/me", {
      method: "GET",
      headers,
      credentials: "include",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw err;
    }

    const user: CurrentUser = await res.json();
    return user;
  },
};
