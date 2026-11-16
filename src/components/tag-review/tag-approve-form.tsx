"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MAIN_CATEGORIES, type MainCategoryId } from "@/lib/taxonomy";
import type { TagCatalogItem } from "@/types/requirement";

export interface ApproveTagFormValues {
  kind: TagCatalogItem["kind"];
  mainCategoryId: MainCategoryId;
}

interface TagApproveFormProps {
  defaultMainCategoryId?: MainCategoryId;
  reviewerName: string;
  onCancel: () => void;
  onSubmit: (values: ApproveTagFormValues) => void | Promise<void>;
}

export function TagApproveForm({
  defaultMainCategoryId = "main-technology",
  reviewerName,
  onCancel,
  onSubmit,
}: TagApproveFormProps) {
  const t = useTranslations("tagReview.approveForm");
  const locale = useLocale();
  const tQueue = useTranslations("tagReview.queue");
  const tKinds = useTranslations("tagReview.kinds");

  const [mainCategoryId, setMainCategoryId] = useState<MainCategoryId>(
    defaultMainCategoryId
  );
  const [kind, setKind] = useState<TagCatalogItem["kind"]>("business");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    try {
      await onSubmit({ kind, mainCategoryId });
    } catch (failure) {
      setError(
        failure && typeof failure === "object" && "message" in failure
          ? String(failure.message)
          : t("saveError")
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pt-2">
      <h4 className="text-sm font-semibold">{t("title")}</h4>

      <div className="space-y-1.5">
        <Label htmlFor="tag-kind">{t("kindLabel")}</Label>
        <select
          id="tag-kind"
          disabled={pending}
          value={kind}
          onChange={(e) => setKind(e.target.value as TagCatalogItem["kind"])}
          className="border-input h-9 w-full rounded-md border bg-transparent px-2.5 text-sm"
        >
          <option value="business">{tKinds("business")}</option>
          <option value="technical">{tKinds("technical")}</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tag-main-category">{t("mainCategoryLabel")}</Label>
        <select
          id="tag-main-category"
          disabled={pending}
          value={mainCategoryId}
          onChange={(e) => setMainCategoryId(e.target.value as MainCategoryId)}
          className="border-input h-9 w-full rounded-md border bg-transparent px-2.5 text-sm"
        >
          {MAIN_CATEGORIES.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label[locale === "en" ? "en" : "th"]}
            </option>
          ))}
        </select>
      </div>

      <p className="text-muted-foreground text-xs">
        {t("reviewerLabel")}: {reviewerName}
      </p>

      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={onCancel}
        >
          {tQueue("cancel")}
        </Button>
        <Button type="submit" size="sm" disabled={pending}>
          {t("submit")}
        </Button>
      </div>
    </form>
  );
}
