"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { User, LogOut, LogIn } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { CurrentUser } from "@/types/user";
import { useCurrentUser } from "@/hooks/queries/use-auth";
import { authService } from "@/services/authService";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * Get the initials to display inside the avatar circle.
 * Prefers first-letter of firstName + lastName (e.g. "PK").
 */
function getInitials(user: CurrentUser): string {
  const f = user.firstName?.[0] ?? "";
  const l = user.lastName?.[0] ?? "";
  return (f + l).toUpperCase() || user.username?.slice(0, 2).toUpperCase() || "NU";
}

export function ProfileDropdown() {
  const t = useTranslations("profile");
  const controlsT = useTranslations("sidebar.controls");
  const pathname = usePathname();
  const router = useRouter();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const queryClient = useQueryClient();

  const lang = pathname.split("/")[1] || "th";
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="h-8 w-8 rounded-full bg-muted/60 animate-pulse" />
    );
  }

  if (!user) {
    return (
      <Link
        href={`/${lang}/login`}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-card hover:bg-muted text-foreground transition-colors cursor-pointer"
      >
        <LogIn className="h-3.5 w-3.5 text-primary" />
        <span>{lang === "th" ? "เข้าสู่ระบบ" : "Sign in"}</span>
      </Link>
    );
  }

  const handleLogoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLogoutOpen(true);
  };

  const handleConfirmLogout = async () => {
    setIsLogoutOpen(false);

    try {
      await authService.logout();
    } catch (error) {
      console.error("[ProfileDropdown] logout request failed:", error);
    }

    queryClient.clear();
    router.push(`/${lang}/login`);
  };

  const roleLabel =
    (t.has(`role.${user.role}`) ? t(`role.${user.role}`) : user.role) || "ผู้ใช้งาน";

  return (
    <>
      <DropdownMenu>
        <IconTooltip label={controlsT("userMenu")}>
          <DropdownMenuTrigger
            className="focus-visible:ring-ring flex cursor-pointer items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            aria-label={controlsT("userMenu")}
          >
            <div className="bg-primary/20 text-primary border border-primary/30 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full text-xs font-bold transition-opacity hover:opacity-80">
              {getInitials(user)}
            </div>
          </DropdownMenuTrigger>
        </IconTooltip>

        <DropdownMenuContent align="end" sideOffset={8} className="w-56">
          {/* User info header */}
          <div className="flex flex-col gap-0.5 px-3 py-2.5">
            <span className="text-foreground text-sm font-semibold truncate">
              {user.firstName} {user.lastName}
            </span>
            <span className="text-muted-foreground text-xs font-normal">
              {roleLabel}
            </span>
          </div>

          <DropdownMenuSeparator />

          {/* Menu items */}
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="cursor-pointer gap-2 px-3 py-2 text-xs"
              onClick={() => router.push(`/${lang}/matching`)}
            >
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{t("menu.profile")}</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-destructive focus:text-destructive cursor-pointer gap-2 px-3 py-2 text-xs"
            onClick={handleLogoutClick}
          >
            <LogOut className="h-4 w-4" />
            <span>{t("menu.logout")}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
        <DialogContent className="sm:max-w-90">
          <div className="flex flex-col items-center px-2 pt-6 pb-2 text-center">
            <div className="bg-destructive/10 mb-5 flex h-14 w-14 items-center justify-center rounded-full">
              <LogOut className="text-destructive h-7 w-7" />
            </div>
            <DialogTitle className="mb-2 text-xl font-bold">
              {t("logoutConfirm.title")}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {t("logoutConfirm.desc")}
            </DialogDescription>
            <div className="mt-8 flex w-full items-center justify-center gap-3">
              <Button
                variant="outline"
                className="w-full sm:w-28 cursor-pointer"
                onClick={() => setIsLogoutOpen(false)}
              >
                {t("logoutConfirm.cancel")}
              </Button>
              <Button
                variant="destructive"
                className="w-full sm:w-28 cursor-pointer"
                onClick={() => void handleConfirmLogout()}
              >
                {t("logoutConfirm.confirm")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
