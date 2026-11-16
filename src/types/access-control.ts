export const SYSTEM_ROLES = [
  // Super admin: every feature and action, on every project (V1 `admin`).
  "system_admin",
  // Runs every project, TI and BI: lists, edits and deletes any of them
  // (V1 `pm`). No People Management or audit.
  "project_admin",
  "executive",
  "department_head",
  "support_staff",
] as const;

export type SystemRole = (typeof SYSTEM_ROLES)[number];

export const PROJECT_ROLES = [
  "project_manager",
  "researcher",
  "entrepreneur",
  "coach",
  "student",
] as const;

export type ProjectRole = (typeof PROJECT_ROLES)[number];

export const PERMISSION_ACTIONS = [
  "view",
  "create",
  "edit",
  "submit",
  "approve",
  "manage",
  "export",
  "delegate",
] as const;

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export const PERMISSION_FEATURES = [
  "dashboard.portfolio",
  "dashboard.executive",
  "dashboard.myProjects",
  "project.setup",
  "project.detail",
  "project.team",
  "task.status",
  "project.activity",
  "project.progress",
  "budget",
  "document",
  "approval",
  "calendar",
  "people",
  "peopleManagement",
  "matching",
  "requirement",
  "funding",
  "dealPipeline",
  "tag.catalog",
  "tag.reviewQueue",
  "audit",
  "alert",
] as const;

export type PermissionFeature = (typeof PERMISSION_FEATURES)[number];

export type WorkflowState =
  | "draft"
  | "in_progress"
  | "submitted"
  | "under_review"
  | "approved"
  | "returned"
  | "rejected"
  | "closed";

export type AssignmentStatus = "active" | "suspended" | "revoked";

export type ScopeBinding =
  | { level: "global" }
  | { level: "department"; departmentId: string }
  | { level: "project"; projectId: string }
  | { level: "task"; taskId: string; projectId: string }
  | { level: "personal"; userId: string }
  | {
      level: "field";
      entityType: string;
      entityId: string;
      fields: readonly string[];
    }
  | { level: "document"; documentId: string };

export interface GrantValidity {
  status: AssignmentStatus;
  effectiveFrom: string;
  effectiveUntil?: string;
}

export interface SystemRoleAssignment extends GrantValidity {
  id: string;
  userId: string;
  role: SystemRole;
  features: readonly PermissionFeature[];
  scope: ScopeBinding;
  queueIds?: readonly string[];
  source: string;
  revision: number;
}

export interface ProjectMembership extends GrantValidity {
  id: string;
  userId: string;
  projectId: string;
  roles: readonly ProjectRole[];
  source: string;
  revision: number;
}

export interface Delegation extends GrantValidity {
  id: string;
  grantorUserId: string;
  granteeUserId: string;
  actions: readonly PermissionAction[];
  feature: PermissionFeature;
  scope: ScopeBinding;
  reason: string;
  approvedByUserId: string;
  revision: number;
}

export interface AccessContext {
  actorUserId: string;
  /** Actual account identities; historical project grants cannot widen them. */
  accountRoles?: readonly string[];
  systemRoleAssignments: readonly SystemRoleAssignment[];
  projectMemberships: readonly ProjectMembership[];
  delegations: readonly Delegation[];
  policyVersion: "TIBI-RBAC-V2";
}

export type PermissionDeniedReason =
  | "ACTOR_CONTEXT_MISMATCH"
  | "NO_MATCHING_GRANT"
  | "SELF_APPROVAL_DENIED"
  | "WORKFLOW_STATE_DENIED"
  | "SENSITIVITY_DENIED";

export interface PermissionResource {
  /** Server-verified former participation or completed-project read access. */
  readOnly?: boolean;
  departmentId?: string;
  projectId?: string;
  taskId?: string;
  ownerUserId?: string;
  assigneeUserId?: string;
  createdByUserId?: string;
  documentId?: string;
  entityType?: string;
  entityId?: string;
  requestedFields?: readonly string[];
  classification?: "standard" | "restricted";
}

export interface PermissionRequest {
  actorUserId: string;
  feature: PermissionFeature;
  action: PermissionAction;
  resource: PermissionResource;
  workflowState?: WorkflowState;
  evaluatedAt: string;
}

export type PermissionDecision =
  | {
      allowed: false;
      reason: PermissionDeniedReason;
      policyVersion: "TIBI-RBAC-V2";
    }
  | {
      allowed: true;
      matchedGrantIds: readonly string[];
      effectiveScopes: readonly ScopeBinding[];
      policyVersion: "TIBI-RBAC-V2";
    };
