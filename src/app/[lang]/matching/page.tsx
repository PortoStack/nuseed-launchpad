import React from "react";
import { requirementService } from "@/services/requirementService";
import { fundingService } from "@/services/fundingService";
import { peopleService } from "@/services/peopleService";
import { personToResearcher } from "@/lib/people-adapters";
import { MatchingRequirementPicker } from "@/components/matching/matching-requirement-picker";
import { MatchingPageContent } from "@/components/matching/matching-page-content";
import { AppShell } from "@/components/shared/AppShell";
import { getPreMatchedResults, performAutoPreMatch } from "@/services/serverPreMatchService";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ requirementId?: string }>;
}

export default async function MatchingPage({
  params,
  searchParams,
}: PageProps) {
  const { lang } = await params;
  const { requirementId } = await searchParams;

  if (!requirementId) {
    const requirements = await requirementService.getRequirements();
    return (
      <AppShell>
        <MatchingRequirementPicker
          initialRequirements={requirements}
          lang={lang}
        />
      </AppShell>
    );
  }

  const [requirement, people, fundings] = await Promise.all([
    requirementService.getRequirementById(requirementId),
    peopleService.getMatchingPeople(),
    fundingService.getFundings(),
  ]);

  let preMatches = await getPreMatchedResults(requirementId);
  if (preMatches.length === 0 && requirement) {
    await performAutoPreMatch(requirementId);
    preMatches = await getPreMatchedResults(requirementId);
  }

  return (
    <AppShell>
      <MatchingPageContent
        requirementId={requirementId}
        lang={lang}
        initialRequirement={requirement}
        researchers={people.map((person) => personToResearcher(person, lang))}
        initialFundings={fundings}
        initialPreMatches={preMatches}
      />
    </AppShell>
  );
}
