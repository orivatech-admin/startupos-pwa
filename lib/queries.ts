import "server-only";
import {
  startOfMonth,
  startOfYear,
  endOfMonth,
  subMonths,
  format,
  differenceInCalendarDays,
} from "date-fns";
import type { createClient } from "@/lib/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export async function getCategories(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_archived", false)
    .order("sort_order");
  if (error) throw error;
  return data;
}

export async function getProjects(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("is_archived", false)
    .order("name");
  if (error) throw error;
  return data;
}

export async function getTags(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .order("name");
  if (error) throw error;
  return data;
}

export async function getAccountsWithPaymentModes(supabase: SupabaseClient) {
  const [{ data: accounts, error: accountsError }, { data: modes, error: modesError }, { data: balances, error: balancesError }] =
    await Promise.all([
      supabase
        .from("accounts")
        .select("*")
        .eq("is_archived", false)
        .order("sort_order"),
      supabase
        .from("payment_modes")
        .select("*")
        .eq("is_archived", false)
        .order("sort_order"),
      supabase.from("account_balances").select("*"),
    ]);
  if (accountsError) throw accountsError;
  if (modesError) throw modesError;
  if (balancesError) throw balancesError;

  const balanceByAccount = new Map(balances.map((b) => [b.account_id, b.balance]));

  return accounts.map((account) => {
    const paymentModes = modes.filter((m) => m.account_id === account.id);
    const balance = account.opening_balance + (balanceByAccount.get(account.id) ?? 0);
    return { ...account, paymentModes, balance };
  });
}

export async function getPaymentModes(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("payment_modes")
    .select("*, accounts(name)")
    .eq("is_archived", false)
    .order("sort_order");
  if (error) throw error;
  return data;
}

export async function getTransactionFormData(supabase: SupabaseClient) {
  const [categories, projects, accounts, tags, defaultAccount] = await Promise.all([
    getCategories(supabase),
    getProjects(supabase),
    getAccountsWithPaymentModes(supabase),
    getTags(supabase),
    getDefaultAccount(supabase),
  ]);

  return {
    categories,
    projects,
    accounts,
    tagNames: tags.map((t) => t.name),
    defaultAccountId: defaultAccount?.id,
  };
}

export async function getTransactionWithTags(supabase: SupabaseClient, id: string) {
  const [{ data: transaction, error: transactionError }, { data: tagLinks, error: tagLinksError }] =
    await Promise.all([
      supabase.from("transactions").select("*").eq("id", id).maybeSingle(),
      supabase.from("transaction_tags").select("tags(name)").eq("transaction_id", id),
    ]);
  if (transactionError) throw transactionError;
  if (tagLinksError) throw tagLinksError;
  if (!transaction) return null;

  const tags = (tagLinks ?? [])
    .map((link) => (link as unknown as { tags: { name: string } | null }).tags?.name)
    .filter((name): name is string => Boolean(name));

  return { transaction, tags };
}

export interface TransactionListItem {
  id: string;
  transaction_type: "expense" | "income" | "transfer";
  amount: number;
  currency: string;
  date_time: string;
  status: "recorded" | "reconciled";
  notes: string | null;
  categoryName: string | null;
  categoryIcon: string | null;
  accountName: string;
  destinationAccountName: string | null;
}

async function attachLookups(
  supabase: SupabaseClient,
  transactions: {
    id: string;
    transaction_type: "expense" | "income" | "transfer";
    amount: number;
    currency: string;
    date_time: string;
    status: "recorded" | "reconciled";
    notes: string | null;
    category_id: string | null;
    account_id: string;
    destination_account_id: string | null;
  }[]
): Promise<TransactionListItem[]> {
  const [categories, { data: accounts, error }] = await Promise.all([
    getCategories(supabase),
    supabase.from("accounts").select("id, name"),
  ]);
  if (error) throw error;

  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const accountById = new Map(accounts.map((a) => [a.id, a]));

  return transactions.map((t) => ({
    id: t.id,
    transaction_type: t.transaction_type,
    amount: t.amount,
    currency: t.currency,
    date_time: t.date_time,
    status: t.status,
    notes: t.notes,
    categoryName: t.category_id ? categoryById.get(t.category_id)?.name ?? null : null,
    categoryIcon: t.category_id ? categoryById.get(t.category_id)?.icon ?? null : null,
    accountName: accountById.get(t.account_id)?.name ?? "—",
    destinationAccountName: t.destination_account_id
      ? accountById.get(t.destination_account_id)?.name ?? null
      : null,
  }));
}

export async function getRecentTransactions(supabase: SupabaseClient, limit: number) {
  const { data, error } = await supabase
    .from("transactions")
    .select(
      "id, transaction_type, amount, currency, date_time, status, notes, category_id, account_id, destination_account_id"
    )
    .order("date_time", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return attachLookups(supabase, data);
}

export async function getTransactionsForRecords(
  supabase: SupabaseClient,
  type?: "expense" | "income" | "transfer"
) {
  let query = supabase
    .from("transactions")
    .select(
      "id, transaction_type, amount, currency, date_time, status, notes, category_id, account_id, destination_account_id"
    )
    .order("date_time", { ascending: false });
  if (type) query = query.eq("transaction_type", type);

  const { data, error } = await query;
  if (error) throw error;
  return attachLookups(supabase, data);
}

export async function getHomeDashboardData(supabase: SupabaseClient) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [{ data: monthTransactions, error }, recentTransactions, categories] = await Promise.all([
    supabase
      .from("transactions")
      .select("transaction_type, amount, category_id, date_time")
      .gte("date_time", monthStart),
    getRecentTransactions(supabase, 8),
    getCategories(supabase),
  ]);
  if (error) throw error;

  const categoryById = new Map(categories.map((c) => [c.id, c]));

  let income = 0;
  let spent = 0;
  const spentByCategory = new Map<string, number>();

  for (const t of monthTransactions) {
    if (t.transaction_type === "income") {
      income += t.amount;
    } else if (t.transaction_type === "expense") {
      spent += t.amount;
      const name = t.category_id ? categoryById.get(t.category_id)?.name ?? "Others" : "Others";
      spentByCategory.set(name, (spentByCategory.get(name) ?? 0) + t.amount);
    }
  }

  const categoryBreakdown = Array.from(spentByCategory.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);

  return {
    netFlow: income - spent,
    income,
    spent,
    categoryBreakdown,
    recentTransactions,
  };
}

export type CashFlowPeriod = "thisMonth" | "thisYear" | "allTime";

export interface CashFlowTotals {
  income: number;
  spending: number;
  netBalance: number;
}

export async function getCashFlowSummary(
  supabase: SupabaseClient
): Promise<Record<CashFlowPeriod, CashFlowTotals>> {
  const now = new Date();
  const monthStart = startOfMonth(now).toISOString();
  const yearStart = startOfYear(now).toISOString();

  const { data, error } = await supabase
    .from("transactions")
    .select("transaction_type, amount, date_time");
  if (error) throw error;
  const rows = data ?? [];

  function totalsSince(fromIso: string | null): CashFlowTotals {
    let income = 0;
    let spending = 0;
    for (const t of rows) {
      if (fromIso && t.date_time < fromIso) continue;
      if (t.transaction_type === "income") income += t.amount;
      else if (t.transaction_type === "expense") spending += t.amount;
    }
    return { income, spending, netBalance: income - spending };
  }

  return {
    thisMonth: totalsSince(monthStart),
    thisYear: totalsSince(yearStart),
    allTime: totalsSince(null),
  };
}

export async function getAnalysisData(supabase: SupabaseClient) {
  const now = new Date();
  const sixMonthsAgoStart = startOfMonth(subMonths(now, 5));
  const threeMonthsAgoStart = startOfMonth(subMonths(now, 2));
  const thisMonthStart = startOfMonth(now);

  const [{ data: transactions, error }, categories, accounts] = await Promise.all([
    supabase
      .from("transactions")
      .select("transaction_type, amount, category_id, date_time")
      .gte("date_time", sixMonthsAgoStart.toISOString()),
    getCategories(supabase),
    getAccountsWithPaymentModes(supabase),
  ]);
  if (error) throw error;

  const categoryById = new Map(categories.map((c) => [c.id, c]));

  const months = Array.from({ length: 6 }, (_, i) => startOfMonth(subMonths(now, 5 - i)));
  const monthly = months.map((monthStart) => {
    const monthEnd = endOfMonth(monthStart);
    let income = 0;
    let expense = 0;
    for (const t of transactions) {
      const d = new Date(t.date_time);
      if (d >= monthStart && d <= monthEnd) {
        if (t.transaction_type === "income") income += t.amount;
        else if (t.transaction_type === "expense") expense += t.amount;
      }
    }
    return { label: format(monthStart, "MMM"), income, expense };
  });

  const spendByCategory = new Map<string, number>();
  let thisMonthSpend = 0;
  let thisMonthIncome = 0;
  let thisMonthCount = 0;

  for (const t of transactions) {
    const d = new Date(t.date_time);
    if (d >= threeMonthsAgoStart && t.transaction_type === "expense") {
      const name = t.category_id ? categoryById.get(t.category_id)?.name ?? "Others" : "Others";
      spendByCategory.set(name, (spendByCategory.get(name) ?? 0) + t.amount);
    }
    if (d >= thisMonthStart) {
      thisMonthCount += 1;
      if (t.transaction_type === "expense") thisMonthSpend += t.amount;
      else if (t.transaction_type === "income") thisMonthIncome += t.amount;
    }
  }

  const categoryBreakdown = Array.from(spendByCategory.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8);

  const daysElapsed = differenceInCalendarDays(now, thisMonthStart) + 1;
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  return {
    monthly,
    categoryBreakdown,
    totalBalance,
    thisMonthSpend,
    thisMonthIncome,
    thisMonthCount,
    avgDailySpend: thisMonthSpend / daysElapsed,
    hasActivity: transactions.length > 0,
  };
}

export async function getCurrentProfile(supabase: SupabaseClient) {
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url, role, created_at")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getDefaultAccount(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("is_default", true)
    .maybeSingle();
  if (error) throw error;
  return data;
}
