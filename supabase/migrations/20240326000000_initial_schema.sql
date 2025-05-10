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

-- Subscriptions Table (Updated version)
CREATE TABLE public.subscriptions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  plan_id text NOT NULL,
  status subscription_status NOT NULL DEFAULT 'active',
  payment_status text CHECK (payment_status IN ('pending', 'authorized', 'captured', 'failed', 'refunded')),
  payment_provider text NOT NULL,
  provider_subscription_id text NOT NULL,
  current_period_start timestamp with time zone NOT NULL,
  current_period_end timestamp with time zone NOT NULL,
  cancel_at_period_end boolean DEFAULT false,
  trial_start timestamp with time zone,
  trial_end timestamp with time zone,
  canceled_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  
  CONSTRAINT unique_provider_subscription UNIQUE (payment_provider, provider_subscription_id)
);

-- Subscription Payments Table (Updated version)
CREATE TABLE public.subscription_payments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  subscription_id text NOT NULL,
  razorpay_payment_id text NOT NULL,
  razorpay_signature text NOT NULL,
  idempotency_key text NOT NULL,
  amount integer NOT NULL,
  currency text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'authorized', 'captured', 'failed', 'refunded')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  
  CONSTRAINT unique_idempotency_key UNIQUE (idempotency_key),
  CONSTRAINT unique_razorpay_payment UNIQUE (razorpay_payment_id)
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

-- Shared Conversations Table
CREATE TABLE shared_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    user_id UUID NOT NULL REFERENCES users(id),
    share_id TEXT UNIQUE NOT NULL,  -- Unique identifier for sharing
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,  -- Optional expiration time
    is_active BOOLEAN DEFAULT true,
    metadata JSONB,
    CONSTRAINT fk_conversation
        FOREIGN KEY (conversation_id)
        REFERENCES conversations(id)
        ON DELETE CASCADE
);

-- Indexes

-- Subscriptions indexes
CREATE INDEX idx_subscriptions_user_active ON public.subscriptions(user_id) WHERE status = 'active';
CREATE INDEX idx_subscriptions_period_end ON public.subscriptions(current_period_end) WHERE status = 'active';

-- Subscription history index
create index idx_subscription_history_user on public.subscription_history(user_id, changed_at);

-- Create index for payment lookups
CREATE INDEX idx_subscription_payments ON public.subscription_payments(subscription_id, created_at);

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

-- Shared conversations indexes
CREATE INDEX idx_shared_conversations_share_id ON shared_conversations(share_id);
CREATE INDEX idx_shared_conversations_user ON shared_conversations(user_id);

-- RLS Policies

-- Users table policies
alter table public.users enable row level security;

create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "System can create user profile on auth"
  on public.users for insert
  with check (auth.uid() = id);

-- Subscription history policies
alter table public.subscription_history enable row level security;

create policy "Users can view their subscription history"
  on public.subscription_history for select
  using (auth.uid() = user_id);

-- Subscriptions table policies
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own subscriptions"
ON subscriptions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own subscriptions"
ON subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
ON subscriptions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions"
ON subscriptions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all subscriptions"
ON subscriptions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Subscription payments policies
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription payments"
  ON public.subscription_payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM public.subscriptions 
      WHERE provider_subscription_id = subscription_payments.subscription_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert subscription payments"
  ON public.subscription_payments FOR INSERT
  WITH CHECK (true);

-- Conversations table policies
alter table public.conversations enable row level security;

create policy "Users can perform all actions on their own conversations"
  on public.conversations for all
  using (auth.uid() = user_id);

-- Allow public access to shared conversations
CREATE POLICY "Public can view shared conversations"
    ON conversations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM shared_conversations
            WHERE conversation_id = conversations.id
            AND is_active = true
        )
    );

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

-- Allow public access to messages of shared conversations
CREATE POLICY "Public can view messages of shared conversations"
    ON chat_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM shared_conversations
            WHERE conversation_id = chat_messages.conversation_id
            AND is_active = true
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

-- Shared conversations policies
ALTER TABLE shared_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own shared conversations"
    ON shared_conversations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create shared conversations"
    ON shared_conversations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own shared conversations"
    ON shared_conversations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shared conversations"
    ON shared_conversations FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Public can view active shared conversations"
    ON shared_conversations FOR SELECT
    USING (is_active = true);

-- Enable realtime for relevant tables
alter publication supabase_realtime add table conversations;
alter publication supabase_realtime add table chat_messages;
alter publication supabase_realtime add table attachments; 