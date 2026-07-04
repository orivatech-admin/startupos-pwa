"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { MoreVertical, Pencil, Trash2, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  DrawerFooter,
} from "@/components/ui/drawer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { renameTaskList, deleteTaskList } from "@/app/(app)/tasks/actions";

export function ListActions({
  list,
  canRename,
  canDelete,
  onRenamed,
  onDeleted,
  triggerClassName,
}: {
  list: { id: string; name: string };
  canRename: boolean;
  canDelete: boolean;
  onRenamed: (id: string, name: string) => void;
  onDeleted: (id: string) => void;
  triggerClassName?: string;
}) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [name, setName] = useState(list.name);
  const [isRenaming, startRenaming] = useTransition();
  const [isDeleting, startDeleting] = useTransition();

  if (!canRename && !canDelete) return null;

  function handleRename() {
    const trimmed = name.trim();
    if (!trimmed) return;
    startRenaming(async () => {
      const result = await renameTaskList(list.id, trimmed);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      onRenamed(list.id, trimmed);
      setRenameOpen(false);
    });
  }

  function handleDelete() {
    startDeleting(async () => {
      const result = await deleteTaskList(list.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      onDeleted(list.id);
      setDeleteOpen(false);
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="List options"
            className={cn(
              "flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
              triggerClassName
            )}
          >
            <MoreVertical className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {canRename ? (
            <DropdownMenuItem
              onSelect={() => {
                setName(list.name);
                setRenameOpen(true);
              }}
            >
              <Pencil className="size-3.5" />
              Rename
            </DropdownMenuItem>
          ) : null}
          {canDelete ? (
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-3.5" />
              Delete
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <Drawer open={renameOpen} onOpenChange={setRenameOpen}>
        <DrawerContent>
          <DrawerHeader className="flex-row items-center justify-between space-y-0">
            <DrawerTitle>Rename list</DrawerTitle>
            <DrawerClose asChild>
              <button
                type="button"
                aria-label="Close"
                className="flex size-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground"
              >
                <X className="size-4" />
              </button>
            </DrawerClose>
          </DrawerHeader>

          <div className="px-4 pb-2">
            <Input
              autoFocus
              placeholder="List name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
              }}
            />
          </div>

          <DrawerFooter>
            <Button
              variant="tasks"
              onClick={handleRename}
              disabled={isRenaming || !name.trim()}
            >
              Save
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{list.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this list and all tasks in it. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
