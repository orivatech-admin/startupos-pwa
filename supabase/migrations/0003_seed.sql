insert into public.categories (name, icon, sort_order) values
  ('Others', 'ellipsis', 0),
  ('Food and Dining', 'utensils', 1),
  ('Shopping', 'shopping-bag', 2),
  ('Travelling', 'plane', 3),
  ('Entertainment', 'film', 4),
  ('Medical', 'heart-pulse', 5),
  ('Personal Care', 'sparkles', 6),
  ('Education', 'graduation-cap', 7),
  ('Bills and Utilities', 'receipt', 8),
  ('Investments', 'trending-up', 9),
  ('Rent', 'home', 10),
  ('Taxes', 'landmark', 11),
  ('Company', 'building-2', 12),
  ('Gifts and Donation', 'gift', 13),
  ('Grocery', 'shopping-cart', 14),
  ('Vehicle', 'car', 15);

insert into public.accounts (name) values ('Bank Account');

insert into public.payment_modes (account_id, name, kind, is_default)
select id, 'Bank Account', 'bank_account', true
from public.accounts
where name = 'Bank Account';
