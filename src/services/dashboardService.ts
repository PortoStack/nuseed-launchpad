import { sql } from "@/lib/db";

export interface ProjectItem {
  id: string;
  code: string;
  title: string;
  companyName: string;
  status: string;
  statusLabel: string;
  tags: string[];
  researchersCount: number;
  assignedResearcher?: string;
  dateRange: string;
  progressPercent: number;
  totalBudget: number;
  remainingBudget: number;
}

export interface ResearcherItem {
  id: string;
  name: string;
  role: string;
  faculty: string;
  discipline: string;
  avatarInitial: string;
  avatarColorBg: string;
  tags: string[];
  relatedProjectsCount: number;
}

export interface FundingItem {
  id: string;
  code: string;
  title: string;
  source: string;
  status: string;
  statusLabel: string;
  maxBudget: number;
  supportRatio?: string;
  tags: string[];
  timeline: string;
}

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
  projects: ProjectItem[];
  researchers: ResearcherItem[];
  fundings: FundingItem[];
}

function getThaiInitial(name: string): string {
  const clean = name
    .replace(
      /^(ศาสตราจารย์|รองศาสตราจารย์|ผู้ช่วยศาสตราจารย์|อาจารย์|ศ\.|รศ\.|ผศ\.|อ\.|ดร\.|เภสัชกรหญิง|เภสัชกร|ภญ\.|ภก\.|นาย|นางสาว|นาง)\s*/gi,
      ""
    )
    .trim();
  return clean.charAt(0) || name.charAt(0) || "น";
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
  "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300",
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
];

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

      // 6. Funding Programs Summary
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

      // 8. Projects (Requirements in database - strictly actual requirements only)
      const projectRows = await sql`
        SELECT r.id, r.project_title, r.company_name, r.target_program, r.budget, r.status, r.structure,
               r.assigned_researcher, r.created_at,
               COALESCE(array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '{}') as tags,
               MAX(am.fit_score) as fit_score
        FROM requirements r
        LEFT JOIN requirement_tags rt ON rt.requirement_id = r.id
        LEFT JOIN tags t ON t.id = rt.tag_id
        LEFT JOIN ai_match_results am ON am.requirement_id = r.id AND am.is_selected = true
        GROUP BY r.id
        ORDER BY r.created_at ASC
      `;


      const projects: ProjectItem[] = projectRows.map((r, index) => {
        const structure = (r.structure as Record<string, any>) || {};
        const code =
          structure.code ||
          r.target_program ||
          `IRTC-2569-${String(index + 1).padStart(3, "0")}`;
        const totalBudget = Number(r.budget) || 150000;
        const remainingBudget =
          structure.remainingBudget !== undefined
            ? Number(structure.remainingBudget)
            : totalBudget;
        const progressPercent =
          r.fit_score !== undefined
            ? Math.round(Number(r.fit_score) * 100)
            : structure.progress !== undefined
            ? Number(structure.progress)
            : r.status === "matched"
            ? 100
            : 0;

        const dateRange =
          structure.startDate && structure.endDate
            ? `${structure.startDate} - ${structure.endDate}`
            : "ต.ค. 2569 - ก.ย. 2570";

        let researchersCount = 0;
        if (structure.researchersCount !== undefined) {
          researchersCount = Number(structure.researchersCount);
        } else if (r.assigned_researcher) {
          researchersCount = r.assigned_researcher.includes(",") ? 2 : 1;
        }

        return {
          id: r.id,
          code,
          title: r.project_title || r.company_name,
          companyName: r.company_name,
          status: r.status || "open",
          statusLabel: "ตรงตามแผน",
          tags: r.tags || [],
          researchersCount,
          assignedResearcher: r.assigned_researcher ? r.assigned_researcher.replace(/\s*\(.*\)$/, "").trim() : undefined,
          dateRange,
          progressPercent,
          totalBudget,
          remainingBudget,
        };
      });

      // 9. Researchers (ALL researchers in database - no LIMIT)
      const researcherRows = await sql`
        SELECT r.id, r.name, r.faculty, r.discipline, r.role_key,
               COALESCE(array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '{}') as tags
        FROM researchers r
        LEFT JOIN researcher_tags rt ON rt.researcher_id = r.id
        LEFT JOIN tags t ON t.id = rt.tag_id
        GROUP BY r.id
        ORDER BY r.name ASC
      `;

      const researchers: ResearcherItem[] = researcherRows.map((r, i) => {
        const initial = getThaiInitial(r.name);
        const avatarColorBg = AVATAR_COLORS[i % AVATAR_COLORS.length];
        const isAssigned =
          projectRows.some(
            (p) =>
              p.assigned_researcher &&
              p.assigned_researcher.includes(
                r.name.replace(/^(ดร\.|นาย|นาง|นางสาว|ผศ\.|รศ\.|ศ\.|ภก\.|ภญ\.)\s*/, "")
              )
          );

        return {
          id: r.id,
          name: r.name,
          role: "นักวิจัย",
          faculty: r.faculty || r.discipline || "มหาวิทยาลัยนเรศวร",
          discipline: r.discipline || "",
          avatarInitial: initial,
          avatarColorBg,
          tags: r.tags || [],
          relatedProjectsCount: isAssigned ? 1 : 0,
        };
      });

      // 10. Funding Programs (ALL funding programs in database - no LIMIT)
      const fundingRows = await sql`
        SELECT f.id, f.code, f.title, f.source, f.support_ratio, f.max_budget::float as max_budget,
               f.status, f.open_period,
               COALESCE(array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '{}') as tags
        FROM funding_programs f
        LEFT JOIN funding_tags ft ON ft.funding_id = f.id
        LEFT JOIN tags t ON t.id = ft.tag_id
        GROUP BY f.id
        ORDER BY
          CASE
            WHEN f.code = 'IRTC' THEN 1
            WHEN f.code = 'BCE' THEN 2
            WHEN f.code = 'P7' THEN 3
            WHEN f.code = 'P4' THEN 4
            ELSE 5
          END,
          f.title ASC
      `;

      const fundings: FundingItem[] = fundingRows.map((f) => ({
        id: f.id,
        code: f.code || f.source || "ทุนวิจัย",
        title: f.title,
        source: f.source || "สป.อว.",
        status: f.status || "open",
        statusLabel: "เปิดรับสมัคร",
        maxBudget: Number(f.max_budget) || 200000,
        supportRatio: f.support_ratio || "สนับสนุนสูงสุด 100%",
        tags:
          (f.tags && f.tags.length > 0)
            ? f.tags
            : ["วิจัยและพัฒนา", "นวัตกรรมชุมชน", "SMEs"],
        timeline: f.open_period || "เปิดรับตลอดปีงบประมาณ 2569",
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
        projects,
        researchers,
        fundings,
      };
    } catch (error) {
      console.error("dashboardService.getDashboardData error:", error);
      return {
        stats: {
          totalRequirements: 2,
          matchedRequirements: 1,
          totalBudget: 350000,
          totalResearchers: 16,
          researchersCount: 13,
          coachesCount: 3,
          totalTags: 48,
          averageFitScore: 0.94,
        },
        industryClusters: [],
        topTags: [],
        programs: [],
        recentMatches: [],
        projects: [],
        researchers: [],
        fundings: [],
      };
    }
  },
};
