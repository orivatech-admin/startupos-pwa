-- Allowlist of emails permitted to sign in. No RLS policies are defined on
-- this table on purpose: it must only be reachable via the security definer
-- functions below, never directly from the client.
create table public.allowed_emails (
  email text primary key,
  note text,
  created_at timestamptz not null default now()
);
alter table public.allowed_emails enable row level security;

-- Bridges auth.users -> app data. transactions.created_by references this,
-- not auth.users directly, since auth.users isn't exposed via PostgREST.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Top-level account, e.g. "Bank Account".
create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  opening_balance numeric(12, 2) not null default 0,
  is_archived boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- A wallet/card/cash mode nested under an account.
create table public.payment_modes (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  name text not null,
  kind text not null default 'other'
    check (kind in ('bank_account', 'credit_card', 'wallet', 'cash', 'other')),
  is_default boolean not null default false,
  is_archived boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create unique index one_default_payment_mode
  on public.payment_modes (is_default)
  where is_default;

-- Fixed, seeded list. No CRUD UI in v1.
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  icon text not null,
  sort_order int not null default 0,
  is_archived boolean not null default false
);

-- Freeform, user-creatable inline from the transaction form.
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_by uuid references public.profiles (id),
  is_archived boolean not null default false,
  created_at timestamptz not null default now()
);

-- Freeform, many-to-many, create-on-the-fly from the tag input.
create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  transaction_type text not null
    check (transaction_type in ('expense', 'income', 'transfer')),
  amount numeric(12, 2) not null check (amount > 0),
  currency text not null default 'INR',
  date_time timestamptz not null,
  created_at timestamptz not null default now(),
  created_by uuid not null references public.profiles (id) default auth.uid(),
  category_id uuid references public.categories (id),
  project_id uuid references public.projects (id),
  payment_mode_id uuid not null references public.payment_modes (id),
  destination_payment_mode_id uuid references public.payment_modes (id),
  status text not null default 'recorded'
    check (status in ('recorded', 'reconciled')),
  notes text,
  constraint transfer_requires_destination check (
    transaction_type <> 'transfer'
    or (
      destination_payment_mode_id is not null
      and destination_payment_mode_id <> payment_mode_id
    )
  ),
  constraint category_required_for_non_transfer check (
    transaction_type = 'transfer' or category_id is not null
  )
);
create index transactions_date_time_idx on public.transactions (date_time desc);
create index transactions_category_id_idx on public.transactions (category_id);
create index transactions_payment_mode_id_idx on public.transactions (payment_mode_id);
create index transactions_project_id_idx on public.transactions (project_id);

create table public.transaction_tags (
  transaction_id uuid not null references public.transactions (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (transaction_id, tag_id)
);
create index transaction_tags_tag_id_idx on public.transaction_tags (tag_id);

create table public.receipts (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.transactions (id) on delete cascade,
  storage_path text not null,
  file_name text,
  content_type text,
  size_bytes bigint,
  uploaded_by uuid references public.profiles (id),
  uploaded_at timestamptz not null default now()
);
create index receipts_transaction_id_idx on public.receipts (transaction_id);

-- Running balance per payment mode, derived rather than stored to avoid drift.
-- security_invoker so the view enforces the querying user's own RLS instead
-- of running as the (RLS-bypassing) view owner.
create view public.payment_mode_balances
with (security_invoker = true)
as
select
  pm.id as payment_mode_id,
  pm.account_id,
  coalesce(sum(
    case
      when t.payment_mode_id = pm.id and t.transaction_type = 'income' then t.amount
      when t.payment_mode_id = pm.id and t.transaction_type = 'expense' then -t.amount
      when t.payment_mode_id = pm.id and t.transaction_type = 'transfer' then -t.amount
      when t.destination_payment_mode_id = pm.id and t.transaction_type = 'transfer' then t.amount
      else 0
    end
  ), 0) as balance
from public.payment_modes pm
left join public.transactions t
  on t.payment_mode_id = pm.id or t.destination_payment_mode_id = pm.id
group by pm.id, pm.account_id;
