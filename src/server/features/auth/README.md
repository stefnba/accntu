# Authentication System

This authentication system provides session-based authentication with multiple login methods:

1. Email with OTP (One-Time Password)
2. GitHub OAuth
3. Google OAuth

## Features

- Session-based authentication (no JWT)
- Multiple login methods for the same user account
- Database-backed sessions with expiration
- Secure HTTP-only cookies
- Protection against session fixation
- IP and user agent tracking for sessions

## Database Schema

The authentication system uses three main tables:

1. **session** - Stores active user sessions
2. **account** - Links social accounts to users
3. **verificationToken** - Manages OTP codes and email verification

## Authentication Flow

### Email + OTP Login

1. User enters email address
2. System generates OTP and sends it to the email
3. User enters OTP to verify identity
4. System creates a session and sets a session cookie

### Social Login (GitHub/Google)

1. Frontend initiates OAuth flow with provider
2. Provider redirects back with user profile
3. Backend verifies the profile and finds or creates user
4. System creates a session and sets a session cookie

## API Endpoints

- `POST /api/auth/login` - Request OTP for email login
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/logout` - End session
- `GET /api/auth/me` - Get current user
- `POST /api/auth/social` - Authenticate with social provider

## Protected Routes

Use the `requireAuth` middleware to protect routes:

```typescript
import { requireAuth } from '@/server/features/auth/middleware';

// Create a protected route group
const protectedRoutes = new Hono()
  .use('*', requireAuth)
  .get('/profile', (c) => {
    const user = c.get('user');
    return c.json({ user });
  });

// Add to main app
app.route('/protected', protectedRoutes);
```

## Security Considerations

- Sessions expire after 1 week
- OTP codes expire after 10 minutes
- Sessions are invalidated on logout
- Cookies are HTTP-only and use SameSite=Strict
- Secure flag is enabled in production
