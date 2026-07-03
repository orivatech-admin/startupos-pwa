-- is_allowed_user() compared auth.jwt() ->> 'email' against allowed_emails.
-- That claim is a snapshot baked into the access token at mint time, and on
-- a brand-new signup the very first token issued (from the same
-- exchangeCodeForSession call that creates the auth.users row) can carry an
-- empty email claim even though auth.users.email is already set -- causing
-- first-time signups to fail the allowlist check, get signed out, and have
-- to log in again before it works. Read the live auth.users row instead of
-- trusting the token's claim.
create or replace function public.is_allowed_user()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from auth.users u
    join public.allowed_emails ae on lower(ae.email) = lower(u.email)
    where u.id = auth.uid()
  );
$$;
