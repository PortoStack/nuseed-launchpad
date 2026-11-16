"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import type { TagCatalogItem, TagCatalogStatus } from "@/types/requirement";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, X } from "lucide-react";
import { MAIN_CATEGORIES, type MainCategoryId } from "@/lib/taxonomy";
import { IconTooltip } from "@/components/shared/IconTooltip";
import type { ApiError } from "@/types/common";

export interface TagEditorValues {
  label: string;
  kind: TagCatalogItem["kind"];
  mainCategoryId: MainCategoryId;
  status: TagCatalogStatus;
}

interface TagEditPanelProps {
  tag: TagCatalogItem | null;
  onClose: () => void;
  onSave: (values: TagEditorValues) => Promise<void>;
}

// The catalog endpoints answer 403 to anyone but staff and admin, and 422 on
// `label` when it repeats another tag's label or synonym (§4.3).
function saveErrorKey(
  error: unknown
): "forbidden" | "labelTaken" | "saveError" {
  const apiError = error as Partial<ApiError> | undefined;
  if (apiError?.code === "FORBIDDEN" || apiError?.code === "403")
    return "forbidden";
  if (apiError?.fieldErrors?.label?.length) return "labelTaken";
  return "saveError";
}

export function TagEditPanel({ tag, onClose, onSave }: TagEditPanelProps) {
  const t = useTranslations("tagReview.edit");
  const tQueue = useTranslations("tagReview.queue");
  const locale = useLocale();
  const tStatuses = useTranslations("tagReview.catalog.statuses");
  const tKinds = useTranslations("tagReview.kinds");

  const [label, setLabel] = useState(tag?.label ?? "");
  const [kind, setKind] = useState<TagCatalogItem["kind"]>(
    tag?.kind ?? "business"
  );
  const [mainCategoryId, setMainCategoryId] = useState<MainCategoryId>(
    tag?.mainCategoryId ?? "main-technology"
  );
  const [status, setStatus] = useState<TagCatalogStatus>(
    tag?.status ?? "active"
  );
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSave = async () => {
    const cleanLabel = label.trim();
    if (!cleanLabel) return;

    setIsSaving(true);
    setErrorMessage(null);
    try {
      await onSave({ label: cleanLabel, kind, mainCategoryId, status });
    } catch (error: unknown) {
      setErrorMessage(t(saveErrorKey(error)));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="border-border bg-card fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col overflow-y-auto border-l shadow-lg">
      <div className="border-border flex items-center justify-between border-b p-4">
        <h2 className="text-base font-semibold">
          {tag ? t("title") : t("createTitle")}
        </h2>
        <IconTooltip label={t("close")}>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("close")}
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">{t("close")}</span>
          </Button>
        </IconTooltip>
      </div>

      <div className="flex-1 space-y-4 p-4">
        {errorMessage && (
          <div className="bg-destructive/10 border-destructive/20 text-destructive rounded-md border p-2 text-sm">
            {errorMessage}
          </div>
        )}

        {!tag && (
          <div className="space-y-1.5">
            <Label htmlFor="tag-edit-label">{t("labelLabel")}</Label>
            <Input
              id="tag-edit-label"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              maxLength={120}
              required
            />
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="tag-edit-kind">{t("kindLabel")}</Label>
          <select
            id="tag-edit-kind"
            value={kind}
            onChange={(event) =>
              setKind(event.target.value as TagCatalogItem["kind"])
            }
            className="border-input h-9 w-full rounded-md border bg-transparent px-2.5 text-sm"
          >
            <option value="business">{tKinds("business")}</option>
            <option value="technical">{tKinds("technical")}</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tag-edit-main-category">
            {t("mainCategoryLabel")}
          </Label>
          <select
            id="tag-edit-main-category"
            data-testid="tag-edit-main-category"
            value={mainCategoryId}
            onChange={(event) =>
              setMainCategoryId(event.target.value as MainCategoryId)
            }
            className="border-input h-9 w-full rounded-md border bg-transparent px-2.5 text-sm"
          >
            {MAIN_CATEGORIES.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label[locale === "en" ? "en" : "th"]}
              </option>
            ))}
          </select>
        </div>

        {tag && (
          <div className="space-y-1.5">
            <Label htmlFor="tag-edit-status">{t("statusLabel")}</Label>
            <select
              id="tag-edit-status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as TagCatalogStatus)
              }
              className="border-input h-9 w-full rounded-md border bg-transparent px-2.5 text-sm"
            >
              <option value="active">{tStatuses("active")}</option>
              <option value="deprecated">{tStatuses("deprecated")}</option>
            </select>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          {!tag && (
            <Button type="button" variant="outline" onClick={onClose}>
              {tQueue("cancel")}
            </Button>
          )}
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !label.trim()}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : tag ? (
              t("save")
            ) : (
              t("create")
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
