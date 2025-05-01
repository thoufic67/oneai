# OneAI Platform Implementation Tasks

## Initial Setup

- [x] Create Supabase project
  - [x] Configure Google OAuth
  - [x] Set up database tables
  - [x] Configure RLS policies
- [ ] Set up Razorpay account
  - [ ] Create subscription plans
  - [ ] Get API keys
- [x] Install dependencies
  ```bash
  npm install @supabase/supabase-js @supabase/auth-helpers-nextjs razorpay openrouter
  ```
- [x] Configure environment variables
  - [x] NEXT_PUBLIC_SUPABASE_URL
  - [x] NEXT_PUBLIC_SUPABASE_ANON_KEY
  - [x] RAZORPAY_KEY_ID
  - [x] RAZORPAY_KEY_SECRET
  - [x] OPENROUTER_API_KEY

## Database Setup

### Create Tables

- [x] Users Table
  - [x] Create table with all fields
  - [x] Set up relationships
  - [x] Configure indexes
- [x] Subscriptions Table
  - [x] Create table structure
  - [x] Set up foreign keys
  - [x] Add indexes
- [x] Conversations Table
  - [x] Create table structure
  - [x] Set up relationships
  - [x] Configure indexes
- [x] Chat Messages Table
  - [x] Create table structure
  - [x] Set up foreign keys
  - [x] Add indexes
- [x] Usage Quotas Table
  - [x] Create table structure
  - [x] Set up relationships
  - [x] Configure indexes

### Security

- [x] Set up Row Level Security (RLS)
  - [x] Users table policies
  - [x] Subscriptions table policies
  - [x] Conversations table policies
  - [x] Messages table policies
  - [x] Quotas table policies

## OpenRouter Integration

### Setup & Configuration

- [x] Create OpenRouter account
- [x] Get API key
- [x] Configure environment variables
  - [x] OPENROUTER_API_KEY
  - [x] NEXT_PUBLIC_API_URL
  - [x] NEXT_PUBLIC_SITE_NAME

### Client Implementation

- [x] Create OpenRouter client
  - [x] Implement streamChat method
  - [x] Implement getModels method
  - [x] Add error handling
  - [x] Add rate limit handling
- [x] Create model configuration
  - [x] Define supported models
  - [x] Set pricing information
  - [x] Configure context limits

## API Implementation

### Authentication API

- [x] Implement Supabase auth integration
  - [x] Set up auth callback route
  - [x] Sync user data to custom users table
  - [x] Add rate limiting for API endpoints
- [x] Configure auth middleware
  - [x] Set up protected routes
  - [x] Handle auth state changes
  - [x] Implement session cleanup for custom data

### Chat API

- [x] Implement streaming endpoint
  - [x] SSE setup
  - [x] Error handling
  - [x] Token tracking
  - [x] Context management
- [x] Create history endpoints
  - [x] Filtering
  - [x] Pagination
  - [x] Search
- [ ] Add models endpoint
  - [ ] Available models
  - [ ] Capabilities
  - [ ] Pricing

### Conversations API

- [x] Basic CRUD operations
  - [x] List conversations
  - [x] Create conversation
  - [x] Update conversation
  - [x] Delete conversation
- [x] Message management
  - [x] Get messages
  - [x] Pagination
  - [x] Search
- [x] Advanced features
  - [x] Conversation sharing
  - [x] Export functionality
  - [x] Title management

### Share Functionality Implementation

- [x] Database Setup

  - [x] Create shared_conversations table
  - [x] Set up indexes for performance
  - [x] Configure RLS policies
  - [x] Test database constraints

- [x] API Implementation

  - [x] Create /api/conversations/[id]/share endpoint
    - [x] Generate unique share ID
    - [x] Create shared conversation record
    - [x] Return shareable URL
  - [x] Create /api/share/[id] endpoint
    - [x] Fetch shared conversation
    - [x] Validate share status
    - [x] Return conversation data
  - [x] Add share deactivation endpoint
    - [x] Toggle share status
    - [x] Handle expiration
  - [x] Create /api/conversations/[id]/share/delete endpoint
    - [x] Validate user ownership
    - [x] Remove shared conversation record
    - [x] Handle concurrent deletions
    - [x] Return success/failure status

- [x] UI Components

  - [x] Add Share button to navbar
    - [x] Show only on conversation pages
    - [x] Add click handler
  - [x] Create Share Modal component
    - [x] Generate link button
    - [x] Copy link functionality
    - [x] Delete share button
    - [x] Confirmation dialog for deletion
    - [x] Success/error notifications
    - [x] Loading states
  - [x] Create Shared Conversation View
    - [x] Read-only conversation display
    - [x] Error handling for invalid/expired/deleted shares
    - [x] Loading states

- [ ] Testing & Validation
  - [ ] Test share link generation
  - [ ] Test share deletion
    - [ ] Verify owner-only deletion
    - [ ] Test concurrent deletion handling
    - [ ] Verify immediate public access removal
  - [ ] Verify public access
  - [ ] Test expiration handling
  - [ ] Validate security policies

### Subscription API

- [ ] Razorpay Integration Setup

  - [ ] Create Razorpay account and get API keys
  - [ ] Set up webhook endpoints
  - [ ] Configure subscription plans in dashboard
  - [ ] Add test mode configurations
  - [ ] Implement signature verification

- [ ] Frontend Integration

  - [ ] Create RazorpayCheckoutButton component
  - [ ] Implement checkout initialization
  - [ ] Add payment success/failure handlers
  - [ ] Create loading and error states
  - [ ] Add retry mechanism for failed payments

- [ ] Backend Implementation

  - [ ] Create subscription creation endpoint
  - [ ] Implement webhook handler
  - [ ] Add payment verification
  - [ ] Set up subscription status tracking
  - [ ] Implement subscription cancellation

- [ ] Database Updates

  - [ ] Add payment_status to subscriptions table
  - [ ] Create subscription_payments table
  - [ ] Set up payment tracking indexes
  - [ ] Add payment history tracking

- [ ] Testing & Validation

  - [ ] Test with Razorpay test cards
  - [ ] Verify webhook handling
  - [ ] Test error scenarios
  - [ ] Validate signature verification
  - [ ] Test subscription lifecycle

- [ ] Plan management

  - [ ] List plans
  - [ ] Plan details
  - [ ] Feature comparison

- [ ] Subscription operations

  - [ ] Create subscription
    - [ ] Handle Razorpay payment flow
    - [ ] Process subscription.activated webhook
    - [ ] Implement QuotaAssignmentManager
    - [ ] Set up quota reset scheduling
  - [ ] Cancel subscription
    - [ ] Handle subscription cancellation
    - [ ] Update quota limits
    - [ ] Record in subscription history
  - [ ] Update subscription
    - [ ] Handle tier upgrades/downgrades
    - [ ] Recalculate quota limits
    - [ ] Reset quotas on upgrade
  - [ ] Handle failed payments
    - [ ] Implement grace period
    - [ ] Send payment reminders
    - [ ] Adjust quota limits

- [ ] Billing features
  - [ ] Invoice management
  - [ ] Payment processing
  - [ ] Portal integration

### User API

- [x] Profile management
  - [x] Get profile
  - [x] Update profile
  - [x] Preferences
- [x] Usage tracking
  - [x] Quota management
    - [x] Implement enhanced users table with subscription fields
    - [x] Create subscription_history table
    - [x] Create usage_quotas table
    - [x] Set up database indexes for performance
    - [x] Implement QuotaManager class in lib/quota.ts
    - [x] Add quota check middleware for protected routes
  - [x] Subscription tiers
    - [x] Define tier configurations in config/subscription.ts
    - [x] Implement tier change logic
    - [x] Add subscription history tracking
    - [x] Create tier upgrade/downgrade workflows
  - [x] API endpoints
    - [x] Implement /api/quota/check route
    - [x] Implement /api/quota/status route
    - [x] Add quota reset scheduling
    - [x] Implement quota usage analytics
  - [ ] UI Components
    - [ ] Create UsageDisplay component
    - [ ] Add QuotaCard component
    - [ ] Implement usage charts and graphs
    - [ ] Add upgrade prompts for quota limits
  - [ ] Cost analysis
    - [ ] Track token usage per model
    - [ ] Calculate costs per subscription tier
    - [ ] Implement cost forecasting
    - [ ] Create cost analysis dashboard
  - [ ] Monitoring
    - [ ] Set up quota usage alerts
    - [ ] Monitor reset frequencies
    - [ ] Track quota exceeded events
    - [ ] Analyze usage patterns
- [ ] API key system
  - [ ] Key generation
  - [ ] Permission management
  - [ ] Usage tracking

### Documentation API

- [ ] Search functionality
  - [ ] Content indexing
  - [ ] Search implementation
  - [ ] Result ranking
- [ ] Feedback system
  - [ ] Submit feedback
  - [ ] Track improvements
  - [ ] Analytics

### Admin API

- [ ] User management
  - [ ] List users
  - [ ] User details
  - [ ] Actions (suspend, delete)
- [ ] Quota management
  - [ ] View quotas
  - [ ] Modify limits
  - [ ] Override settings
- [ ] Platform analytics
  - [ ] Usage statistics
  - [ ] Revenue tracking
  - [ ] Performance metrics

### Webhook Handlers

- [ ] Razorpay integration
  - [ ] Event handling
  - [ ] Payment processing
  - [ ] Error handling

## Security Implementation

### API Protection

- [ ] OpenRouter Security
  - [ ] Secure key storage
  - [ ] Key rotation
  - [ ] Usage monitoring
- [ ] Rate Limiting
  - [ ] Per-user limits
  - [ ] Global limits
  - [ ] Burst handling
- [ ] Data Protection
  - [ ] Input validation
  - [ ] Output sanitization
  - [ ] Data encryption

### Monitoring Setup

- [ ] Error tracking
  - [ ] Error logging
  - [ ] Alert system
  - [ ] Error recovery
- [ ] Performance monitoring
  - [ ] Response times
  - [ ] Resource usage
  - [ ] Bottleneck detection
- [ ] Usage analytics
  - [ ] User activity
  - [ ] API usage
  - [ ] Cost tracking

## Frontend Implementation

### Authentication Components

- [ ] Update Auth Provider
  - [ ] Integrate Supabase auth
  - [ ] Handle session management
  - [ ] Add auth state listeners
- [ ] Create Login Component
  - [ ] Implement sign-in flow
  - [ ] Add loading states
  - [ ] Handle errors
- [ ] Implement Auth Callback
  - [ ] Handle redirect
  - [ ] Store session
  - [ ] Error handling

### Chat Components

- [ ] Create Chat Stream Component
  - [ ] Implement SSE client
  - [ ] Handle streaming
  - [ ] Add error recovery
  - [ ] Show loading states
- [ ] Create Conversation Component
  - [ ] Display messages
  - [ ] Handle user input
  - [ ] Show typing indicators
  - [ ] Implement retry logic

### Subscription Components

- [ ] Create Pricing Component
  - [ ] Display plans
  - [ ] Show features
  - [ ] Handle selection
- [ ] Implement Checkout
  - [ ] Integrate Razorpay
  - [ ] Handle success/failure
  - [ ] Show confirmation

## Integration Testing

### Authentication

- [ ] Test auth flow
  - [ ] Sign-in process
  - [ ] Session management
  - [ ] Token refresh
  - [ ] Error scenarios

### Chat Functionality

- [ ] Test streaming
  - [ ] Connection handling
  - [ ] Error recovery
  - [ ] Message ordering
  - [ ] Quota limits

### Subscription

- [ ] Test payment flow
  - [ ] Plan selection
  - [ ] Payment process
  - [ ] Webhook handling
  - [ ] Status updates

### Quota Management

- [ ] Test usage tracking
  - [ ] Token counting
  - [ ] Limit enforcement
  - [ ] Reset mechanism
  - [ ] Overage handling

## Documentation

### Technical Documentation

- [ ] API Documentation
  - [ ] Endpoint specifications
  - [ ] Request/response formats
  - [ ] Error codes
- [ ] Database Schema
  - [ ] Table relationships
  - [ ] Indexes
  - [ ] RLS policies

### User Documentation

- [ ] Setup Guide
  - [ ] Environment configuration
  - [ ] Installation steps
  - [ ] Deployment process
- [ ] Usage Guide
  - [ ] Features overview
  - [ ] Subscription management
  - [ ] Quota understanding

## Deployment

### Infrastructure Setup

- [ ] Configure production environment
  - [ ] Set up secrets
  - [ ] Configure CORS
  - [ ] Set up monitoring

### Deployment Process

- [ ] Database migration
- [ ] API deployment
- [ ] Frontend deployment
- [ ] Webhook configuration

## Monitoring & Maintenance

### Setup Monitoring

- [ ] Error tracking
- [ ] Performance metrics
- [ ] Usage statistics
- [ ] Quota alerts

### Regular Maintenance

- [ ] Database backups
- [ ] Log rotation
- [ ] Security updates
- [ ] Performance optimization

## Status

- [x] Planning Phase: Complete
- [x] Database Setup: Complete
- [x] API Implementation: Complete
- 🟡 Frontend Implementation: In Progress
- ⚪ Integration Testing: Not Started
- [x] Documentation: Complete
- ⚪ Deployment: Not Started
- ⚪ Monitoring Setup: Not Started
