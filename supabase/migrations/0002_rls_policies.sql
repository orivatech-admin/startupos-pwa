-- Wired as the Supabase "Before User Created" Auth Hook (manual dashboard
-- step) so a Google account outside the allowlist never gets an auth.users
-- row in the first place.
create function public.check_allowed_email(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_email text;
begin
  new_email := lower(event -> 'user' ->> 'email');
  if new_email is null or not exists (
    select 1 from public.allowed_emails ae where lower(ae.email) = new_email
  ) then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 403,
        'message', 'This app is invite-only. Your email is not authorized.'
      )
    );
  end if;
  return jsonb_build_object();
end;
$$;

grant execute on function public.check_allowed_email to supabase_auth_admin;
revoke execute on function public.check_allowed_email from authenticated, anon, public;

-- Revocation-safe membership check: re-evaluated on every query via RLS, so
-- removing a row from allowed_emails immediately cuts off an existing
-- session too, not just future sign-ups.
create function public.is_allowed_user()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.allowed_emails ae
    where lower(ae.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

grant execute on function public.is_allowed_user to authenticated;

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.payment_modes enable row level security;
alter table public.categories enable row level security;
alter table public.projects enable row level security;
alter table public.tags enable row level security;
alter table public.transactions enable row level security;
alter table public.transaction_tags enable row level security;
alter table public.receipts enable row level security;

-- Shared ledger: every allowlisted user has full read/write access to every
-- table, matching a single company book rather than per-user ownership.
create policy "allowlisted full access" on public.profiles
  for all using (public.is_allowed_user()) with check (public.is_allowed_user());
create policy "allowlisted full access" on public.accounts
  for all using (public.is_allowed_user()) with check (public.is_allowed_user());
create policy "allowlisted full access" on public.payment_modes
  for all using (public.is_allowed_user()) with check (public.is_allowed_user());
create policy "allowlisted full access" on public.categories
  for all using (public.is_allowed_user()) with check (public.is_allowed_user());
create policy "allowlisted full access" on public.projects
  for all using (public.is_allowed_user()) with check (public.is_allowed_user());
create policy "allowlisted full access" on public.tags
  for all using (public.is_allowed_user()) with check (public.is_allowed_user());
create policy "allowlisted full access" on public.transactions
  for all using (public.is_allowed_user()) with check (public.is_allowed_user());
create policy "allowlisted full access" on public.transaction_tags
  for all using (public.is_allowed_user()) with check (public.is_allowed_user());
create policy "allowlisted full access" on public.receipts
  for all using (public.is_allowed_user()) with check (public.is_allowed_user());

-- Private receipts bucket: only allowlisted users can read/write, and only
-- ever via short-lived signed URLs generated server-side (never public).
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

create policy "allowlisted manage receipts" on storage.objects
  for all
  using (bucket_id = 'receipts' and public.is_allowed_user())
  with check (bucket_id = 'receipts' and public.is_allowed_user());
