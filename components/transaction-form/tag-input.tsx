"use client";

import { useState } from "react";
import { Hash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function TagInput({
  value,
  onChange,
  suggestions,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions: string[];
}) {
  const [draft, setDraft] = useState("");

  function toggleTag(tag: string) {
    if (value.includes(tag)) {
      onChange(value.filter((t) => t !== tag));
    } else {
      onChange([...value, tag]);
    }
  }

  function addFromDraft() {
    const normalized = draft.trim().toLowerCase();
    if (!normalized) return;
    if (!value.includes(normalized)) onChange([...value, normalized]);
    setDraft("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addFromDraft();
    } else if (e.key === "Backspace" && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  const chips = Array.from(new Set([...value, ...suggestions])).slice(0, 8);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Hash className="size-5 shrink-0 text-muted-foreground" />
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add tags"
          className="h-auto flex-1 border-none bg-transparent px-0 py-2 text-sm shadow-none focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent"
        />
      </div>
      {chips.length > 0 ? (
        <div className="flex flex-wrap gap-2 pl-8">
          {chips.map((tag) => {
            const active = value.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs",
                  active ? "border-primary text-foreground" : "border-border text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "size-3 rounded-full border-2",
                    active ? "border-primary bg-primary" : "border-muted-foreground"
                  )}
                />
                {tag}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
