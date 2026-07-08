import Link from "next/link";
import { cookies } from "next/headers";
import { format } from "date-fns";
import { ChevronLeft, Mail, CalendarDays } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAccessContext } from "@/lib/access";
import { getCurrentProfile } from "@/lib/queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { SignOutButton } from "@/components/sign-out-button";
import { ActiveWorkspace, type WorkspaceId } from "@/components/active-workspace";
import { ThemeToggle } from "@/components/theme-toggle";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const [profile, access] = await Promise.all([
    getCurrentProfile(supabase),
    getAccessContext(supabase),
  ]);
  const name = profile?.full_name || profile?.email || "Account";
  const canSwitchWorkspace = (access?.tools.length ?? 0) > 1;

  const cookieStore = await cookies();
  const activeWorkspace: WorkspaceId =
    cookieStore.get("active_workspace")?.value === "tasks" ? "tasks" : "ledger";

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col">
      <div className="flex items-center gap-3 border-b border-glass-border bg-glass px-4 py-3 backdrop-blur-xl dark:bg-card/50">
        <Link href="/home" aria-label="Back">
          <ChevronLeft className="size-5" />
        </Link>
        <h1 className="text-base font-medium">Profile</h1>
      </div>

      <div className="flex flex-col items-center gap-3 px-4 pt-8 pb-4 text-center">
        <Avatar className="size-20 border border-border">
          {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} alt={name} /> : null}
          <AvatarFallback className="bg-secondary text-lg text-secondary-foreground">
            {initials(name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-lg font-semibold">{name}</p>
          {profile?.email ? <p className="text-sm text-muted-foreground">{profile.email}</p> : null}
        </div>
      </div>

      <div className="flex flex-col gap-3 px-4 pt-4">
        {canSwitchWorkspace ? <ActiveWorkspace active={activeWorkspace} /> : null}

        <Card className="gap-0 divide-y divide-border p-0">
          <div className="flex items-center gap-3 px-4 py-3">
            <Mail className="size-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm">{profile?.email ?? "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <CalendarDays className="size-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Member since</p>
              <p className="text-sm">
                {profile?.created_at ? format(new Date(profile.created_at), "d MMM yyyy") : "—"}
              </p>
            </div>
          </div>
          <ThemeToggle />
        </Card>

        <SignOutButton className="w-full" />
      </div>
    </div>
  );
}
