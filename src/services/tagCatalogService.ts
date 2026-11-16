import { sql } from "@/lib/db";
import type { TagCatalogItem } from "@/types/requirement";
import { normalizeTagCatalogItem, type MainCategoryId } from "@/lib/taxonomy";

export interface CreateCatalogTagDTO {
  label: string;
  kind: "business" | "technical";
  mainCategoryId?: MainCategoryId;
  parentCategory?: string;
  synonyms?: string[];
  excludedWords?: string[];
  exampleSentences?: string[];
  reviewerName?: string;
}

export type TagCatalogUpdate = Partial<
  Pick<
    TagCatalogItem,
    | "label"
    | "kind"
    | "parentCategory"
    | "mainCategoryId"
    | "synonyms"
    | "excludedWords"
    | "exampleSentences"
    | "status"
  >
>;

export const tagCatalogService = {
  getCatalog: async (): Promise<TagCatalogItem[]> => {
    try {
      const rows = await sql`
        SELECT t.*, c.code as category_code, c.name_th as category_name_th
        FROM tags t
        LEFT JOIN tag_categories c ON c.id = t.category_id
        ORDER BY t.name ASC
      `;

      return rows.map((r) =>
        normalizeTagCatalogItem({
          id: r.id,
          label: r.name,
          kind: "business",
          keywords: [r.name, ...(r.aliases || [])],
          mainCategoryId: r.category_code as MainCategoryId,
          parentCategory: r.category_name_th || "",
          synonyms: r.aliases || [],
          status: "active",
          isFlagship: Boolean(r.is_flagship),
        })
      );
    } catch (err) {
      console.error("Database query error in tagCatalogService.getCatalog:", err);
      return [];
    }
  },

  getTags: async (): Promise<TagCatalogItem[]> => {
    return tagCatalogService.getCatalog();
  },

  createTag: async (dto: CreateCatalogTagDTO): Promise<TagCatalogItem> => {
    const rows = await sql`
      INSERT INTO tags (name, aliases)
      VALUES (${dto.label}, ${dto.synonyms || []})
      ON CONFLICT (name) DO UPDATE SET aliases = EXCLUDED.aliases
      RETURNING *;
    `;

    return normalizeTagCatalogItem({
      id: rows[0].id,
      label: rows[0].name,
      kind: dto.kind,
      keywords: [rows[0].name, ...(dto.synonyms || [])],
      mainCategoryId: dto.mainCategoryId,
      parentCategory: dto.parentCategory,
      synonyms: dto.synonyms,
      status: "active",
    });
  },

  updateTag: async (id: string, updates: TagCatalogUpdate): Promise<TagCatalogItem> => {
    if (updates.label) {
      await sql`
        UPDATE tags
        SET name = ${updates.label}, aliases = ${updates.synonyms || []}
        WHERE id = ${id}
      `;
    }
    return normalizeTagCatalogItem({
      id,
      label: updates.label || "",
      kind: updates.kind || "business",
      keywords: [updates.label || ""],
      mainCategoryId: updates.mainCategoryId,
      parentCategory: updates.parentCategory,
      synonyms: updates.synonyms,
      status: updates.status || "active",
    });
  },

  deleteRecord: async (id: string): Promise<void> => {
    await sql`DELETE FROM tags WHERE id = ${id}`;
  },
};
