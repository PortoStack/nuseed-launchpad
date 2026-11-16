"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Menu,
  LayoutDashboard,
  Target,
  FilePlus,
  FolderSync,
  CheckSquare,
  Database,
  Brain,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconTooltip } from "@/components/shared/IconTooltip";
import { authService } from "@/services/authService";
import { useTranslations } from "next-intl";

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

type NavItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
  isActive: boolean;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("sidebar");

  // Extract language from pathname (e.g. /th/dashboard -> th)
  const segments = pathname.split("/");
  const lang = segments[1] || "th";

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      router.push(`/${lang}/login`);
      router.refresh();
    }
  };

  const isDashboard = pathname.includes("/dashboard");
  const isMatching =
    pathname.includes("/matching") && !pathname.includes("/requirements");
  const isNewRequirement = pathname.includes("/requirements");
  const isTagCatalog = pathname.includes("/tag-catalog");
  const isTagReview = pathname.includes("/tag-review");

  const navGroups: NavGroup[] = [
    {
      title: t("groups.matching"),
      items: [
        {
          name: t("items.dashboard"),
          href: `/${lang}/dashboard`,
          icon: <LayoutDashboard className="h-5 w-5" />,
          isActive: isDashboard,
        },
        {
          name: t("items.matching"),
          href: `/${lang}/matching`,
          icon: <Target className="h-5 w-5" />,
          isActive: isMatching,
        },
        {
          name: t("items.newRequirement"),
          href: `/${lang}/requirements/new`,
          icon: <FilePlus className="h-5 w-5" />,
          isActive: isNewRequirement,
        },
      ],
    },
    {
      title: t("groups.taxonomy"),
      items: [
        {
          name: t("items.tagCatalog"),
          href: `/${lang}/tag-catalog`,
          icon: <FolderSync className="h-5 w-5" />,
          isActive: isTagCatalog,
        },
        {
          name: t("items.tagReview"),
          href: `/${lang}/tag-review`,
          icon: <CheckSquare className="h-5 w-5" />,
          isActive: isTagReview,
        },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        "bg-sidebar border-border hidden flex-col border-r transition-all duration-300 md:flex sticky top-0 select-none",
        collapsed ? "w-18" : "w-64",
        className
      )}
    >
      {/* Brand Header */}
      <div className="border-border flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link
            href={`/${lang}/dashboard`}
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <span className="font-heading text-primary text-base font-bold tracking-tight">
              {t("brand")}
            </span>
          </Link>
        )}

        <IconTooltip
          label={t(
            collapsed ? "controls.expandSidebar" : "controls.collapseSidebar"
          )}
          side="right"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={cn("cursor-pointer", collapsed && "mx-auto")}
            aria-label="Toggle Sidebar"
          >
            <Menu className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          </Button>
        </IconTooltip>
      </div>

      {/* Navigation Groups (Only real active pages) */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-4 px-2">
        <nav className="flex flex-col gap-6">
          {navGroups.map((group) => (
            <div key={group.title} className="flex flex-col gap-1">
              {!collapsed && (
                <span className="text-primary/80 mb-1 px-3 text-xs font-semibold">
                  {group.title}
                </span>
              )}

              {group.items.map((item) => {
                const link = (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onNavigate}
                    prefetch={false}
                    className={cn(
                      "relative flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                      item.isActive
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                      collapsed && "justify-center px-0"
                    )}
                    aria-label={collapsed ? item.name : undefined}
                  >
                    <div className="flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>

                    {!collapsed && (
                      <span className="truncate">{item.name}</span>
                    )}
                  </Link>
                );

                return collapsed ? (
                  <IconTooltip key={item.name} label={item.name} side="right">
                    {link}
                  </IconTooltip>
                ) : (
                  <React.Fragment key={item.name}>{link}</React.Fragment>
                );
              })}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
