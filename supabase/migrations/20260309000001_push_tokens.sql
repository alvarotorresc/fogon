-- Push notification tokens for Expo push notifications
create table public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  expo_push_token text not null unique,
  created_at timestamptz default now()
);

-- Index for looking up tokens by user
create index idx_push_tokens_user_id on public.push_tokens(user_id);

-- NO RLS -- NestJS API handles all authorization via guards
