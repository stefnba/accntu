# Auth Feature Coding Guidelines

## Function Parameters

### Use Object Parameters

All functions in the auth feature should use object parameters instead of positional parameters. This approach has several benefits:

1. **Named parameters**: Makes function calls more readable and self-documenting
2. **Order independence**: Parameter order doesn't matter
3. **Optional parameters**: Easier to handle optional parameters
4. **Future-proofing**: Adding new parameters doesn't break existing code
5. **Type safety**: Better TypeScript type checking and IntelliSense support

### Examples

#### ❌ Avoid positional parameters

```typescript
// Hard to remember parameter order
export const authenticateWithOAuth = async (
    provider: 'github' | 'google',
    providerAccountId: string,
    userData: { email: string; name?: string },
    ipAddress?: string,
    userAgent?: string
) => {
    // ...
};

// Function call is not self-documenting
authenticateWithOAuth('github', '12345', { email: 'user@example.com' }, '127.0.0.1', 'Chrome');
```

#### ✅ Use object parameters

```typescript
// Clear parameter structure
export const authenticateWithOAuth = async ({
    provider,
    providerAccountId,
    userData,
    ipAddress,
    userAgent,
}: {
    provider: 'github' | 'google';
    providerAccountId: string;
    userData: { email: string; name?: string };
    ipAddress?: string;
    userAgent?: string;
}) => {
    // ...
};

// Function call is self-documenting
authenticateWithOAuth({
    provider: 'github',
    providerAccountId: '12345',
    userData: { email: 'user@example.com' },
    ipAddress: '127.0.0.1',
    userAgent: 'Chrome',
});
```

### Documentation

When documenting functions with object parameters, use the following JSDoc format:

```typescript
/**
 * Function description
 * @param params - Overall description of parameters
 * @param params.paramName1 - Description of first parameter
 * @param params.paramName2 - Description of second parameter
 * @returns Description of return value
 */
```

## Consistency

All functions in the auth feature should follow this pattern consistently, including:

- Query functions
- Service functions
- Utility functions
- API route handlers

This ensures a consistent API throughout the codebase and makes it easier for developers to work with the auth feature.
