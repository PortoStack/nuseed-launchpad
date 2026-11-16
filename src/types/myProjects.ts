import { ProjectHealthStatus, TaskStatus } from "./status";
import type { MainCategoryId } from "@/lib/taxonomy";

export type MyProjectStatus = ProjectHealthStatus;
export type PeopleProjectStatus = ProjectHealthStatus;
export type { TaskStatus };

export const MY_PROJECT_STATUSES: MyProjectStatus[] = [
  "on-track",
  "at-risk",
  "delayed",
  "completed",
];
export const PEOPLE_PROJECT_STATUSES = MY_PROJECT_STATUSES;

export type ProjectMemberRole =
  | "owner"
  | "coordinator"
  | "member"
  | "entrepreneur"
  | "student"
  | "external_contributor"
  | "viewer";

export const PROJECT_MEMBER_ROLES: ProjectMemberRole[] = [
  "owner",
  "member",
  "entrepreneur",
  "student",
  "external_contributor",
  // Historical roster values remain readable; new choices use account eligibility.
  "coordinator",
  "viewer",
];

export interface TopicTag {
  id: string;
  label: string;
  count: number;
  mainCategoryId?: MainCategoryId;
  mainCategoryLabel?: string;
  isFlagship?: boolean;
}

export interface ProjectListItem {
  id: string;
  code: string;
  title: string;
  tags: string[];
  status: ProjectHealthStatus;
  progressPercent: number;
  progress?: number;
  budgetTHB: number;
  periodLabel: string;
  researcherInitials: string[];
  researcherCount: number;
  type?: "bi" | "ti" | null;
  userRole?: ProjectMemberRole | string;
  userRoleLabel?: string;
  lead?: { id: string; name: string; avatarUrl: string | null } | null;
  workPlan?: { id: string; code: string; name: string } | null;
  archivedAt?: string | null;
  updatedAt?: string;
  lifecycleStatus?: "draft" | "active" | "completed" | "cancelled";
  healthStatus?: ProjectHealthStatus;
  ownerId?: string;
  version?: number;
  period?: { startDate: string | null; endDate: string | null };
}

export interface ProjectTeamMember {
  id: string;
  personId: string | null;
  memberOrder: number;
  role: ProjectMemberRole;
  academicRole?: string | null;
  tags?: string[];
  relatedProjectCount?: number;
  isCurrentUser?: boolean;
  name: string;
  email: string | null;
  phone: string | null;
  affiliation: string | null;
  avatarUrl: string | null;
}

export interface ProjectTeam {
  projectId: string;
  projectTitle: string;
  lead: ProjectTeamMember | null;
  members: ProjectTeamMember[];
}

export interface TaskAssignee {
  id: string;
  personId?: string | null;
  name: string;
  avatarUrl?: string | null;
  role: ProjectMemberRole;
  status: TaskStatus;
  assignedRole?: string;
  isCurrentUser?: boolean;
}

export interface ProjectSubTask {
  cancelReason?: string;
  id: string;
  activityId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string;
  assignees: TaskAssignee[];
}

export interface ProjectActivityDetail {
  cancelReason?: string;
  id: string;
  projectId: string;
  code: string;
  title: string;
  description?: string;
  status: TaskStatus;
  progress: number;
  startDate?: string | null;
  endDate?: string | null;
  dependencies?: string[];
  version?: number;
  subTasks: ProjectSubTask[];
  teamMembers: TaskAssignee[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAssignmentDTO {
  projectId: string;
  activityId: string;
  subTaskId?: string;
  newSubTaskTitle?: string;
  memberIds: string[];
  assignedRole: string;
  dueDate?: string;
  initialStatus: TaskStatus;
  notes?: string;
}
