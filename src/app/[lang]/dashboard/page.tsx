import React from "react";
import { AppShell } from "@/components/shared/AppShell";
import { DashboardWorkspace } from "@/components/dashboard/dashboard-workspace";
import { dashboardService } from "@/services/dashboardService";

export const dynamic = "force-dynamic";

interface DashboardPageProps {
  params: Promise<{ lang: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { lang } = await params;
  const data = await dashboardService.getDashboardData();

  return (
    <AppShell>
      <DashboardWorkspace data={data} lang={lang} />
    </AppShell>
  );
}
