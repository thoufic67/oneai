# OneAI Platform Planning

## Overview

This document outlines the complete platform architecture using Supabase for authentication and database, NextJS API for chat services, and Razorpay for subscription management.

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
      /callback/route.ts # Auth callback API
      /session/route.ts  # Session management
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
    current_subscription TEXT,
    subscription_status TEXT,
    google_id TEXT UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Subscriptions Table

```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    razorpay_subscription_id TEXT UNIQUE,
    plan_id TEXT,
    status TEXT,
    current_period_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);
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
    conversation_id UUID REFERENCES conversations(id),
    user_id UUID REFERENCES users(id),
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    model_id TEXT NOT NULL,
    tokens_used INTEGER,
    parent_message_id UUID REFERENCES chat_messages(id),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Usage Quotas Table

```sql
CREATE TABLE usage_quotas (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    model_id TEXT NOT NULL,
    tokens_used BIGINT DEFAULT 0,
    reset_at TIMESTAMP,
    quota_limit INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_quota_usage_user_id ON usage_quotas(user_id);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
```

## API Routes Structure

```
/app/api
  /auth
    /callback
      route.ts        # Handle auth callbacks
    /session
      route.ts        # Session management
    /verify
      route.ts        # Token verification

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
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL,
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
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
    });

    return response.json();
  }
}
```

## API Endpoints Detail

### Authentication API

- `POST /api/auth/callback`
  - Handle OAuth callbacks
  - Process token exchange
  - Create/update user profile
- `GET /api/auth/session`
  - Get current session
  - Validate token
  - Refresh if needed
- `POST /api/auth/verify`
  - Verify token validity
  - Check permissions

### Chat API

- `POST /api/chat/stream`
  - Stream chat responses (SSE)
  - OpenRouter model selection
  - Token usage tracking
  - Error handling with fallbacks
  - Rate limit management
- `GET /api/chat/history`
  - Get chat history
  - Filter by date/model
  - Pagination support
- `GET /api/chat/models`
  - List available OpenRouter models
  - Get pricing information
  - Get model capabilities
  - Get context limits

### Conversations API

- `GET /api/conversations`
  - List conversations
  - Filter and sort
  - Pagination
- `POST /api/conversations`
  - Create new conversation
  - Set initial context
- `GET /api/conversations/[id]`
  - Get conversation details
  - Get messages
  - Get metadata
- `PATCH /api/conversations/[id]`
  - Update conversation
  - Update metadata
- `DELETE /api/conversations/[id]`
  - Delete conversation
  - Cleanup resources
- `GET /api/conversations/[id]/messages`
  - Get conversation messages
  - Filter and paginate
- `POST /api/conversations/[id]/share`
  - Generate share link
  - Set permissions
- `GET /api/conversations/[id]/export`
  - Export conversation
  - Multiple formats

### Subscription API

- `GET /api/subscription/plans`
  - List available plans
  - Get features
  - Get pricing
- `POST /api/subscription/create`
  - Create subscription
  - Process payment
  - Set up webhooks
- `POST /api/subscription/cancel`
  - Cancel subscription
  - Handle refunds
  - Update quotas
- `GET /api/subscription/invoice`
  - Get invoice history
  - Download invoices
- `GET /api/subscription/portal`
  - Get portal link
  - Manage subscription

### User API

- `GET /api/user/profile`
  - Get user details
  - Get preferences
- `PATCH /api/user/profile`
  - Update profile
  - Update preferences
- `GET /api/user/quota`
  - Get quota limits
  - Get usage stats
- `GET /api/user/usage`
  - Get detailed usage
  - Get cost analysis
- `POST /api/user/api-keys`
  - Create API key
  - Manage permissions

### Webhook Handlers

- `POST /api/webhooks/razorpay`
  - Handle payment events
  - Update subscription
  - Send notifications

### Documentation API

- `GET /api/docs/search`
  - Search documentation
  - Get relevant results
- `POST /api/docs/feedback`
  - Submit feedback
  - Track improvements

### Admin API

- `GET /api/admin/users`
  - Manage users
  - View analytics
- `GET /api/admin/quotas`
  - Manage quotas
  - Override limits
- `GET /api/admin/subscriptions`
  - Manage subscriptions
  - Handle issues
- `GET /api/admin/analytics`
  - View platform stats
  - Generate reports

## API Security Measures

1. **Authentication**

   - JWT validation
   - Role-based access
   - API key validation
   - Rate limiting

2. **Data Protection**

   - Input validation
   - Output sanitization
   - CORS policies
   - Data encryption

3. **Error Handling**
   - Structured errors
   - Logging
   - Monitoring
   - Rate limit tracking

## Monitoring

1. Subscription metrics
2. Usage quota tracking
3. API performance
4. Error tracking
5. Webhook reliability
6. User activity auditing
7. Token usage monitoring

## Testing Strategy

1. Unit Tests:

   - Quota calculations
   - Subscription logic
   - API endpoints
   - Streaming functionality

2. Integration Tests:

   - Subscription flow
   - Quota management
   - Supabase integration
   - OpenRouter integration

3. E2E Tests:
   - Complete subscription flow
   - Chat with quota limits
   - Webhook handling
   - Streaming reliability

## Performance Optimization

1. Database indexing
2. Connection pooling
3. Response streaming
4. Caching strategy
5. Token counting optimization
6. Query optimization

## Future Enhancements

1. Additional subscription tiers
2. Custom quota packages
3. Usage analytics dashboard
4. Bulk token purchases
5. Team subscriptions
6. Advanced conversation features
7. Multi-model chat

## Environment Variables

```env
# OpenRouter Configuration
OPENROUTER_API_KEY=sk_...
NEXT_PUBLIC_SITE_URL=https://oneai.yourdomain.com
NEXT_PUBLIC_SITE_NAME=OneAI Platform

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

## Security Measures

1. **API Key Management**

   - Secure storage of OpenRouter API key
   - Key rotation mechanism
   - Usage monitoring

2. **Rate Limiting**

   - Per-user limits
   - Global limits
   - Quota enforcement

3. **Error Handling**
   - Model fallback strategy
   - Stream recovery
   - Token limit management
