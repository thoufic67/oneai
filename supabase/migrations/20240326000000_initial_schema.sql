-- Create users table extensions
create extension if not exists "uuid-ossp";

-- Users Table
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  constraint email_length check (char_length(email) >= 3)
);

-- Subscriptions Table
create type subscription_status as enum ('active', 'cancelled', 'past_due', 'unpaid');
create type subscription_plan as enum ('free', 'basic', 'pro', 'enterprise');

create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  plan subscription_plan not null default 'free',
  status subscription_status not null default 'active',
  current_period_start timestamp with time zone not null,
  current_period_end timestamp with time zone not null,
  razorpay_subscription_id text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Conversations Table
create table public.conversations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  model text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_message_at timestamp with time zone default timezone('utc'::text, now()) not null,
  metadata jsonb default '{}'::jsonb not null,
  constraint title_length check (char_length(title) >= 1)
);

-- Chat Messages Table
create table public.chat_messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  role text not null,
  content text not null,
  tokens_used integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  model text not null,
  constraint role_check check (role in ('user', 'assistant', 'system')),
  constraint content_length check (char_length(content) >= 1)
);

-- Usage Quotas Table
create table public.usage_quotas (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  subscription_id uuid references public.subscriptions(id) on delete cascade not null,
  tokens_used bigint not null default 0,
  tokens_limit bigint not null,
  reset_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies

-- Users table policies
alter table public.users enable row level security;

create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);

-- Subscriptions table policies
alter table public.subscriptions enable row level security;

create policy "Users can view their own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Conversations table policies
alter table public.conversations enable row level security;

create policy "Users can perform all actions on their own conversations"
  on public.conversations for all
  using (auth.uid() = user_id);

-- Chat messages table policies
alter table public.chat_messages enable row level security;

create policy "Users can perform all actions on messages in their conversations"
  on public.chat_messages for all
  using (
    auth.uid() = (
      select user_id 
      from public.conversations 
      where id = chat_messages.conversation_id
    )
  );

-- Usage quotas table policies
alter table public.usage_quotas enable row level security;

create policy "Users can view their own usage quotas"
  on public.usage_quotas for select
  using (auth.uid() = user_id);

-- Create indexes for better performance
create index idx_conversations_user_id on public.conversations(user_id);
create index idx_chat_messages_conversation_id on public.chat_messages(conversation_id);
create index idx_subscriptions_user_id on public.subscriptions(user_id);
create index idx_usage_quotas_user_id on public.usage_quotas(user_id);

-- Enable realtime for relevant tables
alter publication supabase_realtime add table conversations;
alter publication supabase_realtime add table chat_messages; 