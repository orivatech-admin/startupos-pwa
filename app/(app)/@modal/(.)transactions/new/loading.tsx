import { TransactionFormSkeleton } from "@/components/transaction-form/transaction-form-skeleton";

export default function NewTransactionModalLoading() {
  return (
    <div className="fixed inset-0 z-50 mx-auto flex w-full max-w-md flex-col overflow-hidden bg-background pt-[env(safe-area-inset-top)]">
      <TransactionFormSkeleton />
    </div>
  );
}
