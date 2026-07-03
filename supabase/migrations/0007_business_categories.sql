-- Replaces the personal-expense category set with the business/startup
-- categories this ledger is actually used for. There's no meaningful 1:1
-- mapping from the old personal set (Food and Dining, Grocery, ...) to the
-- new business set (Office Expenses, Cloud Hosting, ...), so existing
-- non-transfer transactions are repointed at the new 'Others' category
-- instead -- category_id can't just be cleared, since
-- category_required_for_non_transfer requires it to stay non-null.

-- Captured by id (not name) before inserting the new set, since the new
-- set also contains an 'Others' row, which would make a name match
-- ambiguous if done afterward.
create temporary table _old_category_ids as select id from public.categories;

insert into public.categories (name, icon, sort_order) values
  ('Office Expenses', 'building-2', 0),
  ('Software Subscriptions', 'app-window', 1),
  ('Cloud Hosting & Infrastructure', 'cloud', 2),
  ('Domains & Web Hosting', 'globe', 3),
  ('Registration & Legal', 'scale', 4),
  ('Accounting & Tax', 'calculator', 5),
  ('Banking & Financial Charges', 'landmark', 6),
  ('Employee Salaries', 'users', 7),
  ('Freelancer & Contractor Payments', 'handshake', 8),
  ('Hardware & Equipment', 'cpu', 9),
  ('Internet & Telecom', 'wifi', 10),
  ('Travel & Transportation', 'plane', 11),
  ('Marketing & Advertising', 'megaphone', 12),
  ('Professional Services', 'briefcase', 13),
  ('Training & Learning', 'graduation-cap', 14),
  ('Security & Compliance', 'shield-check', 15),
  ('Others', 'ellipsis', 16);

update public.transactions
set category_id = (
  select id from public.categories
  where name = 'Others' and id not in (select id from _old_category_ids)
)
where category_id in (select id from _old_category_ids);

delete from public.categories where id in (select id from _old_category_ids);

drop table _old_category_ids;
