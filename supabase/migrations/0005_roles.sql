-- Adds admin/member roles. Everyone (any allowlisted user) can still read
-- everything — this only tightens who may mutate/delete. Admins keep full
-- write access everywhere; members may only edit/delete rows they created.

create type public.user_role as enum ('admin', 'member');

alter table public.profiles
  add column role public.user_role not null default 'member';

create function public.is_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_admin to authenticated;

-- accounts and payment_modes never tracked a creator before now (unlike
-- transactions, which already has created_by) — needed to know who "owns"
-- a row for the member-level edit/delete check below. Existing rows have no
-- known creator, so they're left NULL, which only an admin can edit/delete.
alter table public.accounts
  add column created_by uuid references public.profiles (id) default auth.uid();
alter table public.payment_modes
  add column created_by uuid references public.profiles (id) default auth.uid();

-- Split each blanket "allowlisted full access" policy into per-action
-- policies: read stays open to every allowlisted user, write narrows to
-- admin-or-owner.
drop policy "allowlisted full access" on public.accounts;
create policy "accounts_select" on public.accounts
  for select using (public.is_allowed_user());
create policy "accounts_insert" on public.accounts
  for insert with check (public.is_allowed_user());
create policy "accounts_update" on public.accounts
  for update
  using (public.is_allowed_user() and (public.is_admin() or created_by = auth.uid()))
  with check (public.is_allowed_user() and (public.is_admin() or created_by = auth.uid()));
create policy "accounts_delete" on public.accounts
  for delete using (public.is_allowed_user() and (public.is_admin() or created_by = auth.uid()));

drop policy "allowlisted full access" on public.payment_modes;
create policy "payment_modes_select" on public.payment_modes
  for select using (public.is_allowed_user());
create policy "payment_modes_insert" on public.payment_modes
  for insert with check (public.is_allowed_user());
create policy "payment_modes_update" on public.payment_modes
  for update
  using (public.is_allowed_user() and (public.is_admin() or created_by = auth.uid()))
  with check (public.is_allowed_user() and (public.is_admin() or created_by = auth.uid()));
create policy "payment_modes_delete" on public.payment_modes
  for delete using (public.is_allowed_user() and (public.is_admin() or created_by = auth.uid()));

drop policy "allowlisted full access" on public.transactions;
create policy "transactions_select" on public.transactions
  for select using (public.is_allowed_user());
create policy "transactions_insert" on public.transactions
  for insert with check (public.is_allowed_user());
create policy "transactions_update" on public.transactions
  for update
  using (public.is_allowed_user() and (public.is_admin() or created_by = auth.uid()))
  with check (public.is_allowed_user() and (public.is_admin() or created_by = auth.uid()));
create policy "transactions_delete" on public.transactions
  for delete using (public.is_allowed_user() and (public.is_admin() or created_by = auth.uid()));

-- "Default account" is a shared app-level preference, not personal content —
-- any allowlisted user may change it regardless of who created either
-- account involved, even though the accounts_update policy above otherwise
-- restricts updates to admins/owners.
create function public.set_default_account(target_account_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_allowed_user() then
    raise exception 'Not authorized';
  end if;

  update public.accounts set is_default = false where is_default = true;
  update public.accounts set is_default = true where id = target_account_id;
end;
$$;

grant execute on function public.set_default_account to authenticated;
