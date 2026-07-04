-- Personal task management, separate from the shared ledger tables above:
-- each user's lists and tasks are visible only to them, not to every
-- allowlisted user.

create table public.task_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  name text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index task_lists_user_id_idx on public.task_lists (user_id);
-- At most one default ("My Tasks") list per user.
create unique index one_default_task_list_per_user
  on public.task_lists (user_id)
  where is_default;

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.task_lists (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  title text not null,
  description text,
  due_at timestamptz,
  is_completed boolean not null default false,
  created_at timestamptz not null default now()
);
create index tasks_list_id_idx on public.tasks (list_id);
create index tasks_user_id_idx on public.tasks (user_id);

-- Every user gets a personal "My Tasks" list the moment their profile row
-- is created (see handle_new_user in 0001_init_schema.sql).
create function public.handle_new_profile_task_list()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.task_lists (user_id, name, is_default)
  values (new.id, 'My Tasks', true);
  return new;
end;
$$;

create trigger on_profile_created_add_task_list
  after insert on public.profiles
  for each row execute function public.handle_new_profile_task_list();

alter table public.task_lists enable row level security;
alter table public.tasks enable row level security;

create policy "task_lists_select" on public.task_lists
  for select using (public.is_allowed_user() and user_id = auth.uid());
create policy "task_lists_insert" on public.task_lists
  for insert with check (public.is_allowed_user() and user_id = auth.uid());
create policy "task_lists_update" on public.task_lists
  for update
  using (public.is_allowed_user() and user_id = auth.uid())
  with check (public.is_allowed_user() and user_id = auth.uid());
create policy "task_lists_delete" on public.task_lists
  for delete using (public.is_allowed_user() and user_id = auth.uid());

create policy "tasks_select" on public.tasks
  for select using (public.is_allowed_user() and user_id = auth.uid());
create policy "tasks_insert" on public.tasks
  for insert with check (public.is_allowed_user() and user_id = auth.uid());
create policy "tasks_update" on public.tasks
  for update
  using (public.is_allowed_user() and user_id = auth.uid())
  with check (public.is_allowed_user() and user_id = auth.uid());
create policy "tasks_delete" on public.tasks
  for delete using (public.is_allowed_user() and user_id = auth.uid());

-- Backfill: existing profiles predate this trigger.
insert into public.task_lists (user_id, name, is_default)
select id, 'My Tasks', true from public.profiles
on conflict do nothing;
