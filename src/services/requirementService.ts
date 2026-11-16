import { sql } from "@/lib/db";
import type { Requirement, SuggestedTag, TagCatalogItem } from "@/types/requirement";

export const requirementService = {
  suggestTags: (
    rawText: string,
    catalog: TagCatalogItem[] = []
  ): SuggestedTag[] => {
    const normalized = rawText.trim().toLowerCase();
    if (!normalized) return [];
    const matches: SuggestedTag[] = [];
    for (const item of catalog.filter(
      (tag) => !tag.deletedAt && tag.status !== "deprecated"
    )) {
      if (
        item.excludedWords?.some(
          (word) =>
            word.trim() && normalized.includes(word.trim().toLowerCase())
        )
      )
        continue;
      const keywords = [
        ...new Set([item.label, ...item.keywords, ...(item.synonyms ?? [])]),
      ]
        .map((word) => word.trim())
        .filter(Boolean);
      const matching = keywords.filter((word) =>
        normalized.includes(word.trim().toLowerCase())
      );
      if (!matching.length) continue;
      const confidence = Math.min(
        1,
        Math.max(0.3, matching.length / Math.max(keywords.length, 1) + 0.3)
      );
      matches.push({
        id: item.id,
        label: item.label,
        kind: item.kind,
        confidence,
        source: matching.some(
          (word) => normalized === word.toLowerCase() || word.length >= 8
        )
          ? "exact"
          : "related",
        accepted: true,
      });
    }
    if (matches.length)
      return matches.sort((a, b) => b.confidence - a.confidence);
    const snippet = rawText.replace(/\s+/g, " ").trim();
    return [
      {
        id: "new-concept",
        label: snippet.length > 30 ? snippet.slice(0, 30) + "..." : snippet,
        kind: "business",
        confidence: 0,
        source: "new",
        accepted: false,
      },
    ];
  },

  getRequirements: async (): Promise<Requirement[]> => {
    try {
      const rows = await sql`
        SELECT r.*,
               COALESCE(
                 json_agg(
                   json_build_object(
                     'id', t.id,
                     'label', t.name,
                     'kind', 'business',
                     'confidence', 1.0,
                     'source', 'exact',
                     'accepted', COALESCE(rt.accepted, true)
                   )
                 ) FILTER (WHERE t.id IS NOT NULL),
                 '[]'
               ) as tags
        FROM requirements r
        LEFT JOIN requirement_tags rt ON rt.requirement_id = r.id
        LEFT JOIN tags t ON t.id = rt.tag_id
        GROUP BY r.id
        ORDER BY r.created_at DESC
      `;

      return rows.map((r) => ({
        id: r.id,
        title: r.project_title || r.company_name,
        companyName: r.company_name,
        rawText: r.raw_text,
        needTypes: r.need_types || [],
        status: r.status || "open",
        province: r.province || "",
        budget: Number(r.budget) || 0,
        assignedResearcher: r.assigned_researcher || undefined,
        targetProgram: r.target_program || undefined,
        notes: r.notes || undefined,
        tags: r.tags || [],
        createdAt: r.created_at?.toISOString() || new Date().toISOString(),
      }));
    } catch (err) {
      console.error("Database query error in requirementService.getRequirements:", err);
      return [];
    }
  },

  getRequirementById: async (id: string): Promise<Requirement | null> => {
    try {
      const rows = await sql`
        SELECT r.*,
               COALESCE(
                 json_agg(
                   json_build_object(
                     'id', t.id,
                     'label', t.name,
                     'kind', 'business',
                     'confidence', 1.0,
                     'source', 'exact',
                     'accepted', COALESCE(rt.accepted, true)
                   )
                 ) FILTER (WHERE t.id IS NOT NULL),
                 '[]'
               ) as tags
        FROM requirements r
        LEFT JOIN requirement_tags rt ON rt.requirement_id = r.id
        LEFT JOIN tags t ON t.id = rt.tag_id
        WHERE r.id = ${id}
        GROUP BY r.id
      `;

      if (rows.length === 0) return null;

      const r = rows[0];
      return {
        id: r.id,
        title: r.project_title || r.company_name,
        companyName: r.company_name,
        rawText: r.raw_text,
        needTypes: r.need_types || [],
        status: r.status || "open",
        province: r.province || "",
        budget: Number(r.budget) || 0,
        assignedResearcher: r.assigned_researcher || undefined,
        targetProgram: r.target_program || undefined,
        notes: r.notes || undefined,
        tags: r.tags || [],
        createdAt: r.created_at?.toISOString() || new Date().toISOString(),
      };
    } catch (err) {
      console.error("Database query error in requirementService.getRequirementById:", err);
      return null;
    }
  },

  getTagReviewQueue: async (): Promise<Requirement[]> => {
    return requirementService.getRequirements();
  },

  decideTagProposal: async (
    requirementId: string,
    tagId: string,
    payload: { decision?: string } | string
  ): Promise<Requirement> => {
    const isApprove =
      typeof payload === "string"
        ? payload === "approve"
        : payload?.decision === "approve";
    try {
      await sql`
        UPDATE requirement_tags
        SET accepted = ${isApprove}
        WHERE requirement_id = ${requirementId} AND tag_id = ${tagId}
      `;
    } catch (err) {
      console.error("Failed to update tag decision in database:", err);
    }

    const updated = await requirementService.getRequirementById(requirementId);
    if (!updated) {
      throw new Error("Requirement not found");
    }
    return updated;
  },
};
