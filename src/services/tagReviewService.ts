import type { Requirement, TagCatalogItem } from "@/types/requirement";

export interface NearMatch {
  tag: TagCatalogItem;
  score: number; // 0..1
}

export interface PendingTagProposal {
  requirementId: string;
  tagId: string;
  label: string;
  kind: "business" | "technical";
  nearMatches: NearMatch[];
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function suggestNearMatches(
  label: string,
  catalog: TagCatalogItem[]
): NearMatch[] {
  const normLabel = normalize(label);
  const matches: NearMatch[] = [];

  for (const tag of catalog) {
    if (tag.deletedAt || tag.status === "deprecated") continue;
    const candidates = [
      tag.label,
      ...(tag.keywords ?? []),
      ...(tag.synonyms ?? []),
    ].map(normalize);

    let score = 0;
    if (candidates.includes(normLabel)) {
      score = 1.0;
    } else if (
      candidates.some((c) => c.includes(normLabel) || normLabel.includes(c))
    ) {
      score = 0.6;
    }

    if (score > 0) {
      matches.push({ tag, score });
    }
  }

  return matches.sort((a, b) => b.score - a.score).slice(0, 5);
}

export function getPendingTagProposals(
  requirements: Requirement[],
  catalog: TagCatalogItem[]
): PendingTagProposal[] {
  const proposals: PendingTagProposal[] = [];

  for (const req of requirements) {
    for (const tag of req.tags) {
      if (tag.accepted) continue;
      proposals.push({
        requirementId: req.id,
        tagId: tag.id,
        label: tag.label,
        kind: "business",
        nearMatches: suggestNearMatches(tag.label, catalog),
      });
    }
  }

  return proposals;
}
