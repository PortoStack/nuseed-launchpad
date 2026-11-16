import type { Person } from "@/types/people";
import type { Researcher } from "@/types/overview";

export function personToResearcher(person: Person, locale = "th"): Researcher {
  const name =
    locale === "en"
      ? person.displayNameEn || person.displayName
      : person.displayNameTh || person.displayName;

  const rawTags = person.tags || [];
  const tags = rawTags.map((t) => (typeof t === "string" ? t : t.name));

  return {
    id: person.id,
    name: name || "ไม่ระบุชื่อ",
    role: person.specialty || person.faculty || "นักวิจัย",
    roleKey: (person.roles?.[0] as any) || "researcher",
    roles: person.roles || ["researcher"],
    tags: tags,
    relatedProjectCount: person.relatedProjectCount || 0,
    avatarInitial: name ? name.slice(0, 2) : "นว",
    avatarColor: "bg-primary/10 text-primary",
    avatarUrl: person.avatarUrl || null,
    faculty: person.faculty || null,
    department: null,
    about: person.about || "",
    isAvailable: true,
  };
}
