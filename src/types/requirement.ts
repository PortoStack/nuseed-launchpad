export type RequirementStatus = "draft" | "tagged" | "need_review";

import type { MainCategoryId } from "@/lib/taxonomy";

export type NeedType =
  "product" | "solution" | "prototype" | "consulting" | "testing" | "reference";

export const NEED_TYPES: NeedType[] = [
  "product",
  "solution",
  "prototype",
  "consulting",
  "testing",
  "reference",
];

export interface ProblemStructure {
  problem?: string; // อาการ / ปัญหา
  object?: string; // วัตถุ / ผลิตภัณฑ์
  context?: string; // บริบท / สภาพแวดล้อม
  outcome?: string; // ผลลัพธ์ที่ต้องการ
  constraint?: string; // ข้อจำกัด / เงื่อนไข
}

export interface SuggestedTag {
  id: string;
  label: string;
  kind: "business" | "technical";
  confidence: number; // 0..1, keyword-match score
  source: "exact" | "related" | "new" | "rejected"; // "new" = pending proposal
  proposalId?: string;
  status?: "suggested" | "approved" | "rejected";
  catalogTagId?: string | null;
  accepted: boolean; // user accept/edit/remove state
}

export type TagCatalogStatus = "active" | "deprecated";
export type TagCatalogSource = "system" | "requirement_review";

export interface TagCatalogItem {
  deletedAt?: string | null;
  deletedBy?: string | null;
  id: string;
  label: string;
  kind: "business" | "technical";
  keywords: string[]; // matching triggers used by suggestTags()
  parentCategory?: string;
  mainCategoryId?: MainCategoryId;
  mainCategoryLabel?: string;
  isFlagship?: boolean;
  synonyms?: string[];
  excludedWords?: string[];
  exampleSentences?: string[];
  source?: TagCatalogSource;
  reviewerName?: string;
  status?: TagCatalogStatus; // undefined is treated as "active"
  createdAt?: string;
  updatedAt?: string;
}

export interface Requirement {
  deletedAt?: string | null;
  deletedBy?: string | null;
  id: string;
  title?: string;
  companyName?: string;
  province?: string;
  budget?: number;
  rawText: string;
  sourceChannel?: string; // LINE, โทรศัพท์, สัมมนา, แบบฟอร์ม, สัมภาษณ์
  entrepreneurName?: string;
  assignedResearcher?: string;
  targetProgram?: string;
  notes?: string;
  needTypes: NeedType[];
  structure?: ProblemStructure;
  tags: SuggestedTag[];
  status: RequirementStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateRequirementDTO {
  rawText: string;
  sourceChannel?: string;
  entrepreneurName?: string;
  needTypes: NeedType[];
  structure: ProblemStructure;
  tags: SuggestedTag[];
}

export type UpdateRequirementDTO = Partial<CreateRequirementDTO>;
