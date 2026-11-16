// ===== Project Lifecycle Status (ขั้นตอนโครงการ) =====
export type ProjectLifecycleStatus =
  | "draft" // ร่าง
  | "active" // ดำเนินการ
  | "completed" // เสร็จสิ้น
  | "cancelled"; // ยกเลิก

// ===== Project Health Status (สถานะสุขภาพโครงการ) =====
export type ProjectHealthStatus =
  | "on-track" // ปกติ
  | "at-risk" // เสี่ยง (= risk-of-delay เดิม)
  | "delayed" // ล่าช้า / off-track
  | "completed"; // เสร็จสิ้น

export type ProjectHealthStatusInput =
  | ProjectHealthStatus
  | "off-track"
  | "risk-of-delay"
  | "in-progress"
  | "in_progress"
  | "active"
  | string
  | null
  | undefined;

// ===== Task/Activity Status (สถานะงาน) =====
export type TaskStatus =
  | "pending" // รอดำเนินการ (= to-do เดิม)
  | "in_progress" // กำลังทำ
  | "submitted" // ส่งแล้ว
  | "approved" // อนุมัติ
  | "rejected" // ปฏิเสธ
  | "completed" // เสร็จสิ้น
  | "delayed" // ล่าช้า
  | "cancelled"; // ยกเลิก

// Ordered array for UI rendering
export const TASK_STATUS_ORDER: TaskStatus[] = [
  "pending",
  "in_progress",
  "submitted",
  "approved",
  "completed",
  "delayed",
  "rejected",
  "cancelled",
];

export const PROJECT_HEALTH_ORDER: ProjectHealthStatus[] = [
  "on-track",
  "at-risk",
  "delayed",
  "completed",
];

export const PROJECT_HEALTH_VARIANT: Record<
  ProjectHealthStatus,
  "success" | "warning" | "danger"
> = {
  "on-track": "success",
  completed: "success",
  "at-risk": "warning",
  delayed: "danger",
};

export const PROJECT_HEALTH_LABEL_KEY: Record<
  ProjectHealthStatus,
  "onTrack" | "atRisk" | "delayed" | "completed"
> = {
  "on-track": "onTrack",
  "at-risk": "atRisk",
  delayed: "delayed",
  completed: "completed",
};

export function normalizeProjectHealthStatus(
  status: ProjectHealthStatusInput
): ProjectHealthStatus {
  switch (status) {
    case "completed":
      return "completed";
    case "on-track":
      return "on-track";
    case "at-risk":
    case "risk-of-delay":
      return "at-risk";
    case "delayed":
    case "off-track":
      return "delayed";
    case "active":
    case "in-progress":
    case "in_progress":
      return "on-track";
    // Not started yet (a draft, or waiting for approval): nothing has slipped,
    // so it is not flagged as at risk.
    case "draft":
    case "pending":
    case "pending_approval":
    case "submitted":
      return "on-track";
    default:
      return "at-risk";
  }
}

export function normalizeProjectLifecycleStatus(
  status: string | null | undefined
): ProjectLifecycleStatus {
  switch (status) {
    case "draft":
    case "active":
    case "completed":
    case "cancelled":
      return status;
    // There is no approval step, so a project still waiting on one has not
    // started yet.
    case "pending":
    case "pending_approval":
    case "submitted":
      return "draft";
    case "in-progress":
    case "in_progress":
    case "on-track":
    case "at-risk":
    case "delayed":
    case "off-track":
    case "risk-of-delay":
      return "active";
    default:
      return "active";
  }
}
