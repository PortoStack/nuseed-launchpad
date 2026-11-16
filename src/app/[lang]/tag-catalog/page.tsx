import React from "react";
import { tagCatalogService } from "@/services/tagCatalogService";
import { TagCatalogWorkspace } from "@/components/tag-catalog/tag-catalog-workspace";
import { AppShell } from "@/components/shared/AppShell";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function TagCatalogPage({ params }: PageProps) {
  const { lang } = await params;

  const catalog = await tagCatalogService.getCatalog();

  return (
    <AppShell>
      <TagCatalogWorkspace
        initialCatalog={catalog}
        lang={lang}
        canManageCatalog={true}
      />
    </AppShell>
  );
}
