"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List,
  Folder,
  Users,
  Wallet,
  Calendar,
  User,
  Plus,
  Target,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  DashboardData,
  ProjectItem,
  ResearcherItem,
  FundingItem,
} from "@/services/dashboardService";

interface DashboardWorkspaceProps {
  data: DashboardData;
  lang: string;
}

type ScopeFilter = "all" | "projects" | "researchers" | "fundings";
type SortOption = "latest" | "budget_desc" | "name_asc";
type ViewMode = "grid" | "list";

export function DashboardWorkspace({ data, lang }: DashboardWorkspaceProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [scope, setScope] = useState<ScopeFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("latest");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const {
    projects = [],
    researchers = [],
    fundings = [],
    topTags = [],
  } = data;

  // Filter Projects
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.companyName.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (selectedTag) {
      result = result.filter((p) => p.tags.includes(selectedTag));
    }

    if (sortOption === "budget_desc") {
      result.sort((a, b) => b.totalBudget - a.totalBudget);
    } else if (sortOption === "name_asc") {
      result.sort((a, b) => a.title.localeCompare(b.title, "th"));
    }

    return result;
  }, [projects, searchQuery, selectedTag, sortOption]);

  // Filter Researchers
  const filteredResearchers = useMemo(() => {
    let result = [...researchers];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.faculty.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (selectedTag) {
      result = result.filter((r) => r.tags.includes(selectedTag));
    }

    if (sortOption === "name_asc") {
      result.sort((a, b) => a.name.localeCompare(b.name, "th"));
    }

    return result;
  }, [researchers, searchQuery, selectedTag, sortOption]);

  // Filter Fundings
  const filteredFundings = useMemo(() => {
    let result = [...fundings];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (f) =>
          f.title.toLowerCase().includes(q) ||
          f.code.toLowerCase().includes(q) ||
          f.source.toLowerCase().includes(q) ||
          f.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (selectedTag) {
      result = result.filter((f) => f.tags.includes(selectedTag));
    }

    if (sortOption === "budget_desc") {
      result.sort((a, b) => b.maxBudget - a.maxBudget);
    } else if (sortOption === "name_asc") {
      result.sort((a, b) => a.title.localeCompare(b.title, "th"));
    }

    return result;
  }, [fundings, searchQuery, selectedTag, sortOption]);

  const showProjects = scope === "all" || scope === "projects";
  const showResearchers = scope === "all" || scope === "researchers";
  const showFundings = scope === "all" || scope === "fundings";

  return (
    <div className="space-y-6 pb-20">
      {/* Page Header & Actions */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          ค้นหาโครงการและนักวิจัย
        </h1>

        <div className="flex items-center gap-2">
          <Link href={`/${lang}/matching`}>
            <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer">
              <Target className="h-4 w-4 text-primary" />
              <span>ค้นหาการจับคู่</span>
            </Button>
          </Link>
          <Link href={`/${lang}/requirements/new`}>
            <Button size="sm" className="gap-1.5 cursor-pointer shadow-xs">
              <Plus className="h-4 w-4" />
              <span>บันทึกความต้องการ</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 3. Search & Filter Bar (Matching Screenshot) */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Scope Dropdown */}
        <div className="relative">
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as ScopeFilter)}
            className="h-10 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-2xs focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="all">ขอบเขต: ทั้งหมด</option>
            <option value="projects">ขอบเขต: โครงการ</option>
            <option value="researchers">ขอบเขต: นักวิจัย</option>
            <option value="fundings">ขอบเขต: แหล่งทุน</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground shadow-2xs focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="relative">
          <select
            value={selectedTag || ""}
            onChange={(e) => setSelectedTag(e.target.value || null)}
            className="h-10 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-2xs focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="">Filter: แท็กทั้งหมด</option>
            {topTags.map((tag) => (
              <option key={tag.name} value={tag.name}>
                {tag.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="h-10 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-2xs focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="latest">เรียงตาม: อัปเดตล่าสุด</option>
            <option value="budget_desc">เรียงตาม: งบประมาณสูง-ต่ำ</option>
            <option value="name_asc">เรียงตาม: ชื่อ (ก-ฮ)</option>
          </select>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center rounded-lg border border-border bg-card p-1 shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={cn(
              "rounded p-1.5 text-muted-foreground transition-colors cursor-pointer",
              viewMode === "grid" && "bg-muted text-foreground"
            )}
            title="Grid View"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={cn(
              "rounded p-1.5 text-muted-foreground transition-colors cursor-pointer",
              viewMode === "list" && "bg-muted text-foreground"
            )}
            title="List View"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 4. Active Tag Filter Chip (if selected) */}
      {selectedTag && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">กรองด้วยแท็ก:</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary">
            {selectedTag}
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className="ml-1 hover:text-foreground cursor-pointer"
            >
              ×
            </button>
          </span>
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION 1: โครงการ (Projects Grid)                          */}
      {/* ============================================================ */}
      {showProjects && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Folder className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-base font-bold text-foreground">
                โครงการ ({filteredProjects.length})
              </h2>
            </div>
            {scope !== "projects" && (
              <button
                type="button"
                onClick={() => setScope("projects")}
                className="text-xs font-medium text-primary hover:underline cursor-pointer"
              >
                ดูทั้งหมด ({projects.length}) &gt;
              </button>
            )}
          </div>

          {filteredProjects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
              ไม่พบโครงการที่ตรงกับเงื่อนไขการค้นหา
            </div>
          ) : (
            <div
              className={cn(
                "gap-4",
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  : "flex flex-col"
              )}
            >
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} lang={lang} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ============================================================ */}
      {/* SECTION 2: นักวิจัย (Researchers Grid)                       */}
      {/* ============================================================ */}
      {showResearchers && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-base font-bold text-foreground">
                นักวิจัย ({filteredResearchers.length})
              </h2>
            </div>
            {scope !== "researchers" && (
              <button
                type="button"
                onClick={() => setScope("researchers")}
                className="text-xs font-medium text-primary hover:underline cursor-pointer"
              >
                ดูทั้งหมด ({researchers.length}) &gt;
              </button>
            )}
          </div>

          {filteredResearchers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
              ไม่พบนักวิจัยที่ตรงกับเงื่อนไขการค้นหา
            </div>
          ) : (
            <div
              className={cn(
                "gap-4",
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  : "flex flex-col"
              )}
            >
              {filteredResearchers.map((researcher) => (
                <ResearcherCard
                  key={researcher.id}
                  researcher={researcher}
                  lang={lang}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ============================================================ */}
      {/* SECTION 3: แหล่งทุน (Funding Programs Grid) - เพิ่มตามสั่ง     */}
      {/* ============================================================ */}
      {showFundings && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-base font-bold text-foreground">
                แหล่งทุน ({filteredFundings.length})
              </h2>
            </div>
            {scope !== "fundings" && (
              <button
                type="button"
                onClick={() => setScope("fundings")}
                className="text-xs font-medium text-primary hover:underline cursor-pointer"
              >
                ดูทั้งหมด ({fundings.length}) &gt;
              </button>
            )}
          </div>

          {filteredFundings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
              ไม่พบแหล่งทุนที่ตรงกับเงื่อนไขการค้นหา
            </div>
          ) : (
            <div
              className={cn(
                "gap-4",
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  : "flex flex-col"
              )}
            >
              {filteredFundings.map((funding) => (
                <FundingCard key={funding.id} funding={funding} lang={lang} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

// ============================================================
// COMPONENT: ProjectCard (100% Original UI from Screenshot)
// ============================================================
function ProjectCard({ project, lang }: { project: ProjectItem; lang: string }) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs transition-shadow hover:shadow-sm">
      <div className="space-y-3">
        {/* Top Header: Code & Status */}
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-xs font-medium text-muted-foreground">
            {project.code}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {project.statusLabel}
          </span>
        </div>

        {/* Title */}
        <Link
          href={`/${lang}/matching?requirementId=${project.id}`}
          className="group block"
        >
          <h3 className="line-clamp-2 text-sm font-bold text-foreground group-hover:text-primary transition-colors">
            {project.title}
          </h3>
        </Link>

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-muted/70 px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="rounded-md bg-muted/70 px-1.5 py-0.5 text-[11px] text-muted-foreground">
                +{project.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Middle Meta: Researchers count & Date range */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <div className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
              <User className="h-3 w-3" />
            </span>
            <span>นักวิจัย {project.researchersCount} คน</span>
          </div>

          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground/80" />
            <span>{project.dateRange}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">ความคืบหน้า</span>
            <span className="font-semibold text-foreground">
              {project.progressPercent}%
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${Math.max(project.progressPercent, 0)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer: Budgets */}
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs">
        <div>
          <span className="text-muted-foreground block text-[10px]">งบรวม</span>
          <span className="font-bold text-foreground">
            {project.totalBudget.toLocaleString()} บาท
          </span>
        </div>
        <div className="text-right">
          <span className="text-muted-foreground block text-[10px]">คงเหลือ</span>
          <span className="font-bold text-foreground">
            {project.remainingBudget.toLocaleString()} บาท
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPONENT: ResearcherCard (100% Original UI from Screenshot)
// ============================================================
function ResearcherCard({
  researcher,
  lang,
}: {
  researcher: ResearcherItem;
  lang: string;
}) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs transition-shadow hover:shadow-sm">
      <div className="space-y-3">
        {/* Header: Initial Avatar & Name */}
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-2xs",
              researcher.avatarColorBg
            )}
          >
            {researcher.avatarInitial}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-foreground">
              {researcher.name}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {researcher.role} · {researcher.faculty}
            </p>
          </div>
        </div>

        {/* Tags */}
        {researcher.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {researcher.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-muted/70 px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
            {researcher.tags.length > 3 && (
              <span className="rounded-md bg-muted/70 px-1.5 py-0.5 text-[11px] text-muted-foreground">
                +{researcher.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer: Related Projects Count */}
      <div className="mt-4 border-t border-border pt-2.5 text-xs text-muted-foreground">
        <span>{researcher.relatedProjectsCount} โครงการที่เกี่ยวข้อง</span>
      </div>
    </div>
  );
}

// ============================================================
// COMPONENT: FundingCard (Matching Layout for Funding Programs)
// ============================================================
function FundingCard({
  funding,
  lang,
}: {
  funding: FundingItem;
  lang: string;
}) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs transition-shadow hover:shadow-sm">
      <div className="space-y-3">
        {/* Top Header: Code & Status */}
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-xs font-semibold text-primary">
            {funding.source} · {funding.code}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {funding.statusLabel}
          </span>
        </div>

        {/* Title */}
        <h3 className="line-clamp-2 text-sm font-bold text-foreground">
          {funding.title}
        </h3>

        {/* Tags */}
        {funding.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {funding.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-muted/70 px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
            {funding.tags.length > 3 && (
              <span className="rounded-md bg-muted/70 px-1.5 py-0.5 text-[11px] text-muted-foreground">
                +{funding.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Middle Meta: Budget & Support Ratio */}
        <div className="space-y-1 text-xs pt-1">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">วงเงินสนับสนุนสูงสุด:</span>
            <span className="font-bold text-foreground">
              {funding.maxBudget.toLocaleString()} บาท
            </span>
          </div>
          {funding.supportRatio && (
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>สัดส่วน:</span>
              <span>{funding.supportRatio}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Timeline */}
      <div className="mt-4 flex items-center gap-1 border-t border-border pt-2.5 text-xs text-muted-foreground">
        <Calendar className="h-3.5 w-3.5 text-muted-foreground/80" />
        <span>{funding.timeline}</span>
      </div>
    </div>
  );
}
