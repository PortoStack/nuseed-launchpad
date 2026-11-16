export const ENTREPRENEUR_TYPES = [
  "limited_company",
  "community_enterprise",
  "limited_partnership",
] as const;

export type EntrepreneurType = (typeof ENTREPRENEUR_TYPES)[number];
