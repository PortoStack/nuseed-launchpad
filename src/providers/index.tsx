"use client";

import React, { useState } from "react";
import { NextIntlClientProvider, type AbstractIntlMessages } from "next-intl";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

interface AppProviderProps {
  children: React.ReactNode;
  locale: string;
  messages: AbstractIntlMessages;
  timeZone?: string;
}

export function AppProvider({
  children,
  locale,
  messages,
  timeZone = "Asia/Bangkok",
}: AppProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  );

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone={timeZone}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delay={300}>{children}</TooltipProvider>
        <Toaster />
      </QueryClientProvider>
    </NextIntlClientProvider>
  );
}
