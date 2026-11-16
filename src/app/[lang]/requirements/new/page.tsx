import { RequirementIntakeForm } from "@/components/requirement/requirement-intake-form";
import { AppShell } from "@/components/shared/AppShell";

export default async function NewRequirementPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return (
    <AppShell showBreadcrumb={false}>
      <div className="py-2">
        <RequirementIntakeForm lang={lang} />
      </div>
    </AppShell>
  );
}
