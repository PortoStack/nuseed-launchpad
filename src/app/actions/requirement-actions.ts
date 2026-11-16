"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { ProblemStructure, SuggestedTag } from "@/types/requirement";
import { tagCatalogService } from "@/services/tagCatalogService";
import { requirementService } from "@/services/requirementService";
import {
  mockExtractTagsFromText,
  type PreMatchedResultItem,
} from "@/services/mockAiService";
import {
  performAutoPreMatch,
  getPreMatchedResults,
} from "@/services/serverPreMatchService";

export interface CreateRequirementInput {
  projectTitle?: string;
  companyName?: string;
  entrepreneurName?: string;
  entrepreneurPrefix?: string;
  entrepreneurType?: string;
  businessType?: string;
  province?: string;
  phone?: string;
  email?: string;
  budget?: number;
  rawText: string;
  needTypes: string[];
  sourceChannel?: string;
  structure?: ProblemStructure;
  targetProgram?: string;
  tags: string[];
}

export async function extractTagsAction(
  rawText: string,
  businessType?: string
): Promise<string[]> {
  return mockExtractTagsFromText(rawText, businessType);
}

export async function suggestTagsAction(
  rawText: string
): Promise<SuggestedTag[]> {
  try {
    const catalog = await tagCatalogService.getCatalog();
    let suggested = requirementService.suggestTags(rawText, catalog);

    if (
      suggested.length === 0 ||
      (suggested.length === 1 && suggested[0].source === "new")
    ) {
      try {
        const aiTags = await mockExtractTagsFromText(rawText);
        if (aiTags.length > 0) {
          suggested = aiTags.map((name, index) => ({
            id: `tag-${Date.now()}-${index}`,
            label: name,
            kind: "business" as const,
            confidence: 0.9,
            source: "exact" as const,
            accepted: true,
          }));
        }
      } catch {
        // keep suggested
      }
    }

    return suggested;
  } catch (error) {
    console.error("suggestTagsAction error:", error);
    return [];
  }
}

export async function createRequirementWithAutoMatchAction(
  data: CreateRequirementInput
): Promise<{ success: boolean; requirementId?: string; error?: string }> {
  try {
    const rawTextTrimmed = data.rawText?.trim();
    if (!rawTextTrimmed) {
      return { success: false, error: "กรุณาระบุโจทย์ปัญหาและความต้องการ" };
    }

    const companyOrEntrepreneur =
      data.companyName?.trim() ||
      data.entrepreneurName?.trim() ||
      "วิสาหกิจ/ผู้ประกอบการทั่วไป";

    // 1. Insert into requirements table
    const reqResult = await sql`
      INSERT INTO requirements (
        project_title,
        company_name,
        entrepreneur_name,
        entrepreneur_prefix,
        entrepreneur_type,
        business_type,
        province,
        phone,
        email,
        budget,
        raw_text,
        need_types,
        source_channel,
        structure,
        target_program,
        status
      ) VALUES (
        ${data.projectTitle || companyOrEntrepreneur},
        ${companyOrEntrepreneur},
        ${data.entrepreneurName?.trim() || null},
        ${data.entrepreneurPrefix || null},
        ${data.entrepreneurType || "วิสาหกิจชุมชน"},
        ${data.businessType || "เกษตรและการแปรรูปอาหาร"},
        ${data.province || "พิษณุโลก"},
        ${data.phone || null},
        ${data.email || null},
        ${data.budget || 0},
        ${rawTextTrimmed},
        ${data.needTypes || []},
        ${data.sourceChannel || "LINE"},
        ${JSON.stringify(data.structure || {})},
        ${data.targetProgram || "IRTC"},
        'matched'
      )
      RETURNING id;
    `;

    const requirementId = reqResult[0].id;

    // 2. Insert tags & junction entries
    if (data.tags && data.tags.length > 0) {
      for (const tagName of data.tags) {
        const trimmed = tagName.trim();
        if (!trimmed) continue;

        // Ensure tag exists
        const tagRows = await sql`
          INSERT INTO tags (name, is_approved)
          VALUES (${trimmed}, true)
          ON CONFLICT (name) DO UPDATE SET updated_at = NOW()
          RETURNING id;
        `;
        const tagId = tagRows[0].id;

        // Link in requirement_tags
        await sql`
          INSERT INTO requirement_tags (requirement_id, tag_id, accepted)
          VALUES (${requirementId}, ${tagId}, true)
          ON CONFLICT (requirement_id, tag_id) DO NOTHING;
        `;
      }
    }

    // 3. Trigger Mock AI Auto-Matching
    await performAutoPreMatch(requirementId);

    try {
      revalidatePath("/th/matching");
      revalidatePath("/en/matching");
    } catch {
      // Ignore outside Next.js request context
    }

    return { success: true, requirementId };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการบันทึกข้อมูล";
    console.error("createRequirementWithAutoMatchAction error:", error);
    return { success: false, error: message };
  }
}

export async function getPreMatchedResultsAction(
  requirementId: string
): Promise<PreMatchedResultItem[]> {
  return getPreMatchedResults(requirementId);
}

export async function reMatchRequirementAction(
  requirementId: string
): Promise<{ success: boolean; results: PreMatchedResultItem[] }> {
  try {
    await performAutoPreMatch(requirementId);
    const results = await getPreMatchedResults(requirementId);
    try {
      revalidatePath("/th/matching");
      revalidatePath("/en/matching");
    } catch {
      // Ignore outside Next.js request context
    }
    return { success: true, results };
  } catch (error) {
    console.error("reMatchRequirementAction error:", error);
    return { success: false, results: [] };
  }
}

export async function toggleMatchSelectionAction(
  matchId: string,
  isSelected: boolean
): Promise<boolean> {
  try {
    await sql`
      UPDATE ai_match_results
      SET is_selected = ${isSelected}
      WHERE id = ${matchId}
    `;
    return true;
  } catch (error) {
    console.error("toggleMatchSelectionAction error:", error);
    return false;
  }
}
