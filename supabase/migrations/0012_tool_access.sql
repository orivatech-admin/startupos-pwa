-- Per-tool access control: which of the app's modules (Ledger, Tasks) a
-- user can see. Independent of admin/member role — role governs mutate
-- rights within a module a user can already see; this governs which
-- modules they see at all. Admins always see every tool regardless of
-- explicit grants (see has_tool_access below).

create type public.tool_id as enum ('ledger', 'tasks');

create table public.user_tool_access (
  user_id uuid not null references public.profiles (id) on delete cascade,
  tool public.tool_id not null,
  granted_at timestamptz not null default now(),
  primary key (user_id, tool)
);
create index user_tool_access_user_id_idx on public.user_tool_access (user_id);

alter table public.user_tool_access enable row level security;

-- Grants are managed by hand in the Supabase dashboard (same as
-- allowed_emails and profiles.role) — no in-app admin UI yet. Anyone may
-- read their own grants (needed for the app to decide what to show them),
-- or an admin may read anyone's; only an admin may write.
create policy "user_tool_access_select" on public.user_tool_access
  for select using (public.is_allowed_user() and (public.is_admin() or user_id = auth.uid()));
create policy "user_tool_access_insert" on public.user_tool_access
  for insert with check (public.is_allowed_user() and public.is_admin());
create policy "user_tool_access_update" on public.user_tool_access
  for update
  using (public.is_allowed_user() and public.is_admin())
  with check (public.is_allowed_user() and public.is_admin());
create policy "user_tool_access_delete" on public.user_tool_access
  for delete using (public.is_allowed_user() and public.is_admin());

-- Revocation-safe, mirrors is_admin()/is_allowed_user(): admins always
-- pass (full visibility on top of their existing full mutate rights);
-- everyone else needs an explicit grant row for the tool in question.
create function public.has_tool_access(check_tool public.tool_id)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select
    public.is_admin()
    or exists (
      select 1 from public.user_tool_access uta
      where uta.user_id = auth.uid() and uta.tool = check_tool
    );
$$;

grant execute on function public.has_tool_access to authenticated;

-- Grandfather every existing profile into both tools so no one loses
-- access on ship day — admins dial individual users back afterward.
insert into public.user_tool_access (user_id, tool)
select id, 'ledger'::public.tool_id from public.profiles
union all
select id, 'tasks'::public.tool_id from public.profiles
on conflict do nothing;

-- New profiles also get both tools by default, matching today's "everyone
-- gets full access" onboarding.
create function public.handle_new_profile_tool_access()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_tool_access (user_id, tool) values (new.id, 'ledger');
  insert into public.user_tool_access (user_id, tool) values (new.id, 'tasks');
  return new;
end;
$$;

create trigger on_profile_created_add_tool_access
  after insert on public.profiles
  for each row execute function public.handle_new_profile_tool_access();

-- Ledger: granular policies (accounts, payment_modes, transactions) —
-- AND has_tool_access('ledger') into every clause.
drop policy "accounts_select" on public.accounts;
create policy "accounts_select" on public.accounts
  for select using (public.is_allowed_user() and public.has_tool_access('ledger'));
drop policy "accounts_insert" on public.accounts;
create policy "accounts_insert" on public.accounts
  for insert with check (public.is_allowed_user() and public.has_tool_access('ledger'));
drop policy "accounts_update" on public.accounts;
create policy "accounts_update" on public.accounts
  for update
  using (
    public.is_allowed_user() and public.has_tool_access('ledger')
    and (public.is_admin() or created_by = auth.uid())
  )
  with check (
    public.is_allowed_user() and public.has_tool_access('ledger')
    and (public.is_admin() or created_by = auth.uid())
  );
drop policy "accounts_delete" on public.accounts;
create policy "accounts_delete" on public.accounts
  for delete using (
    public.is_allowed_user() and public.has_tool_access('ledger')
    and (public.is_admin() or created_by = auth.uid())
  );

drop policy "payment_modes_select" on public.payment_modes;
create policy "payment_modes_select" on public.payment_modes
  for select using (public.is_allowed_user() and public.has_tool_access('ledger'));
drop policy "payment_modes_insert" on public.payment_modes;
create policy "payment_modes_insert" on public.payment_modes
  for insert with check (public.is_allowed_user() and public.has_tool_access('ledger'));
drop policy "payment_modes_update" on public.payment_modes;
create policy "payment_modes_update" on public.payment_modes
  for update
  using (
    public.is_allowed_user() and public.has_tool_access('ledger')
    and (public.is_admin() or created_by = auth.uid())
  )
  with check (
    public.is_allowed_user() and public.has_tool_access('ledger')
    and (public.is_admin() or created_by = auth.uid())
  );
drop policy "payment_modes_delete" on public.payment_modes;
create policy "payment_modes_delete" on public.payment_modes
  for delete using (
    public.is_allowed_user() and public.has_tool_access('ledger')
    and (public.is_admin() or created_by = auth.uid())
  );

drop policy "transactions_select" on public.transactions;
create policy "transactions_select" on public.transactions
  for select using (public.is_allowed_user() and public.has_tool_access('ledger'));
drop policy "transactions_insert" on public.transactions;
create policy "transactions_insert" on public.transactions
  for insert with check (public.is_allowed_user() and public.has_tool_access('ledger'));
drop policy "transactions_update" on public.transactions;
create policy "transactions_update" on public.transactions
  for update
  using (
    public.is_allowed_user() and public.has_tool_access('ledger')
    and (public.is_admin() or created_by = auth.uid())
  )
  with check (
    public.is_allowed_user() and public.has_tool_access('ledger')
    and (public.is_admin() or created_by = auth.uid())
  );
drop policy "transactions_delete" on public.transactions;
create policy "transactions_delete" on public.transactions
  for delete using (
    public.is_allowed_user() and public.has_tool_access('ledger')
    and (public.is_admin() or created_by = auth.uid())
  );

-- Ledger: tables still on a single blanket "for all" policy (never split
-- into granular policies by 0005_roles.sql) — AND the tool check into
-- that one policy rather than splitting them now.
drop policy "allowlisted full access" on public.categories;
create policy "allowlisted full access" on public.categories
  for all
  using (public.is_allowed_user() and public.has_tool_access('ledger'))
  with check (public.is_allowed_user() and public.has_tool_access('ledger'));

drop policy "allowlisted full access" on public.projects;
create policy "allowlisted full access" on public.projects
  for all
  using (public.is_allowed_user() and public.has_tool_access('ledger'))
  with check (public.is_allowed_user() and public.has_tool_access('ledger'));

drop policy "allowlisted full access" on public.tags;
create policy "allowlisted full access" on public.tags
  for all
  using (public.is_allowed_user() and public.has_tool_access('ledger'))
  with check (public.is_allowed_user() and public.has_tool_access('ledger'));

drop policy "allowlisted full access" on public.transaction_tags;
create policy "allowlisted full access" on public.transaction_tags
  for all
  using (public.is_allowed_user() and public.has_tool_access('ledger'))
  with check (public.is_allowed_user() and public.has_tool_access('ledger'));

drop policy "allowlisted full access" on public.receipts;
create policy "allowlisted full access" on public.receipts
  for all
  using (public.is_allowed_user() and public.has_tool_access('ledger'))
  with check (public.is_allowed_user() and public.has_tool_access('ledger'));

drop policy "allowlisted manage receipts" on storage.objects;
create policy "allowlisted manage receipts" on storage.objects
  for all
  using (bucket_id = 'receipts' and public.is_allowed_user() and public.has_tool_access('ledger'))
  with check (bucket_id = 'receipts' and public.is_allowed_user() and public.has_tool_access('ledger'));

-- Tasks: granular policies from 0008_tasks.sql / 0009_tasks_sharing.sql —
-- AND has_tool_access('tasks') into every clause.
drop policy "task_lists_select" on public.task_lists;
create policy "task_lists_select" on public.task_lists
  for select using (public.is_allowed_user() and public.has_tool_access('tasks'));
drop policy "task_lists_insert" on public.task_lists;
create policy "task_lists_insert" on public.task_lists
  for insert with check (public.is_allowed_user() and public.has_tool_access('tasks'));
drop policy "task_lists_update" on public.task_lists;
create policy "task_lists_update" on public.task_lists
  for update
  using (
    public.is_allowed_user() and public.has_tool_access('tasks')
    and (public.is_admin() or user_id = auth.uid())
  )
  with check (
    public.is_allowed_user() and public.has_tool_access('tasks')
    and (public.is_admin() or user_id = auth.uid())
  );
drop policy "task_lists_delete" on public.task_lists;
create policy "task_lists_delete" on public.task_lists
  for delete using (
    public.is_allowed_user() and public.has_tool_access('tasks')
    and (public.is_admin() or user_id = auth.uid())
  );

drop policy "tasks_select" on public.tasks;
create policy "tasks_select" on public.tasks
  for select using (public.is_allowed_user() and public.has_tool_access('tasks'));
drop policy "tasks_insert" on public.tasks;
create policy "tasks_insert" on public.tasks
  for insert with check (public.is_allowed_user() and public.has_tool_access('tasks'));
drop policy "tasks_update" on public.tasks;
create policy "tasks_update" on public.tasks
  for update
  using (
    public.is_allowed_user() and public.has_tool_access('tasks')
    and (public.is_admin() or user_id = auth.uid() or assignee_id = auth.uid())
  )
  with check (
    public.is_allowed_user() and public.has_tool_access('tasks')
    and (public.is_admin() or user_id = auth.uid() or assignee_id = auth.uid())
  );
drop policy "tasks_delete" on public.tasks;
create policy "tasks_delete" on public.tasks
  for delete using (
    public.is_allowed_user() and public.has_tool_access('tasks')
    and (public.is_admin() or user_id = auth.uid() or assignee_id = auth.uid())
  );
