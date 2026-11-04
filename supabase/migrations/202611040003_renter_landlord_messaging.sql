-- Private renter-landlord conversations. Access is limited to the two participants.
create table if not exists public.conversations (
 id uuid primary key default gen_random_uuid(),
 listing_id bigint not null references public.listings(id) on delete cascade,
 renter_id uuid not null references auth.users(id) on delete cascade,
 landlord_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(),
 last_message_at timestamptz not null default now(),
 unique(listing_id,renter_id),
 check(renter_id <> landlord_id)
);
create table if not exists public.messages (
 id uuid primary key default gen_random_uuid(),
 conversation_id uuid not null references public.conversations(id) on delete cascade,
 sender_id uuid not null references auth.users(id) on delete cascade,
 body text not null check(length(trim(body)) between 1 and 5000),
 created_at timestamptz not null default now()
);
create index if not exists conversations_renter_recent on public.conversations(renter_id,last_message_at desc);
create index if not exists conversations_landlord_recent on public.conversations(landlord_id,last_message_at desc);
create index if not exists messages_thread_recent on public.messages(conversation_id,created_at);
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
create policy "Participants view conversations" on public.conversations for select to authenticated using(auth.uid()=renter_id or auth.uid()=landlord_id);
create policy "Approved renter starts conversation" on public.conversations for insert to authenticated with check(
 renter_id=auth.uid() and renter_id<>landlord_id
 and exists(select 1 from public.user_access ua where ua.user_id=auth.uid() and ua.status='approved')
 and exists(select 1 from public.listings l where l.id=listing_id and l.owner_id=landlord_id and l.status='approved')
);
create policy "Participants view messages" on public.messages for select to authenticated using(
 exists(select 1 from public.conversations c where c.id=conversation_id and (auth.uid()=c.renter_id or auth.uid()=c.landlord_id))
);
create policy "Approved participants send messages" on public.messages for insert to authenticated with check(
 sender_id=auth.uid() and exists(
  select 1 from public.conversations c join public.user_access ua on ua.user_id=auth.uid() and ua.status='approved'
  where c.id=conversation_id and (auth.uid()=c.renter_id or auth.uid()=c.landlord_id)
 )
);
-- This trigger-only function updates the conversation timestamp after a message.
-- Keep its privileged scope narrow and prevent direct invocation by API roles.
create or replace function public.update_conversation_message_time() returns trigger
language plpgsql
security definer
set search_path = ''
as $
begin
 update public.conversations
 set last_message_at = now()
 where id = new.conversation_id;
 return new;
end;
$;
revoke all on function public.update_conversation_message_time() from public, anon, authenticated;
create trigger message_updates_conversation after insert on public.messages
for each row execute function public.update_conversation_message_time();