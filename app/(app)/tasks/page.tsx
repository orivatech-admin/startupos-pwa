import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, getTaskListsWithTasks } from "@/lib/queries";
import { UserAvatarLink } from "@/components/user-avatar-link";
import { TasksBoard } from "@/components/tasks/tasks-board";

export default async function TasksPage() {
  const supabase = await createClient();
  const [profile, lists] = await Promise.all([
    getCurrentProfile(supabase),
    getTaskListsWithTasks(supabase),
  ]);
  const fullName = profile?.full_name || profile?.email || "Account";
  const displayName =
    profile?.full_name?.split(" ")[0] || profile?.email?.split("@")[0] || "there";

  return (
    <div className="tasks-theme mx-auto flex min-h-svh w-full max-w-md flex-col pb-24">
      <div className="flex items-start justify-between px-4 pt-6 pb-4">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="text-xl font-semibold">{displayName}</h1>
        </div>
        <UserAvatarLink
          name={fullName}
          avatarUrl={profile?.avatar_url}
          currentModule="tasks"
        />
      </div>

      <TasksBoard
        lists={lists}
        currentUserId={profile?.id}
        currentUserRole={profile?.role}
      />
    </div>
  );
}
