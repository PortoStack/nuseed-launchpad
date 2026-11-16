export type DealStatus =
  | "new"
  | "screened"
  | "contacting_researcher"
  | "proposing_funding"
  | "awaiting_decision"
  | "approved"
  | "closed_lost";

export const DEAL_STATUSES: DealStatus[] = [
  "new",
  "screened",
  "contacting_researcher",
  "proposing_funding",
  "awaiting_decision",
  "approved",
  "closed_lost",
];

export type DealPriority = "low" | "medium" | "high";

export const DEAL_PRIORITIES: DealPriority[] = ["low", "medium", "high"];

export interface DealActivityLogEntry {
  id: string;
  timestamp: string; // ISO
  channel: string; // free text: โทรศัพท์, อีเมล, LINE, นัดพบ, ...
  outcome: string; // free text summary
}

export type DealDecisionReason =
  "won" | "rejected" | "on_hold" | "insufficient_info";

export const DEAL_DECISION_REASONS: DealDecisionReason[] = [
  "won",
  "rejected",
  "on_hold",
  "insufficient_info",
];

export interface DealDecision {
  reason: DealDecisionReason;
  note?: string;
  decidedAt: string; // ISO
}

export interface Deal {
  deletedAt?: string | null;
  deletedBy?: string | null;
  id: string;
  requirementId: string;
  researcherId?: string;
  fundingId?: string;
  status: DealStatus;
  ownerId: string;
  ownerName: string;
  priority: DealPriority;
  nextFollowUpDate?: string; // ISO date
  activityLog: DealActivityLogEntry[];
  decision?: DealDecision;
  linkedProjectId?: string;
  linkedProjectCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDealDTO {
  requirementId: string;
  researcherId?: string;
  fundingId?: string;
  ownerId: string;
  ownerName: string;
  priority: DealPriority;
  nextFollowUpDate?: string;
}
