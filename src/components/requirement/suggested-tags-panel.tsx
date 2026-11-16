"use client";

import React, { useId } from "react";
import type { SuggestedTag } from "@/types/requirement";
import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SuggestedTagsPanelProps {
  tags: SuggestedTag[];
  onToggleTag: (tagId: string) => void;
  onEditLabel: (tagId: string, newLabel: string) => void;
  /** Shows the tags without selection or rename controls. */
  readOnly?: boolean;
}

export function SuggestedTagsPanel({
  tags,
  onToggleTag,
  onEditLabel,
  readOnly = false,
}: SuggestedTagsPanelProps) {
  const t = useTranslations("requirement.tags");
  const idPrefix = useId();

  if (tags.length === 0) {
    return (
      <div className="border-border text-muted-foreground rounded-lg border border-dashed py-7 px-4 text-center text-sm">
        {t("noTags")}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const isNew = tag.source === "new";
        const checkboxId = `${idPrefix}-tag-${encodeURIComponent(tag.id)}`;
        const help =
          tag.confidence > 0
            ? t("confidenceHelp", { score: Math.round(tag.confidence * 100) })
            : t("selectionHelp");
        return (
          <Tooltip key={tag.id}>
            <TooltipTrigger
              render={
                <div
                  tabIndex={readOnly ? 0 : undefined}
                  className={cn(
                    "focus-visible:ring-ring flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors outline-none focus-visible:ring-2",
                    tag.accepted
                      ? "border-primary/40 bg-primary/10 text-primary font-medium"
                      : "border-border bg-muted/50 text-muted-foreground",
                    isNew && "border-dashed"
                  )}
                />
              }
            >
              {!readOnly && (
                <Checkbox
                  id={checkboxId}
                  checked={tag.accepted}
                  onCheckedChange={() => onToggleTag(tag.id)}
                  aria-label={tag.label}
                />
              )}
              {readOnly || !isNew || tag.status === "approved" ? (
                readOnly ? (
                  <span className="break-words">{tag.label}</span>
                ) : (
                  <label
                    htmlFor={checkboxId}
                    className="cursor-pointer break-words"
                  >
                    {tag.label}
                  </label>
                )
              ) : (
                <input
                  type="text"
                  value={tag.label}
                  aria-label={t("editLabel", { label: tag.label })}
                  onChange={(e) => onEditLabel(tag.id, e.target.value)}
                  className="focus:ring-primary/40 w-40 min-w-0 rounded border-none bg-transparent px-1 focus:ring-1 focus:outline-none"
                />
              )}
              {isNew && (
                <span className="shrink-0 text-[10px]">{t("newConcept")}</span>
              )}
            </TooltipTrigger>
            <TooltipContent role="tooltip">{help}</TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
