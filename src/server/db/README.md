# Database Layer

This directory contains the database configuration and schemas for the application, using Drizzle ORM for type-safe database operations.

## Directory Structure

```
src/server/db/
├── index.ts       # Database client setup
└── schemas/       # Drizzle ORM schemas
    ├── auth.ts    # Authentication-related schemas
    ├── user.ts    # User-related schemas
    └── index.ts   # Schema exports
```

## Database Client

The database client is configured in `index.ts` and provides a connection to the database. It's used throughout the application for database operations.

```typescript
import { db } from '@/server/db';

// Example usage
const users = await db.select().from(userSchema);
```

## Schemas

### Auth Schema (`schemas/auth.ts`)

Contains schemas for authentication-related tables:

- `session`: User sessions
- `verificationToken`: Verification tokens for email OTP, password reset, etc.
- `oauthAccount`: OAuth provider accounts linked to users

### User Schema (`schemas/user.ts`)

Contains schemas for user-related tables:

- `user`: User profiles
- `userSettings`: User preferences and settings

## Usage with Handler Utilities

Database operations should be performed using the handler utilities from `@/server/lib/handler` to ensure consistent error handling and validation:

```typescript
import { withDbQuery, withDbQueryValidatedNullable } from '@/server/lib/handler';
import { user } from '@/server/db/schemas/user';

// Simple query
export const getAllUsers = async () =>
  withDbQuery({
    operation: 'get all users',
    queryFn: () => db.select().from(user),
  });

// Query with validation and nullable result
export const getUserById = async ({ userId }: { userId: string }) =>
  withDbQueryValidatedNullable({
    operation: 'get user by id',
    outputSchema: SelectUserSchema,
    queryFn: async () => {
      const [result] = await db
        .select()
        .from(user)
        .where(eq(user.id, userId));
      return result;
    },
  });
```

## Schema Validation

Schemas are defined with Drizzle ORM and include Zod validation schemas for input/output validation:

```typescript
// Example from user.ts
export const user = pgTable('user', {
  id: text('id').primaryKey().notNull(),
  email: text('email').notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastLoginAt: timestamp('last_login_at'),
  role: text('role', { enum: ['user', 'admin'] }).default('user').notNull(),
});

// Zod schema for validation
export const SelectUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  image: z.string().nullable(),
  createdAt: z.date(),
  lastLoginAt: z.date().nullable(),
  role: z.enum(['user', 'admin']),
});

// Type for the user record
export type TUser = z.infer<typeof SelectUserSchema>;
```

## Best Practices

1. **Use Handler Utilities**: Always use the handler utilities for database operations to ensure consistent error handling.
2. **Define Validation Schemas**: Define Zod validation schemas for all database operations.
3. **Use Types**: Use the generated types from Zod schemas for type safety.
4. **Centralize Queries**: Keep all database queries in the `queries.ts` file of the relevant feature.
5. **Use Object Parameters**: Use object parameters for all functions to improve maintainability.
