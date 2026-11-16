import { sql } from "@/lib/db";
import type { Funding, FundingStatus } from "@/types/funding";

export const fundingService = {
  getStatus: (funding: Funding, now: Date = new Date()): FundingStatus => {
    if (funding.isActive === false) return "inactive";
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const { openDate, closeDate } = funding.timeline || {};
    if (closeDate && closeDate.slice(0, 10) < today) return "closed";
    if (openDate && openDate.slice(0, 10) > today) return "upcoming";
    return "open";
  },

  getFundings: async (): Promise<Funding[]> => {
    try {
      const rows = await sql`
        SELECT f.*,
               COALESCE(array_agg(t.name) FILTER (WHERE t.name IS NOT NULL), '{}') as tags
        FROM funding_programs f
        LEFT JOIN funding_tags ft ON ft.funding_id = f.id
        LEFT JOIN tags t ON t.id = ft.tag_id
        GROUP BY f.id
        ORDER BY f.title ASC
      `;

      return rows.map((r) => ({
        id: r.id,
        name: r.title,
        title: r.title,
        agency: r.source || "สป.อว.",
        sourceType: "external",
        sourceName: r.source || "สป.อว.",
        objective: r.objective || "",
        concept: r.concept || "",
        financialRules: {
          budgetTHB: Number(r.max_budget) || 0,
          fundingRatioPercent: 100,
          privateCofundingRequired: false,
          reimbursableExpenses: [],
        },
        timeline: {
          openDate: "2026-01-01",
          closeDate: "2026-12-31",
          milestones: [],
        },
        tags: r.tags || [],
        isActive: r.status === "open",
      }));
    } catch (err) {
      console.error("Database query error in fundingService.getFundings:", err);
      return [];
    }
  },
};
