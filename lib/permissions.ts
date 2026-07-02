import type { UserRole } from "@/lib/supabase/types";

// Plain, client-safe permission check — no "server-only" guard, since
// components render this to decide whether to show edit/delete controls at
// all. The real enforcement is server-side (RLS + lib/access.ts).
export function canMutateRecord(
  role: UserRole | undefined,
  userId: string | undefined,
  createdBy: string | null | undefined
): boolean {
  if (!userId) return false;
  return role === "admin" || createdBy === userId;
}
