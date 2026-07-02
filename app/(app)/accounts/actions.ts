"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAccessContext, canMutate, PERMISSION_ERROR } from "@/lib/access";
import type { AccountType, PaymentModeKind } from "@/lib/supabase/types";

type ActionResult = { error?: string; id?: string };

export async function createAccount(
  name: string,
  accountType: AccountType,
  openingBalance: number
): Promise<ActionResult> {
  const trimmed = name.trim();
  if (!trimmed) return { error: "Account name is required" };

  const supabase = await createClient();
  const access = await getAccessContext(supabase);
  if (!access) return { error: "Not signed in" };

  const { count, error: countError } = await supabase
    .from("accounts")
    .select("id", { count: "exact", head: true })
    .eq("is_archived", false);
  if (countError) return { error: countError.message };

  const { data, error } = await supabase
    .from("accounts")
    .insert({
      name: trimmed,
      account_type: accountType,
      opening_balance: openingBalance || 0,
      is_default: count === 0,
      created_by: access.userId,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  revalidatePath("/accounts");
  return { id: data.id };
}

export async function createPaymentMode(
  accountId: string,
  name: string,
  kind: PaymentModeKind
): Promise<ActionResult> {
  const trimmed = name.trim();
  if (!trimmed) return { error: "Payment mode name is required" };

  const supabase = await createClient();
  const access = await getAccessContext(supabase);
  if (!access) return { error: "Not signed in" };

  const { data, error } = await supabase
    .from("payment_modes")
    .insert({ account_id: accountId, name: trimmed, kind, created_by: access.userId })
    .select("id")
    .single();
  if (error) return { error: error.message };

  revalidatePath("/accounts");
  return { id: data.id };
}

export async function updateAccount(
  accountId: string,
  name: string,
  accountType: AccountType,
  openingBalance: number
): Promise<ActionResult> {
  const trimmed = name.trim();
  if (!trimmed) return { error: "Account name is required" };

  const supabase = await createClient();
  const access = await getAccessContext(supabase);
  if (!access) return { error: "Not signed in" };

  const { data: account, error: fetchError } = await supabase
    .from("accounts")
    .select("created_by")
    .eq("id", accountId)
    .maybeSingle();
  if (fetchError) return { error: fetchError.message };
  if (!canMutate(access, account?.created_by ?? null)) return { error: PERMISSION_ERROR };

  const { error } = await supabase
    .from("accounts")
    .update({ name: trimmed, account_type: accountType, opening_balance: openingBalance || 0 })
    .eq("id", accountId);
  if (error) return { error: error.message };

  revalidatePath("/accounts");
  return { id: accountId };
}

export async function deleteAccount(accountId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const access = await getAccessContext(supabase);
  if (!access) return { error: "Not signed in" };

  const { data: account, error: fetchError } = await supabase
    .from("accounts")
    .select("is_default, created_by")
    .eq("id", accountId)
    .maybeSingle();
  if (fetchError) return { error: fetchError.message };
  if (!canMutate(access, account?.created_by ?? null)) return { error: PERMISSION_ERROR };

  const { error } = await supabase.from("accounts").delete().eq("id", accountId);
  if (error) {
    if (error.code === "23503") {
      return {
        error: "This account has existing transactions and can't be deleted.",
      };
    }
    return { error: error.message };
  }

  if (account?.is_default) {
    const { data: next } = await supabase
      .from("accounts")
      .select("id")
      .eq("is_archived", false)
      .order("sort_order")
      .order("created_at")
      .limit(1)
      .maybeSingle();
    if (next) {
      await supabase.rpc("set_default_account", { target_account_id: next.id });
    }
  }

  revalidatePath("/accounts");
  return {};
}

export async function updatePaymentMode(
  paymentModeId: string,
  name: string,
  kind: PaymentModeKind
): Promise<ActionResult> {
  const trimmed = name.trim();
  if (!trimmed) return { error: "Payment mode name is required" };

  const supabase = await createClient();
  const access = await getAccessContext(supabase);
  if (!access) return { error: "Not signed in" };

  const { data: mode, error: fetchError } = await supabase
    .from("payment_modes")
    .select("created_by")
    .eq("id", paymentModeId)
    .maybeSingle();
  if (fetchError) return { error: fetchError.message };
  if (!canMutate(access, mode?.created_by ?? null)) return { error: PERMISSION_ERROR };

  const { error } = await supabase
    .from("payment_modes")
    .update({ name: trimmed, kind })
    .eq("id", paymentModeId);
  if (error) return { error: error.message };

  revalidatePath("/accounts");
  return { id: paymentModeId };
}

export async function deletePaymentMode(paymentModeId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const access = await getAccessContext(supabase);
  if (!access) return { error: "Not signed in" };

  const { data: mode, error: fetchError } = await supabase
    .from("payment_modes")
    .select("created_by")
    .eq("id", paymentModeId)
    .maybeSingle();
  if (fetchError) return { error: fetchError.message };
  if (!canMutate(access, mode?.created_by ?? null)) return { error: PERMISSION_ERROR };

  const { error } = await supabase.from("payment_modes").delete().eq("id", paymentModeId);
  if (error) {
    if (error.code === "23503") {
      return {
        error: "This payment mode is used on existing transactions and can't be deleted.",
      };
    }
    return { error: error.message };
  }

  revalidatePath("/accounts");
  return {};
}

export async function setDefaultAccount(accountId: string): Promise<ActionResult> {
  const supabase = await createClient();

  // Routed through a security-definer function rather than plain table
  // updates: "default account" is a shared app-level preference, so any
  // allowlisted user may change it even though the accounts_update RLS
  // policy otherwise restricts row updates to admins/owners.
  const { error } = await supabase.rpc("set_default_account", {
    target_account_id: accountId,
  });
  if (error) return { error: error.message };

  revalidatePath("/accounts");
  return {};
}
