import { TransactionFormSkeleton } from "@/components/transaction-form/transaction-form-skeleton";

export default function NewTransactionLoading() {
  return (
    <div className="flex h-svh flex-col">
      <TransactionFormSkeleton />
    </div>
  );
}
