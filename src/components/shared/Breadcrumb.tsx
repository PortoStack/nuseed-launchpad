"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

// Top-level segments whose page only redirects to the next crumb (or back to
// My Projects). Linking them would lead nowhere new, so they render as text.
const REDIRECT_ONLY_SEGMENTS = new Set(["projects", "ti", "bi", "requirements"]);

const UUID_SEGMENT =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// URL segments that name a page, mapped to the menu's own labels (or a
// breadcrumb label for segments the menu has no item for), so the crumbs
// read in the page's language instead of the raw path.
const SEGMENT_LABEL_KEY: Record<string, string> = {
  dashboard: "items.dashboard",
  overview: "items.overview",
  "executive-dashboard": "items.executiveDashboard",
  calendar: "items.calendar",
  people: "items.people",
  requirement: "items.requirement",
  requirements: "items.requirement",
  funding: "items.funding",
  matching: "items.matching",
  "deal-pipeline": "items.dealPipeline",
  "tag-review": "items.tagReview",
  "tag-catalog": "items.tagCatalog",
  myproject: "items.myProject",
  ti: "items.tiProjects",
  bi: "items.biProjects",
  drafts: "items.draftProject",
  audit: "items.auditLog",
  "people-management": "items.peopleManagement",
  projects: "breadcrumb.projects",
  create: "breadcrumb.create",
  new: "breadcrumb.create",
  edit: "breadcrumb.edit",
  profile: "breadcrumb.profile",
  "list-detail": "breadcrumb.details",
};

/**
 * The crumb text for one URL segment. Pages with an id in the path pass the
 * record's name through `labels`; an id they did not name is shortened
 * rather than spelled out as "0f586a8b 1fbf 5552 …".
 */
function segmentTitle(
  segment: string,
  translate: (key: string) => string,
  labels?: Readonly<Record<string, string>>
): string {
  const label = labels?.[segment]?.trim();
  if (label) return label;
  const key = SEGMENT_LABEL_KEY[segment];
  if (key) {
    try {
      return translate(key);
    } catch {
      // Fallback if translation key is missing
    }
  }
  if (UUID_SEGMENT.test(segment)) return segment.slice(0, 8);
  // Unknown segment: show it readable ("some-page" -> "Some page")
  return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
}

export function Breadcrumb({
  className,
  labels,
}: {
  className?: string;
  /** Display names for path segments, keyed by the segment (e.g. an id). */
  labels?: Readonly<Record<string, string>>;
}) {
  const pathname = usePathname();
  const t = useTranslations("sidebar");
  const segments = pathname.split("/").filter(Boolean);

  // Skip the lang segment
  const pathSegments = segments.slice(1);

  if (pathSegments.length === 0) return null;

  const lang = segments[0] || "th";
  const homeHref = `/${lang}/dashboard`;

  return (
    <nav
      className={cn(
        "text-muted-foreground flex items-center text-sm",
        className
      )}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            href={homeHref}
            className="hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
          </Link>
        </li>
        {pathSegments.map((segment, index) => {
          const isLast = index === pathSegments.length - 1;
          const href = `/${segments[0]}/${pathSegments.slice(0, index + 1).join("/")}`;

          const title = segmentTitle(segment, t, labels);

          return (
            <li key={href} className="flex items-center space-x-2">
              <ChevronRight className="h-4 w-4" />
              {isLast ? (
                <span
                  className="text-foreground font-medium"
                  aria-current="page"
                >
                  {title}
                </span>
              ) : index === 0 && REDIRECT_ONLY_SEGMENTS.has(segment) ? (
                <span>{title}</span>
              ) : (
                <Link
                  href={href}
                  className="hover:text-foreground transition-colors"
                >
                  {title}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
