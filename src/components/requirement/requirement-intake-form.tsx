"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SuggestedTagsPanel } from "./suggested-tags-panel";
import type {
  NeedType,
  ProblemStructure,
  SuggestedTag,
} from "@/types/requirement";
import { NEED_TYPES } from "@/types/requirement";
import {
  createRequirementWithAutoMatchAction,
  suggestTagsAction,
} from "@/app/actions/requirement-actions";

interface RequirementIntakeFormProps {
  lang: string;
}

export function RequirementIntakeForm({ lang }: RequirementIntakeFormProps) {
  const router = useRouter();
  const t = useTranslations("requirement");
  const tNeedTypes = useTranslations("requirement.needTypes");

  const [rawText, setRawText] = useState("");
  const [entrepreneurName, setEntrepreneurName] = useState("");
  const [sourceChannel, setSourceChannel] = useState("LINE");
  const [selectedNeedTypes, setSelectedNeedTypes] = useState<NeedType[]>([]);
  const [tags, setTags] = useState<SuggestedTag[]>([]);
  const [structure, setStructure] = useState<ProblemStructure>({
    problem: "",
    object: "",
    context: "",
    outcome: "",
    constraint: "",
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit = rawText.trim().length > 0 && selectedNeedTypes.length >= 1;

  const handleAnalyze = async () => {
    if (!rawText.trim()) return;
    setIsAnalyzing(true);
    try {
      const suggested = await suggestTagsAction(rawText);
      setTags(suggested);
    } catch (error) {
      console.error("Error analyzing tags:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleToggleNeedType = (type: NeedType) => {
    setSelectedNeedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleToggleTag = (tagId: string) => {
    setTags((prev) =>
      prev.map((t) => (t.id === tagId ? { ...t, accepted: !t.accepted } : t))
    );
  };

  const handleEditTagLabel = (tagId: string, newLabel: string) => {
    setTags((prev) =>
      prev.map((t) => (t.id === tagId ? { ...t, label: newLabel } : t))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || isSubmitting || isAnalyzing) return;

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const acceptedTagLabels = tags
        .filter((t) => t.accepted)
        .map((t) => t.label.trim())
        .filter(Boolean);

      const result = await createRequirementWithAutoMatchAction({
        projectTitle: entrepreneurName.trim() || "บันทึกความต้องการใหม่",
        companyName: entrepreneurName.trim() || "วิสาหกิจ/ผู้ประกอบการทั่วไป",
        entrepreneurName: entrepreneurName.trim() || undefined,
        sourceChannel,
        needTypes: selectedNeedTypes,
        structure,
        rawText: rawText.trim(),
        tags: acceptedTagLabels,
      });

      if (result.success && result.requirementId) {
        router.push(`/${lang}/matching?requirementId=${result.requirementId}`);
        router.refresh();
      } else {
        setErrorMessage(result.error || t("create.saveError"));
        setIsSubmitting(false);
      }
    } catch (error: unknown) {
      console.error("Submit error:", error);
      setErrorMessage(t("create.saveError"));
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto space-y-6 pb-12">
      <fieldset disabled={isSubmitting} className="min-w-0 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href={`/${lang}/matching`}
              className="text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-1.5 text-sm transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("create.backToList")}
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">
              {t("create.title")}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t("create.description")}
            </p>
          </div>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="bg-destructive/10 border-destructive/20 text-destructive rounded-md border p-3 text-sm"
          >
            {errorMessage}
          </div>
        )}

        {/* 1. Raw Narrative + Analyze Section */}
        <div className="border-border bg-card space-y-4 rounded-xl border p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <Label htmlFor="rawText" className="text-base font-semibold">
              {t("create.rawTextLabel")}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAnalyze}
              disabled={!rawText.trim() || isAnalyzing || isSubmitting}
              className="text-primary border-primary/30 hover:bg-primary/5 h-8 gap-1.5 cursor-pointer"
            >
              {isAnalyzing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="text-primary h-3.5 w-3.5" />
              )}
              {isAnalyzing ? t("create.analyzing") : t("create.analyzeButton")}
            </Button>
          </div>

          <Textarea
            id="rawText"
            rows={4}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={t("create.rawTextPlaceholder")}
            className="resize-y"
          />

          {/* Suggested Tags Panel */}
          <div className="border-border space-y-2 border-t pt-2">
            <div>
              <h4 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                {t("create.tagsSectionTitle")}
              </h4>
              <p className="text-muted-foreground text-xs">
                {t("create.tagsSectionDesc")}
              </p>
            </div>
            <SuggestedTagsPanel
              tags={tags}
              onToggleTag={handleToggleTag}
              onEditLabel={handleEditTagLabel}
            />
          </div>
        </div>

        {/* 2. Origin Details & Need Types */}
        <div className="border-border bg-card space-y-4 rounded-xl border p-5 shadow-xs">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="entrepreneurName">
                {t("create.entrepreneurLabel")}
              </Label>
              <Input
                id="entrepreneurName"
                value={entrepreneurName}
                onChange={(e) => setEntrepreneurName(e.target.value)}
                placeholder={t("create.entrepreneurPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sourceChannel">
                {t("create.sourceChannelLabel")}
              </Label>
              <select
                id="sourceChannel"
                value={sourceChannel}
                onChange={(e) => setSourceChannel(e.target.value)}
                className="border-border bg-card focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs transition-colors focus-visible:ring-1 focus-visible:outline-none"
              >
                <option value="LINE">LINE</option>
                <option value="โทรศัพท์">
                  {t("create.sourceChannels.phone")}
                </option>
                <option value="สัมมนา">
                  {t("create.sourceChannels.seminar")}
                </option>
                <option value="แบบฟอร์ม">
                  {t("create.sourceChannels.form")}
                </option>
                <option value="สัมภาษณ์">
                  {t("create.sourceChannels.interview")}
                </option>
              </select>
            </div>
          </div>

          <div className="border-border space-y-2 border-t pt-2">
            <Label className="text-sm font-semibold">
              {t("create.needTypeLabel")}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {NEED_TYPES.map((type) => {
                const selected = selectedNeedTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleToggleNeedType(type)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                      selected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {tNeedTypes(type)}
                  </button>
                );
              })}
            </div>
            {selectedNeedTypes.length === 0 && (
              <p className="text-[#c2410c] dark:text-amber-500 text-xs mt-1">
                {t("create.needTypeRequired")}
              </p>
            )}
          </div>
        </div>

        {/* 3. Structured Problem Dimensions (Optional) */}
        <div className="border-border bg-card space-y-4 rounded-xl border p-5 shadow-xs">
          <div>
            <h3 className="text-base font-semibold">
              {t("create.problemStructureTitle")}
            </h3>
            <p className="text-muted-foreground text-xs">
              {t("create.problemStructureDesc")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="struct-problem" className="text-xs">
                {t("create.fields.problem")}
              </Label>
              <Input
                id="struct-problem"
                value={structure.problem || ""}
                onChange={(e) =>
                  setStructure({ ...structure, problem: e.target.value })
                }
                placeholder={t("create.fields.problemPlaceholder")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="struct-object" className="text-xs">
                {t("create.fields.object")}
              </Label>
              <Input
                id="struct-object"
                value={structure.object || ""}
                onChange={(e) =>
                  setStructure({ ...structure, object: e.target.value })
                }
                placeholder={t("create.fields.objectPlaceholder")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="struct-context" className="text-xs">
                {t("create.fields.context")}
              </Label>
              <Input
                id="struct-context"
                value={structure.context || ""}
                onChange={(e) =>
                  setStructure({ ...structure, context: e.target.value })
                }
                placeholder={t("create.fields.contextPlaceholder")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="struct-outcome" className="text-xs">
                {t("create.fields.outcome")}
              </Label>
              <Input
                id="struct-outcome"
                value={structure.outcome || ""}
                onChange={(e) =>
                  setStructure({ ...structure, outcome: e.target.value })
                }
                placeholder={t("create.fields.outcomePlaceholder")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="struct-constraint" className="text-xs">
                {t("create.fields.constraint")}
              </Label>
              <Input
                id="struct-constraint"
                value={structure.constraint || ""}
                onChange={(e) =>
                  setStructure({ ...structure, constraint: e.target.value })
                }
                placeholder={t("create.fields.constraintPlaceholder")}
              />
            </div>
          </div>
        </div>

        {/* 4. Form Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/${lang}/matching`)}
            disabled={isSubmitting}
            className="cursor-pointer"
          >
            {t("create.cancel")}
          </Button>
          <Button
            type="submit"
            disabled={!canSubmit || isSubmitting || isAnalyzing}
            className="min-w-[120px] cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("create.saving")}
              </>
            ) : (
              t("create.submit")
            )}
          </Button>
        </div>
      </fieldset>
    </form>
  );
}
