"use server";

import { requirementService } from "@/services/requirementService";
import { fundingService } from "@/services/fundingService";
import type { Requirement } from "@/types/requirement";
import type { Funding } from "@/types/funding";

export async function reloadRequirementAndFundings(
  requirementId: string
): Promise<{ requirement: Requirement | null; fundings: Funding[] }> {
  const [requirement, fundings] = await Promise.all([
    requirementService.getRequirementById(requirementId),
    fundingService.getFundings(),
  ]);
  return { requirement, fundings };
}
