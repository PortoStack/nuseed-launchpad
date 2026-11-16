"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  createTagAction,
  updateTagAction,
  getTagsAction,
} from "@/app/actions/tag-actions";
import type { TagCatalogItem } from "@/types/requirement";
import { TagEditPanel, type TagEditorValues } from "@/components/tag-review/tag-edit-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, Plus, Tags } from "lucide-react";
import {
  BusinessDeleteButton,
  BusinessTrashButton,
} from "@/components/shared/business-lifecycle-controls";
import {
  getLocalizedTaxonomyTagLabel,
  getMainCategory,
  MAIN_CATEGORIES,
  sortTaxonomyTags,
  type MainCategoryId,
} from "@/lib/taxonomy";

interface TagCatalogWorkspaceProps {
  initialCatalog: TagCatalogItem[];
  lang: string;
  canManageCatalog?: boolean;
}

export function TagCatalogWorkspace({
  initialCatalog,
  lang,
  canManageCatalog = true,
}: TagCatalogWorkspaceProps) {
  const t = useTranslations("tagReview.catalog");
  const tLifecycle = useTranslations("businessLifecycle");
  const tStatuses = useTranslations("tagReview.catalog.statuses");
  const tKinds = useTranslations("tagReview.kinds");
  const locale = lang === "en" ? "en" : "th";

  const [catalog, setCatalog] = useState<TagCatalogItem[]>(initialCatalog);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<MainCategoryId | "">("");
  const [query, setQuery] = useState("");

  const selectedTag = catalog.find((tag) => tag.id === selectedTagId) ?? null;

  const refreshCatalog = async () => {
    const updated = await getTagsAction();
    setCatalog(updated);
    setSelectedTagId(null);
    setIsCreatingTag(false);
  };

  const handleSaveTag = async (values: TagEditorValues) => {
    if (selectedTag) {
      await updateTagAction(selectedTag.id, values);
    } else {
      await createTagAction(values);
    }
    await refreshCatalog();
  };

  const getDisplayLabel = (tag: TagCatalogItem) =>
    getLocalizedTaxonomyTagLabel(tag.id, locale) ?? tag.label;

  const getDisplayCategory = (tag: TagCatalogItem) =>
    (tag.mainCategoryId
      ? getMainCategory(tag.mainCategoryId)?.label[locale]
      : undefined) ||
    tag.mainCategoryLabel ||
    tag.parentCategory ||
    "—";

  const filteredCatalog = sortTaxonomyTags(
    catalog.filter((tag) => {
      if (categoryFilter && tag.mainCategoryId !== categoryFilter) return false;
      if (
        query &&
        ![
          tag.label,
          getDisplayLabel(tag),
          tag.mainCategoryLabel,
          tag.parentCategory,
          getDisplayCategory(tag),
        ]
          .filter(Boolean)
          .some((value) =>
            value!.toLocaleLowerCase().includes(query.toLocaleLowerCase())
          )
      ) {
        return false;
      }
      return true;
    })
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Tags className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {lang === "th" ? "คลังแท็ก (Tag Catalog)" : "Tag Catalog"}
            </h1>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {lang === "th"
              ? "จัดการโครงสร้าง Taxonomy และความสัมพันธ์ของแท็กระดับอุทยานวิทยาศาสตร์"
              : "Manage taxonomy structure, categories, and tags for matching"}
          </p>
        </div>

        {canManageCatalog && (
          <Button
            type="button"
            onClick={() => {
              setSelectedTagId(null);
              setIsCreatingTag(true);
            }}
            className="shrink-0 gap-1.5"
          >
            <Plus className="h-4 w-4" />
            {t("createTag")}
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative block w-full sm:max-w-xs">
            <span className="sr-only">{t("filters.searchPlaceholder")}</span>
            <Search
              aria-hidden="true"
              className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("filters.searchPlaceholder")}
              className="h-9 pl-8 text-xs"
              data-testid="tag-catalog-search"
            />
          </div>

          <div className="block w-full sm:max-w-xs">
            <span className="sr-only">{t("filters.mainCategory")}</span>
            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value as MainCategoryId | "")
              }
              aria-label={t("filters.mainCategory")}
              className="border-input h-9 w-full rounded-md border bg-transparent px-2.5 text-xs text-foreground"
              data-testid="tag-catalog-main-category-filter"
            >
              <option value="" className="bg-background text-foreground">{t("filters.allCategories")}</option>
              {MAIN_CATEGORIES.map((category) => (
                <option key={category.id} value={category.id} className="bg-background text-foreground">
                  {category.label[lang === "en" ? "en" : "th"]}
                </option>
              ))}
            </select>
          </div>

          {(categoryFilter || query) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setCategoryFilter("");
                setQuery("");
              }}
              className="h-9 text-xs"
            >
              {t("filters.clear")}
            </Button>
          )}
        </div>

        {canManageCatalog && (
          <BusinessTrashButton kind="tag" onChanged={refreshCatalog} />
        )}
      </div>

      {/* Tags Table */}
      <div className="border-border bg-card overflow-x-auto rounded-lg border shadow-xs">
        <table className="w-full min-w-[820px] text-left text-xs">
          <thead className="bg-muted/40 text-muted-foreground border-b border-border">
            <tr>
              <th className="px-3.5 py-3 font-semibold">{t("columns.label")}</th>
              <th className="px-3.5 py-3 font-semibold">{t("columns.kind")}</th>
              <th className="px-3.5 py-3 font-semibold">{t("columns.mainCategory")}</th>
              <th className="px-3.5 py-3 font-semibold">{t("columns.status")}</th>
              <th className="px-3.5 py-3 font-semibold">{t("columns.reviewer")}</th>
              <th className="px-3.5 py-3 font-semibold">{t("columns.updatedAt")}</th>
              {canManageCatalog && (
                <th className="px-3.5 py-3 font-semibold">{tLifecycle("actions")}</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredCatalog.map((tag) => (
              <tr
                key={tag.id}
                onClick={canManageCatalog ? () => setSelectedTagId(tag.id) : undefined}
                tabIndex={canManageCatalog ? 0 : undefined}
                onKeyDown={(event) => {
                  if (canManageCatalog && (event.key === "Enter" || event.key === " ")) {
                    event.preventDefault();
                    setSelectedTagId(tag.id);
                  }
                }}
                className={cn(
                  "transition-colors outline-none",
                  canManageCatalog &&
                    "hover:bg-muted/40 focus-visible:bg-muted/40 cursor-pointer"
                )}
              >
                <td className="px-3.5 py-2.5 font-medium text-foreground">
                  {getDisplayLabel(tag)}
                  {tag.isFlagship && (
                    <span className="text-muted-foreground ml-1.5 font-normal text-[11px]">
                      ({t("flagship")})
                    </span>
                  )}
                </td>
                <td className="text-muted-foreground px-3.5 py-2.5">
                  {tKinds(tag.kind)}
                </td>
                <td className="text-muted-foreground px-3.5 py-2.5">
                  {getDisplayCategory(tag)}
                </td>
                <td className="px-3.5 py-2.5">
                  <Badge
                    variant="outline"
                    className={cn(
                      "px-1.5 py-0 text-[10px]",
                      tag.status === "deprecated"
                        ? "text-muted-foreground"
                        : "border-status-success-border bg-status-success-surface text-status-success-foreground"
                    )}
                  >
                    {tStatuses(tag.status ?? "active")}
                  </Badge>
                </td>
                <td className="text-muted-foreground px-3.5 py-2.5">
                  {tag.reviewerName || "—"}
                </td>
                <td className="text-muted-foreground px-3.5 py-2.5">
                  {tag.updatedAt
                    ? new Date(tag.updatedAt).toLocaleDateString(
                        lang === "en" ? "en-GB" : "th-TH",
                        { day: "2-digit", month: "short", year: "numeric" }
                      )
                    : "—"}
                </td>
                {canManageCatalog && (
                  <td
                    className="px-3.5 py-2.5"
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                  >
                    <BusinessDeleteButton
                      kind="tag"
                      id={tag.id}
                      label={getDisplayLabel(tag)}
                      onChanged={refreshCatalog}
                    />
                  </td>
                )}
              </tr>
            ))}
            {filteredCatalog.length === 0 && (
              <tr>
                <td
                  colSpan={canManageCatalog ? 7 : 6}
                  className="text-muted-foreground px-3.5 py-12 text-center"
                >
                  {catalog.length === 0 ? t("empty") : t("noResults")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit / Create Tag Panel */}
      {canManageCatalog && (selectedTag || isCreatingTag) && (
        <TagEditPanel
          key={selectedTag?.id ?? "new-tag"}
          tag={selectedTag}
          onClose={() => {
            setSelectedTagId(null);
            setIsCreatingTag(false);
          }}
          onSave={handleSaveTag}
        />
      )}
    </div>
  );
}
