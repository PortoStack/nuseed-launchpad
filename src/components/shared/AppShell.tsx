"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Breadcrumb } from "./Breadcrumb";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
  showBreadcrumb?: boolean;
  breadcrumbLabels?: Readonly<Record<string, string>>;
}

export function AppShell({
  children,
  showBreadcrumb = true,
  breadcrumbLabels,
}: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-background flex min-h-screen w-full overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="bg-background relative flex w-72 max-w-xs flex-col shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b px-4">
              <span className="font-heading text-primary font-bold">
                NU SEED Launchpad
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                className="cursor-pointer"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <Sidebar
              className="flex w-full border-none h-full"
              onNavigate={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top Header - 100% NUSEEDBITI */}
        <Header onMenuToggle={() => setMobileMenuOpen(true)} />

        {/* Scrollable Page Body */}
        <main className="bg-surface-subtle min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          <div className="mx-auto w-full min-w-0 max-w-7xl p-5 sm:p-6 lg:p-8">
            {showBreadcrumb && (
              <Breadcrumb labels={breadcrumbLabels} className="mb-4 sm:mb-6" />
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
