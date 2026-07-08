import { createClient } from "@/lib/supabase/server";
import { requireTool } from "@/lib/access";
import { getTransactionFormData } from "@/lib/queries";
import { TransactionFormRoute } from "@/components/transaction-form/transaction-form-route";

export default async function NewTransactionPage() {
  const supabase = await createClient();
  await requireTool(supabase, "ledger");
  const { categories, projects, accounts, tagNames, defaultAccountId } =
    await getTransactionFormData(supabase);

  return (
    <div className="flex h-svh flex-col">
      <TransactionFormRoute
        mode="page"
        categories={categories}
        projects={projects}
        accounts={accounts}
        existingTags={tagNames}
        defaultAccountId={defaultAccountId}
      />
    </div>
  );
}
