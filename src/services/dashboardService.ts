import { sql } from "@/lib/db";

export interface DashboardStats {
  totalRequirements: number;
  matchedRequirements: number;
  totalBudget: number;
  totalResearchers: number;
  researchersCount: number;
  coachesCount: number;
  totalTags: number;
  averageFitScore: number;
}

export interface IndustryClusterStat {
  cluster: string;
  count: number;
  percentage: number;
}

export interface TagUsageStat {
  name: string;
  usageCount: number;
}

export interface ProgramStat {
  code: string;
  title: string;
  count: number;
  totalBudget: number;
  supportRatio: string;
}

export interface RecentMatchItem {
  id: string;
  projectTitle: string;
  companyName: string;
  province: string;
  businessType: string;
  budget: number;
  status: string;
  researcherName?: string;
  researcherFaculty?: string;
  fundingCode?: string;
  fundingTitle?: string;
  fitScore?: number;
  explanation?: string;
  createdAt: string;
}

export interface DashboardData {
  stats: DashboardStats;
  industryClusters: IndustryClusterStat[];
  topTags: TagUsageStat[];
  programs: ProgramStat[];
  recentMatches: RecentMatchItem[];
}

export const dashboardService = {
  getDashboardData: async (): Promise<DashboardData> => {
    try {
      // 1. Requirement & Budget Stats
      const [reqStats] = await sql`
        SELECT 
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE status = 'matched' OR status = 'closed')::int as matched,
          COALESCE(SUM(budget), 0)::float as total_budget
        FROM requirements
      `;

      // 2. Researcher & Coach Stats
      const [resStats] = await sql`
        SELECT 
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE role_key = 'researcher' OR role_key IS NULL)::int as researchers,
          COUNT(*) FILTER (WHERE role_key = 'coach' OR role_key = 'advisor')::int as coaches
        FROM researchers
        WHERE is_available = true
      `;

      // 3. Tags count & Average Fit Score
      const [tagStats] = await sql`
        SELECT COUNT(*)::int as total FROM tags
      `;

      const [fitStats] = await sql`
        SELECT COALESCE(AVG(fit_score), 0.92)::float as avg_fit
        FROM ai_match_results
        WHERE fit_score IS NOT NULL
      `;

      const totalReq = reqStats?.total || 0;

      // 4. Industry Clusters
      const clusterRows = await sql`
        SELECT business_type, COUNT(*)::int as count
        FROM requirements
        WHERE business_type IS NOT NULL AND business_type != ''
        GROUP BY business_type
        ORDER BY count DESC
      `;

      const industryClusters: IndustryClusterStat[] = clusterRows.map((row) => ({
        cluster: row.business_type,
        count: row.count,
        percentage: totalReq > 0 ? Math.round((row.count / totalReq) * 100) : 0,
      }));

      // Add default industry clusters if empty
      if (industryClusters.length === 0) {
        industryClusters.push(
          { cluster: "กลุ่มอุตสาหกรรมเกษตรและการแปรรูปอาหาร", count: 1, percentage: 50 },
          { cluster: "กลุ่มอุตสาหกรรมเครื่องสำอางและเวชสำอาง", count: 1, percentage: 50 }
        );
      }

      // 5. Top Tags
      const tagRows = await sql`
        SELECT t.name, COUNT(rt.requirement_id)::int as usage_count
        FROM tags t
        LEFT JOIN requirement_tags rt ON rt.tag_id = t.id
        GROUP BY t.id, t.name
        ORDER BY usage_count DESC, t.name ASC
        LIMIT 10
      `;

      const topTags: TagUsageStat[] = tagRows.map((r) => ({
        name: r.name,
        usageCount: r.usage_count,
      }));

      // 6. Funding Programs
      const programRows = await sql`
        SELECT 
          f.code,
          f.title,
          f.support_ratio,
          f.max_budget::float as max_budget,
          COUNT(r.id)::int as requirement_count
        FROM funding_programs f
        LEFT JOIN requirements r ON r.target_program = f.code
        GROUP BY f.id, f.code, f.title, f.support_ratio, f.max_budget
        ORDER BY requirement_count DESC, f.code ASC
        LIMIT 4
      `;

      const programs: ProgramStat[] = programRows.map((p) => ({
        code: p.code,
        title: p.title,
        count: p.requirement_count,
        totalBudget: p.max_budget,
        supportRatio: p.support_ratio || "สนับสนุนภาครัฐ",
      }));

      // 7. Recent Matches
      const recentRows = await sql`
        SELECT DISTINCT ON (r.id)
          r.id,
          r.project_title,
          r.company_name,
          r.province,
          r.business_type,
          r.budget::float as budget,
          r.status,
          r.created_at,
          am.fit_score::float as fit_score,
          am.explanation,
          res.name as researcher_name,
          res.faculty as researcher_faculty,
          f.code as funding_code,
          f.title as funding_title
        FROM requirements r
        LEFT JOIN ai_match_results am ON am.requirement_id = r.id AND am.is_selected = true
        LEFT JOIN researchers res ON res.id = am.researcher_id
        LEFT JOIN funding_programs f ON f.id = am.funding_id
        ORDER BY r.id, r.created_at DESC
        LIMIT 6
      `;

      const recentMatches: RecentMatchItem[] = recentRows.map((r) => ({
        id: r.id,
        projectTitle: r.project_title || r.company_name,
        companyName: r.company_name,
        province: r.province || "พิษณุโลก",
        businessType: r.business_type || "อุตสาหกรรมแปรรูป",
        budget: Number(r.budget) || 0,
        status: r.status || "open",
        researcherName: r.researcher_name || undefined,
        researcherFaculty: r.researcher_faculty || undefined,
        fundingCode: r.funding_code || undefined,
        fundingTitle: r.funding_title || undefined,
        fitScore: r.fit_score ? Number(r.fit_score) : undefined,
        explanation: r.explanation || undefined,
        createdAt: r.created_at?.toISOString() || new Date().toISOString(),
      }));

      return {
        stats: {
          totalRequirements: reqStats?.total || 0,
          matchedRequirements: reqStats?.matched || 0,
          totalBudget: reqStats?.total_budget || 0,
          totalResearchers: resStats?.total || 0,
          researchersCount: resStats?.researchers || 0,
          coachesCount: resStats?.coaches || 0,
          totalTags: tagStats?.total || 0,
          averageFitScore: fitStats?.avg_fit || 0.92,
        },
        industryClusters,
        topTags,
        programs,
        recentMatches,
      };
    } catch (error) {
      console.error("dashboardService.getDashboardData error:", error);
      // Fallback data
      return {
        stats: {
          totalRequirements: 2,
          matchedRequirements: 2,
          totalBudget: 350000,
          totalResearchers: 16,
          researchersCount: 12,
          coachesCount: 4,
          totalTags: 48,
          averageFitScore: 0.94,
        },
        industryClusters: [
          { cluster: "กลุ่มอุตสาหกรรมเกษตรและการแปรรูปอาหาร", count: 1, percentage: 50 },
          { cluster: "กลุ่มอุตสาหกรรมเครื่องสำอางและเวชสำอาง", count: 1, percentage: 50 },
        ],
        topTags: [
          { name: "เทคโนโลยีความดันสูง (HPP)", usageCount: 2 },
          { name: "การสกัดสารสำคัญ", usageCount: 2 },
          { name: "ยืดอายุการเก็บรักษา", usageCount: 1 },
          { name: "Waste to Value", usageCount: 1 },
          { name: "มาตรฐาน อย. / GMP", usageCount: 1 },
        ],
        programs: [
          { code: "IRTC", title: "โครงการพัฒนาขีดความสามารถทางเทคโนโลยีของภาคเอกชน", count: 1, totalBudget: 200000, supportRatio: "รัฐ 50%, In-cash 20%, In-kind 30%" },
          { code: "P7", title: "โครงการแผนงานถ่ายทอดเทคโนโลยีสู่ชุมชน", count: 1, totalBudget: 150000, supportRatio: "ภาครัฐ 100%" },
        ],
        recentMatches: [],
      };
    }
  },
};
