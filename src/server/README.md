# Server Architecture

This directory contains the server-side code for the application, built with Hono as the API framework and Drizzle ORM for database operations.

## Directory Structure

```
src/server/
├── db/                # Database configuration and schemas
│   ├── index.ts       # Database client setup
│   └── schemas/       # Drizzle ORM schemas
├── features/          # Feature-based organization
│   ├── auth/          # Authentication feature
│   └── user/          # User management feature
├── lib/               # Shared libraries
│   ├── cookies/       # Cookie management utilities
│   ├── error/         # Error handling system
│   └── handler/       # Database and route handler utilities
├── middleware/        # Shared middleware
└── index.ts           # Main Hono API setup
```

## Core Concepts

### 1. Feature-Based Organization

The codebase is organized around features, with each feature containing its own:

- **Routes**: API endpoints for the feature
- **Services**: Business logic
- **Queries**: Database operations
- **Schemas**: Data validation schemas

This organization makes it easy to understand and maintain each feature independently.

### 2. Layered Architecture

Each feature follows a layered architecture:

1. **Routes Layer**: Handles HTTP requests and responses
2. **Services Layer**: Contains business logic and orchestrates operations
3. **Queries Layer**: Handles database operations

This separation of concerns makes the code more maintainable and testable.

### 3. Centralized Utilities

Common utilities are centralized in the `lib` directory:

- **Error Handling**: Comprehensive error handling system
- **Cookie Management**: Centralized cookie operations
- **Handler Utilities**: Standardized database and route handlers

### 4. Type Safety

The codebase leverages TypeScript for type safety throughout:

- **Database Schemas**: Strongly typed with Drizzle ORM
- **API Requests/Responses**: Validated with Zod
- **Error Handling**: Type-safe error propagation

## Key Features

### Authentication (auth)

The authentication feature provides:

- Email OTP authentication
- OAuth authentication
- Session management
- Authorization middleware

### User Management (user)

The user feature provides:

- User profile management
- User settings management
- User creation and updates

## Best Practices

### 1. Object Parameters

All functions use object parameters instead of positional parameters for better maintainability:

```typescript
// Good
function doSomething({ param1, param2 }: { param1: string; param2: number }) {
  // ...
}

// Bad
function doSomething(param1: string, param2: number) {
  // ...
}
```

### 2. Error Handling

Errors are handled consistently using the error factory:

```typescript
throw errorFactory.createAuthError({
  message: 'Invalid or expired session',
  code: 'AUTH.SESSION_NOT_FOUND',
  statusCode: 401,
});
```

### 3. Database Operations

Database operations are wrapped with handler utilities:

```typescript
const user = await withDbQueryValidatedNullable({
  operation: 'get user by id',
  outputSchema: SelectUserSchema,
  queryFn: async () => {
    const [result] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    return result;
  },
});
```

### 4. Cookie Management

Cookies are managed through a centralized utility:

```typescript
setSecureCookie(c, COOKIE_NAMES.AUTH_SESSION, sessionId);
const sessionId = getCookieValue(c, COOKIE_NAMES.AUTH_SESSION);
```

## Getting Started

To work with the server code:

1. Understand the feature you're working with
2. Follow the layered architecture (routes → services → queries)
3. Use the provided utilities for error handling, database operations, etc.
4. Follow the established patterns and best practices
