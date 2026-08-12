-- ════════════════════════════════════════════════════════════════
--  0002_rls.sql — Row-Level Security policies for CrewYard
--  Enable RLS on every table, then add fine-grained policies.
-- ════════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────
--  Enable RLS on all tables
-- ──────────────────────────────────────────────────────────────
alter table profiles                  enable row level security;
alter table asks                      enable row level security;
alter table comments                  enable row level security;
alter table likes                     enable row level security;
alter table saves                     enable row level security;
alter table groups                    enable row level security;
alter table group_members             enable row level security;
alter table conversations             enable row level security;
alter table conversation_participants enable row level security;
alter table messages                  enable row level security;


-- ════════════════════════════════════════════════════════════════
--  PROFILES
-- ════════════════════════════════════════════════════════════════

-- Anyone (including anon) can read all profiles
create policy "profiles: public read"
  on profiles for select
  using (true);

-- Authenticated users can update only their own profile
create policy "profiles: owner update"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No INSERT policy here — the handle_new_user() trigger (running as
-- SECURITY DEFINER) creates profile rows; clients cannot INSERT directly.

-- No DELETE policy — profiles are managed by the trigger / admin only.


-- ════════════════════════════════════════════════════════════════
--  ASKS
-- ════════════════════════════════════════════════════════════════

-- Anyone (including anon) can read all asks
create policy "asks: public read"
  on asks for select
  using (true);

-- Authenticated users can only insert asks they own
create policy "asks: authenticated insert (own)"
  on asks for insert
  with check (
    auth.role() = 'authenticated'
    and auth.uid() = author_id
  );

-- Users can only update their own asks
create policy "asks: owner update"
  on asks for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

-- Users can only delete their own asks
create policy "asks: owner delete"
  on asks for delete
  using (auth.uid() = author_id);


-- ════════════════════════════════════════════════════════════════
--  COMMENTS
-- ════════════════════════════════════════════════════════════════

-- Anyone (including anon) can read all comments
create policy "comments: public read"
  on comments for select
  using (true);

-- Authenticated users can only insert comments they own
create policy "comments: authenticated insert (own)"
  on comments for insert
  with check (
    auth.role() = 'authenticated'
    and auth.uid() = author_id
  );

-- Users can only delete their own comments
create policy "comments: owner delete"
  on comments for delete
  using (auth.uid() = author_id);


-- ════════════════════════════════════════════════════════════════
--  LIKES
-- ════════════════════════════════════════════════════════════════

-- Anyone (including anon) can read all likes
create policy "likes: public read"
  on likes for select
  using (true);

-- Authenticated users can only insert likes for themselves
create policy "likes: authenticated insert (own)"
  on likes for insert
  with check (
    auth.role() = 'authenticated'
    and auth.uid() = user_id
  );

-- Users can only delete their own likes
create policy "likes: owner delete"
  on likes for delete
  using (auth.uid() = user_id);


-- ════════════════════════════════════════════════════════════════
--  SAVES
-- ════════════════════════════════════════════════════════════════

-- Anyone (including anon) can read all saves
create policy "saves: public read"
  on saves for select
  using (true);

-- Authenticated users can only insert saves for themselves
create policy "saves: authenticated insert (own)"
  on saves for insert
  with check (
    auth.role() = 'authenticated'
    and auth.uid() = user_id
  );

-- Users can only delete their own saves
create policy "saves: owner delete"
  on saves for delete
  using (auth.uid() = user_id);


-- ════════════════════════════════════════════════════════════════
--  GROUPS
-- ════════════════════════════════════════════════════════════════

-- Anyone (including anon) can read all groups
create policy "groups: public read"
  on groups for select
  using (true);

-- Any authenticated user can create a group (prototype; lock down later)
create policy "groups: authenticated insert"
  on groups for insert
  with check (auth.role() = 'authenticated');

-- No public UPDATE/DELETE — reserved for admin / service role only.


-- ════════════════════════════════════════════════════════════════
--  GROUP_MEMBERS
-- ════════════════════════════════════════════════════════════════

-- Anyone (including anon) can read group membership
create policy "group_members: public read"
  on group_members for select
  using (true);

-- Authenticated users can only join groups as themselves
create policy "group_members: authenticated insert (own)"
  on group_members for insert
  with check (
    auth.role() = 'authenticated'
    and auth.uid() = user_id
  );

-- Users can only leave (delete) their own membership rows
create policy "group_members: owner delete"
  on group_members for delete
  using (auth.uid() = user_id);


-- ════════════════════════════════════════════════════════════════
--  CONVERSATIONS
-- ════════════════════════════════════════════════════════════════

-- A user can only see conversations they participate in
create policy "conversations: participant read"
  on conversations for select
  using (
    auth.uid() in (
      select user_id
      from conversation_participants
      where conversation_id = conversations.id
    )
  );

-- Authenticated users can create new conversations
create policy "conversations: authenticated insert"
  on conversations for insert
  with check (auth.role() = 'authenticated');


-- ════════════════════════════════════════════════════════════════
--  CONVERSATION_PARTICIPANTS
-- ════════════════════════════════════════════════════════════════

-- A user can only see participant rows for their own conversations
create policy "conversation_participants: participant read"
  on conversation_participants for select
  using (
    auth.uid() in (
      select user_id
      from conversation_participants cp
      where cp.conversation_id = conversation_participants.conversation_id
    )
  );

-- Authenticated users can insert participant rows.
-- The application layer is responsible for only adding themselves
-- and one other valid user when creating a conversation.
create policy "conversation_participants: authenticated insert"
  on conversation_participants for insert
  with check (auth.role() = 'authenticated');


-- ════════════════════════════════════════════════════════════════
--  MESSAGES
-- ════════════════════════════════════════════════════════════════

-- A user can only read messages in conversations they participate in
create policy "messages: participant read"
  on messages for select
  using (
    auth.uid() in (
      select user_id
      from conversation_participants
      where conversation_id = messages.conversation_id
    )
  );

-- A user can only send a message where:
--   1. sender_id = their own uid  (no spoofing)
--   2. they are an existing participant of that conversation
create policy "messages: participant insert (own sender)"
  on messages for insert
  with check (
    auth.role() = 'authenticated'
    and auth.uid() = sender_id
    and auth.uid() in (
      select user_id
      from conversation_participants
      where conversation_id = messages.conversation_id
    )
  );
