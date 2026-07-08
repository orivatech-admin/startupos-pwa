import "server-only";
import { redirect } from "next/navigation";
import type { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/supabase/types";
import { canMutateRecord } from "@/lib/permissions";
import { TOOL_HOME, type ToolId } from "@/lib/tools";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

const ALL_TOOLS: ToolId[] = ["ledger", "tasks"];

export interface AccessContext {
  userId: string;
  role: UserRole;
  tools: ToolId[];
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

  const role = profile?.role ?? "member";

  // Admins always see every tool, regardless of explicit grants — role
  // implies full visibility, same way admins already bypass owner-only
  // mutate checks elsewhere.
  if (role === "admin") {
    return { userId, role, tools: ALL_TOOLS };
  }

  const { data: grants } = await supabase.from("user_tool_access").select("tool").eq("user_id", userId);

  return { userId, role, tools: (grants ?? []).map((g) => g.tool) };
}

export function canMutate(access: AccessContext | null, createdBy: string | null): boolean {
  return canMutateRecord(access?.role, access?.userId, createdBy);
}

// Page-level guard for tool-gated routes — redirects unauthenticated users
// to sign in, redirects users lacking `tool` to a tool they do have (or
// /unauthorized if they have none). RLS is the real security boundary;
// this exists purely so a locked-out user gets a sensible redirect instead
// of a broken/empty page.
export async function requireTool(supabase: SupabaseClient, tool: ToolId): Promise<AccessContext> {
  const access = await getAccessContext(supabase);
  if (!access) redirect("/");
  if (access.tools.includes(tool)) return access;

  const fallback = access.tools[0];
  redirect(fallback ? TOOL_HOME[fallback] : "/unauthorized");
}
