"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  decideTagProposalAction,
  getTagsAction,
} from "@/app/actions/tag-actions";
import {
  getPendingTagProposals,
  type PendingTagProposal,
} from "@/services/tagReviewService";
import type { Requirement, TagCatalogItem } from "@/types/requirement";
import { TagApproveForm, type ApproveTagFormValues } from "./tag-approve-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckSquare } from "lucide-react";

interface TagReviewWorkspaceProps {
  initialRequirements: Requirement[];
  initialCatalog: TagCatalogItem[];
  currentUser: { name: string };
  lang: string;
  canViewReviewQueue?: boolean;
  canManageReviewQueue?: boolean;
  canViewRequirements?: boolean;
}

export function TagReviewWorkspace({
  initialRequirements,
  initialCatalog,
  currentUser,
  lang,
  canViewReviewQueue = true,
  canManageReviewQueue = true,
  canViewRequirements = false,
}: TagReviewWorkspaceProps) {
  const t = useTranslations("tagReview");
  const [requirements, setRequirements] = useState(initialRequirements);
  const [catalog, setCatalog] = useState(initialCatalog);

  const [previousRequirements, setPreviousRequirements] =
    useState(initialRequirements);
  if (previousRequirements !== initialRequirements) {
    setPreviousRequirements(initialRequirements);
    setRequirements(initialRequirements);
  }

  const proposals = useMemo(
    () => getPendingTagProposals(requirements, catalog),
    [requirements, catalog]
  );

  const applyDecisionResult = (updated: Requirement) => {
    setRequirements((prev) =>
      prev.map((r) => (r.id === updated.id ? updated : r))
    );
  };

  const handleApprove = async (
    proposal: PendingTagProposal,
    values: ApproveTagFormValues
  ) => {
    if (!canManageReviewQueue) return;
    const requirementExists = requirements.some(
      (r) => r.id === proposal.requirementId
    );
    if (!requirementExists) return;

    const updated = await decideTagProposalAction(
      proposal.requirementId,
      proposal.tagId,
      {
        decision: "approve",
        kind: values.kind,
        mainCategoryId: values.mainCategoryId,
      }
    );
    applyDecisionResult(updated);
    setCatalog(await getTagsAction());
  };

  const handleMerge = async (
    proposal: PendingTagProposal,
    target: TagCatalogItem
  ) => {
    if (!canManageReviewQueue) return;
    const requirementExists = requirements.some(
      (r) => r.id === proposal.requirementId
    );
    if (!requirementExists) return;

    const updated = await decideTagProposalAction(
      proposal.requirementId,
      proposal.tagId,
      {
        decision: "merge",
        targetTagId: target.id,
      }
    );
    applyDecisionResult(updated);
  };

  const handleReject = async (proposal: PendingTagProposal) => {
    if (!canManageReviewQueue) return;
    const requirement = requirements.find(
      (r) => r.id === proposal.requirementId
    );
    if (!requirement) return;

    const updated = await decideTagProposalAction(
      requirement.id,
      proposal.tagId,
      { decision: "reject" }
    );
    applyDecisionResult(updated);
  };

  const requirementsById = useMemo(
    () => new Map(requirements.map((r) => [r.id, r])),
    [requirements]
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {lang === "th" ? "คิวตรวจรับรองแท็ก (Review Queue)" : "Tag Review Queue"}
            </h1>
            {proposals.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {proposals.length}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {lang === "th"
              ? "ตรวจสอบ อนุมัติแท็กใหม่ หรือรวมเข้ากับแท็ก Taxonomy เดิมในระบบ"
              : "Review and approve new proposed tags or merge with existing taxonomy tags"}
          </p>
        </div>
      </div>

      {canViewReviewQueue && (
        <ReviewQueueTab
          canManage={canManageReviewQueue}
          canViewRequirements={canViewRequirements}
          proposals={proposals}
          requirementsById={requirementsById}
          currentUserName={currentUser.name}
          lang={lang}
          onApprove={handleApprove}
          onMerge={handleMerge}
          onReject={handleReject}
        />
      )}
    </div>
  );
}

function ReviewQueueTab({
  canManage,
  canViewRequirements,
  proposals,
  requirementsById,
  currentUserName,
  lang,
  onApprove,
  onMerge,
  onReject,
}: {
  canManage: boolean;
  canViewRequirements: boolean;
  proposals: PendingTagProposal[];
  requirementsById: Map<string, Requirement>;
  currentUserName: string;
  lang: string;
  onApprove: (
    proposal: PendingTagProposal,
    values: ApproveTagFormValues
  ) => Promise<void>;
  onMerge: (
    proposal: PendingTagProposal,
    target: TagCatalogItem,
    score: number
  ) => Promise<void>;
  onReject: (proposal: PendingTagProposal) => Promise<void>;
}) {
  const t = useTranslations("tagReview.queue");

  if (proposals.length === 0) {
    return (
      <div className="border-border bg-card flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-center">
        <CheckSquare className="h-10 w-10 text-muted-foreground/40 mb-1" />
        <p className="text-muted-foreground text-sm font-medium">{t("empty")}</p>
        <p className="text-muted-foreground/70 text-xs">
          {lang === "th"
            ? "ไม่มีแท็กใหม่ที่รอการตรวจสอบในขณะนี้"
            : "No pending tag proposals requiring review"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {proposals.map((proposal) => (
        <ProposalCard
          canManage={canManage}
          canViewRequirements={canViewRequirements}
          key={`${proposal.requirementId}-${proposal.tagId}`}
          proposal={proposal}
          requirement={requirementsById.get(proposal.requirementId) ?? null}
          currentUserName={currentUserName}
          lang={lang}
          onApprove={onApprove}
          onMerge={onMerge}
          onReject={onReject}
        />
      ))}
    </div>
  );
}

function ProposalCard({
  canManage,
  canViewRequirements,
  proposal,
  requirement,
  currentUserName,
  lang,
  onApprove,
  onMerge,
  onReject,
}: {
  canManage: boolean;
  canViewRequirements: boolean;
  proposal: PendingTagProposal;
  requirement: Requirement | null;
  currentUserName: string;
  lang: string;
  onApprove: (
    proposal: PendingTagProposal,
    values: ApproveTagFormValues
  ) => Promise<void>;
  onMerge: (
    proposal: PendingTagProposal,
    target: TagCatalogItem,
    score: number
  ) => Promise<void>;
  onReject: (proposal: PendingTagProposal) => Promise<void>;
}) {
  const t = useTranslations("tagReview.queue");
  const tMerge = useTranslations("tagReview.mergeForm");
  const [mode, setMode] = useState<"idle" | "approve" | "merge">("idle");
  const [mergeTargetId, setMergeTargetId] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const requirementLabel =
    requirement?.entrepreneurName?.trim() ||
    requirement?.rawText.trim() ||
    t(canViewRequirements ? "viewRequirement" : "sourceRequirement");

  const runDecision = async (action: () => Promise<void>) => {
    if (pending) return;
    setPending(true);
    setError("");
    try {
      await action();
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

  const handleMergeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const match = proposal.nearMatches.find((m) => m.tag.id === mergeTargetId);
    if (!match) return;
    void runDecision(() => onMerge(proposal, match.tag, match.score));
  };

  return (
    <div className="border-border bg-card space-y-3 rounded-xl border p-4 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="font-semibold text-foreground text-sm">{proposal.label}</p>
          {requirement && (
            <p className="text-muted-foreground text-xs">
              {t("fromRequirement")}:{" "}
              {canViewRequirements ? (
                <Link
                  href={`/${lang}/requirement/${requirement.id}`}
                  className="text-primary hover:underline"
                >
                  {requirementLabel}
                </Link>
              ) : (
                <span>{requirementLabel}</span>
              )}
            </p>
          )}
        </div>
      </div>

      <div>
        <p className="text-muted-foreground text-xs font-semibold">
          {t("nearMatches")}
        </p>
        {proposal.nearMatches.length === 0 ? (
          <p className="text-muted-foreground text-xs italic mt-0.5">
            {t("noNearMatches")}
          </p>
        ) : (
          <div className="mt-1 flex flex-wrap gap-1.5">
            {proposal.nearMatches.map((match) => (
              <span
                key={match.tag.id}
                className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs"
              >
                {match.tag.label} ({Math.round(match.score * 100)}%)
              </span>
            ))}
          </div>
        )}
      </div>

      {canManage && mode === "approve" && (
        <TagApproveForm
          reviewerName={currentUserName}
          onCancel={() => setMode("idle")}
          onSubmit={(values) => onApprove(proposal, values)}
        />
      )}

      {canManage && mode === "merge" && (
        <form onSubmit={handleMergeSubmit} className="space-y-2 pt-2">
          <h4 className="text-sm font-semibold">{tMerge("title")}</h4>
          <select
            value={mergeTargetId}
            onChange={(e) => setMergeTargetId(e.target.value)}
            className="border-input h-9 w-full rounded-md border bg-transparent px-2.5 text-sm"
          >
            <option value="">{tMerge("targetPlaceholder")}</option>
            {proposal.nearMatches.map((match) => (
              <option key={match.tag.id} value={match.tag.id}>
                {match.tag.label}
              </option>
            ))}
          </select>
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMode("idle")}
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!mergeTargetId || pending}
            >
              {tMerge("submit")}
            </Button>
          </div>
        </form>
      )}

      {canManage && mode === "idle" && (
        <div className="flex flex-wrap gap-2 pt-1">
          <Button type="button" size="sm" onClick={() => setMode("approve")}>
            {t("approve")}
          </Button>
          {proposal.nearMatches.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMode("merge")}
            >
              {t("merge")}
            </Button>
          )}
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={pending}
            onClick={() => void runDecision(() => onReject(proposal))}
          >
            {t("reject")}
          </Button>
        </div>
      )}
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
