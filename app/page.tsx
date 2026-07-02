import { redirect } from "next/navigation";
import { Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { hasEnvVars } from "@/lib/utils";

export default async function LandingPage() {
  if (hasEnvVars) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    if (data?.claims) {
      redirect("/home");
    }
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-10 p-8 text-center">
      <div className="flex flex-col items-center gap-6">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Wallet className="size-8" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">Ledger</h1>
          <p className="max-w-xs text-balance text-sm text-muted-foreground">
            Track every rupee that moves. Expenses, income, and transfers —
            one quiet place for the whole team.
          </p>
        </div>
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
