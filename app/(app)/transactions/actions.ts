"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAccessContext, canMutate, PERMISSION_ERROR } from "@/lib/access";
import { TransactionFormSchema } from "@/lib/validations/transaction";

type ActionResult = { error?: string; id?: string };

function parseFormData(formData: FormData) {
  return TransactionFormSchema.safeParse({
    transaction_type: formData.get("transaction_type"),
    amount: formData.get("amount"),
    currency: formData.get("currency") ?? "INR",
    date_time: formData.get("date_time"),
    category_id: formData.get("category_id") || undefined,
    project_id: formData.get("project_id") || undefined,
    account_id: formData.get("account_id"),
    destination_account_id: formData.get("destination_account_id") || undefined,
    payment_mode_id: formData.get("payment_mode_id") || undefined,
    notes: formData.get("notes") || undefined,
    tags: JSON.parse(String(formData.get("tags") ?? "[]")),
  });
}

async function upsertTags(
  supabase: Awaited<ReturnType<typeof createClient>>,
  rawNames: string[]
) {
  const names = Array.from(
    new Set(rawNames.map((n) => n.trim().toLowerCase()).filter(Boolean))
  );
  if (names.length === 0) return [];

  const { data: existing, error: selectError } = await supabase
    .from("tags")
    .select("*")
    .in("name", names);
  if (selectError) throw selectError;

  const existingNames = new Set((existing ?? []).map((t) => t.name));
  const missing = names.filter((n) => !existingNames.has(n));
  if (missing.length === 0) return existing ?? [];

  const { data: inserted, error: insertError } = await supabase
    .from("tags")
    .insert(missing.map((name) => ({ name })))
    .select();
  // Another request may have created the same tag concurrently — fall back
  // to re-selecting rather than failing the whole transaction save.
  if (insertError) {
    const { data: retried, error: retryError } = await supabase
      .from("tags")
      .select("*")
      .in("name", names);
    if (retryError) throw retryError;
    return retried ?? [];
  }

  return [...(existing ?? []), ...(inserted ?? [])];
}

async function uploadReceipts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  transactionId: string,
  userId: string,
  files: File[]
) {
  for (const file of files) {
    if (file.size === 0) continue;
    const path = `${transactionId}/${crypto.randomUUID()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("receipts")
      .upload(path, file);
    if (uploadError) continue;
    await supabase.from("receipts").insert({
      transaction_id: transactionId,
      storage_path: path,
      file_name: file.name,
      content_type: file.type,
      size_bytes: file.size,
      uploaded_by: userId,
    });
  }
}

function revalidateLedgerPaths() {
  revalidatePath("/home");
  revalidatePath("/transactions");
  revalidatePath("/accounts");
}

export async function createTransaction(formData: FormData): Promise<ActionResult> {
  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return { error: "Not signed in" };

  const { tags, ...transactionInput } = parsed.data;

  const { data: transaction, error: insertError } = await supabase
    .from("transactions")
    .insert({ ...transactionInput, created_by: userId })
    .select("id")
    .single();

  if (insertError || !transaction) {
    return { error: insertError?.message ?? "Failed to save transaction" };
  }

  if (tags.length > 0) {
    const tagRows = await upsertTags(supabase, tags);
    await supabase
      .from("transaction_tags")
      .insert(tagRows.map((t) => ({ transaction_id: transaction.id, tag_id: t.id })));
  }

  const receiptFiles = formData.getAll("receipts").filter((f): f is File => f instanceof File);
  await uploadReceipts(supabase, transaction.id, userId, receiptFiles);

  revalidateLedgerPaths();
  return { id: transaction.id };
}

export async function updateTransaction(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const access = await getAccessContext(supabase);
  if (!access) return { error: "Not signed in" };

  const { data: existing, error: fetchError } = await supabase
    .from("transactions")
    .select("created_by")
    .eq("id", id)
    .maybeSingle();
  if (fetchError) return { error: fetchError.message };
  if (!canMutate(access, existing?.created_by ?? null)) return { error: PERMISSION_ERROR };

  const { tags, ...transactionInput } = parsed.data;

  const { error: updateError } = await supabase
    .from("transactions")
    .update(transactionInput)
    .eq("id", id);
  if (updateError) return { error: updateError.message };

  await supabase.from("transaction_tags").delete().eq("transaction_id", id);
  if (tags.length > 0) {
    const tagRows = await upsertTags(supabase, tags);
    await supabase
      .from("transaction_tags")
      .insert(tagRows.map((t) => ({ transaction_id: id, tag_id: t.id })));
  }

  const receiptFiles = formData.getAll("receipts").filter((f): f is File => f instanceof File);
  await uploadReceipts(supabase, id, access.userId, receiptFiles);

  revalidateLedgerPaths();
  return { id };
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const access = await getAccessContext(supabase);
  if (!access) return { error: "Not signed in" };

  const { data: existing, error: fetchError } = await supabase
    .from("transactions")
    .select("created_by")
    .eq("id", id)
    .maybeSingle();
  if (fetchError) return { error: fetchError.message };
  if (!canMutate(access, existing?.created_by ?? null)) return { error: PERMISSION_ERROR };

  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidateLedgerPaths();
  return {};
}

export async function markReconciled(id: string, reconciled: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const access = await getAccessContext(supabase);
  if (!access) return { error: "Not signed in" };

  const { data: existing, error: fetchError } = await supabase
    .from("transactions")
    .select("created_by")
    .eq("id", id)
    .maybeSingle();
  if (fetchError) return { error: fetchError.message };
  if (!canMutate(access, existing?.created_by ?? null)) return { error: PERMISSION_ERROR };

  const { error } = await supabase
    .from("transactions")
    .update({ status: reconciled ? "reconciled" : "recorded" })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidateLedgerPaths();
  return {};
}

export async function createProject(name: string): Promise<{ id?: string; error?: string }> {
  const trimmed = name.trim();
  if (!trimmed) return { error: "Project name is required" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({ name: trimmed })
    .select("id")
    .single();
  if (error) return { error: error.message };
  return { id: data.id };
}
