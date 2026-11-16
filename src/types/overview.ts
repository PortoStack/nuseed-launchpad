import { ProjectHealthStatus } from "./status";
import type { MainCategoryId } from "@/lib/taxonomy";
import type { CompanyDetail, Expertise, UserRole } from "./user";
export type ProjectStatus = ProjectHealthStatus;

export interface TopicTag {
  id: string;
  label: string;
  count: number;
  mainCategoryId?: MainCategoryId;
  mainCategoryLabel?: string;
  isFlagship?: boolean;
}

export interface Project {
  id: string;
  code: string;
  title: string;
  tags: string[];
  status: ProjectHealthStatus;
  progressPercent: number;
  budgetTHB: number;
  remainingTHB?: number;
  periodLabel: string;
  researcherInitials: string[];
  researcherCount: number;
  lead?: { id: string; name: string; avatarUrl: string | null } | null;
  updatedAt?: string;
  isMyProject?: boolean;
  overviewCard?: {
    version: 1;
    progressPercent: number;
    budget: {
      budgetTHB: number;
      remainingTHB: number;
    } | null;
    team: {
      researcherCount: number;
      researcherInitials: string[];
      lead: { id: string; name: string; avatarUrl: string | null } | null;
    } | null;
  };
}

export interface ResearcherEducation {
  degree: string;
  institution: string;
  faculty?: string;
  institutionEn?: string;
  facultyEn?: string;
  year?: number;
}

export interface ResearcherContact {
  address?: string;
  phones?: string[];
  emails?: string[];
}

export interface Researcher {
  id: string;
  name: string;
  nameTh?: string;
  nameEn?: string;
  role: string;
  roleKey?: UserRole;
  roles?: string[];
  tags: string[];
  relatedProjectCount: number;
  avatarInitial: string;
  avatarColor: string;
  avatarUrl?: string | null;
  faculty?: string | null;
  department?: string | null;
  about?: string;
  education?: ResearcherEducation[];
  contact?: ResearcherContact;
  company?: CompanyDetail;
  expertise?: Expertise[];
  isAvailable?: boolean;
  availabilityNote?: string;
  relatedRequirementIds?: string[];
}

export interface ResearchPaper {
  id: string;
  title: string;
  author: string;
  authorId?: string;
  year: string;
  tags: string[];
  journalName?: string | null;
  url?: string | null;
}

export interface OverviewData {
  projects: Project[];
  researchers: Researcher[];
  papers: ResearchPaper[];
  topicTags: TopicTag[];
  statusCounts: Record<ProjectHealthStatus, number>;
}

// Spec v2.1 Section 3 Contracts
export interface BackendProjectCard {
  id: string;
  code: string;
  title: string;
  type?: "bi" | "ti" | null;
  status: string;
  lifecycleStatus?: string;
  healthStatus?: string;
  progress: number;
  lead?: { id: string; name: string; avatarUrl: string | null } | null;
  tags: { id: string; name: string }[] | string[];
  updatedAt?: string;
  budgetTHB?: number;
  remainingTHB?: number;
  periodLabel?: string;
  researcherInitials?: string[];
  researcherCount?: number;
  overviewCard?: {
    version: 1;
    progressPercent: number;
    budget: {
      budgetTHB: number;
      remainingTHB: number;
    } | null;
    team: {
      researcherCount: number;
      researcherInitials: string[];
      lead: {
        id: string;
        name?: string;
        displayName?: string;
        avatarUrl: string | null;
      } | null;
    } | null;
  };
}

export interface BackendPeopleCard {
  id: string;
  displayName: string;
  displayNameTh?: string;
  displayNameEn?: string;
  avatarUrl?: string | null;
  faculty?: string | null;
  primaryExpertise?: string | null;
  specialty?: string | null;
  /** System roles; matching offers only researchers, and coaches separately. */
  roles?: string[];
  tags: { id: string; name: string }[] | string[];
  relatedProjectCount?: number;
}

export interface BackendPublicationRow {
  id: string;
  title: string;
  year?: number | string | null;
  publicationYear?: number | null;
  journalName?: string | null;
  researcherName?: string;
  author?: string;
  url?: string | null;
  tags?: { id: string; name: string }[] | string[];
}

export interface BackendOverviewResponse {
  projects: {
    total: number;
    items: BackendProjectCard[];
  };
  people: {
    total: number;
    items: BackendPeopleCard[];
  };
  publications: {
    total: number;
    items: BackendPublicationRow[];
  };
}

// ─── Overview query (spec §3.1 #10) ─────────────────────────────────────────

export type OverviewScope = "all" | "project" | "researcher" | "paper";

/**
 * Query for `GET /dashboard/overview`, mirroring the params spec #10 accepts:
 * `q, scope, tagIds[], healthStatuses[], sort, page, pageSize, limitPerGroup`.
 *
 * `sort` holds the *frontend* enum (`title-asc`, `progress-desc`, …); the
 * service converts it to wire params.
 */
export interface OverviewQuery {
  q?: string;
  scope?: OverviewScope;
  tagIds?: string[];
  healthStatuses?: ProjectStatus[];
  sort?: string;
  page?: number;
  pageSize?: number;
  limitPerGroup?: number;
}

/** Totals for the *whole* filtered set, before paging or per-group limiting. */
export interface OverviewGroupCounts {
  projects: number;
  researchers: number;
  papers: number;
}

export type OverviewResult = OverviewData & {
  counts: OverviewGroupCounts;
};
