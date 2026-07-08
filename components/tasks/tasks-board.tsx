"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { canMutateRecord } from "@/lib/permissions";
import type { TaskListWithTasks } from "@/lib/queries";
import type { UserRole } from "@/lib/supabase/types";
import { TaskRow } from "@/components/tasks/task-row";
import { CreateListSheet } from "@/components/tasks/create-list-sheet";
import { ListActions } from "@/components/tasks/list-actions";

export function TasksBoard({
  lists,
  currentUserId,
  currentUserRole,
}: {
  lists: TaskListWithTasks[];
  currentUserId?: string;
  currentUserRole?: UserRole;
}) {
  const [allLists, setAllLists] = useState(lists);
  const [selectedListId, setSelectedListId] = useState(lists[0]?.id ?? "");
  const [createListOpen, setCreateListOpen] = useState(false);

  // Keep local state in sync with fresh server data after revalidation
  // (e.g. a newly created/edited task) so changes show without a refresh.
  useEffect(() => {
    setAllLists(lists);
  }, [lists]);

  const selectedList = allLists.find((l) => l.id === selectedListId) ?? allLists[0];

  function handleListRenamed(id: string, name: string) {
    setAllLists((prev) => prev.map((l) => (l.id === id ? { ...l, name } : l)));
  }

  function handleListDeleted(id: string) {
    setAllLists((prev) => {
      const next = prev.filter((l) => l.id !== id);
      if (selectedListId === id) setSelectedListId(next[0]?.id ?? "");
      return next;
    });
  }

  const canRenameSelected =
    !!selectedList &&
    !selectedList.isVirtual &&
    canMutateRecord(currentUserRole, currentUserId, selectedList.user_id);
  const canDeleteSelected =
    !!selectedList && !selectedList.isVirtual && currentUserRole === "admin";

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-4 overflow-x-auto px-4 pb-3">
        {allLists.map((list) => {
          const isSelected = list.id === selectedList?.id;
          return (
            <div key={list.id} className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => setSelectedListId(list.id)}
                className={cn(
                  "border-b-2 px-0.5 pb-2 text-sm font-medium whitespace-nowrap transition-colors",
                  isSelected
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground"
                )}
              >
                {list.name}
              </button>
              {isSelected && !list.isVirtual ? (
                <ListActions
                  list={{ id: list.id, name: list.name }}
                  canRename={canRenameSelected}
                  canDelete={canDeleteSelected}
                  onRenamed={handleListRenamed}
                  onDeleted={handleListDeleted}
                  triggerClassName="size-auto rounded-none border-b-2 border-transparent px-0 pb-2 text-primary hover:bg-transparent"
                />
              ) : null}
            </div>
          );
        })}
        <button
          type="button"
          onClick={() => setCreateListOpen(true)}
          className="flex shrink-0 items-center gap-1 border-b-2 border-transparent px-0.5 pb-2 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground"
        >
          <Plus className="size-4" />
          New list
        </button>
      </div>

      <div className="flex flex-col gap-3.5 px-4 pt-2">
        {selectedList && selectedList.tasks.length > 0 ? (
          selectedList.tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
            />
          ))
        ) : (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-glass-border bg-glass px-6 py-12 text-center shadow-lg shadow-black/20 backdrop-blur-xl dark:bg-card/50">
            <Link
              href={selectedList ? `/tasks/new?list=${selectedList.id}` : "/tasks/new"}
              aria-label="Add task"
              className="flex size-14 items-center justify-center rounded-full bg-primary/15 text-primary transition-transform hover:bg-primary/25 active:scale-95"
            >
              <Plus className="size-7" />
            </Link>
            <div>
              <p className="text-base font-medium">No tasks yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedList
                  ? `Add your first task to ${selectedList.name}.`
                  : "Add your first task."}
              </p>
            </div>
          </div>
        )}
      </div>

      {selectedList ? (
        <Link
          href={`/tasks/new?list=${selectedList.id}`}
          aria-label="Add task"
          className="fixed right-4 bottom-6 z-40 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-95"
        >
          <Plus className="size-6" />
        </Link>
      ) : null}

      <CreateListSheet
        open={createListOpen}
        onOpenChange={setCreateListOpen}
        onCreated={(list) => {
          setAllLists((prev) => [
            ...prev,
            { ...list, isVirtual: false, user_id: currentUserId ?? "", tasks: [] },
          ]);
          setSelectedListId(list.id);
        }}
      />
    </div>
  );
}
