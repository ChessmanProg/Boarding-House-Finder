-- Boarding House Finder: user account approval workflow
create table if not exists public.user_access (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id)
);

alter table public.user_access enable row level security;

revoke all on public.user_access from anon;
grant select, insert on public.user_access to authenticated;
grant update on public.user_access to authenticated;

create policy "Users can read their own access request"
on public.user_access for select to authenticated
using (user_id = (select auth.uid()));

create policy "Users can create their own pending access request"
on public.user_access for insert to authenticated
with check (
  user_id = (select auth.uid())
  and status = 'pending'
);

create policy "Owner can read all access requests"
on public.user_access for select to authenticated
using (lower((select auth.jwt())->>'email') = 'tneilandre20@gmail.com');

create policy "Owner can review access requests"
on public.user_access for update to authenticated
using (lower((select auth.jwt())->>'email') = 'tneilandre20@gmail.com')
with check (
  lower((select auth.jwt())->>'email') = 'tneilandre20@gmail.com'
  and status in ('approved', 'rejected', 'pending')
);

create or replace function public.create_user_access_request()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_access (user_id, email, status)
  values (new.id, coalesce(new.email, ''), 'pending')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_access_request on auth.users;
create trigger on_auth_user_created_access_request
after insert on auth.users
for each row execute function public.create_user_access_request();
