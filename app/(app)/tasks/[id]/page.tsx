import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, getTaskById, getTaskMembers } from "@/lib/queries";
import { TaskDetail } from "@/components/tasks/task-detail";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [task, members, profile] = await Promise.all([
    getTaskById(supabase, id),
    getTaskMembers(supabase),
    getCurrentProfile(supabase),
  ]);

  if (!task) notFound();

  const nameById = new Map(members.map((m) => [m.id, m.name]));
  const creatorName = task.user_id ? nameById.get(task.user_id) ?? null : null;

  return (
    <div className="tasks-theme mx-auto flex min-h-svh w-full max-w-md flex-col pb-24">
      <TaskDetail
        task={task}
        members={members}
        creatorName={creatorName}
        currentUserId={profile?.id}
        currentUserRole={profile?.role}
      />
    </div>
  );
}
