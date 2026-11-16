"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Target,
  Sparkles,
  Users,
  Wallet,
  Tag,
  Building2,
  TrendingUp,
  ArrowRight,
  Plus,
  CheckCircle2,
  Database,
  Brain,
  Filter,
  RotateCcw,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DashboardData } from "@/services/dashboardService";

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-muted-foreground text-sm font-medium">{label}</span>
      <div role="group" aria-label={label} className="flex flex-wrap gap-2">
        {children}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "focus-visible:outline-ring inline-flex min-h-11 items-center rounded-md border px-4 text-base font-medium transition-colors focus-visible:outline-2 cursor-pointer",
        active
          ? "border-primary bg-primary text-primary-foreground font-semibold shadow-xs"
          : "bg-card text-foreground hover:bg-muted"
      )}
    >
      {children}
    </button>
  );
}

interface DashboardWorkspaceProps {
  data: DashboardData;
  lang: string;
}

export function DashboardWorkspace({ data, lang }: DashboardWorkspaceProps) {
  const t = useTranslations("dashboard");
  const { industryClusters, topTags, programs, recentMatches } = data;

  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<"all" | "matched" | "pending">("all");

  const filteredMatches = useMemo(() => {
    return recentMatches.filter((item) => {
      if (selectedCluster && item.businessType !== selectedCluster) {
        return false;
      }
      if (selectedProgram && item.fundingCode !== selectedProgram) {
        return false;
      }
      const isMatched = Boolean(
        item.researcherName ||
        (item.fitScore !== undefined && item.fitScore !== null && item.fitScore > 0)
      );
      if (selectedStatus === "matched" && !isMatched) {
        return false;
      }
      if (selectedStatus === "pending" && isMatched) {
        return false;
      }
      return true;
    });
  }, [recentMatches, selectedCluster, selectedProgram, selectedStatus]);

  const hasActiveFilters = selectedCluster !== null || selectedProgram !== null || selectedStatus !== "all";

  const handleResetFilters = () => {
    setSelectedCluster(null);
    setSelectedProgram(null);
    setSelectedStatus("all");
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header Section */}
      <div className="border-border bg-card rounded-2xl border p-6 shadow-xs sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-xl font-bold">
                <Target className="h-5 w-5" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {t("title")}
              </h1>
            </div>
            <p className="text-muted-foreground text-sm">
              {t("description")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link href={`/${lang}/requirements/new`}>
              <Button className="gap-2 shadow-sm font-semibold">
                <Plus className="h-4 w-4" />
                {t("newRequirement")}
              </Button>
            </Link>

            <Link href={`/${lang}/matching`}>
              <Button variant="outline" className="gap-2">
                <Target className="h-4 w-4 text-primary" />
                {t("matchingWorkspace")}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Interactive Tag Matching Filter Bar (Replaced 4 KPI stat boxes) */}
      <div className="border-border bg-card rounded-2xl border p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            <h2 className="text-base font-bold text-foreground">
              {t("filters.label")}
            </h2>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="text-muted-foreground hover:text-foreground text-xs gap-1.5 h-8"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {t("filters.reset")}
            </Button>
          )}
        </div>

        <nav aria-label={t("filters.label")} className="flex flex-col gap-5 lg:flex-row lg:flex-wrap lg:items-start lg:gap-8">
          {/* Filter 1: Industry Cluster */}
          <FilterGroup label={t("filters.cluster")}>
            <FilterChip
              active={selectedCluster === null}
              onClick={() => setSelectedCluster(null)}
            >
              {t("filters.all")}
            </FilterChip>
            {industryClusters.map((c) => (
              <FilterChip
                key={c.cluster}
                active={selectedCluster === c.cluster}
                onClick={() => setSelectedCluster(selectedCluster === c.cluster ? null : c.cluster)}
              >
                {c.cluster}
              </FilterChip>
            ))}
          </FilterGroup>

          {/* Filter 2: Funding Program */}
          <FilterGroup label={t("filters.program")}>
            <FilterChip
              active={selectedProgram === null}
              onClick={() => setSelectedProgram(null)}
            >
              {t("filters.all")}
            </FilterChip>
            {programs.map((p) => (
              <FilterChip
                key={p.code}
                active={selectedProgram === p.code}
                onClick={() => setSelectedProgram(selectedProgram === p.code ? null : p.code)}
              >
                {p.code}
              </FilterChip>
            ))}
          </FilterGroup>

          {/* Filter 3: Matching Status */}
          <FilterGroup label={t("filters.status")}>
            <FilterChip
              active={selectedStatus === "all"}
              onClick={() => setSelectedStatus("all")}
            >
              {t("filters.all")}
            </FilterChip>
            <FilterChip
              active={selectedStatus === "matched"}
              onClick={() => setSelectedStatus(selectedStatus === "matched" ? "all" : "matched")}
            >
              {t("filters.matched")}
            </FilterChip>
            <FilterChip
              active={selectedStatus === "pending"}
              onClick={() => setSelectedStatus(selectedStatus === "pending" ? "all" : "pending")}
            >
              {t("filters.pending")}
            </FilterChip>
          </FilterGroup>
        </nav>

        {hasActiveFilters && (
          <div className="pt-3 text-xs text-muted-foreground flex items-center gap-1.5 border-t border-border/60">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="font-medium text-foreground">
              {t("filters.filteredResults", { count: filteredMatches.length })}
            </span>
          </div>
        )}
      </div>

      {/* 3. Middle Section: Industry Clusters & Programs */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Col 1 & 2: Industry Cluster Distribution + Top Tags */}
        <div className="border-border bg-card rounded-xl border p-6 shadow-xs space-y-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Layers className="text-primary h-4 w-4" />
                {t("clusters.title")}
              </h3>
              <p className="text-muted-foreground text-xs mt-1">
                {t("clusters.description")}
              </p>
            </div>
            {selectedCluster && (
              <Badge variant="outline" className="border-primary text-primary text-xs">
                {selectedCluster}
              </Badge>
            )}
          </div>

          {/* Bar List */}
          <div className="space-y-4">
            {industryClusters.map((cluster) => {
              const isSelected = selectedCluster === cluster.cluster;
              return (
                <div
                  key={cluster.cluster}
                  onClick={() => setSelectedCluster(isSelected ? null : cluster.cluster)}
                  className={cn(
                    "space-y-1.5 p-2 rounded-lg cursor-pointer transition-colors",
                    isSelected ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-muted/40"
                  )}
                >
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className={cn("truncate max-w-[80%]", isSelected ? "text-primary font-bold" : "text-foreground")}>
                      {cluster.cluster}
                    </span>
                    <span className="text-muted-foreground">
                      {cluster.count} {t("clusters.projectsUnit")} ({cluster.percentage}%)
                    </span>
                  </div>
                  <div className="bg-muted/60 h-2.5 w-full rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", isSelected ? "bg-primary" : "bg-primary/80")}
                      style={{ width: `${Math.max(15, cluster.percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Top Matched Tags */}
          <div className="border-border/80 border-t pt-5 space-y-3">
            <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-primary" />
              {t("tags.topTagsTitle")}
            </h4>
            <div className="flex flex-wrap gap-2">
              {topTags.map((tagItem) => (
                <Badge
                  key={tagItem.name}
                  variant="secondary"
                  className="bg-muted/70 hover:bg-muted text-foreground flex items-center gap-1.5 py-1 px-2.5 text-xs transition-colors"
                >
                  <span>#{tagItem.name}</span>
                  {tagItem.usageCount > 0 && (
                    <span className="bg-primary/20 text-primary font-bold rounded-full px-1.5 py-0.2 text-[10px]">
                      {tagItem.usageCount}
                    </span>
                  )}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Col 3: Programs & Engine Architecture */}
        <div className="space-y-6">
          {/* Programs */}
          <div className="border-border bg-card rounded-xl border p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Wallet className="text-emerald-500 h-4 w-4" />
                  {t("programs.title")}
                </h3>
                <p className="text-muted-foreground text-xs mt-1">
                  {t("programs.description")}
                </p>
              </div>
              {selectedProgram && (
                <Badge variant="outline" className="border-emerald-500 text-emerald-600 dark:text-emerald-400 text-xs">
                  {selectedProgram}
                </Badge>
              )}
            </div>

            <div className="space-y-3">
              {programs.map((p) => {
                const isSelected = selectedProgram === p.code;
                return (
                  <div
                    key={p.code}
                    onClick={() => setSelectedProgram(isSelected ? null : p.code)}
                    className={cn(
                      "rounded-lg border p-3 space-y-1.5 cursor-pointer transition-colors",
                      isSelected
                        ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-1 ring-emerald-500/40"
                        : "border-border/70 bg-muted/20 hover:bg-muted/40"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground text-sm">
                        {p.code}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {p.count} {t("programs.projectsUnit")}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-xs line-clamp-1">
                      {p.title}
                    </p>
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/50">
                      <span className="text-muted-foreground">
                        {t("programs.budgetLimit")} ฿{p.totalBudget.toLocaleString()}
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        {p.supportRatio}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Engine Status */}
          <div className="border-border bg-card rounded-xl border p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="text-emerald-500 h-3.5 w-3.5" />
              {t("engine.title")}
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5 text-emerald-500" />
                  {t("engine.database")}
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {t("engine.online")}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Brain className="h-3.5 w-3.5 text-indigo-500" />
                  {t("engine.ai")}
                </span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  {t("engine.active")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Recent Matched Requirements Table */}
      <div className="border-border bg-card rounded-xl border p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Target className="text-primary h-4 w-4" />
              {t("table.title")}
            </h3>
            <p className="text-muted-foreground text-xs mt-0.5">
              {t("table.description")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {filteredMatches.length} / {recentMatches.length} {t("clusters.projectsUnit")}
            </span>
            <Link href={`/${lang}/matching`}>
              <Button variant="ghost" size="sm" className="text-primary hover:underline text-xs gap-1">
                {t("table.viewAll")} <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>

        {filteredMatches.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm space-y-3">
            <p>{hasActiveFilters ? t("filters.filteredResults", { count: 0 }) : t("table.empty")}</p>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={handleResetFilters} className="text-xs">
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                {t("filters.reset")}
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-border text-muted-foreground border-b text-xs uppercase bg-muted/30">
                <tr>
                  <th className="py-3 px-4 font-semibold">{t("table.colProject")}</th>
                  <th className="py-3 px-4 font-semibold">{t("table.colCluster")}</th>
                  <th className="py-3 px-4 font-semibold">{t("table.colResearcher")}</th>
                  <th className="py-3 px-4 font-semibold">{t("table.colFunding")}</th>
                  <th className="py-3 px-4 font-semibold text-center">{t("table.colFit")}</th>
                  <th className="py-3 px-4 font-semibold text-right">{t("table.colAction")}</th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {filteredMatches.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-foreground max-w-sm line-clamp-1">
                        {item.projectTitle}
                      </div>
                      <div className="text-muted-foreground flex items-center gap-1.5 text-xs mt-0.5">
                        <Building2 className="h-3 w-3" />
                        <span className="truncate max-w-[200px]">{item.companyName}</span>
                        {item.province && (
                          <span className="text-[11px] bg-secondary px-1.5 py-0.2 rounded text-secondary-foreground">
                            {item.province}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-muted-foreground max-w-[180px] truncate">
                      {item.businessType}
                    </td>

                    <td className="py-3.5 px-4">
                      {item.researcherName ? (
                        <div>
                          <div className="font-medium text-foreground text-xs">
                            {item.researcherName}
                          </div>
                          <div className="text-muted-foreground text-[11px] truncate max-w-[180px]">
                            {item.researcherFaculty}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs italic">
                          {t("table.analyzing")}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {item.fundingCode ? (
                        <Badge variant="outline" className="text-xs font-bold">
                          {item.fundingCode}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {item.fitScore ? (
                        <Badge className="bg-emerald-600 text-white text-xs font-bold">
                          {Math.round(item.fitScore * 100)}%
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          {t("table.pending")}
                        </Badge>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link href={`/${lang}/matching?requirementId=${item.id}`}>
                        <Button size="sm" variant="outline" className="text-xs h-7 gap-1">
                          {t("table.openWorkspace")} <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
