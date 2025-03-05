# Verification Token Service

This service handles the creation, validation, and management of verification tokens used for various authentication and verification flows in the application.

## Overview

Verification tokens are used for several purposes:

1. **Email OTP Authentication**: One-time passwords sent via email for passwordless login
2. **Email Verification**: Verifying a user's email address
3. **Password Reset**: Tokens for password reset flows
4. **Account Verification**: Verifying a user's account

## Token Types

The service supports different token types, defined in the `TOptType` enum:

- `login`: For email OTP login
- `verify-email`: For email verification
- `reset-password`: For password reset
- `invite`: For user invitations

## Key Functions

### Token Generation

```typescript
// Generate an OTP for email login
const { otp, token } = await verificationTokenServices.generateOtp({
  email: 'user@example.com'
});

// Generate a verification token for email verification
const token = await verificationTokenServices.generateEmailVerificationToken({
  userId: 'user-123',
  email: 'user@example.com'
});
```

### Token Verification

```typescript
// Verify an OTP
const isValid = await verificationTokenServices.verifyOtp({
  token: 'token-123',
  otp: '123456'
});

// Verify an email verification token
const isValid = await verificationTokenServices.verifyEmailVerificationToken({
  userId: 'user-123',
  token: 'token-123'
});
```

### Token Management

```typescript
// Mark a token as used
await verificationTokenServices.markTokenAsUsed({
  token: 'token-123'
});

// Delete expired tokens
await verificationTokenServices.deleteExpiredTokens();
```

## Security Considerations

1. **Token Expiration**: All tokens have an expiration time to limit the window of vulnerability
2. **Rate Limiting**: The service implements rate limiting to prevent brute force attacks
3. **Token Hashing**: Sensitive tokens are hashed before storage
4. **Attempt Tracking**: Failed verification attempts are tracked to prevent brute force attacks

## Integration with Auth Service

The verification token service is used by the auth service for various authentication flows:

```typescript
// In auth service
export const authenticateWithEmailOtp = async ({ email }: { email: string }) => {
  return verificationTokenServices.initiateLoginWithEmailOTP({ email });
};

export const verifyEmailOtpAndCreateSession = async ({
  token,
  otp,
  ipAddress,
  userAgent,
}: {
  token: string;
  otp: string;
  ipAddress?: string;
  userAgent?: string;
}) => {
  // Verify the OTP
  const isValid = await verificationTokenServices.verifyEmailOtp({ token, otp });

  // Rest of the authentication flow...
};
```

## Error Handling

The service uses the centralized error handling system:

```typescript
if (!verification) {
  throw errorFactory.createAuthError({
    message: 'Invalid or expired OTP',
    code: 'AUTH.OTP_INVALID',
    statusCode: 401,
  });
}
```
