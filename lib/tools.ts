import type { ToolId } from "@/lib/supabase/types";

export type { ToolId };

// Where a user lands when redirected into a given tool.
export const TOOL_HOME: Record<ToolId, string> = {
  ledger: "/home",
  tasks: "/tasks",
};
