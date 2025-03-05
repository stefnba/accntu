# Auth Feature

This directory contains the authentication and authorization features of the application.

## Directory Structure

```
auth/
├── queries/                # Database queries
│   ├── email-otp.ts        # Email OTP verification queries
│   ├── oauth.ts            # OAuth account queries
│   ├── session.ts          # Session management queries
│   ├── verification-token.ts # Verification token queries
│   └── index.ts            # Exports all queries with namespacing
├── services/               # Business logic
│   ├── auth.ts             # Main auth service combining different methods
│   ├── email-otp.ts        # Email OTP verification services
│   ├── oauth.ts            # OAuth authentication services
│   ├── session.ts          # Session management services
│   ├── verification.ts     # Email verification services
│   └── index.ts            # Exports all services with namespacing
├── constants.ts            # Auth-related constants
├── middleware.ts           # Auth middleware
├── routes.ts               # Auth API routes
├── schemas.ts              # Auth-specific schemas
├── utils.ts                # Auth utilities
└── index.ts                # Main entry point
```

## Usage

### Importing

```typescript
// Import specific namespaced queries
import { sessionQueries, verificationTokenQueries } from '@/server/features/auth/queries';

// Import specific namespaced services
import { sessionServices, emailOtpServices } from '@/server/features/auth/services';

// Import everything with namespacing
import { queries, services } from '@/server/features/auth';
```

### Examples

```typescript
// Create a session
const session = await sessionServices.createSession({
  userId: 'user-id',
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
});

// Authenticate with email OTP
const { token } = await emailOtpServices.loginWithEmailOTP('user@example.com');

// Verify email OTP
const isValid = await emailOtpServices.verifyEmailOtp(token, '123456');
```

## Auth Methods

The auth feature supports multiple authentication methods:

1. **Email OTP**: One-time password sent to email
2. **OAuth**: Social login with providers like GitHub and Google
3. **Magic Link**: Email link authentication

Each method has its own set of queries and services, but they all integrate with the same session management system.
