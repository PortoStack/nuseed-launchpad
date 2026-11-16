"use client";

import { cn } from "@/lib/utils";
import { Bell, Globe, Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button, buttonVariants } from "@/components/ui/button";
import { ProfileDropdown } from "./ProfileDropdown";
import { TH, US } from "country-flag-icons/react/1x1";
import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconTooltip } from "@/components/shared/IconTooltip";

export function buildLocaleHref({
  pathname,
  newLocale,
}: {
  pathname: string;
  newLocale: string;
}) {
  const segments = pathname.split("/");
  segments[1] = newLocale;
  return segments.join("/") || `/${newLocale}/matching`;
}

export function Header({
  className,
  onMenuToggle,
}: {
  className?: string;
  onMenuToggle?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("notifications");
  const controlsT = useTranslations("sidebar.controls");
  const lang = pathname.split("/")[1] || "th";

  const switchLocale = (newLocale: string) => {
    router.push(buildLocaleHref({ pathname, newLocale }));
  };

  return (
    <header
      className={cn(
        "bg-card/95 border-border sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b px-4 backdrop-blur-md sm:px-6",
        className
      )}
    >
      {/* Left section: Mobile menu button */}
      <div className="flex items-center gap-3">
        <IconTooltip label={controlsT("openMenu") || "เปิดเมนู"}>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden cursor-pointer"
            aria-label={controlsT("openMenu") || "เปิดเมนู"}
            onClick={onMenuToggle}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </IconTooltip>
      </div>

      {/* Right section: Risk/Notification Bell + Language Switcher + Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Notification Bell */}
        <DropdownMenu>
          <IconTooltip label={t("riskTitle") || "การแจ้งเตือน"}>
            <DropdownMenuTrigger
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "cursor-pointer"
              )}
              aria-label={t("riskTitle") || "การแจ้งเตือน"}
            >
              <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            </DropdownMenuTrigger>
          </IconTooltip>
          <DropdownMenuContent align="end" className="w-80 p-2">
            <p className="text-foreground px-2 py-1.5 text-xs font-semibold">
              {t("riskTitle") || "การแจ้งเตือนระบบ"}
            </p>
            <div className="py-6 text-center text-xs text-muted-foreground">
              {t("riskEmpty") || "ไม่มีการแจ้งเตือนในขณะนี้"}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Language Switcher Dropdown with Flags */}
        <DropdownMenu>
          <IconTooltip label={controlsT("switchLanguage") || "เปลี่ยนภาษา"}>
            <DropdownMenuTrigger
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "cursor-pointer"
              )}
              aria-label={controlsT("switchLanguage") || "เปลี่ยนภาษา"}
            >
              <Globe className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            </DropdownMenuTrigger>
          </IconTooltip>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem
              onClick={() => switchLocale("th")}
              className="gap-2 cursor-pointer text-xs"
            >
              <TH className="h-4 w-4 rounded-xs object-cover" />
              <span className={lang === "th" ? "font-semibold text-primary" : ""}>
                ภาษาไทย
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => switchLocale("en")}
              className="gap-2 cursor-pointer text-xs"
            >
              <US className="h-4 w-4 rounded-xs object-cover" />
              <span className={lang === "en" ? "font-semibold text-primary" : ""}>
                English
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile Dropdown */}
        <ProfileDropdown />
      </div>
    </header>
  );
}
