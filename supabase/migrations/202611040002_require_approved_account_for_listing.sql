-- Restrict creating listing submissions to approved accounts.
-- Public browsing of approved listings remains unchanged.
drop policy if exists "Public can submit pending listings" on public.listings;

create policy "Approved users can submit pending listings"
on public.listings for insert
to authenticated
with check (
  status = 'pending'
  and exists (
    select 1
    from public.user_access ua
    where ua.user_id = (select auth.uid())
      and ua.status = 'approved'
  )
);
