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

## Quota Tracking and Subscription Management

### Enhanced Database Schema

```sql
-- Update Users Table with Subscription Info
ALTER TABLE users
ADD COLUMN subscription_tier TEXT NOT NULL DEFAULT 'free',
ADD COLUMN subscription_status TEXT NOT NULL DEFAULT 'active';

-- Create Index for Subscription Lookups
CREATE INDEX idx_users_subscription ON users(subscription_tier)
WHERE subscription_status = 'active';

-- Subscription History Table
CREATE TABLE subscription_history (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    old_tier TEXT,
    new_tier TEXT NOT NULL,
    change_reason TEXT NOT NULL, -- 'upgrade', 'downgrade', 'system', 'payment_failure'
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB -- Store additional context about the change
);

CREATE INDEX idx_subscription_history_user ON subscription_history(user_id, changed_at);

-- Usage Quotas Table
CREATE TABLE usage_quotas (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    subscription_tier TEXT NOT NULL,  -- Track which tier this quota belongs to
    quota_key TEXT NOT NULL,  -- 'small_messages', 'large_messages', 'image_generation'
    used_count INTEGER DEFAULT 0,
    quota_limit INTEGER NOT NULL,
    reset_frequency TEXT NOT NULL, -- '3hour', 'daily', 'monthly'
    last_reset_at TIMESTAMP NOT NULL,
    next_reset_at TIMESTAMP NOT NULL,
    last_usage_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_quota UNIQUE (user_id, quota_key)
);
```

### Subscription Tiers Configuration

```typescript
// config/subscription.ts

export const SUBSCRIPTION_TIERS = {
  free: {
    name: "Free",
    price: 0,
    quotas: {
      small_messages: { limit: 100, resetFrequency: "monthly" },
      large_messages: { limit: 20, resetFrequency: "monthly" },
      image_generation: { limit: 5, resetFrequency: "3hour" },
    },
  },
  pro: {
    name: "Pro",
    price: 999, // $9.99
    quotas: {
      small_messages: { limit: 500, resetFrequency: "monthly" },
      large_messages: { limit: 100, resetFrequency: "monthly" },
      image_generation: { limit: 10, resetFrequency: "3hour" },
    },
  },
  enterprise: {
    name: "Enterprise",
    price: null, // Custom pricing
    quotas: {
      small_messages: { limit: 5000, resetFrequency: "monthly" },
      large_messages: { limit: 1000, resetFrequency: "monthly" },
      image_generation: { limit: 100, resetFrequency: "3hour" },
    },
  },
};

export type QuotaKey = "small_messages" | "large_messages" | "image_generation";
export type ResetFrequency = "3hour" | "daily" | "monthly";
```

### Quota Management Implementation

```typescript
// lib/quota.ts

export class QuotaManager {
  // Check if user has sufficient quota
  async checkQuota(
    userId: string,
    quotaKey: QuotaKey,
    units: number = 1
  ): Promise<boolean> {
    const user = await this.getUser(userId);
    const quota = await this.getCurrentQuota(userId, quotaKey);

    // Check if quota needs reset
    if (new Date() >= new Date(quota.next_reset_at)) {
      await this.resetQuota(quota);
    }

    // Check against limit
    if (quota.used_count + units > quota.quota_limit) {
      throw new QuotaExceededError(quotaKey, quota);
    }

    return true;
  }

  // Increment quota usage
  async incrementQuota(
    userId: string,
    quotaKey: QuotaKey,
    units: number = 1
  ): Promise<void> {
    await this.db.usage_quotas.update({
      where: { user_id: userId, quota_key: quotaKey },
      data: {
        used_count: { increment: units },
        last_usage_at: new Date(),
      },
    });
  }

  // Reset quota based on frequency
  private async resetQuota(quota: UsageQuota): Promise<void> {
    const nextReset = this.calculateNextReset(quota.reset_frequency);

    await this.db.usage_quotas.update({
      where: { id: quota.id },
      data: {
        used_count: 0,
        last_reset_at: new Date(),
        next_reset_at: nextReset,
      },
    });
  }
}
```

### API Implementation

```typescript
// app/api/quota/check/route.ts
export async function POST(req: Request) {
  const { quotaKey, units = 1 } = await req.json();
  const userId = await getUserId(req);

  try {
    await quotaManager.checkQuota(userId, quotaKey, units);
    return NextResponse.json({ allowed: true });
  } catch (error) {
    if (error instanceof QuotaExceededError) {
      return NextResponse.json(
        {
          allowed: false,
          error: "QUOTA_EXCEEDED",
          details: error.details,
        },
        { status: 429 }
      );
    }
    throw error;
  }
}

// app/api/quota/status/route.ts
export async function GET(req: Request) {
  const userId = await getUserId(req);
  const user = await getUser(userId);
  const quotas = await getAllQuotas(userId);

  return NextResponse.json({
    subscription: {
      tier: user.subscription_tier,
      status: user.subscription_status,
    },
    quotas: quotas.reduce(
      (acc, quota) => ({
        ...acc,
        [quota.quota_key]: {
          used: quota.used_count,
          limit: quota.quota_limit,
          resetsAt: quota.next_reset_at,
          remaining: quota.quota_limit - quota.used_count,
          percentageUsed: (quota.used_count / quota.quota_limit) * 100,
        },
      }),
      {}
    ),
  });
}
```

### Usage in Chat Components

```typescript
// components/chat/input.tsx
export const ChatInput = () => {
  const sendMessage = async (content: string) => {
    // Check quota before sending
    try {
      await checkQuota("small_messages");
      // Send message logic
      await incrementQuota("small_messages");
    } catch (error) {
      if (error.code === "QUOTA_EXCEEDED") {
        toast.error("Message quota exceeded. Please upgrade your plan.");
        return;
      }
      throw error;
    }
  };
};
```

### Subscription Management UI

```typescript
// components/subscription/usage-display.tsx
export const UsageDisplay = () => {
  const { data: quotaStatus } = useQuotaStatus();

  return (
    <div className="grid gap-4">
      {Object.entries(quotaStatus.quotas).map(([key, quota]) => (
        <QuotaCard
          key={key}
          name={formatQuotaName(key)}
          used={quota.used}
          limit={quota.limit}
          resetsAt={quota.resetsAt}
          percentageUsed={quota.percentageUsed}
        />
      ))}
    </div>
  );
};
```

## Subscription and Quota Assignment Flow

```typescript
// lib/subscription/quota-assignment.ts

interface QuotaAssignment {
  userId: string;
  subscriptionTier: string;
  previousTier?: string;
}

export class QuotaAssignmentManager {
  /**
   * Called after successful payment and subscription creation
   */
  async assignQuotasForNewSubscription({
    userId,
    subscriptionTier,
    previousTier,
  }: QuotaAssignment): Promise<void> {
    const tierQuotas = SUBSCRIPTION_TIERS[subscriptionTier].quotas;

    // Start a transaction to ensure all quotas are assigned atomically
    await db.$transaction(async (tx) => {
      // 1. Update user's subscription tier
      await tx.users.update({
        where: { id: userId },
        data: {
          subscription_tier: subscriptionTier,
          subscription_status: "active",
        },
      });

      // 2. Record subscription change in history
      await tx.subscription_history.create({
        data: {
          user_id: userId,
          old_tier: previousTier || "none",
          new_tier: subscriptionTier,
          change_reason: previousTier ? "upgrade" : "new_subscription",
          metadata: {
            payment_successful: true,
            changed_at: new Date().toISOString(),
          },
        },
      });

      // 3. Create or update quota entries for each quota type
      for (const [quotaKey, quota] of Object.entries(tierQuotas)) {
        const nextReset = calculateNextReset(quota.resetFrequency);

        await tx.usage_quotas.upsert({
          where: {
            user_id_quota_key: {
              user_id: userId,
              quota_key: quotaKey,
            },
          },
          create: {
            user_id: userId,
            quota_key: quotaKey,
            subscription_tier: subscriptionTier,
            quota_limit: quota.limit,
            reset_frequency: quota.resetFrequency,
            used_count: 0,
            last_reset_at: new Date(),
            next_reset_at: nextReset,
          },
          update: {
            subscription_tier: subscriptionTier,
            quota_limit: quota.limit,
            reset_frequency: quota.resetFrequency,
            // Only reset usage if upgrading to a new tier
            ...(previousTier && {
              used_count: 0,
              last_reset_at: new Date(),
              next_reset_at: nextReset,
            }),
          },
        });
      }
    });
  }

  /**
   * Calculate next reset timestamp based on frequency
   */
  private calculateNextReset(frequency: ResetFrequency): Date {
    const now = new Date();

    switch (frequency) {
      case "3hour":
        return new Date(now.getTime() + 3 * 60 * 60 * 1000);

      case "daily":
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow;

      case "monthly":
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        nextMonth.setDate(1);
        nextMonth.setHours(0, 0, 0, 0);
        return nextMonth;

      default:
        throw new Error(`Unknown reset frequency: ${frequency}`);
    }
  }
}

// Usage in Razorpay webhook handler
// app/api/webhooks/razorpay/route.ts

export async function POST(req: Request) {
  const payload = await req.json();

  // Verify Razorpay signature
  if (!verifyRazorpaySignature(payload)) {
    return new Response("Invalid signature", { status: 400 });
  }

  if (payload.event === "subscription.activated") {
    const { subscription_id, user_id, plan_id } = payload;

    try {
      const quotaAssigner = new QuotaAssignmentManager();

      // Get subscription details from your database
      const subscription = await db.subscriptions.findUnique({
        where: { provider_subscription_id: subscription_id },
        include: { user: true },
      });

      // Assign quotas for the new subscription
      await quotaAssigner.assignQuotasForNewSubscription({
        userId: user_id,
        subscriptionTier: getPlanTier(plan_id),
        previousTier: subscription?.user.subscription_tier,
      });

      return new Response("OK", { status: 200 });
    } catch (error) {
      console.error("Failed to assign quotas:", error);
      return new Response("Failed to assign quotas", { status: 500 });
    }
  }
}
```

### Quota Assignment Process

1. **Payment Success**

   - User completes payment through Razorpay
   - Razorpay sends webhook event `subscription.activated`
   - System verifies webhook signature

2. **Subscription Update**

   - Update user's subscription tier and status
   - Record change in subscription history
   - Previous tier is preserved for tracking

3. **Quota Assignment**

   - System assigns quotas based on new subscription tier
   - All quota types are created/updated in a single transaction
   - Quota limits are set according to tier configuration
   - Reset schedules are established based on frequency

4. **Reset Behavior**

   - New subscriptions start with fresh quotas
   - Upgrades reset all quotas to start fresh
   - Quota reset times are calculated based on frequency
   - 3-hour quotas reset on rolling basis
   - Daily quotas reset at midnight UTC
   - Monthly quotas reset on 1st of each month

5. **Error Handling**
   - Failed assignments are rolled back via transactions
   - Webhook retries handle temporary failures
   - Error notifications sent to monitoring system

This implementation ensures:

- Atomic quota assignments
- Clear subscription history
- Proper quota reset scheduling
- Handling of upgrades/downgrades
- Transaction safety
- Audit trail of changes

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
