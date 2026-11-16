import type { AccessContext } from "@/types/access-control";
import type { EntrepreneurType } from "@/types/entrepreneur";

export const ACCOUNT_ROLES = [
  "executive",
  "bi_head",
  "ti_head",
  "ti_staff",
  "bi_staff",
  "researcher",
  "entrepreneur",
  "student",
  "external",
  "system_admin",
] as const;
export type AccountRole = (typeof ACCOUNT_ROLES)[number];

// ---------------------------------------------------------------------------
// User types — aligned with spec v3.1 §2.2 + BI/TI matching extensions
// ---------------------------------------------------------------------------

/**
 * The RBAC V1 §2.1 roles, plus `admin` (system superuser, outside the spec)
 * and `guest` (the zero-permission fallback below).
 *
 * A runtime list, not a bare union: the permission layer keys its tables on
 * these, so every role it must answer for has to be enumerable at runtime.
 * `staff` covers the spec's single "BO / Staff" role.
 */
export const USER_ROLES = [
  "executive",
  "head",
  "pm",
  "researcher",
  "entrepreneur",
  "coach", // Legacy account value; new accounts use external.
  "external",
  "student",
  "staff",
  "admin",
  "guest",
] as const;

/**
 * Canonical lowercase roles from the API.
 * The backend may return PascalCase — use `normalizeRole()` before comparing.
 */
export type UserRole = (typeof USER_ROLES)[number];

/** Roles the backend may still send that collapsed into a canonical one. */
const ROLE_ALIASES: Record<string, UserRole> = {
  system_admin: "admin",
  company: "entrepreneur",
  advisor: "coach",
  adviser: "coach",
  bo: "staff",
  // The people directory sends the stored role names; /auth/me already
  // folds them into these.
  ti_staff: "staff",
  bi_staff: "staff",
  ti_head: "head",
  bi_head: "head",
  project_manager: "pm",
};

/**
 * Convert any casing of a role string to the canonical lowercase `UserRole`.
 * Call this on every role value received from an API response.
 *
 * An unrecognised role becomes `guest`, which carries no permissions — spec
 * §2.3 deny by default. Casting instead would let an unmapped backend role
 * reach the permission tables typed as a role that has rights.
 */
export function normalizeRole(raw: string): UserRole {
  const value = raw.trim().toLowerCase();
  if ((USER_ROLES as readonly string[]).includes(value)) {
    return value as UserRole;
  }
  const alias = ROLE_ALIASES[value];
  if (alias) {
    return alias;
  }
  if (process.env.NODE_ENV !== "production") {
    console.warn(`normalizeRole: unrecognised role "${raw}", treated as guest`);
  }
  return "guest";
}

// ─── SKU / Product ──────────────────────────────────────────────────────────

export interface SKUItem {
  id: string;
  name: string;
  category?: string;
  description?: string;
}

// ─── Company Detail ─────────────────────────────────────────────────────────

export interface CompanyDetail {
  companyName: string;
  entrepreneurType?: EntrepreneurType;
  registeredCapital?: number;
  productsServices?: string;
  registrationNumber?: string;
  businessType?: string;
  address?: string;
  contactPerson?: string;
  skus: SKUItem[];
}

// ─── Expertise ──────────────────────────────────────────────────────────────

export interface Expertise {
  id: string;
  label: string;
  /** "business" for BI domain, "technical" for TI domain */
  domain: "business" | "technical";
}

// ─── Participation History ──────────────────────────────────────────────────

export type ParticipationRole =
  "lead" | "researcher" | "coach" | "advisor" | "entrepreneur" | "member";

export interface ParticipationRecord {
  projectId: string;
  projectTitle: string;
  role: ParticipationRole;
  budgetReceived?: number;
  outcome?: string;
  startDate: string;
  endDate?: string;
}

// ─── Core profile interfaces ────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  username?: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  firstNameTh?: string;
  lastNameTh?: string;
  displayNameTh?: string;
  firstNameEn?: string;
  lastNameEn?: string;
  displayNameEn?: string;
  role: UserRole;
  roles: UserRole[];
  avatarUrl?: string;
  /** Department scope key — a Head sees only their own (spec §2.3). */
  department?: string;
}

export interface Education {
  degree: string;
  institution: string;
  faculty?: string;
  /** Optional English text; the existing fields remain the legacy/Thai fallback. */
  institutionEn?: string;
  facultyEn?: string;
  year?: number;
}

export interface ContactInfo {
  address?: string;
  phones?: string[];
  emails?: string[];
}

export interface UserProfileDetail extends UserProfile {
  titlePrefix?: string;
  titlePrefixTh?: string;
  titlePrefixEn?: string;
  about?: string;
  phone?: string;
  education?: Education[];
  contact?: ContactInfo;
  tags?: string[];
  /** Company information — populated when role is "entrepreneur" */
  company?: CompanyDetail;
  /** Domain expertise areas */
  expertise?: Expertise[];
  /** Historical record of project participation */
  participationHistory?: ParticipationRecord[];
}

/**
 * The authenticated identity returned by `/auth/me`.
 *
 * `role` and `roles` remain only as a compatibility view for routes that have
 * not migrated from RBAC V1. New authorization must use `accessContext`.
 */
export interface CurrentUser extends UserProfileDetail {
  accessContext: AccessContext | null;
}
