"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, Check, UserPen, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { canMutateRecord } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { updateTask, deleteTask, setTaskCompletion } from "@/app/(app)/tasks/actions";
import { TaskFields, UNASSIGNED } from "@/components/tasks/task-fields";
import type { TaskDetailData, TaskMember } from "@/lib/queries";
import type { UserRole } from "@/lib/supabase/types";

export function TaskDetail({
  task,
  members,
  creatorName,
  currentUserId,
  currentUserRole,
}: {
  task: TaskDetailData;
  members: TaskMember[];
  creatorName: string | null;
  currentUserId?: string;
  currentUserRole?: UserRole;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [dueAt, setDueAt] = useState<string | null>(task.due_at);
  const [assigneeId, setAssigneeId] = useState(task.assignee_id ?? UNASSIGNED);
  const [isCompleted, setIsCompleted] = useState(task.is_completed);
  const [isSaving, startSaving] = useTransition();
  const [isToggling, startToggle] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const canMutate =
    canMutateRecord(currentUserRole, currentUserId, task.user_id) ||
    canMutateRecord(currentUserRole, currentUserId, task.assignee_id);

  function toggle() {
    startToggle(async () => {
      const result = await setTaskCompletion(task.id, !isCompleted);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setIsCompleted((prev) => !prev);
    });
  }

  function handleSave() {
    const trimmed = title.trim();
    if (!trimmed) return;
    const resolvedAssigneeId = assigneeId === UNASSIGNED ? null : assigneeId;
    startSaving(async () => {
      const result = await updateTask(task.id, trimmed, description, dueAt, resolvedAssigneeId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      router.push("/tasks");
      router.refresh();
    });
  }

  async function handleDelete() {
    const result = await deleteTask(task.id);
    if (result?.error) return { error: result.error };
    router.push("/tasks");
    router.refresh();
    return {};
  }

  return (
    <>
      <div className="flex items-center justify-between px-4 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/tasks" aria-label="Back">
            <ChevronLeft className="size-5" />
          </Link>
          <h1 className="text-lg font-semibold">Task</h1>
        </div>

        <button
          type="button"
          onClick={toggle}
          disabled={isToggling || !canMutate}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60",
            isCompleted
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-secondary text-secondary-foreground"
          )}
        >
          <Check className="size-3.5" strokeWidth={isCompleted ? 3 : 2} />
          {isCompleted ? "Done" : "Mark as done"}
        </button>
      </div>

      <div className="flex flex-1 flex-col px-4">
        <TaskFields
          title={title}
          onTitleChange={setTitle}
          description={description}
          onDescriptionChange={setDescription}
          assigneeId={assigneeId}
          onAssigneeChange={setAssigneeId}
          dueAt={dueAt}
          onDueAtChange={setDueAt}
          members={members}
          disabled={!canMutate}
        />

        {creatorName ? (
          <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <UserPen className="size-3.5" />
            Created by {creatorName}
          </div>
        ) : null}

        {canMutate ? (
          <div className="mt-8 flex flex-col gap-2">
            <Button
              size="lg"
              onClick={handleSave}
              disabled={isSaving || !title.trim()}
              className="w-full"
            >
              Save
            </Button>
            <Button
              variant="ghost"
              onClick={() => setDeleteOpen(true)}
              className="w-full text-destructive hover:text-destructive"
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
          </div>
        ) : null}

        <DeleteConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Delete this task?"
          description={`"${task.title}" will be permanently removed. This can't be undone.`}
          onConfirm={handleDelete}
        />
      </div>
    </>
  );
}
