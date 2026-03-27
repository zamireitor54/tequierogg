create table if not exists public.push_subscriptions (
  endpoint text primary key,
  subscription jsonb not null,
  keys jsonb not null,
  user_agent text,
  is_active boolean not null default true,
  preferred_hour integer not null default 6,
  preferred_minute integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  last_sent_at timestamptz
);

create index if not exists push_subscriptions_is_active_idx
  on public.push_subscriptions (is_active);
