"use client";

import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import type { CurrentUser } from "@/types/user";

export function useCurrentUser() {
  return useQuery<CurrentUser>({
    queryKey: ["auth", "me"],
    queryFn: () => authService.getCurrentUser(),
    retry: (failureCount, error: any) => {
      // Don't retry if unauthenticated
      if (error?.code === "UNAUTHENTICATED" || error?.code === "TOKEN_EXPIRED") {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 5,
  });
}
