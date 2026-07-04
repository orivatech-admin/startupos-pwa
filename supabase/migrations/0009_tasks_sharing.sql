-- Reworks task_lists/tasks visibility from "private per user" (0008) to
-- shared like the ledger: every allowlisted user can see every list and
-- task, but mutating a task is limited to an admin, its creator, or its
-- assignee. Also adds task assignment.

alter table public.tasks
  add column assignee_id uuid references public.profiles (id);
create index tasks_assignee_id_idx on public.tasks (assignee_id);

drop policy "task_lists_select" on public.task_lists;
drop policy "task_lists_update" on public.task_lists;
drop policy "task_lists_delete" on public.task_lists;

-- Lists: everyone can see every list; mutating one is limited to its
-- creator or an admin (no explicit spec for lists, so this mirrors the
-- accounts/payment_modes convention).
create policy "task_lists_select" on public.task_lists
  for select using (public.is_allowed_user());
create policy "task_lists_update" on public.task_lists
  for update
  using (public.is_allowed_user() and (public.is_admin() or user_id = auth.uid()))
  with check (public.is_allowed_user() and (public.is_admin() or user_id = auth.uid()));
create policy "task_lists_delete" on public.task_lists
  for delete using (public.is_allowed_user() and (public.is_admin() or user_id = auth.uid()));

drop policy "tasks_select" on public.tasks;
drop policy "tasks_update" on public.tasks;
drop policy "tasks_delete" on public.tasks;

-- Tasks: everyone can see every task. Admins may edit/delete any task;
-- members may only edit/delete tasks they created or are assigned to.
create policy "tasks_select" on public.tasks
  for select using (public.is_allowed_user());
create policy "tasks_update" on public.tasks
  for update
  using (
    public.is_allowed_user()
    and (public.is_admin() or user_id = auth.uid() or assignee_id = auth.uid())
  )
  with check (
    public.is_allowed_user()
    and (public.is_admin() or user_id = auth.uid() or assignee_id = auth.uid())
  );
create policy "tasks_delete" on public.tasks
  for delete using (
    public.is_allowed_user()
    and (public.is_admin() or user_id = auth.uid() or assignee_id = auth.uid())
  );
