# OneAI Platform Planning

## Overview

This document outlines the complete platform architecture using Supabase for authentication and database, NextJS API for chat services, and Razorpay for subscription management.

## User Journey & Conversation Flow

### Conversation Lifecycle

1. **Starting a Conversation**

   - User sends their first message
   - System automatically creates a new conversation
   - Message is stored with `sequence_number = 1`
   - Assistant generates and stores response with `sequence_number = 2`

2. **Message Flow**

   - Each message in a conversation has a sequential number
   - Messages alternate between user and assistant
   - Each message can reference its parent message for threaded context

3. **Message Revisions**

   - Users can edit their previous messages
     - Original message is marked as not latest (`is_latest = false`)
     - New revision is created with incremented `revision_number`
     - New revision maintains same `sequence_number` as original
     - Latest revision is marked with `is_latest = true`
   - Assistant responses can be regenerated
     - Similar to user edits, but marked with `revision_type = 'regeneration'`
     - Previous response marked as not latest
     - New response gets next revision number
     - Maintains conversation flow and sequence

4. **Revision History**
   - All message versions are preserved
   - Each revision links to original message via `original_message_id`
   - UI can show revision history when requested
   - Easy to track changes and regenerations
   - Token usage tracked per revision for billing

### Data Model Example

```
Conversation Example:
[User Message]    seq=1, rev=0 (original)
[Assistant Reply] seq=2, rev=0 (original)
[User Edit]       seq=1, rev=1 (revision of first message)
[New Response]    seq=2, rev=1 (regenerated due to edit)
[User Message]    seq=3, rev=0 (new message)
[Assistant Reply] seq=4, rev=0 (new response)
```

### Key Features

1. **Real-time Updates**

   - Messages stream in real-time
   - Edits and regenerations reflect immediately
   - UI updates to show latest versions

2. **Revision Tracking**

   - Complete history preserved
   - Clear indication of current versions
   - Support for both user edits and regenerations

3. **Performance Optimization**

   - Efficient loading of latest message versions
   - Single query to load current conversation state
   - Revisions loaded only when viewing history

4. **User Experience**
   - Similar to ChatGPT interaction model
   - Seamless editing and regeneration
   - Clear indication of message versions
   - Easy access to revision history

## Architecture

- Frontend: Next.js with TypeScript
- Backend: NextJS API Routes with Server-Sent Events (SSE)
- Authentication & Database: Supabase
- Payment & Subscription: Razorpay Subscription API
- State Management: React Context
- UI Components: HeroUI and TailwindCSS
- External Services: OpenRouter API for LLM access

## Technical Stack

- Core Dependencies:
  - @supabase/supabase-js
  - @supabase/auth-helpers-nextjs
  - razorpay
  - @heroicons/react
  - framer-motion
  - lucide-react
  - openrouter
  - server-sent-events

## Directory Structure

```
/app
  /layout.tsx              # Root layout
  /page.tsx               # Landing page
  /providers.tsx          # Global providers
  /error.tsx              # Error handling

  /(auth)
    /login
      /page.tsx          # Login page
    /callback
      /page.tsx          # Auth callback handler

  /(dashboard)
    /layout.tsx          # Dashboard layout
    /page.tsx            # Dashboard home
    /settings
      /page.tsx          # User settings
    /usage
      /page.tsx          # Usage statistics

  /c
    /[id]
      /page.tsx          # Chat interface
      /loading.tsx       # Loading UI
      /error.tsx         # Error UI

  /api
    /auth
      /callback
        route.ts        # Handle auth callbacks
    /chat
      /stream/route.ts   # SSE streaming
      /models/route.ts   # Models list
    /conversations
      /route.ts          # Conversation CRUD
      /[id]/route.ts     # Single conversation
    /subscription
      /plans/route.ts    # Subscription plans
      /create/route.ts   # Create subscription
      /cancel/route.ts   # Cancel subscription
      /webhook/route.ts  # Razorpay webhook
    /user
      /profile/route.ts  # User profile
      /quota/route.ts    # Usage quota

  /pricing
    /page.tsx            # Pricing page
    /components
      /plan-card.tsx     # Plan display
      /checkout.tsx      # Checkout component

  /docs
    /page.tsx            # Documentation home
    /[slug]/page.tsx     # Doc pages

  /blog
    /page.tsx            # Blog listing
    /[slug]/page.tsx     # Blog posts

  /about
    /page.tsx            # About page

/components
  /auth
    /login-button.tsx    # Login button
    /user-menu.tsx       # User dropdown
  /chat
    /message.tsx         # Chat message
    /input.tsx          # Chat input
    /stream.tsx         # Stream handler
  /shared
    /button.tsx         # Common button
    /card.tsx           # Common card
  /layout
    /header.tsx         # Site header
    /footer.tsx         # Site footer
  /subscription
    /plan-selector.tsx  # Plan selection
    /usage-stats.tsx    # Usage display

/lib
  /supabase.ts          # Supabase client
  /openrouter.ts        # OpenRouter client
  /razorpay.ts         # Razorpay client
  /utils
    /auth.ts           # Auth helpers
    /chat.ts           # Chat helpers
    /subscription.ts   # Subscription helpers

/config
  /site.ts             # Site configuration
  /openrouter.ts       # OpenRouter config
  /subscription.ts     # Subscription plans
  /quota.ts           # Usage quotas

/types
  /auth.ts             # Auth types
  /chat.ts            # Chat types
  /subscription.ts    # Subscription types
  /api.ts             # API types

/styles
  /globals.css        # Global styles
  /components.css     # Component styles

/public
  /images            # Static images
  /icons            # Site icons
```

## Database Schema (Supabase)

### Users Table

```sql
CREATE TABLE users (
    id UUID REFERENCES auth.users PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    picture_url TEXT,
    provider_type TEXT,
    provider_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Add unique constraint for provider combination
    CONSTRAINT unique_provider UNIQUE (provider_type, provider_id)
);
```

### Subscriptions Table

```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    plan_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'past_due', 'unpaid', 'trial')),
    payment_provider TEXT NOT NULL,
    provider_subscription_id TEXT NOT NULL,
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT false,
    trial_start TIMESTAMP,
    trial_end TIMESTAMP,
    canceled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB,
    -- Ensure unique provider subscription
    CONSTRAINT unique_provider_subscription UNIQUE (payment_provider, provider_subscription_id)
);

-- Index for quick user subscription lookup
CREATE INDEX idx_subscriptions_user_active ON subscriptions(user_id)
WHERE status = 'active';

-- Index for subscription renewal checks
CREATE INDEX idx_subscriptions_period_end ON subscriptions(current_period_end)
WHERE status = 'active';
```

### Conversations Table

```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    title TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP,
    metadata JSONB
);
```

### Chat Messages Table

```sql
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    user_id UUID NOT NULL REFERENCES users(id),
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    model_id TEXT NOT NULL,
    tokens_used INTEGER,
    sequence_number INTEGER NOT NULL,
    parent_message_id UUID REFERENCES chat_messages(id),
    original_message_id UUID REFERENCES chat_messages(id),  -- Links to the original message if this is a revision
    revision_number INTEGER DEFAULT 0,                      -- 0 for original message, increments for each revision
    revision_type TEXT CHECK (revision_type IN ('user_edit', 'regeneration')),
    is_latest BOOLEAN DEFAULT true,                        -- Indicates if this is the latest version
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Ensure unique sequence in conversation
    CONSTRAINT unique_message_sequence UNIQUE (conversation_id, sequence_number),
    -- Ensure proper revision ordering
    CONSTRAINT unique_revision_sequence UNIQUE (original_message_id, revision_number)
);

-- Index for loading conversation messages efficiently
CREATE INDEX idx_chat_messages_conv_latest ON chat_messages(conversation_id)
WHERE is_latest = true;

CREATE INDEX idx_chat_messages_conv_seq ON chat_messages(conversation_id, sequence_number, is_latest);

-- Example queries:

/*
-- Load latest version of all messages in a conversation
SELECT * FROM chat_messages
WHERE conversation_id = :conversation_id
  AND is_latest = true
ORDER BY sequence_number;

-- Load all revisions of a specific message
SELECT * FROM chat_messages
WHERE original_message_id = :message_id
  OR id = :message_id
ORDER BY revision_number;
*/
```

### Usage Quotas Table

```sql
CREATE TABLE usage_quotas (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    model_id TEXT NOT NULL,
    messages_used INTEGER DEFAULT 0,        -- For MVP: Track number of messages
    messages_limit INTEGER NOT NULL,        -- Monthly message limit based on plan
    tokens_used BIGINT DEFAULT 0,          -- For future: Track token usage
    tokens_limit BIGINT DEFAULT NULL,      -- For future: Token limits
    reset_at TIMESTAMP NOT NULL,           -- Next quota reset date
    last_message_at TIMESTAMP,             -- Timestamp of last message
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT positive_messages CHECK (messages_used >= 0 AND messages_limit > 0)
);

-- Index for checking user's quota
CREATE INDEX idx_quota_usage_user ON usage_quotas(user_id, model_id)
WHERE reset_at > CURRENT_TIMESTAMP;

-- Index for quota reset processing
CREATE INDEX idx_quota_reset ON usage_quotas(reset_at)
WHERE messages_used > 0;

-- Example quota check query
/*
SELECT
    messages_used,
    messages_limit,
    messages_used >= messages_limit as limit_reached,
    reset_at
FROM usage_quotas
WHERE user_id = :user_id
    AND model_id = :model_id
    AND reset_at > CURRENT_TIMESTAMP;
*/
```

## API Routes Structure

```
/app/api
  /auth
    /callback
      route.ts        # Handle auth callbacks
    /chat
      /stream
        route.ts        # SSE chat streaming with OpenRouter
      /history
        route.ts        # Chat history operations
      /models
        route.ts        # Available OpenRouter models info

  /conversations
    route.ts          # List/create conversations
    /[id]
      route.ts        # Get/update/delete conversation
      /messages
        route.ts      # Conversation messages
      /title
        route.ts      # Update conversation title
      /share
        route.ts      # Share conversation
      /export
        route.ts      # Export conversation

  /subscription
    /plans
      route.ts        # Subscription plans
    /create
      route.ts        # Create subscription
    /cancel
      route.ts        # Cancel subscription
    /update
      route.ts        # Update subscription
    /invoice
      route.ts        # Get/list invoices
    /portal
      route.ts        # Customer portal redirect

  /user
    /profile
      route.ts        # User profile operations
    /preferences
      route.ts        # User preferences
    /quota
      route.ts        # Quota management
    /usage
      route.ts        # Usage statistics
    /api-keys
      route.ts        # API key management

  /webhooks
    /razorpay
      route.ts        # Razorpay webhooks

  /docs
    /search
      route.ts        # Documentation search
    /feedback
      route.ts        # Documentation feedback

  /admin
    /users
      route.ts        # User management
    /quotas
      route.ts        # Quota management
    /subscriptions
      route.ts        # Subscription management
    /analytics
      route.ts        # Usage analytics
```

## OpenRouter Integration

### Configuration

```typescript
// config/openrouter.ts
export const OPENROUTER_CONFIG = {
  API_URL: "https://openrouter.ai/api/v1",
  SUPPORTED_MODELS: {
    "openai/gpt-4": {
      name: "GPT-4",
      contextLength: 8192,
      pricePerToken: 0.00003,
    },
    // Add other models
  },
  HEADERS: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_API_URL,
    "X-Title": "OneAI Platform",
  },
};
```

### Chat Stream Implementation

```typescript
// lib/openrouter.ts
export class OpenRouterClient {
  async streamChat(messages: Message[], model: string) {
    const response = await fetch(
      `${OPENROUTER_CONFIG.API_URL}/chat/completions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          ...OPENROUTER_CONFIG.HEADERS,
        },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
        }),
      }
    );

    return response.body;
  }

  async getModels() {
    const response = await fetch(`${OPENROUTER_CONFIG.API_URL}/models`, {
      headers: {
        Authorization: `
```
