"use client";

import { useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";
import { Check, CalendarClock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { canMutateRecord } from "@/lib/permissions";
import { setTaskCompletion } from "@/app/(app)/tasks/actions";
import type { UserRole } from "@/lib/supabase/types";

export interface TaskRowData {
  id: string;
  title: string;
  description: string | null;
  due_at: string | null;
  is_completed: boolean;
  user_id: string;
  assignee_id: string | null;
  assigneeName: string | null;
  assigneeAvatarUrl: string | null;
}

function assigneeInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]!.toUpperCase())
      .join("") || "?"
  );
}

export function TaskRow({
  task,
  currentUserId,
  currentUserRole,
}: {
  task: TaskRowData;
  currentUserId?: string;
  currentUserRole?: UserRole;
}) {
  const [isPending, startTransition] = useTransition();

  const canMutate =
    canMutateRecord(currentUserRole, currentUserId, task.user_id) ||
    canMutateRecord(currentUserRole, currentUserId, task.assignee_id);

  function toggle() {
    startTransition(async () => {
      const result = await setTaskCompletion(task.id, !task.is_completed);
      if (result.error) toast.error(result.error);
    });
  }

  return (
    <div className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-card/50 px-5 py-4.5 shadow-lg shadow-black/20 backdrop-blur-xl backdrop-saturate-150">
      <button
        type="button"
        onClick={toggle}
        disabled={isPending || !canMutate}
        aria-label={task.is_completed ? "Mark as not done" : "Mark as done"}
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors disabled:opacity-50",
          task.is_completed
            ? "border-primary bg-primary"
            : "border-muted-foreground"
        )}
      >
        {task.is_completed ? (
          <Check className="size-3 text-primary-foreground" strokeWidth={3} />
        ) : null}
      </button>

      <Link href={`/tasks/${task.id}`} className="min-w-0 flex-1">
        <p className={cn("text-sm", task.is_completed && "text-muted-foreground line-through")}>
          {task.title}
        </p>
        {task.description ? (
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{task.description}</p>
        ) : null}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {task.due_at ? (
            <span className="flex items-center gap-1">
              <CalendarClock className="size-3.5" />
              {format(new Date(task.due_at), "d MMM, h:mm a")}
            </span>
          ) : null}
          {task.assigneeName ? (
            <span className="flex items-center gap-1.5">
              <Avatar className="size-5">
                {task.assigneeAvatarUrl ? (
                  <AvatarImage src={task.assigneeAvatarUrl} alt={task.assigneeName} />
                ) : null}
                <AvatarFallback className="bg-secondary text-[9px] text-secondary-foreground">
                  {assigneeInitials(task.assigneeName)}
                </AvatarFallback>
              </Avatar>
              {task.assigneeName}
            </span>
          ) : null}
        </div>
      </Link>
    </div>
  );
}
