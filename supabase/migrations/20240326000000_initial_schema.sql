-- Create users table extensions
create extension if not exists "uuid-ossp";

-- Create enum types if they don't exist
do $$ begin
    create type subscription_status as enum ('active', 'cancelled', 'past_due', 'unpaid', 'trial');
exception 
    when duplicate_object then null;
end $$;

do $$ begin
    create type subscription_plan as enum ('free', 'basic', 'pro', 'enterprise');
exception 
    when duplicate_object then null;
end $$;

do $$ begin
    create type reset_frequency as enum ('3hour', 'daily', 'monthly', 'yearly');
exception 
    when duplicate_object then null;
end $$;

-- Create function to safely increment quota
CREATE OR REPLACE FUNCTION increment_quota(increment_by integer)
RETURNS integer
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN COALESCE(used_count, 0) + increment_by;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_quota TO authenticated;

-- Users Table
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  name text,
  picture_url text,
  provider_type text,
  provider_id text,
  subscription_tier subscription_plan default 'free' not null,
  subscription_status subscription_status default 'active' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  constraint email_length check (char_length(email) >= 3),
  constraint unique_provider unique (provider_type, provider_id)
);

-- Subscription History Table
create table public.subscription_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  old_tier subscription_plan,
  new_tier subscription_plan not null,
  change_reason text not null,
  changed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  metadata jsonb default '{}'::jsonb,
  
  constraint valid_change_reason check (change_reason in ('upgrade', 'downgrade', 'system', 'payment_failure'))
);

-- Subscriptions Table
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  plan_id text not null,
  status subscription_status not null default 'active',
  payment_provider text not null,
  provider_subscription_id text not null,
  current_period_start timestamp with time zone not null,
  current_period_end timestamp with time zone not null,
  cancel_at_period_end boolean default false,
  trial_start timestamp with time zone,
  trial_end timestamp with time zone,
  canceled_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  metadata jsonb default '{}'::jsonb,
  
  constraint unique_provider_subscription unique (payment_provider, provider_subscription_id)
);

-- Conversations Table
create table public.conversations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_message_at timestamp with time zone,
  metadata jsonb default '{}'::jsonb,
  
  constraint title_length check (title is null or char_length(title) >= 1)
);

-- Chat Messages Table
create table public.chat_messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  role text not null,
  content text not null,
  model_id text not null,
  tokens_used integer,
  sequence_number integer not null,
  parent_message_id uuid references public.chat_messages(id),
  original_message_id uuid references public.chat_messages(id),
  revision_number integer default 0,
  revision_type text check (revision_type in ('user_edit', 'regeneration')),
  is_latest boolean default true,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  constraint role_check check (role in ('user', 'assistant', 'system')),
  constraint content_length check (char_length(content) >= 1),
  constraint unique_message_sequence unique (conversation_id, sequence_number),
  constraint unique_revision_sequence unique (original_message_id, revision_number)
);

-- Attachments Table
create table public.attachments (
  id uuid default uuid_generate_v4() primary key,
  message_id uuid references public.chat_messages(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  file_name text not null,
  file_type text not null,
  file_size integer not null,
  file_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  metadata jsonb default '{}'::jsonb,
  
  constraint file_name_length check (char_length(file_name) >= 1),
  constraint positive_file_size check (file_size > 0)
);

-- Usage Quotas Table
create table public.usage_quotas (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  subscription_tier subscription_plan not null,
  quota_key text not null,
  used_count integer default 0,
  quota_limit integer not null,
  reset_frequency reset_frequency not null,
  last_reset_at timestamp with time zone not null,
  next_reset_at timestamp with time zone not null,
  last_usage_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  constraint positive_usage check (used_count >= 0 and quota_limit > 0),
  constraint unique_user_quota unique (user_id, quota_key),
  constraint valid_quota_key check (quota_key in ('small_messages', 'large_messages', 'image_generation'))
);

-- Indexes

-- Subscriptions indexes
create index idx_subscriptions_user_active on public.subscriptions(user_id) where status = 'active';
create index idx_subscriptions_period_end on public.subscriptions(current_period_end) where status = 'active';

-- Subscription history index
create index idx_subscription_history_user on public.subscription_history(user_id, changed_at);

-- Conversations indexes
create index idx_conversations_user_id on public.conversations(user_id);
create index idx_conversations_last_message on public.conversations(last_message_at);

-- Chat messages indexes
create index idx_chat_messages_conv_latest on public.chat_messages(conversation_id) where is_latest = true;
create index idx_chat_messages_conv_seq on public.chat_messages(conversation_id, sequence_number, is_latest);

-- Attachments indexes
create index idx_attachments_message on public.attachments(message_id);
create index idx_attachments_user on public.attachments(user_id);

-- Usage quotas indexes
create index idx_quota_usage_user on public.usage_quotas(user_id, quota_key);
create index idx_quota_reset on public.usage_quotas(next_reset_at) where used_count > 0;

-- RLS Policies

-- Users table policies
alter table public.users enable row level security;

create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);

-- Add new policy for user creation during auth
create policy "System can create user profile on auth"
  on public.users for insert
  with check (auth.uid() = id);

-- Subscription history policies
alter table public.subscription_history enable row level security;

create policy "Users can view their subscription history"
  on public.subscription_history for select
  using (auth.uid() = user_id);

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

-- Attachments table policies
alter table public.attachments enable row level security;

create policy "Users can perform all actions on their own attachments"
  on public.attachments for all
  using (auth.uid() = user_id);

-- Usage quotas table policies
alter table public.usage_quotas enable row level security;

create policy "Users can view their own usage quotas"
  on public.usage_quotas for select
  using (auth.uid() = user_id);

create policy "Users can update their own usage quotas"
  on public.usage_quotas for update
  using (auth.uid() = user_id);

create policy "System can create initial usage quotas"
  on public.usage_quotas for insert
  with check (auth.uid() = user_id);

-- Enable realtime for relevant tables
alter publication supabase_realtime add table conversations;
alter publication supabase_realtime add table chat_messages;
alter publication supabase_realtime add table attachments; 