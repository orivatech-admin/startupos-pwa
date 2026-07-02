-- Reworks the account/payment-mode model:
--   - accounts now carry a type (bank_account | wallet | credit_card) and are
--     the primary, required reference on a transaction.
--   - payment_modes become an optional, secondary detail per account,
--     describing HOW money moved (upi | cheque | internet_banking |
--     debit_card) rather than a stand-in for the account itself.
-- Existing test data is wiped rather than migrated (clean slate).

drop view if exists public.payment_mode_balances;

truncate table
  public.transaction_tags,
  public.receipts,
  public.transactions,
  public.payment_modes,
  public.accounts
cascade;

alter table public.accounts
  add column account_type text not null default 'bank_account'
    check (account_type in ('bank_account', 'wallet', 'credit_card')),
  add column is_default boolean not null default false;
alter table public.accounts alter column account_type drop default;

create unique index one_default_account
  on public.accounts (is_default)
  where is_default;

alter table public.payment_modes
  drop column is_default,
  drop constraint payment_modes_kind_check,
  alter column kind drop default,
  add constraint payment_modes_kind_check
    check (kind in ('upi', 'cheque', 'internet_banking', 'debit_card'));
drop index if exists one_default_payment_mode;

-- destination_payment_mode_id never had a UI (transfers only pick accounts,
-- not a payment-mode instrument), so it's dropped rather than left dead.
alter table public.transactions
  add column account_id uuid not null references public.accounts (id),
  add column destination_account_id uuid references public.accounts (id),
  alter column payment_mode_id drop not null,
  drop column destination_payment_mode_id;

alter table public.transactions
  drop constraint transfer_requires_destination,
  add constraint transfer_requires_destination check (
    transaction_type <> 'transfer'
    or (
      destination_account_id is not null
      and destination_account_id <> account_id
    )
  );

create index transactions_account_id_idx on public.transactions (account_id);
create index transactions_destination_account_id_idx on public.transactions (destination_account_id);

-- Running balance per account, derived rather than stored to avoid drift.
create view public.account_balances
with (security_invoker = true)
as
select
  a.id as account_id,
  coalesce(sum(
    case
      when t.account_id = a.id and t.transaction_type = 'income' then t.amount
      when t.account_id = a.id and t.transaction_type = 'expense' then -t.amount
      when t.account_id = a.id and t.transaction_type = 'transfer' then -t.amount
      when t.destination_account_id = a.id and t.transaction_type = 'transfer' then t.amount
      else 0
    end
  ), 0) as balance
from public.accounts a
left join public.transactions t
  on t.account_id = a.id or t.destination_account_id = a.id
group by a.id;

-- Re-seed a default account: 0003's seed ran before this migration (or, on a
-- fresh install, right before the truncate above wipes it), so the app needs
-- at least one usable account again. No matching payment_modes row this time
-- — payment mode is an optional, separate concept now.
insert into public.accounts (name, account_type, is_default)
values ('Bank Account', 'bank_account', true);
