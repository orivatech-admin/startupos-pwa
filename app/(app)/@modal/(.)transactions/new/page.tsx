import { createClient } from "@/lib/supabase/server";
import { getTransactionFormData } from "@/lib/queries";
import { TransactionFormRoute } from "@/components/transaction-form/transaction-form-route";

export default async function NewTransactionModal() {
  const supabase = await createClient();
  const { categories, projects, accounts, tagNames, defaultAccountId } =
    await getTransactionFormData(supabase);

  return (
    <div className="fixed inset-0 z-50 mx-auto flex w-full max-w-md flex-col overflow-hidden bg-background pt-[env(safe-area-inset-top)]">
      <TransactionFormRoute
        mode="modal"
        categories={categories}
        projects={projects}
        accounts={accounts}
        existingTags={tagNames}
        defaultAccountId={defaultAccountId}
      />
    </div>
  );
}
