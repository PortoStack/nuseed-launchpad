"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Requirement } from "@/types/requirement";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Building2, MapPin, ChevronRight, Tag, Plus, Sparkles } from "lucide-react";

export function MatchingRequirementPicker({
  initialRequirements: requirements,
  lang,
}: {
  initialRequirements: Requirement[];
  lang: string;
}) {
  const t = useTranslations("matching.picker");
  const [query, setQuery] = useState("");

  const filtered = requirements.filter((item) =>
    [item.rawText, item.title ?? "", item.companyName ?? "", item.province ?? ""]
      .join(" ")
      .toLowerCase()
      .includes(query.trim().toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t("title")}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{t("description")}</p>
        </div>

        <Link href={`/${lang}/requirements/new`}>
          <Button className="gap-2 shadow-sm font-semibold cursor-pointer">
            <Plus className="h-4 w-4" />
            {t.has("newRequirement") ? t("newRequirement") : (lang === "en" ? "New Requirement" : "เพิ่มความต้องการใหม่")}
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="text-muted-foreground absolute left-3 top-3 h-4 w-4" />
        <Input
          aria-label={t("search")}
          placeholder={lang === "en" ? "Search by enterprise name, problem statement, or province..." : "ค้นหาตามชื่อวิสาหกิจ, โจทย์ปัญหา, หรือจังหวัด..."}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-3">
        {filtered.map((item) => (
          <Link
            key={item.id}
            href={`/${lang}/matching?requirementId=${encodeURIComponent(item.id)}`}
            className="hover:border-primary/50 hover:bg-card/80 group border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border p-5 shadow-xs transition-all"
          >
            <div className="space-y-2 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-foreground text-base font-semibold group-hover:text-primary transition-colors">
                  {item.title || item.companyName}
                </span>
                {item.companyName && item.title && item.companyName !== item.title && (
                  <Badge variant="outline" className="text-xs">
                    <Building2 className="mr-1 h-3 w-3" />
                    {item.companyName}
                  </Badge>
                )}
                {item.province && (
                  <Badge variant="secondary" className="text-xs">
                    <MapPin className="mr-1 h-3 w-3" />
                    {item.province}
                  </Badge>
                )}
              </div>

              <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                {item.rawText}
              </p>

              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.tags.slice(0, 5).map((tag) => (
                    <span
                      key={tag.id}
                      className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[11px]"
                    >
                      #{tag.label}
                    </span>
                  ))}
                  {item.tags.length > 5 && (
                    <span className="text-muted-foreground text-[11px] self-center">
                      +{item.tags.length - 5}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2 text-primary text-sm font-medium">
              <span>{t("view")}</span>
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}

        {filtered.length === 0 && (
          <div className="border-border rounded-xl border border-dashed py-16 text-center">
            <Tag className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground text-sm">{t("empty")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
