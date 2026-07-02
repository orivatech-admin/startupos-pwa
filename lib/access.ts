import "server-only";
import type { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/supabase/types";
import { canMutateRecord } from "@/lib/permissions";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export interface AccessContext {
  userId: string;
  role: UserRole;
}

export const PERMISSION_ERROR = "You can only edit or delete records you created.";

export async function getAccessContext(supabase: SupabaseClient): Promise<AccessContext | null> {
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  return { userId, role: profile?.role ?? "member" };
}

export function canMutate(access: AccessContext | null, createdBy: string | null): boolean {
  return canMutateRecord(access?.role, access?.userId, createdBy);
}
