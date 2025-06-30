# Authentication System

The authentication system is built using [Better Auth](https://www.better-auth.com/), providing a robust, customizable authentication solution with multiple sign-in methods.

## Quick Start

```bash
bunx @better-auth/cli generate --config=src/lib/auth/config.ts --output=src/lib/auth/schema.ts
```

## Features

- **Multiple Authentication Methods**: Email OTP, Social Providers (GitHub)
- **Session Management**: Cookie-based sessions with built-in caching
- **Role-Based Access Control**: Protect routes based on user roles
- **Optimized Performance**: Cookie caching for better performance
- **Enhanced Developer Experience**: Clean hook-based API

## Architecture

### Core Components

1. **Server-side (`/server`):**
   - `endpoints.ts`: API routes for authentication operations
   - `middleware.ts`: Route protection and session management
   - `validate.ts`: Session validation with optimized caching

2. **Client-side (`/client`):**
   - `hooks.ts`: React hooks with SWR for data fetching
   - `otp.ts`: Extracted OTP validation logic
   - `api.ts`: Client API wrappers
   - `client.ts`: Auth client configuration

3. **Configuration (`config.ts`):**
   - Better Auth configuration
   - Plugin setup

## Usage Guide

### Client-Side Hooks

#### Basic Session Access

```tsx
import { useSession } from '@/lib/auth/client';

function Profile() {
  const { user, session, isLoading } = useSession();

  if (isLoading) return <div>Loading...</div>;

  return <div>Welcome, {user?.name}</div>;
}
```

#### Complete Auth API

```tsx
import { useAuth } from '@/lib/auth/client';

function AuthComponent() {
  const auth = useAuth();

  // Sign in with Email OTP
  const { sendOTP, isPending: isOtpSending } = auth.signIn.emailOTP.initiateEmailOTP();

  // Sign in with Social Provider
  const { signIn, isPending: isSocialSigningIn } = auth.signIn.social;

  // Sign out
  const handleSignOut = () => auth.signOut();

  return (
    <div>
      {auth.isSignedIn ? (
        <button onClick={handleSignOut}>Sign Out</button>
      ) : (
        <>
          <button onClick={() => sendOTP('user@example.com')} disabled={isOtpSending}>
            Sign in with Email
          </button>

          <button onClick={() => signIn('github')} disabled={isSocialSigningIn}>
            Sign in with GitHub
          </button>
        </>
      )}
    </div>
  );
}
```

### Server-Side Protection

```tsx
import { authMiddleware } from '@/lib/auth/server';

// In your API route
export default authMiddleware(async (c, next) => {
  const user = c.get('user');
  // Access protected resources

  return await next();
});
```

## Performance Optimizations

### Session Caching

The system uses Better Auth's built-in cookie caching for optimal performance:

```typescript
// In config.ts
session: {
  cookieCache: {
    enabled: true,
    maxAge: 5 * 60 // 5 minutes cache duration
  }
}
```

This prevents unnecessary database queries by storing session data in a signed, short-lived cookie.

### SWR Integration

All client hooks use SWR for efficient data fetching with automatic revalidation:

```typescript
const { data, error, isLoading, mutate } = authClient.useSession();
```

This provides:

- Automatic caching
- Revalidation on focus
- Deduplicated requests
- Error handling

## Security Considerations

1. **Cookie Security**: HTTP-Only, SameSite=Lax, and Secure in production
2. **Role-Based Access**: Granular protection based on user roles
3. **Session Expiration**: Configurable session lifetimes
4. **Activity Tracking**: Tracks user agent and IP for active sessions

## Testing

The auth system includes comprehensive tests:

```bash
bun test src/lib/auth/client/hooks.test.tsx
```

Tests cover:

- Session management
- Sign-in/sign-out functionality
- Social authentication flow
- Error handling

## Troubleshooting

### Common Issues

1. **Session Not Found**: Check session cookie expiration
2. **Invalid OTP**: Verify email and code are correct
3. **Social Auth Failed**: Verify client credentials in environment variables

For more details, refer to the [Better Auth Documentation](https://www.better-auth.com/docs/).
