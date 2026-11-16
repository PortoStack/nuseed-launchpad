export type FundingType = "grant" | "matching" | "loan" | "other";
export type FundingSourceType = "internal" | "external";

export const FUNDING_TYPES: FundingType[] = [
  "grant",
  "matching",
  "loan",
  "other",
];

export const FUNDING_SOURCE_TYPES: FundingSourceType[] = [
  "internal",
  "external",
];

export type FundingStatus = "upcoming" | "open" | "closed" | "inactive";

export interface FundingEligibility {
  criteria: string[]; // คุณสมบัติผู้สมัคร
  projectTypes: string[]; // ประเภท Project ที่รับ
  restrictions?: string; // ข้อจำกัดที่ต้องผ่าน
}

export interface FundingFinancialRules {
  budgetTHB: number;
  fundingRatioPercent: number; // สัดส่วนทุนที่แหล่งทุนออกให้ (0-100)
  privateCofundingRequired: boolean;
  privateCofundingAmountTHB?: number;
  /** Preserve the backend's detailed condition when editing other fields. */
  coFundingCondition?: string;
  reimbursableExpenses: string[];
  matchingAllocation?: FundingMatchingAllocation;
}

export type FundingContributionMode = "percent" | "amount";

export interface FundingContribution {
  inputMode: FundingContributionMode;
  value: number;
  amountTHB: number;
  ratioPercent: number;
}

export interface FundingPrivateContribution extends FundingContribution {
  agency: string;
}

/** The total includes both owner and private shares; budgetTHB remains the owner cap. */
export interface FundingMatchingAllocation {
  totalAmountTHB: number;
  owner: FundingContribution;
  privateContributions: FundingPrivateContribution[];
}

export interface FundingMilestone {
  label: string;
  date: string; // ISO date
  description?: string;
}

export interface FundingTimeline {
  openDate: string; // ISO date
  closeDate: string; // ISO date
  closingSoonStartDate?: string;
  milestones: FundingMilestone[];
}

export interface FundingTagRef {
  id: string;
  name: string;
}

export interface Funding {
  /** Absent on older APIs means active. */
  isActive?: boolean;
  id: string;
  name: string;
  title?: string;
  objective?: string;
  agency: string; // หน่วยงานเจ้าของทุน
  sourceName?: string;
  type?: FundingType;
  sourceType?: FundingSourceType;
  referenceUrl?: string;
  eligibility?: FundingEligibility;
  financialRules: FundingFinancialRules;
  timeline: FundingTimeline;
  tags: string[];
  /** Original API IDs aligned with the display labels, used when editing. */
  tagIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFundingDTO {
  name: string;
  agency: string;
  type: FundingType;
  sourceType: FundingSourceType;
  referenceUrl?: string;
  eligibility: FundingEligibility;
  financialRules: FundingFinancialRules;
  timeline: FundingTimeline;
  tags: (string | FundingTagRef)[];
}

/** Persisted references returned when funding deletion is blocked. */
export interface FundingReference {
  id: string;
  name: string;
  deleted: boolean;
}

export interface FundingUsageDetails {
  projects: FundingReference[];
  deals: FundingReference[];
}
