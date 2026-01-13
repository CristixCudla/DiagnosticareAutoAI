-- Set cristian.cudla1@student.usv.ro as admin
update public.profiles
set is_admin = true
where email = 'cristian.cudla1@student.usv.ro';

-- Give admin user premium access
update public.subscriptions
set 
  tier = 'premium',
  is_active = true,
  subscription_start_date = now(),
  subscription_end_date = now() + interval '100 years'
where user_id = (
  select id from public.profiles
  where email = 'cristian.cudla1@student.usv.ro'
);
