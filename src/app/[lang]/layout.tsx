import type { Metadata } from "next";
import "../globals.css";
import React from "react";
import { cn } from "@/lib/utils";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/lib/i18n/routing";
import { notFound } from "next/navigation";
import { AppProvider } from "@/providers";
import { sarabun, prompt, inter, roboto } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "NU SEED Launchpad — Tag Matching",
  description: "AI-Powered Tag Matching & Technology Transfer Platform",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ lang: locale }));
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!routing.locales.includes(lang as "th" | "en")) {
    notFound();
  }

  setRequestLocale(lang);
  const messages = await getMessages();

  return (
    <html
      lang={lang}
      className={cn(
        "h-full",
        "antialiased",
        sarabun.variable,
        prompt.variable,
        inter.variable,
        roboto.variable,
        "font-sans"
      )}
    >
      <body className="bg-background text-foreground flex min-h-full flex-col">
        <AppProvider
          locale={lang || "th"}
          messages={messages}
          timeZone="Asia/Bangkok"
        >
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
