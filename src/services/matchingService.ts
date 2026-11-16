import type { Requirement } from "@/types/requirement";
import type { Researcher } from "@/types/overview";
import type { Funding } from "@/types/funding";
function getFundingStatus(funding: Funding, now: Date = new Date()): string {
  if (funding.isActive === false) return "inactive";
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const { openDate, closeDate } = funding.timeline || {};
  if (closeDate && closeDate.slice(0, 10) < today) return "closed";
  if (openDate && openDate.slice(0, 10) > today) return "upcoming";
  return "open";
}
import { normalizeRole, type UserRole } from "@/types/user";
import {
  analyzeMatchWithGemini,
  type GeminiMatchAnalysis,
} from "./geminiService";

function personRoles(person: Researcher): UserRole[] {
  return [person.roleKey, ...(person.roles ?? [])]
    .filter((role): role is string => Boolean(role))
    .map(normalizeRole);
}

function holdsRole(person: Researcher, role: UserRole): boolean {
  const roles = personRoles(person);
  return roles.length === 0 || roles.includes(role);
}

export interface TagMatchResult {
  exact: string[];
  related: string[];
  missing: string[];
  score: number; // 0..1
  aiAnalysis?: GeminiMatchAnalysis | null;
}

export interface RankedResearcher {
  researcher: Researcher;
  match: TagMatchResult;
}

export interface RankedFunding {
  funding: Funding;
  match: TagMatchResult;
}

export interface RankedFundingResearcher {
  funding: Funding;
  researcher: Researcher;
  match: TagMatchResult;
}

export interface RankedFundingResearcherEntrepreneur
  extends RankedFundingResearcher {
  requirement: Requirement;
}

export interface PersonnelCandidate {
  id: string;
  name: string;
  role: string;
  tags: string[];
  avatarInitial?: string;
  avatarColor?: string;
  avatarUrl?: string | null;
  faculty?: string | null;
  about?: string;
  isAvailable?: boolean;
}

export interface RankedPersonnel {
  candidate: PersonnelCandidate;
  match: TagMatchResult;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * 100% Original Tag Matching Algorithm from NUSEEDBITI
 * Compares requirement accepted tags against candidate tags.
 * Computes Exact, Related, and Missing tags + weighted score (0..1).
 */
export function explainTagMatch(
  requirementTags: string[],
  candidateTags: string[]
): TagMatchResult {
  if (requirementTags.length === 0) {
    return { exact: [], related: [], missing: [], score: 0 };
  }

  const normalizedCandidates = candidateTags.map(normalize);

  const exact: string[] = [];
  const related: string[] = [];
  const missing: string[] = [];

  for (const reqTag of requirementTags) {
    const normReq = normalize(reqTag);
    if (normalizedCandidates.includes(normReq)) {
      exact.push(reqTag);
      continue;
    }
    const hasRelated = normalizedCandidates.some(
      (c) => c.includes(normReq) || normReq.includes(c)
    );
    if (hasRelated) {
      related.push(reqTag);
    } else {
      missing.push(reqTag);
    }
  }

  const score = (exact.length + related.length * 0.5) / requirementTags.length;

  return { exact, related, missing, score };
}

function getAcceptedRequirementTagLabels(requirement: Requirement): string[] {
  return requirement.tags.filter((t) => t.accepted).map((t) => t.label);
}

function checkIsAssigned(researcherName: string, assigned?: string): boolean {
  if (!assigned) return false;
  const cleanAssigned = assigned.replace(/^(ดร\.|นาย|นาง|นางสาว|ผศ\.|รศ\.|ศ\.|ภก\.|ภญ\.)\s*/, "").trim();
  const cleanName = researcherName.replace(/^(ดร\.|นาย|นาง|นางสาว|ผศ\.|รศ\.|ศ\.|ภก\.|ภญ\.)\s*/, "").trim();
  return (
    assigned.includes(researcherName) ||
    researcherName.includes(cleanAssigned) ||
    assigned.includes(cleanName)
  );
}

export function matchResearchers(
  requirement: Requirement,
  researchers: Researcher[]
): RankedResearcher[] {
  const requirementTags = getAcceptedRequirementTagLabels(requirement);

  return researchers
    .filter((researcher) => holdsRole(researcher, "researcher"))
    .map((researcher) => ({
      researcher,
      match: explainTagMatch(requirementTags, researcher.tags),
    }))
    .filter((item) => item.match.score > 0)
    .sort((a, b) => {
      if (b.match.score !== a.match.score) {
        return b.match.score - a.match.score;
      }
      const isAssignedA = checkIsAssigned(a.researcher.name, requirement.assignedResearcher);
      const isAssignedB = checkIsAssigned(b.researcher.name, requirement.assignedResearcher);
      if (isAssignedA && !isAssignedB) return -1;
      if (!isAssignedA && isAssignedB) return 1;
      return 0;
    });
}

export function matchFundings(
  requirement: Requirement,
  fundings: Funding[]
): RankedFunding[] {
  const requirementTags = getAcceptedRequirementTagLabels(requirement);

  return fundings
    .filter((funding) => getFundingStatus(funding) === "open")
    .map((funding) => ({
      funding,
      match: explainTagMatch(requirementTags, funding.tags),
    }))
    .sort((a, b) => b.match.score - a.match.score);
}

export function matchPersonnel(
  requirement: Requirement,
  candidates: PersonnelCandidate[]
): RankedPersonnel[] {
  const requirementTags = getAcceptedRequirementTagLabels(requirement);

  return candidates
    .map((candidate) => ({
      candidate,
      match: explainTagMatch(requirementTags, candidate.tags),
    }))
    .sort((a, b) => b.match.score - a.match.score);
}

export function matchCoachesAndAdvisors(
  requirement: Requirement,
  researchers: Researcher[]
): RankedPersonnel[] {
  const candidates: PersonnelCandidate[] = researchers
    .filter((r) =>
      personRoles(r).some((role) => role === "external" || role === "coach")
    )
    .map((r) => ({
      id: r.id,
      name: r.name,
      role: r.role,
      tags: r.tags,
      avatarInitial: r.avatarInitial,
      avatarColor: r.avatarColor,
      avatarUrl: r.avatarUrl,
      faculty: r.faculty,
      about: r.about,
      isAvailable: r.isAvailable,
    }));

  return matchPersonnel(requirement, candidates).filter(
    (item) => item.match.score > 0
  );
}

export function matchFundingResearcherPairs(
  researchers: Researcher[],
  fundings: Funding[]
): RankedFundingResearcher[] {
  return fundings
    .filter((funding) => getFundingStatus(funding) === "open")
    .flatMap((funding) =>
      researchers
        .filter((researcher) => holdsRole(researcher, "researcher"))
        .map((researcher) => ({
          funding,
          researcher,
          match: explainTagMatch(funding.tags, researcher.tags),
        }))
    )
    .filter((item) => item.match.score > 0)
    .sort((a, b) => b.match.score - a.match.score);
}

export function matchFundingResearcherEntrepreneurTriples(
  requirement: Requirement,
  researchers: Researcher[],
  fundings: Funding[]
): RankedFundingResearcherEntrepreneur[] {
  const tags = getAcceptedRequirementTagLabels(requirement);
  return matchFundingResearcherPairs(researchers, fundings)
    .flatMap((pair) => {
      const researcherMatch = explainTagMatch(tags, pair.researcher.tags);
      const fundingMatch = explainTagMatch(tags, pair.funding.tags);
      if (!researcherMatch.score || !fundingMatch.score) return [];
      return [
        {
          ...pair,
          requirement,
          match: {
            ...pair.match,
            score:
              (pair.match.score + researcherMatch.score + fundingMatch.score) /
              3,
          },
        },
      ];
    })
    .sort((a, b) => b.match.score - a.match.score);
}

/**
 * Server Action / Utility to request AI Evaluation on demand
 */
export async function enhanceMatchWithGemini(
  requirement: Requirement,
  researcher: Researcher,
  funding?: Funding
): Promise<GeminiMatchAnalysis | null> {
  return analyzeMatchWithGemini({
    requirementTitle: requirement.title || requirement.companyName || "",
    problemStatement: requirement.rawText,
    researcherName: researcher.name,
    researcherFaculty: researcher.faculty || undefined,
    researcherExpertise: researcher.about || undefined,
    researcherOutstandingWorks: researcher.department || undefined,
    fundingTitle: funding?.title,
  });
}
