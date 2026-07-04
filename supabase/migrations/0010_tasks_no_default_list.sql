-- Removes the per-user default "My Tasks" list (0008). Tasks may now belong to
-- no list (list_id null); those unlisted tasks are grouped under a virtual
-- "My Tasks" section in the UI. Lists are only ever created explicitly.

-- Stop auto-creating a default list whenever a profile is created.
drop trigger if exists on_profile_created_add_task_list on public.profiles;
drop function if exists public.handle_new_profile_task_list();

-- Tasks can now be unlisted.
alter table public.tasks alter column list_id drop not null;

-- Move tasks out of the old default lists so they surface under "My Tasks".
update public.tasks t
set list_id = null
from public.task_lists l
where t.list_id = l.id and l.is_default;

-- Remove the old default lists and the "default list" concept entirely.
delete from public.task_lists where is_default;
drop index if exists public.one_default_task_list_per_user;
alter table public.task_lists drop column is_default;
