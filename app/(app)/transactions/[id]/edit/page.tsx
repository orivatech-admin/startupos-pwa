import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTransactionFormData, getTransactionWithTags, getCurrentProfile } from "@/lib/queries";
import { TransactionFormRoute } from "@/components/transaction-form/transaction-form-route";

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [formData, existing, profile] = await Promise.all([
    getTransactionFormData(supabase),
    getTransactionWithTags(supabase, id),
    getCurrentProfile(supabase),
  ]);

  if (!existing) notFound();

  return (
    <div className="flex h-svh flex-col">
      <TransactionFormRoute
        mode="page"
        categories={formData.categories}
        projects={formData.projects}
        accounts={formData.accounts}
        existingTags={formData.tagNames}
        defaultAccountId={formData.defaultAccountId}
        transaction={existing.transaction}
        initialTags={existing.tags}
        currentUserId={profile?.id}
        currentUserRole={profile?.role}
      />
    </div>
  );
}
