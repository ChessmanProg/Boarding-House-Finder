-- Tighten table privileges and optimize the messaging RLS predicates.
revoke all on table public.conversations, public.messages from anon;
revoke update, delete, truncate, references, trigger on table public.conversations, public.messages from authenticated;
grant select, insert on table public.conversations, public.messages to authenticated;

create index if not exists messages_sender_recent on public.messages(sender_id, created_at desc);

drop policy if exists "Participants view conversations" on public.conversations;
create policy "Participants view conversations" on public.conversations
for select to authenticated
using ((select auth.uid()) = renter_id or (select auth.uid()) = landlord_id);

drop policy if exists "Approved renter starts conversation" on public.conversations;
create policy "Approved renter starts conversation" on public.conversations
for insert to authenticated
with check (
 renter_id = (select auth.uid())
 and renter_id <> landlord_id
 and exists (select 1 from public.user_access ua where ua.user_id = (select auth.uid()) and ua.status = 'approved')
 and exists (select 1 from public.listings l where l.id = listing_id and l.owner_id = landlord_id and l.status = 'approved')
);

drop policy if exists "Participants view messages" on public.messages;
create policy "Participants view messages" on public.messages
for select to authenticated
using (
 exists (select 1 from public.conversations c where c.id = conversation_id
 and ((select auth.uid()) = c.renter_id or (select auth.uid()) = c.landlord_id))
);

drop policy if exists "Approved participants send messages" on public.messages;
create policy "Approved participants send messages" on public.messages
for insert to authenticated
with check (
 sender_id = (select auth.uid())
 and exists (
  select 1 from public.conversations c
  join public.user_access ua on ua.user_id = (select auth.uid()) and ua.status = 'approved'
  where c.id = conversation_id and ((select auth.uid()) = c.renter_id or (select auth.uid()) = c.landlord_id)
 )
);