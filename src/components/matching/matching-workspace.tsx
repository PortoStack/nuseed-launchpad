"use client";

import React, { createContext, useContext, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Requirement } from "@/types/requirement";
import type {
  RankedResearcher,
  RankedFunding,
  RankedPersonnel,
  TagMatchResult,
  RankedFundingResearcher,
  RankedFundingResearcherEntrepreneur,
} from "@/services/matchingService";
import { Users, Wallet, Inbox, Tag, Handshake, UserCheck, ArrowLeft, Building2, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIMatchingInsightDialog } from "./ai-matching-insight-dialog";
import { AIPreMatchedSummary } from "./ai-pre-matched-summary";
import type { PreMatchedResultItem } from "@/services/mockAiService";

type TabKey = "researchers" | "coaches" | "funding";

interface MatchingWorkspaceProps {
  requirement: Requirement;
  rankedResearchers: RankedResearcher[];
  rankedFundings: RankedFunding[];
  rankedPersonnel: RankedPersonnel[];
  rankedPairs?: RankedFundingResearcher[];
  rankedTriples?: RankedFundingResearcherEntrepreneur[];
  lang: string;
  canCreateDeal?: boolean;
  preMatches?: PreMatchedResultItem[];
}

const CanCreateDealContext = createContext(false);

export function MatchingWorkspace({
  requirement,
  rankedResearchers,
  rankedFundings,
  rankedPersonnel,
  rankedPairs = [],
  rankedTriples = [],
  lang,
  canCreateDeal = false,
  preMatches = [],
}: MatchingWorkspaceProps) {
  const t = useTranslations("matching");
  const tNeedTypes = useTranslations("requirement.needTypes");
  const [activeTab, setActiveTab] = useState<TabKey>("researchers");
  const [relation, setRelation] = useState("entrepreneur-researcher");

  const acceptedTags = requirement.tags.filter((tag) => tag.accepted);

  return (
    <CanCreateDealContext.Provider value={canCreateDeal}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("title")}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{t("description")}</p>
        </div>

        {/* Navigation & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/${lang}/matching`}
            className="text-primary inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("changeRequirement")}
          </Link>

          <Link href={`/${lang}/requirements/new`}>
            <Button variant="outline" size="sm" className="gap-1.5 font-medium cursor-pointer">
              <Plus className="h-4 w-4" />
              {lang === "en" ? "New Requirement" : "เพิ่มความต้องการใหม่"}
            </Button>
          </Link>
        </div>

        {/* Relation selector */}
        <div className="space-y-2">
          <label htmlFor="matching-relation" className="text-foreground text-sm font-medium">
            {t("relations.label")}
          </label>
          <select
            id="matching-relation"
            value={relation}
            onChange={(event) => {
              setRelation(event.target.value);
              setActiveTab(
                event.target.value === "entrepreneur-funding"
                  ? "funding"
                  : "researchers"
              );
            }}
            className="border-border bg-card text-foreground block w-full rounded-md border p-2.5 text-sm sm:max-w-md shadow-2xs focus:border-primary focus:ring-1 focus:ring-primary"
          >
            {[
              "entrepreneur-researcher",
              "entrepreneur-funding",
              "funding-researcher",
              "funding-researcher-entrepreneur",
            ].map((key) => (
              <option key={key} value={key}>
                {t(`relations.${key}`)}
              </option>
            ))}
          </select>
        </div>

        {/* Requirement summary card (100% Original Style) */}
        <div className="border-border bg-card space-y-3 rounded-xl border p-5 shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            <h2 className="text-foreground text-base font-semibold">
              {requirement.companyName || requirement.title}
            </h2>
            {requirement.province && (
              <span className="bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-md flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {requirement.province}
              </span>
            )}
            {requirement.targetProgram && (
              <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-md">
                {requirement.targetProgram}
              </span>
            )}
          </div>

          <p className="text-foreground/90 text-sm leading-relaxed">{requirement.rawText}</p>

          {requirement.assignedResearcher && (
            <div className="flex items-center gap-2 text-xs bg-muted/40 p-2.5 rounded-lg border border-border/50">
              <span className="font-semibold text-foreground">
                {lang === "th" ? "นักวิจัยที่ปรึกษาในข้อเสนอ (Excel):" : "Assigned Researcher (Excel):"}
              </span>
              <span className="text-primary font-medium">{requirement.assignedResearcher}</span>
            </div>
          )}

          {requirement.needTypes && requirement.needTypes.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {requirement.needTypes.map((nt) => (
                <span
                  key={nt}
                  className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-medium"
                >
                  {nt}
                </span>
              ))}
            </div>
          )}

          {acceptedTags.length > 0 && (
            <div className="border-border flex flex-wrap gap-1.5 border-t pt-3">
              {acceptedTags.map((tag) => (
                <span
                  key={tag.id}
                  className="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-xs font-medium"
                >
                  #{tag.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* AI Pre-Matched Recommendations Box */}
        {preMatches && preMatches.length > 0 && (
          <AIPreMatchedSummary
            requirementId={requirement.id}
            initialMatches={preMatches}
            onSelectTab={(tab) => {
              setActiveTab(tab);
              if (tab === "funding") {
                setRelation("entrepreneur-funding");
              } else {
                setRelation("entrepreneur-researcher");
              }
            }}
          />
        )}

        {/* Tabs for 2-Way Entrepreneur Matching */}
        {relation === "entrepreneur-researcher" && (
          <div className="border-border bg-muted/40 flex w-fit gap-1 rounded-xl border p-1">
            {(["researchers", "coaches", "funding"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === tab
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {t(`tabs.${tab}`)}
              </button>
            ))}
          </div>
        )}

        {/* Tab & Relation Content */}
        {relation === "funding-researcher" ||
        relation === "funding-researcher-entrepreneur" ? (
          <div className="space-y-3">
            {(relation === "funding-researcher"
              ? rankedPairs
              : rankedTriples
            ).map(({ funding, researcher, match }) => (
              <div
                key={`${funding.id}-${researcher.id}`}
                className="border-border bg-card flex items-start justify-between gap-4 rounded-xl border p-5 shadow-xs"
              >
                <div className="space-y-2 min-w-0">
                  <span className="text-primary block font-semibold text-base">
                    {funding.title}
                  </span>
                  <p className="text-foreground text-sm font-medium">
                    {researcher.name}
                  </p>
                  {relation === "funding-researcher-entrepreneur" && (
                    <p className="text-muted-foreground text-xs">
                      ผู้ประกอบการ: {requirement.companyName || requirement.rawText}
                    </p>
                  )}
                  <MatchExplainChips match={match} />
                  <div className="flex items-center gap-2 pt-1">
                    <AIMatchingInsightDialog
                      requirementTitle={requirement.companyName || requirement.title || ""}
                      problemStatement={requirement.rawText}
                      researcherName={researcher.name}
                      researcherFaculty={researcher.faculty || undefined}
                      researcherExpertise={researcher.about}
                      fundingTitle={funding.title}
                    />
                  </div>
                </div>
                <ScoreBadge score={match.score} />
              </div>
            ))}
            {(relation === "funding-researcher" ? rankedPairs : rankedTriples)
              .length === 0 && (
              <p className="text-muted-foreground py-12 text-center text-sm">
                {t("relations.empty")}
              </p>
            )}
          </div>
        ) : acceptedTags.length === 0 ? (
          <EmptyState
            icon={<Tag className="h-7 w-7" />}
            title={t("empty.noAcceptedTagsTitle")}
            desc={t("empty.noAcceptedTagsDesc")}
          />
        ) : activeTab === "researchers" ? (
          <ResearchersTab
            results={rankedResearchers}
            lang={lang}
            requirement={requirement}
          />
        ) : activeTab === "coaches" ? (
          <CoachesTab
            results={rankedPersonnel}
            lang={lang}
            requirement={requirement}
          />
        ) : (
          <FundingTab
            results={rankedFundings}
            lang={lang}
            requirement={requirement}
          />
        )}
      </div>
    </CanCreateDealContext.Provider>
  );
}

export function MatchExplainChips({ match }: { match: TagMatchResult }) {
  const t = useTranslations("matching.explain");

  return (
    <div className="flex flex-wrap gap-1.5">
      {match.exact.map((tag) => (
        <span
          key={`exact-${tag}`}
          title={t("exact")}
          className="border-status-success-border bg-status-success-surface text-status-success-foreground rounded border px-2 py-0.5 text-[11px] font-medium"
        >
          ✓ {tag}
        </span>
      ))}
      {match.related.map((tag) => (
        <span
          key={`related-${tag}`}
          title={t("related")}
          className="border-status-warning-border bg-status-warning-surface text-status-warning-foreground rounded border px-2 py-0.5 text-[11px] font-medium"
        >
          ~ {tag}
        </span>
      ))}
      {match.missing.map((tag) => (
        <span
          key={`missing-${tag}`}
          title={t("missing")}
          className="border-border bg-muted/60 text-muted-foreground rounded border px-2 py-0.5 text-[11px] line-through opacity-70"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const t = useTranslations("matching");
  const percent = Math.round(score * 100);

  return (
    <div className="flex shrink-0 flex-col items-end">
      <span className="text-primary text-xl font-black">{percent}%</span>
      <span className="text-muted-foreground text-[10px] uppercase font-semibold tracking-wider">
        {t("score")}
      </span>
    </div>
  );
}

function ResearchersTab({
  results,
  lang,
  requirement,
}: {
  results: RankedResearcher[];
  lang: string;
  requirement: Requirement;
}) {
  const t = useTranslations("matching");

  if (results.length === 0 || results.every((r) => r.match.score === 0)) {
    return (
      <EmptyState
        icon={<Users className="h-7 w-7" />}
        title={t("empty.researchersTitle")}
        desc={t("empty.researchersDesc")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {results.map(({ researcher, match }) => (
        <div
          key={researcher.id}
          className="border-border bg-card flex items-start justify-between gap-4 rounded-xl border p-5 shadow-xs transition-shadow hover:shadow-sm"
        >
          <div className="min-w-0 space-y-2">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-foreground text-base font-semibold">
                  {researcher.name}
                </span>
                {requirement.assignedResearcher &&
                  (requirement.assignedResearcher.includes(researcher.name) ||
                    researcher.name.includes(
                      requirement.assignedResearcher.replace(
                        /^(ดร\.|นาย|นาง|นางสาว|ผศ\.|รศ\.|ศ\.|ภก\.|ภญ\.)\s*/,
                        ""
                      )
                    ) ||
                    requirement.assignedResearcher.includes(
                      researcher.name.replace(
                        /^(ดร\.|นาย|นาง|นางสาว|ผศ\.|รศ\.|ศ\.|ภก\.|ภญ\.)\s*/,
                        ""
                      )
                    )) && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold">
                      ★ {lang === "th" ? "นักวิจัยที่ปรึกษาตามข้อเสนอ" : "Assigned in Proposal"}
                    </span>
                  )}
              </div>
              <p className="text-muted-foreground text-xs mt-0.5">
                {researcher.faculty || researcher.role}
              </p>
            </div>

            <MatchExplainChips match={match} />

            <div className="flex items-center gap-2 pt-1">
              <AIMatchingInsightDialog
                requirementTitle={requirement.companyName || requirement.title || ""}
                problemStatement={requirement.rawText}
                researcherName={researcher.name}
                researcherFaculty={researcher.faculty || undefined}
                researcherExpertise={researcher.about}
              />
            </div>
          </div>
          <ScoreBadge score={match.score} />
        </div>
      ))}
    </div>
  );
}

function CoachesTab({
  results,
  lang,
  requirement,
}: {
  results: RankedPersonnel[];
  lang: string;
  requirement: Requirement;
}) {
  const t = useTranslations("matching");

  if (results.length === 0 || results.every((r) => r.match.score === 0)) {
    return (
      <EmptyState
        icon={<UserCheck className="h-7 w-7" />}
        title={t("empty.coachesTitle")}
        desc={t("empty.coachesDesc")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {results.map(({ candidate, match }) => (
        <div
          key={candidate.id}
          className="border-border bg-card flex items-start justify-between gap-4 rounded-xl border p-5 shadow-xs"
        >
          <div className="min-w-0 space-y-2">
            <div>
              <span className="text-foreground text-base font-semibold">
                {candidate.name}
              </span>
              <p className="text-muted-foreground text-xs mt-0.5">
                {candidate.role}
                {candidate.faculty && ` · ${candidate.faculty}`}
              </p>
            </div>

            <MatchExplainChips match={match} />

            <div className="flex items-center gap-2 pt-1">
              <AIMatchingInsightDialog
                requirementTitle={requirement.companyName || requirement.title || ""}
                problemStatement={requirement.rawText}
                researcherName={candidate.name}
                researcherFaculty={candidate.faculty || undefined}
                researcherExpertise={candidate.about}
              />
            </div>
          </div>
          <ScoreBadge score={match.score} />
        </div>
      ))}
    </div>
  );
}

function FundingTab({
  results,
  lang,
  requirement,
}: {
  results: RankedFunding[];
  lang: string;
  requirement: Requirement;
}) {
  const t = useTranslations("matching");

  if (results.length === 0 || results.every((r) => r.match.score === 0)) {
    return (
      <EmptyState
        icon={<Wallet className="h-7 w-7" />}
        title={t("empty.fundingTitle")}
        desc={t("empty.fundingDesc")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {results.map(({ funding, match }) => (
        <div
          key={funding.id}
          className="border-border bg-card flex items-start justify-between gap-4 rounded-xl border p-5 shadow-xs"
        >
          <div className="min-w-0 space-y-2">
            <div>
              <span className="text-foreground text-base font-semibold">
                {funding.title}
              </span>
              <p className="text-muted-foreground text-xs mt-0.5">
                {funding.sourceName} · งบประมาณสูงสุด:{" "}
                {funding.financialRules.budgetTHB.toLocaleString()} บาท
              </p>
            </div>

            <MatchExplainChips match={match} />

            <div className="flex items-center gap-2 pt-1">
              <AIMatchingInsightDialog
                requirementTitle={requirement.companyName || requirement.title || ""}
                problemStatement={requirement.rawText}
                researcherName={funding.name || funding.title || ""}
                fundingTitle={funding.name || funding.title || ""}
              />
            </div>
          </div>
          <ScoreBadge score={match.score} />
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="border-border flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-16">
      <div className="bg-muted/50 text-muted-foreground flex h-14 w-14 items-center justify-center rounded-full">
        {icon}
      </div>
      <div className="text-center">
        <p className="text-foreground text-sm font-medium">{title}</p>
        <p className="text-muted-foreground mt-1 text-xs">{desc}</p>
      </div>
    </div>
  );
}

export function MatchingEmptyState({ lang }: { lang: string }) {
  const t = useTranslations("matching");

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <div className="bg-muted/50 text-muted-foreground flex h-16 w-16 items-center justify-center rounded-full">
        <Inbox className="h-7 w-7" />
      </div>
      <div className="max-w-sm text-center">
        <p className="text-foreground text-sm font-medium">
          {t("noRequirementTitle")}
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          {t("noRequirementDesc")}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href={`/${lang}/matching`}
          className="text-primary text-sm font-medium hover:underline"
        >
          {t("backToRequirements")}
        </Link>
        <span className="text-muted-foreground">•</span>
        <Link
          href={`/${lang}/requirements/new`}
          className="text-primary text-sm font-medium hover:underline"
        >
          {lang === "en" ? "New Requirement" : "เพิ่มความต้องการใหม่"}
        </Link>
      </div>
    </div>
  );
}
