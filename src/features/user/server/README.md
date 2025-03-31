# User Feature

This directory contains the user feature implementation, which handles user profile management and user settings.

## Directory Structure

- `queries.ts`: Database queries for user operations
- `routes.ts`: API routes for user operations
- `services.ts`: Business logic for user operations
- `schemas.ts`: Data validation schemas (if any)

## Usage

### Importing Services

```typescript
import * as UserServices from '@/server/features/user/services';
```

### Importing Queries

```typescript
import * as UserQueries from '@/server/features/user/queries';
```

## Examples

### Getting a User Profile

```typescript
const userProfile = await UserServices.getUserProfile({
  userId: 'user-id-here'
});
```

### Updating a User Profile

```typescript
const updatedUser = await UserServices.updateUserProfile({
  userId: 'user-id-here',
  data: {
    firstName: 'John',
    lastName: 'Doe',
    image: 'https://example.com/image.jpg',
    settings: {
      theme: 'dark',
      language: 'en',
      timezone: 'UTC',
      currency: 'USD'
    }
  }
});
```

### Creating a New User

```typescript
const newUser = await UserServices.signupNewUser({
  data: {
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
    image: 'https://example.com/image.jpg'
  }
});
```

## API Routes

- `GET /me`: Get the current user's profile
- `PATCH /update`: Update the current user's profile

All routes require authentication via the `requireAuth` middleware.

## Code Guidelines

All functions in this feature use object parameters instead of positional parameters for better maintainability and readability. This approach provides several benefits:

1. Self-documenting code
2. Order independence
3. Easier handling of optional parameters
4. Future-proofing
5. Better TypeScript type checking

For more details on coding guidelines, see the `CODING_GUIDELINES.md` file in the project root.
