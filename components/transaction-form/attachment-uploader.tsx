"use client";

import { useRef } from "react";
import { Paperclip, ChevronRight, Camera, X, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import type { ReceiptWithUrl } from "@/lib/queries";

export function AttachmentUploader({
  value,
  onChange,
  existingReceipts = [],
  onRemoveExisting,
}: {
  value: File[];
  onChange: (files: File[]) => void;
  existingReceipts?: ReceiptWithUrl[];
  onRemoveExisting?: (receiptId: string) => void;
}) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const total = existingReceipts.length + value.length;

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    onChange([...value, ...picked]);
    e.target.value = "";
  }

  return (
    <div className="flex flex-col gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="flex w-full items-center gap-3 py-2 text-left">
            <Paperclip className="size-5 shrink-0 text-muted-foreground" />
            <span className="flex-1 text-sm">
              {total > 0 ? `${total} attachment${total > 1 ? "s" : ""}` : "Add attachment"}
            </span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem onSelect={() => cameraInputRef.current?.click()}>
            <Camera className="size-4" />
            Take photo
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => fileInputRef.current?.click()}>
            <Paperclip className="size-4" />
            Choose file
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleSelect}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        multiple
        className="hidden"
        onChange={handleSelect}
      />
      {total > 0 ? (
        <div className="flex flex-col gap-2 pl-8">
          {existingReceipts.map((receipt) => (
            <div
              key={receipt.id}
              className="flex items-center gap-2 rounded-md bg-secondary px-3 py-2"
            >
              <FileText className="size-4 shrink-0 text-muted-foreground" />
              {receipt.signedUrl ? (
                <a
                  href={receipt.signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 truncate text-xs underline-offset-2 hover:underline"
                >
                  {receipt.file_name ?? "Attachment"}
                </a>
              ) : (
                <span className="flex-1 truncate text-xs">{receipt.file_name ?? "Attachment"}</span>
              )}
              {onRemoveExisting ? (
                <button type="button" onClick={() => onRemoveExisting(receipt.id)}>
                  <X className="size-3.5 text-muted-foreground" />
                </button>
              ) : null}
            </div>
          ))}
          {value.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-2 rounded-md bg-secondary px-3 py-2"
            >
              <FileText className="size-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate text-xs">{file.name}</span>
              <button
                type="button"
                onClick={() => onChange(value.filter((_, i) => i !== index))}
              >
                <X className="size-3.5 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
