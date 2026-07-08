"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAccessContext, canMutate, PERMISSION_ERROR, type AccessContext } from "@/lib/access";
import { MY_TASKS_LIST_ID } from "@/lib/queries";
import type { TaskStatus } from "@/lib/supabase/types";

type ActionResult = { error?: string; id?: string };

function canMutateTask(
  access: AccessContext,
  task: { user_id: string; assignee_id: string | null }
): boolean {
  return canMutate(access, task.user_id) || canMutate(access, task.assignee_id);
}

export async function createTaskList(name: string): Promise<ActionResult> {
  const trimmed = name.trim();
  if (!trimmed) return { error: "List name is required" };

  const supabase = await createClient();
  const access = await getAccessContext(supabase);
  if (!access) return { error: "Not signed in" };

  const { data, error } = await supabase
    .from("task_lists")
    .insert({ name: trimmed })
    .select("id")
    .single();
  if (error) return { error: error.message };

  revalidatePath("/tasks");
  return { id: data.id };
}

export async function renameTaskList(
  listId: string,
  name: string
): Promise<ActionResult> {
  const trimmed = name.trim();
  if (!trimmed) return { error: "List name is required" };

  const supabase = await createClient();
  const access = await getAccessContext(supabase);
  if (!access) return { error: "Not signed in" };

  const { data: list, error: fetchError } = await supabase
    .from("task_lists")
    .select("user_id")
    .eq("id", listId)
    .maybeSingle();
  if (fetchError) return { error: fetchError.message };
  if (!list || !canMutate(access, list.user_id)) return { error: PERMISSION_ERROR };

  const { error } = await supabase
    .from("task_lists")
    .update({ name: trimmed })
    .eq("id", listId);
  if (error) return { error: error.message };

  revalidatePath("/tasks");
  return { id: listId };
}

export async function deleteTaskList(listId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const access = await getAccessContext(supabase);
  if (!access) return { error: "Not signed in" };
  if (access.role !== "admin") return { error: PERMISSION_ERROR };

  // Tasks in this list cascade-delete via the list_id foreign key.
  const { error } = await supabase.from("task_lists").delete().eq("id", listId);
  if (error) return { error: error.message };

  revalidatePath("/tasks");
  return {};
}

export async function createTask(
  listId: string,
  title: string,
  description: string | null,
  dueAt: string | null,
  assigneeId: string | null
): Promise<ActionResult> {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) return { error: "Task title is required" };

  const supabase = await createClient();
  const access = await getAccessContext(supabase);
  if (!access) return { error: "Not signed in" };

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      list_id: listId === MY_TASKS_LIST_ID ? null : listId,
      title: trimmedTitle,
      description: description?.trim() || null,
      due_at: dueAt,
      assignee_id: assigneeId,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  revalidatePath("/tasks");
  return { id: data.id };
}

export async function updateTask(
  taskId: string,
  title: string,
  description: string | null,
  dueAt: string | null,
  assigneeId: string | null
): Promise<ActionResult> {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) return { error: "Task title is required" };

  const supabase = await createClient();
  const access = await getAccessContext(supabase);
  if (!access) return { error: "Not signed in" };

  const { data: task, error: fetchError } = await supabase
    .from("tasks")
    .select("user_id, assignee_id")
    .eq("id", taskId)
    .maybeSingle();
  if (fetchError) return { error: fetchError.message };
  if (!task || !canMutateTask(access, task)) return { error: PERMISSION_ERROR };

  const { error } = await supabase
    .from("tasks")
    .update({
      title: trimmedTitle,
      description: description?.trim() || null,
      due_at: dueAt,
      assignee_id: assigneeId,
    })
    .eq("id", taskId);
  if (error) return { error: error.message };

  revalidatePath("/tasks");
  return { id: taskId };
}

export async function deleteTask(taskId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const access = await getAccessContext(supabase);
  if (!access) return { error: "Not signed in" };

  const { data: task, error: fetchError } = await supabase
    .from("tasks")
    .select("user_id, assignee_id")
    .eq("id", taskId)
    .maybeSingle();
  if (fetchError) return { error: fetchError.message };
  if (!task || !canMutateTask(access, task)) return { error: PERMISSION_ERROR };

  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) return { error: error.message };

  revalidatePath("/tasks");
  return {};
}

export async function setTaskStatus(
  taskId: string,
  status: TaskStatus
): Promise<ActionResult> {
  const supabase = await createClient();
  const access = await getAccessContext(supabase);
  if (!access) return { error: "Not signed in" };

  const { data: task, error: fetchError } = await supabase
    .from("tasks")
    .select("user_id, assignee_id")
    .eq("id", taskId)
    .maybeSingle();
  if (fetchError) return { error: fetchError.message };
  if (!task || !canMutateTask(access, task)) return { error: PERMISSION_ERROR };

  const { error } = await supabase.from("tasks").update({ status }).eq("id", taskId);
  if (error) return { error: error.message };

  revalidatePath("/tasks");
  return { id: taskId };
}
