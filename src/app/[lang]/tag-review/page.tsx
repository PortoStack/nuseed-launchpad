import React from "react";
import { requirementService } from "@/services/requirementService";
import { tagCatalogService } from "@/services/tagCatalogService";
import { TagReviewWorkspace } from "@/components/tag-review/tag-review-workspace";
import { AppShell } from "@/components/shared/AppShell";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function TagReviewPage({ params }: PageProps) {
  const { lang } = await params;

  const [requirements, catalog] = await Promise.all([
    requirementService.getRequirements(),
    tagCatalogService.getCatalog(),
  ]);

  return (
    <AppShell>
      <TagReviewWorkspace
        initialRequirements={requirements}
        initialCatalog={catalog}
        currentUser={{ name: "เจ้าหน้าที่อุทยานฯ" }}
        lang={lang}
        canViewReviewQueue={true}
        canManageReviewQueue={true}
        canViewRequirements={true}
      />
    </AppShell>
  );
}
