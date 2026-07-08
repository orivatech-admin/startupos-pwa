-- Replaces the boolean tasks.is_completed with a real 3-state workflow
-- (todo -> in_progress -> done), and tracks when a task became done so the
-- UI can hide tasks that have sat in "done" for a while.

create type public.task_status as enum ('todo', 'in_progress', 'done');

alter table public.tasks add column status public.task_status not null default 'todo';
alter table public.tasks add column completed_at timestamptz;

update public.tasks
set
  status = case when is_completed then 'done'::public.task_status else 'todo'::public.task_status end,
  -- We never recorded a real completion time under the old boolean field.
  -- Backfilling to now() (rather than created_at) avoids retroactively
  -- hiding already-done tasks the moment this ships.
  completed_at = case when is_completed then now() else null end;

alter table public.tasks drop column is_completed;

-- Keeps completed_at in sync with status regardless of which code path
-- changes it, so callers only ever need to set `status`.
create function public.set_task_completed_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'done' then
    -- Only stamp the moment of the todo/in_progress -> done transition;
    -- leave it alone on unrelated edits to an already-done task.
    if tg_op = 'INSERT' or old.status is distinct from 'done' then
      new.completed_at := now();
    end if;
  else
    new.completed_at := null;
  end if;
  return new;
end;
$$;

create trigger tasks_set_completed_at
  before insert or update on public.tasks
  for each row execute function public.set_task_completed_at();
