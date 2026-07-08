import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { LayoutGrid } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAccessContext } from "@/lib/access";
import { TOOL_HOME, type ToolId } from "@/lib/tools";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { hasEnvVars } from "@/lib/utils";

export default async function LandingPage() {
  if (hasEnvVars) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    if (data?.claims) {
      const access = await getAccessContext(supabase);
      const cookieStore = await cookies();
      const preferred = cookieStore.get("active_workspace")?.value as ToolId | undefined;
      const tools = access?.tools ?? [];
      const target = preferred && tools.includes(preferred) ? preferred : tools[0];
      redirect(target ? TOOL_HOME[target] : "/unauthorized");
    }
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-10 p-8 text-center">
      <div className="flex flex-col items-center gap-6">
        <div className="mx-auto flex w-fit items-center gap-3">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <LayoutGrid className="size-8" />
          </div>
          <h1 className="flex flex-col items-start text-left leading-tight">
            <span className="text-lg font-normal text-muted-foreground">The</span>
            <span className="text-3xl font-semibold">StartUp</span>
            <span className="text-3xl font-semibold">OS</span>
          </h1>
        </div>
        <p className="max-w-xs text-balance text-xs tracking-wide text-muted-foreground/70 uppercase">
          The toolkit for early-stage teams.
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <GoogleSignInButton />
        <p className="text-xs text-muted-foreground">
          Internal use only. Access is limited to approved accounts.
        </p>
      </div>
    </main>
  );
}
