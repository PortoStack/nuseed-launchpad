"use client";

import React, { useEffect, useState } from "react";
import type { Requirement } from "@/types/requirement";
import type { Researcher } from "@/types/overview";
import type { Funding } from "@/types/funding";
import {
  matchResearchers,
  matchFundings,
  matchCoachesAndAdvisors,
  matchFundingResearcherPairs,
  matchFundingResearcherEntrepreneurTriples,
} from "@/services/matchingService";
import { reloadRequirementAndFundings } from "@/app/actions/matching-actions";
import { MatchingWorkspace, MatchingEmptyState } from "./matching-workspace";
import type { PreMatchedResultItem } from "@/services/mockAiService";

interface MatchingPageContentProps {
  requirementId: string;
  lang: string;
  initialRequirement: Requirement | null;
  researchers: Researcher[];
  initialFundings: Funding[];
  canCreateDeal?: boolean;
  initialPreMatches?: PreMatchedResultItem[];
}

export function MatchingPageContent({
  requirementId,
  lang,
  initialRequirement,
  researchers,
  initialFundings,
  canCreateDeal = false,
  initialPreMatches = [],
}: MatchingPageContentProps) {
  const [requirement, setRequirement] = useState(initialRequirement);
  const [fundings, setFundings] = useState(initialFundings);
  const [preMatches, setPreMatches] = useState(initialPreMatches);
  const [isLoading, setIsLoading] = useState(initialRequirement === null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (initialRequirement !== null) return;
    let cancelled = false;

    reloadRequirementAndFundings(requirementId).then(
      ({ requirement: found, fundings: freshFundings }) => {
        if (cancelled) return;
        if (found) {
          setRequirement(found);
          setFundings(freshFundings);
        } else {
          setNotFound(true);
        }
        setIsLoading(false);
      }
    );

    return () => {
      cancelled = true;
    };
  }, [requirementId, initialRequirement]);

  if (notFound) {
    return <MatchingEmptyState lang={lang} />;
  }

  if (isLoading || !requirement) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="bg-muted h-7 w-64 rounded-md" />
        <div className="bg-muted/40 h-32 rounded-xl" />
        <div className="bg-muted/60 h-10 w-48 rounded-xl" />
        <div className="bg-muted/40 h-24 rounded-xl" />
        <div className="bg-muted/40 h-24 rounded-xl" />
      </div>
    );
  }

  const rankedResearchers = matchResearchers(requirement, researchers);
  const rankedFundings = matchFundings(requirement, fundings);
  const rankedPersonnel = matchCoachesAndAdvisors(requirement, researchers);

  return (
    <MatchingWorkspace
      requirement={requirement}
      rankedResearchers={rankedResearchers}
      rankedFundings={rankedFundings}
      rankedPersonnel={rankedPersonnel}
      rankedPairs={matchFundingResearcherPairs(researchers, fundings)}
      rankedTriples={matchFundingResearcherEntrepreneurTriples(
        requirement,
        researchers,
        fundings
      )}
      lang={lang}
      canCreateDeal={canCreateDeal}
      preMatches={preMatches}
    />
  );
}
