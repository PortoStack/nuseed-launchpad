import type { UserProfileDetail } from "./user";

export * from "./myProjects";

export interface PersonRef {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface TagRef {
  id: string;
  name: string;
}

export interface TagWithCount extends TagRef {
  count: number;
  mainCategoryId?: string;
  mainCategoryLabel?: string;
  isFlagship?: boolean;
}

export interface Person extends Pick<
  UserProfileDetail,
  "about" | "education" | "contact" | "company" | "expertise" | "phone"
> {
  email?: string;
  id: string;
  displayName: string;
  displayNameTh?: string;
  displayNameEn?: string;
  avatarUrl: string | null;
  faculty: string | null;
  specialty: string | null;
  roles: string[];
  /** Stored account identities, before display-role normalization. */
  accountRoles?: string[];
  tags: TagRef[];
  relatedProjectCount?: number;
  advisorUserId?: string;
}

export interface ResearcherSuggestion {
  id: string;
  initials: string;
  name: string;
  nameTh?: string;
  nameEn?: string;
  department: string;
  specialty: string;
  matchPercent: number;
}
