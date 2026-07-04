import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTaskListName, getTaskMembers, MY_TASKS_LIST_ID } from "@/lib/queries";
import { NewTaskForm } from "@/components/tasks/new-task-form";

export default async function NewTaskPage({
  searchParams,
}: {
  searchParams: Promise<{ list?: string }>;
}) {
  const { list } = await searchParams;
  const listId = list || MY_TASKS_LIST_ID;

  const supabase = await createClient();
  const members = await getTaskMembers(supabase);

  const listName =
    listId === MY_TASKS_LIST_ID
      ? "My Tasks"
      : (await getTaskListName(supabase, listId)) ?? "Tasks";

  return (
    <div className="tasks-theme mx-auto flex min-h-svh w-full max-w-md flex-col pb-24">
      <div className="flex items-center justify-between px-4 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/tasks" aria-label="Back">
            <ChevronLeft className="size-5" />
          </Link>
          <h1 className="text-lg font-semibold">New Task</h1>
        </div>
        <span className="text-sm text-muted-foreground">{listName}</span>
      </div>

      <NewTaskForm listId={listId} members={members} />
    </div>
  );
}
