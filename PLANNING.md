# OneAI Authentication Migration Plan

## Overview

This document outlines the plan to migrate the authentication system from Google OAuth to Supabase Auth while maintaining the existing chat service backend integration.

## Current Architecture

- Frontend: Next.js with TypeScript
- Authentication: Google OAuth
- Chat Services: Custom backend API
- State Management: React Context for auth state
- UI Components: HeroUI and TailwindCSS

## Target Architecture

- Frontend: Next.js with TypeScript (unchanged)
- Authentication: Supabase Auth with Google OAuth provider
- Chat Services: Custom backend API (unchanged)
- State Management: React Context with Supabase Auth
- UI Components: HeroUI and TailwindCSS (unchanged)

## Technical Stack Updates

- New Dependencies:
  - @supabase/supabase-js
  - @supabase/auth-helpers-nextjs

## Directory Structure

```
/app
  /auth
    /callback
      page.tsx      # Updated for Supabase auth callback
  /components
    /auth
      provider.tsx  # Updated AuthProvider with Supabase
/lib
  supabase.ts      # New Supabase client configuration
/services
  supabaseAuthService.ts  # New Supabase auth service
  api.ts           # Updated chat service with Supabase auth
```

## Authentication Flow

1. User clicks "Sign in with Google"
2. Supabase Auth handles OAuth flow
3. Callback page processes authentication
4. AuthProvider updates global auth state
5. Chat services use Supabase JWT for API calls

## Data Models

### User Model

```typescript
interface User {
  id: string;
  email: string;
  name?: string;
  picture_url?: string;
}
```

### Auth State

```typescript
interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
```

## Security Considerations

1. JWT token validation on backend
2. Secure session management
3. Protected route handling
4. Token refresh mechanism
5. Error handling and recovery

## Integration Points

### Frontend Integration

1. Supabase client initialization
2. Auth state management
3. Protected routes
4. API request authentication

### Backend Integration

1. JWT validation
2. User session management
3. API endpoint authentication
4. Error handling

## Testing Strategy

1. Unit Tests:

   - Auth service functions
   - Protected route components
   - API integration

2. Integration Tests:

   - Authentication flow
   - Session management
   - API communication

3. E2E Tests:
   - Complete sign-in flow
   - Protected route access
   - Chat functionality with auth

## Rollback Plan

1. Maintain old authentication code in a separate branch
2. Keep Google OAuth configuration active during transition
3. Monitor error rates and user feedback
4. Prepare rollback scripts and procedures

## Performance Considerations

1. Minimize authentication redirects
2. Optimize token refresh strategy
3. Implement proper loading states
4. Cache user session data appropriately

## Monitoring and Logging

1. Authentication success/failure rates
2. Token refresh events
3. API authentication errors
4. Session duration metrics

## Future Enhancements

1. Additional auth providers
2. Enhanced session management
3. Improved error handling
4. Advanced security features

## Documentation Requirements

1. Update API documentation
2. Update deployment guides
3. Create troubleshooting guide
4. Document security practices
