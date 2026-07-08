"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createTask } from "@/app/(app)/tasks/actions";
import { TaskFields, UNASSIGNED } from "@/components/tasks/task-fields";
import type { TaskMember } from "@/lib/queries";

export function NewTaskForm({
  listId,
  members,
}: {
  listId: string;
  members: TaskMember[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState<string | null>(null);
  const [assigneeId, setAssigneeId] = useState(UNASSIGNED);
  const [isSaving, startSaving] = useTransition();

  function handleSave() {
    const trimmed = title.trim();
    if (!trimmed) return;
    const resolvedAssigneeId = assigneeId === UNASSIGNED ? null : assigneeId;
    startSaving(async () => {
      const result = await createTask(listId, trimmed, description, dueAt, resolvedAssigneeId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      router.push("/tasks");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-1 flex-col px-4">
      <TaskFields
        autoFocusTitle
        title={title}
        onTitleChange={setTitle}
        description={description}
        onDescriptionChange={setDescription}
        assigneeId={assigneeId}
        onAssigneeChange={setAssigneeId}
        dueAt={dueAt}
        onDueAtChange={setDueAt}
        members={members}
      />

      <div className="mt-8">
        <Button
          onClick={handleSave}
          disabled={isSaving || !title.trim()}
          className="w-full"
        >
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
          Add Task
        </Button>
      </div>
    </div>
  );
}
