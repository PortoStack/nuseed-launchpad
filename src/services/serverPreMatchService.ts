import { sql } from "@/lib/db";
import {
  mockAnalyzeMatch,
  type PreMatchedResultItem,
} from "./mockAiService";
import type { GeminiMatchAnalysis } from "./geminiService";

/**
 * Evaluates candidates and saves pre-matched recommendations into ai_match_results
 */
export async function performAutoPreMatch(requirementId: string) {
  try {
    // 1. Get requirement info
    const reqRows = await sql`
      SELECT id, project_title, company_name, raw_text, business_type, budget, need_types,
             assigned_researcher, target_program, notes
      FROM requirements
      WHERE id = ${requirementId}
    `;

    if (reqRows.length === 0) return null;
    const req = reqRows[0];

    // 2. Get researchers & coaches
    const researchers = await sql`
      SELECT id, name, role_key, faculty, discipline, expertise_primary, outstanding_works
      FROM researchers
      WHERE is_available = true
    `;

    // 3. Get fundings
    const fundings = await sql`
      SELECT id, code, title, max_budget, support_ratio
      FROM funding_programs
      WHERE status = 'open'
    `;

    if (researchers.length === 0 || fundings.length === 0) return null;

    // Pick top Lead Researcher (role = researcher)
    const leadCandidates = researchers.filter((r) => r.role_key === "researcher" || !r.role_key);
    // Pick top Coach/Advisor (role = coach or advisor or co-researcher)
    const coachCandidates = researchers.filter((r) => r.role_key === "coach" || r.role_key === "advisor" || r.role_key === "researcher");

    const reqText = `${req.project_title || ""} ${req.company_name} ${req.raw_text} ${req.business_type || ""}`.toLowerCase();

    // Determine target funding based on target_program, budget and context
    let targetFunding = fundings[0];
    if (req.target_program) {
      const matched = fundings.find(
        (f) => f.code.toLowerCase() === req.target_program.toLowerCase()
      );
      if (matched) targetFunding = matched;
    } else {
      const budgetNum = Number(req.budget) || 0;
      if (budgetNum > 150000 || reqText.includes("sme") || reqText.includes("นิติบุคคล") || reqText.includes("irtc")) {
        targetFunding = fundings.find((f) => f.code === "IRTC") || fundings[0];
      } else {
        targetFunding = fundings.find((f) => f.code === "P7") || fundings[0];
      }
    }

    // Check if requirement has an assigned researcher from Excel proposal
    const cleanAssigned = (req.assigned_researcher || "")
      .replace(/^(ดร\.|นาย|นาง|นางสาว|ผศ\.|รศ\.|ศ\.|ภก\.|ภญ\.)\s*/, "")
      .trim();

    const assignedResearcher = researchers.find((r) => {
      const cleanR = r.name.replace(/^(ดร\.|นาย|นาง|นางสาว|ผศ\.|รศ\.|ศ\.|ภก\.|ภญ\.)\s*/, "").trim();
      return (
        Boolean(req.assigned_researcher) &&
        (req.assigned_researcher.includes(r.name) ||
          r.name.includes(cleanAssigned) ||
          (cleanAssigned.length >= 4 && cleanR.includes(cleanAssigned)) ||
          (cleanR.length >= 4 && cleanAssigned.includes(cleanR)))
      );
    });

    // Rank lead researcher
    let bestLead = assignedResearcher || leadCandidates[0];
    let bestLeadScore = assignedResearcher ? 0.98 : -1;
    let bestLeadAnalysis: GeminiMatchAnalysis | null = null;

    if (assignedResearcher) {
      bestLeadAnalysis = {
        fitScore: 0.98,
        scoreBreakdown: {
          expertiseAlignment: 0.99,
          domainSynergy: 0.98,
          practicalFeasibility: 0.97,
        },
        explanation: `${assignedResearcher.name} สังกัด${assignedResearcher.faculty || "มหาวิทยาลัยนเรศวร"} ได้รับการระบุเป็นนักวิจัยที่ปรึกษาหลักในข้อเสนอโครงการ มีความเชี่ยวชาญตรงจุดในด้าน ${assignedResearcher.expertise_primary || "สาขาที่เกี่ยวข้อง"} พร้อมนำองค์ความรู้และเทคโนโลยีมาสนับสนุน "${req.project_title || req.company_name}" ภายใต้ ${targetFunding.title}`,
        suggestedTags: ["นักวิจัยประจำโครงการ", targetFunding.code],
      };
    } else {
      for (const r of leadCandidates) {
        const analysis = mockAnalyzeMatch({
          requirementTitle: req.project_title || req.company_name,
          problemStatement: req.raw_text,
          researcherName: r.name,
          researcherFaculty: r.faculty,
          researcherExpertise: r.expertise_primary,
          researcherOutstandingWorks: r.outstanding_works,
          fundingTitle: targetFunding.title,
        });

        if (analysis.fitScore > bestLeadScore) {
          bestLeadScore = analysis.fitScore;
          bestLead = r;
          bestLeadAnalysis = analysis;
        }
      }
    }

    // Rank coach/advisor/co-researcher (exclude the lead researcher)
    const availableCoaches = coachCandidates.filter((c) => c.id !== bestLead?.id);
    let bestCoach: any = null;
    let bestCoachScore = -1;
    let bestCoachAnalysis: GeminiMatchAnalysis | null = null;

    // Check if notes/proposal mentions a specific co-researcher (e.g. ธีรพร, ศศิประภา)
    const notesText = (req.notes || "").toLowerCase();
    const namedCoResearcher = availableCoaches.find((c) => {
      const cleanName = c.name.replace(/^(ดร\.|นาย|นาง|นางสาว|ผศ\.|รศ\.|ศ\.|ภก\.|ภญ\.)\s*/, "").trim();
      return cleanName.length >= 4 && notesText.includes(cleanName.toLowerCase());
    });

    if (namedCoResearcher) {
      bestCoach = namedCoResearcher;
      bestCoachAnalysis = {
        fitScore: 0.92,
        scoreBreakdown: {
          expertiseAlignment: 0.94,
          domainSynergy: 0.92,
          practicalFeasibility: 0.90,
        },
        explanation: `${namedCoResearcher.name} สังกัด${namedCoResearcher.faculty || "มหาวิทยาลัยนเรศวร"} เป็นผู้ร่วมโครงการวิจัยตามข้อเสนอ มีความเชี่ยวชาญด้าน ${namedCoResearcher.expertise_primary || "สาขาที่เกี่ยวข้อง"} ร่วมให้คำปรึกษาและสนับสนุนการดำเนินโครงการ`,
        suggestedTags: ["ผู้ร่วมโครงการ", "ที่ปรึกษา"],
      };
    } else if (availableCoaches.length > 0) {
      for (const c of availableCoaches) {
        const analysis = mockAnalyzeMatch({
          requirementTitle: req.project_title || req.company_name,
          problemStatement: req.raw_text,
          researcherName: c.name,
          researcherFaculty: c.faculty,
          researcherExpertise: c.expertise_primary,
          researcherOutstandingWorks: c.outstanding_works,
          fundingTitle: targetFunding.title,
        });

        if (analysis.fitScore > bestCoachScore) {
          bestCoachScore = analysis.fitScore;
          bestCoach = c;
          bestCoachAnalysis = analysis;
        }
      }
    }

    // Clean up previous pre-matches for this requirement
    await sql`
      DELETE FROM ai_match_results
      WHERE requirement_id = ${requirementId}
    `;

    // Save Top Lead Researcher Match
    if (bestLead && bestLeadAnalysis) {
      await sql`
        INSERT INTO ai_match_results (
          requirement_id,
          researcher_id,
          funding_id,
          fit_score,
          score_breakdown,
          explanation,
          suggested_tags,
          is_selected
        ) VALUES (
          ${requirementId},
          ${bestLead.id},
          ${targetFunding.id},
          ${bestLeadAnalysis.fitScore},
          ${JSON.stringify(bestLeadAnalysis.scoreBreakdown)},
          ${bestLeadAnalysis.explanation},
          ${bestLeadAnalysis.suggestedTags},
          true
        )
      `;
    }

    // Save Top Coach/Advisor Match if available
    if (bestCoach && bestCoachAnalysis) {
      await sql`
        INSERT INTO ai_match_results (
          requirement_id,
          researcher_id,
          funding_id,
          fit_score,
          score_breakdown,
          explanation,
          suggested_tags,
          is_selected
        ) VALUES (
          ${requirementId},
          ${bestCoach.id},
          ${targetFunding.id},
          ${bestCoachAnalysis.fitScore},
          ${JSON.stringify(bestCoachAnalysis.scoreBreakdown)},
          ${bestCoachAnalysis.explanation},
          ${bestCoachAnalysis.suggestedTags},
          true
        )
      `;
    }

    return {
      leadResearcher: bestLead,
      leadAnalysis: bestLeadAnalysis,
      coach: bestCoach,
      coachAnalysis: bestCoachAnalysis,
      funding: targetFunding,
    };
  } catch (error) {
    console.error("performAutoPreMatch error:", error);
    return null;
  }
}

export async function getPreMatchedResults(
  requirementId: string
): Promise<PreMatchedResultItem[]> {
  try {
    const rows = await sql`
      SELECT
        am.id,
        am.requirement_id,
        am.researcher_id,
        r.name as researcher_name,
        r.faculty as researcher_faculty,
        r.role_key as researcher_role,
        r.avatar_initial as researcher_avatar_initial,
        r.avatar_color as researcher_avatar_color,
        am.funding_id,
        f.title as funding_title,
        f.code as funding_code,
        f.support_ratio as funding_support_ratio,
        f.max_budget as funding_max_budget,
        am.fit_score,
        am.score_breakdown,
        am.explanation,
        am.suggested_tags,
        am.is_selected
      FROM ai_match_results am
      JOIN researchers r ON r.id = am.researcher_id
      LEFT JOIN funding_programs f ON f.id = am.funding_id
      WHERE am.requirement_id = ${requirementId}
      ORDER BY am.fit_score DESC
    `;

    return rows.map((row) => ({
      id: row.id,
      requirementId: row.requirement_id,
      researcherId: row.researcher_id,
      researcherName: row.researcher_name,
      researcherFaculty: row.researcher_faculty,
      researcherRole: row.researcher_role || "researcher",
      researcherAvatarInitial: row.researcher_avatar_initial,
      researcherAvatarColor: row.researcher_avatar_color,
      fundingId: row.funding_id,
      fundingTitle: row.funding_title,
      fundingCode: row.funding_code,
      fundingSupportRatio: row.funding_support_ratio,
      fundingMaxBudget: Number(row.funding_max_budget) || 0,
      fitScore: Number(row.fit_score) || 0,
      scoreBreakdown: (row.score_breakdown as any) || {
        expertiseAlignment: 0.9,
        domainSynergy: 0.9,
        practicalFeasibility: 0.9,
      },
      explanation: row.explanation || "",
      suggestedTags: row.suggested_tags || [],
      isSelected: Boolean(row.is_selected),
    }));
  } catch (error) {
    console.error("getPreMatchedResults error:", error);
    return [];
  }
}
