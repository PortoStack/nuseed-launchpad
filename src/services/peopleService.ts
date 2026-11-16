import { sql } from "@/lib/db";
import type { Person } from "@/types/people";

export const peopleService = {
  getMatchingPeople: async (): Promise<Person[]> => {
    try {
      const rows = await sql`
        SELECT r.*,
               COALESCE(array_agg(t.name) FILTER (WHERE t.name IS NOT NULL), '{}') as tags
        FROM researchers r
        LEFT JOIN researcher_tags rt ON rt.researcher_id = r.id
        LEFT JOIN tags t ON t.id = rt.tag_id
        GROUP BY r.id
        ORDER BY r.name ASC
      `;

      return rows.map((r) => ({
        id: r.id,
        displayName: r.name,
        displayNameTh: r.name,
        displayNameEn: r.name,
        faculty: r.faculty || "",
        roles: [(r.role_key as any) || "researcher"],
        specialty: r.discipline || r.faculty || "นักวิจัย",
        about: r.expertise_primary || "",
        avatarUrl: r.avatar_url || null,
        tags: (r.tags || []).map((name: string) => ({ id: name, name })),
        relatedProjectCount: 0,
      }));
    } catch (err) {
      console.error("Database query error in peopleService.getMatchingPeople:", err);
      return [];
    }
  },
};
