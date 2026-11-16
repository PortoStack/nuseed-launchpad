import type { CurrentUser } from "@/types/user";

/** Choose default destination for signed-in user */
export function landingPathForUser(user: CurrentUser, lang: string): string {
  return `/${lang}/matching`;
}

/** Preserve a requested page or fallback to default */
export function postLoginPathForUser(
  user: CurrentUser,
  lang: string,
  returnTo: string | null
): string {
  if (returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return landingPathForUser(user, lang);
}
