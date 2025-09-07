# Service Factory System

A type-safe service factory system for building business logic layers that coordinate between API endpoints and database queries. This system provides consistent patterns for implementing business rules, validation, and cross-entity operations while maintaining full type safety.

## Overview

The service factory system consists of:

- **`createFeatureServices`** - Entry point for building service collections
- **`FeatureServices`** - Core class for registering schemas and queries
- **Schema integration** - Direct integration with schema factory for input validation
- **Query integration** - Seamless integration with query factory for data access
- **Type safety** - Full TypeScript inference from schemas to service functions

## Key Features

- 🎯 **Type-Safe**: Full TypeScript support with automatic input/output type inference
- 🏗️ **Business Logic Focus**: Clean separation of business rules from data access
- 🔄 **Schema Integration**: Direct integration with schema factory for input validation
- 📊 **Query Integration**: Seamless integration with query factory for data operations
- 🔐 **Security Patterns**: Built-in patterns for authentication and authorization
- 🎨 **Flexible Architecture**: Support for simple pass-through and complex business logic

## Quick Start

```typescript
import { createFeatureServices } from '@/server/lib/service';
import { tagSchemas } from '@/features/tag/schemas';
import { tagQueries } from '@/features/tag/server/db/queries';

// Build service collection from schemas and queries
export const tagServices = createFeatureServices
    .registerSchema(tagSchemas)
    .registerQuery(tagQueries)
    .defineServices(({ queries, schemas }) => ({
        /**
         * Create a new tag with business logic validation
         */
        create: async (input) => {
            // Add business logic here
            if (input.data.name.toLowerCase() === 'spam') {
                throw new Error('Invalid tag name');
            }

            // Call query layer
            return await queries.create(input);
        },

        /**
         * Get many tags - simple pass-through
         */
        getMany: async (input) => {
            return await queries.getMany(input);
        },
    }));

// Type inference works automatically
const newTag = await tagServices.create({
    data: { name: 'Work', color: '#FF0000' },
    userId: 'user123',
}); // Fully typed!
```

## Core Concepts

### Three-Layer Architecture

The service factory integrates three layers:

1. **Schema Layer** - Input validation and type definitions
2. **Service Layer** - Business logic and coordination (this layer)
3. **Query Layer** - Pure database operations

### Service Responsibilities

Services handle:

- **Business Logic Validation** - Rules beyond schema validation
- **Cross-Entity Operations** - Operations spanning multiple entities
- **Authorization Logic** - Ownership verification and permissions
- **Data Transformation** - Converting between different representations
- **External Service Integration** - Calling third-party APIs
- **Transaction Coordination** - Multi-step database operations

### Schema-Query-Service Flow

```typescript
// 1. Schema defines input/output structure
const { schemas } = createFeatureSchemas
    .registerTable(userTable)
    .addCore('create', ({ baseSchema, buildInput }) => ({
        service: buildInput({ data: baseSchema }), // Service input type
    }));

// 2. Query provides data access
const queries = createFeatureQueries.registerSchema(schemas).addQuery('create', {
    fn: async ({ data, userId }) => {
        /* database operation */
    },
});

// 3. Service coordinates business logic
const services = createFeatureServices
    .registerSchema(schemas)
    .registerQuery(queries)
    .defineServices(({ queries }) => ({
        create: async (input) => {
            // Business logic + query call
            return await queries.create(input);
        },
    }));
```

## API Reference

### Factory Functions

#### `createFeatureServices.registerSchema(schemas)`

Register operation schemas from the schema factory system.

```typescript
const services = createFeatureServices
  .registerSchema(userSchemas)  // Schemas from schema factory
  .registerQuery(...)
  .defineServices(...);
```

#### `createFeatureServices.registerQuery(queries)`

Register query functions from the query factory system.

```typescript
const services = createFeatureServices
  .registerSchema(schemas)
  .registerQuery(userQueries)  // Query builder or query object
  .defineServices(...);
```

### Service Definition

#### `.defineServices(fn)`

Define service functions that implement business logic.

```typescript
const services = createFeatureServices
    .registerSchema(schemas)
    .registerQuery(queries)
    .defineServices(({ queries, schemas }) => ({
        // Define your service functions here
        operationName: async (input) => {
            // Business logic implementation
            // Input is automatically typed from schemas
        },
    }));
```

## Examples

### Basic CRUD Services

```typescript
export const userServices = createFeatureServices
    .registerSchema(userSchemas)
    .registerQuery(userQueries)
    .defineServices(({ queries }) => ({
        /**
         * Create a new user with validation
         */
        create: async (input) => {
            // Business logic validation
            if (input.data.email.endsWith('@spam.com')) {
                throw new Error('Email domain not allowed');
            }

            // Check for existing user
            const existingUser = await queries.getByEmail({
                email: input.data.email,
                userId: input.userId,
            });

            if (existingUser) {
                throw new Error('User with this email already exists');
            }

            // Create user
            return await queries.create(input);
        },

        /**
         * Get user by ID - simple pass-through
         */
        getById: async (input) => {
            return await queries.getById(input);
        },

        /**
         * Update user with business rules
         */
        updateById: async (input) => {
            // Verify user exists and user owns it
            const existingUser = await queries.getById({
                ids: input.ids,
                userId: input.userId,
            });

            if (!existingUser) {
                throw new Error('User not found');
            }

            // Business rule: Can't change email to existing email
            if (input.data.email && input.data.email !== existingUser.email) {
                const emailExists = await queries.getByEmail({
                    email: input.data.email,
                    userId: input.userId,
                });

                if (emailExists) {
                    throw new Error('Email already in use');
                }
            }

            return await queries.updateById(input);
        },

        /**
         * Soft delete user
         */
        removeById: async (input) => {
            // Could add business logic like:
            // - Check if user has active subscriptions
            // - Send notification email
            // - Clean up related data

            return await queries.removeById(input);
        },
    }));
```

### Cross-Entity Business Logic

```typescript
export const tagServices = createFeatureServices
    .registerSchema(tagSchemas)
    .registerSchema(tagToTransactionSchemas) // Multiple schemas
    .registerQuery(tagQueries)
    .registerQuery(tagToTransactionQueries) // Multiple query collections
    .defineServices(({ queries }) => ({
        /**
         * Create tag - simple operation
         */
        create: async (input) => {
            return await queries.create(input);
        },

        /**
         * Assign tags to transaction - complex cross-entity operation
         */
        assignToTransaction: async (input) => {
            // Business logic: Verify user owns the transaction
            const transaction = await transactionServices.getById({
                ids: { id: input.transactionId },
                userId: input.userId,
            });

            if (!transaction) {
                throw new Error('Transaction not found or access denied');
            }

            // Business logic: Verify user owns all tags
            if (input.tagIds.length > 0) {
                const userTags = await queries.getMany({
                    userId: input.userId,
                    filters: { ids: input.tagIds },
                });

                if (userTags.length !== input.tagIds.length) {
                    throw new Error('Some tags not found or access denied');
                }
            }

            // Business rule: Maximum 10 tags per transaction
            if (input.tagIds.length > 10) {
                throw new Error('Maximum 10 tags allowed per transaction');
            }

            // Execute the assignment
            return await queries.assignToTransaction(input);
        },
    }));
```

### Advanced Business Logic with External Services

```typescript
export const transactionServices = createFeatureServices
    .registerSchema(transactionSchemas)
    .registerQuery(transactionQueries)
    .defineServices(({ queries }) => ({
        /**
         * Create transaction with currency conversion
         */
        create: async (input) => {
            // Business logic: Convert currency if needed
            if (input.data.currency !== 'USD') {
                const exchangeRate = await currencyService.getExchangeRate({
                    from: input.data.currency,
                    to: 'USD',
                    date: input.data.date,
                });

                input.data.amountUsd = input.data.amount * exchangeRate;
            }

            // Business logic: Categorize transaction
            if (!input.data.category) {
                input.data.category = await categorizationService.categorize(
                    input.data.description
                );
            }

            // Create transaction
            const transaction = await queries.create(input);

            // Business logic: Send notification for large transactions
            if (Math.abs(transaction.amount) > 1000) {
                await notificationService.sendLargeTransactionAlert({
                    userId: input.userId,
                    transaction,
                });
            }

            return transaction;
        },

        /**
         * Bulk import with validation and deduplication
         */
        bulkImport: async (input) => {
            const { transactions, userId } = input;

            // Business logic: Validate batch size
            if (transactions.length > 1000) {
                throw new Error('Maximum 1000 transactions per batch');
            }

            // Business logic: Detect duplicates
            const duplicates = await queries.findDuplicates({
                transactions,
                userId,
            });

            if (duplicates.length > 0) {
                throw new Error(`Found ${duplicates.length} duplicate transactions`);
            }

            // Business logic: Validate total amount
            const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
            if (Math.abs(totalAmount) > 100000) {
                throw new Error('Batch total exceeds limits');
            }

            // Execute bulk insert with transaction
            return await queries.createMany({
                items: transactions,
                userId,
            });
        },
    }));
```

### Integration with Third-Party Services

```typescript
export const userServices = createFeatureServices
    .registerSchema(userSchemas)
    .registerQuery(userQueries)
    .defineServices(({ queries }) => ({
        /**
         * Create user with email verification
         */
        create: async (input) => {
            // Business logic: Validate email with external service
            const emailValid = await emailValidationService.verify(input.data.email);
            if (!emailValid.isValid) {
                throw new Error(`Invalid email: ${emailValid.reason}`);
            }

            // Create user
            const user = await queries.create(input);

            // Business logic: Send welcome email
            await emailService.sendWelcomeEmail({
                email: user.email,
                name: user.name,
            });

            // Business logic: Create default settings
            await settingsService.createDefaults({
                userId: user.id,
            });

            return user;
        },

        /**
         * Update user profile with image processing
         */
        updateProfile: async (input) => {
            // Business logic: Process profile image if provided
            if (input.data.profileImageUrl) {
                const processedImage = await imageService.process({
                    url: input.data.profileImageUrl,
                    operations: ['resize:200x200', 'optimize'],
                });

                input.data.profileImageUrl = processedImage.url;
            }

            // Update user
            const user = await queries.updateById(input);

            // Business logic: Invalidate cache
            await cacheService.invalidate(`user:${user.id}`);

            return user;
        },
    }));
```

## Security Patterns

### Ownership Verification

Always verify user ownership for cross-entity operations:

```typescript
const services = {
    assignTagToTransaction: async ({ tagId, transactionId, userId }) => {
        // ✅ Good - Verify ownership of both entities
        const [tag, transaction] = await Promise.all([
            tagServices.getById({ ids: { id: tagId }, userId }),
            transactionServices.getById({ ids: { id: transactionId }, userId }),
        ]);

        if (!tag || !transaction) {
            throw new Error('Tag or transaction not found');
        }

        // Now safe to perform operation
        return await queries.assignTag({ tagId, transactionId });
    },
};

// ❌ Bad - No ownership verification
const badServices = {
    assignTagToTransaction: async ({ tagId, transactionId }) => {
        // This could allow users to assign tags to other users' transactions!
        return await queries.assignTag({ tagId, transactionId });
    },
};
```

### Input Sanitization

```typescript
const services = {
    create: async (input) => {
        // Business logic: Sanitize inputs
        if (input.data.description) {
            input.data.description = sanitizeHtml(input.data.description);
        }

        // Business logic: Validate business rules
        if (input.data.amount > 1000000) {
            throw new Error('Amount exceeds maximum allowed');
        }

        return await queries.create(input);
    },
};
```

### Rate Limiting

```typescript
const services = {
    create: async (input) => {
        // Business logic: Check rate limits
        const recentCount = await queries.getRecentCount({
            userId: input.userId,
            minutes: 60,
        });

        if (recentCount > 100) {
            throw new Error('Rate limit exceeded. Try again later.');
        }

        return await queries.create(input);
    },
};
```

## Error Handling

Services should handle business logic errors distinctly from system errors:

```typescript
const services = {
    create: async (input) => {
        try {
            // Business validation
            if (input.data.name.length < 2) {
                throw new Error('Name must be at least 2 characters'); // Business logic error
            }

            // Call query
            return await queries.create(input);
        } catch (error) {
            // System errors from queries are already handled by withDbQuery
            // Business logic errors should be thrown as-is for proper HTTP status codes
            if (error.message.includes('already exists')) {
                throw new Error('A record with this name already exists'); // Business logic error
            }

            // Re-throw system errors
            throw error;
        }
    },
};
```

## Testing Patterns

Services are ideal units for testing business logic:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { userServices } from './user-services';

describe('userServices', () => {
    it('should prevent creating users with spam emails', async () => {
        // Mock query layer
        const mockQueries = {
            create: vi.fn(),
            getByEmail: vi.fn().mockResolvedValue(null),
        };

        // Test business logic
        await expect(
            userServices.create({
                data: { email: 'test@spam.com', name: 'Test' },
                userId: 'user123',
            })
        ).rejects.toThrow('Email domain not allowed');

        // Verify query wasn't called
        expect(mockQueries.create).not.toHaveBeenCalled();
    });
});
```

## Performance Considerations

### Batch Operations

```typescript
const services = {
    // ✅ Good - Batch database operations
    createMany: async (input) => {
        // Validate all items first
        for (const item of input.items) {
            if (item.amount > 1000000) {
                throw new Error(`Amount ${item.amount} exceeds limit`);
            }
        }

        // Single database operation
        return await queries.createMany(input);
    },
};

// ❌ Bad - Multiple database operations
const badServices = {
    createMany: async (input) => {
        const results = [];
        for (const item of input.items) {
            // This creates N database operations!
            const result = await queries.create({ data: item, userId: input.userId });
            results.push(result);
        }
        return results;
    },
};
```

### Caching

```typescript
const services = {
    getById: async (input) => {
        // Check cache first
        const cached = await cache.get(`user:${input.ids.id}`);
        if (cached) return cached;

        // Get from database
        const user = await queries.getById(input);

        // Cache result
        if (user) {
            await cache.set(`user:${user.id}`, user, { ttl: 300 });
        }

        return user;
    },
};
```

## Integration with API Endpoints

Services integrate seamlessly with Hono API endpoints:

```typescript
// Service definition
export const userServices = createFeatureServices
    .registerSchema(userSchemas)
    .registerQuery(userQueries)
    .defineServices(({ queries }) => ({
        create: async (input) => {
            /* implementation */
        },
    }));

// API endpoint
import { userServices } from './services';

const app = new Hono().post('/users', zValidator('json', CreateUserSchema), async (c) =>
    withRoute(
        c,
        async () => {
            const user = getUser(c);
            const data = c.req.valid('json');

            // Call service (includes business logic)
            return await userServices.create({
                data,
                userId: user.id,
            });
        },
        201
    )
);
```

## Best Practices

1. **Single Responsibility**: Each service function should handle one business operation

2. **Business Logic Focus**: Keep business rules in services, not in queries or endpoints

3. **Ownership Verification**: Always verify user ownership for cross-entity operations

4. **Error Context**: Provide meaningful error messages for business logic failures

5. **Input Validation**: Services handle business validation beyond schema validation

6. **External Service Integration**: Services are the right place for third-party API calls

7. **Transaction Coordination**: Use services for multi-step operations that need consistency

8. **Performance Optimization**: Batch database operations and implement caching where appropriate

9. **Type Safety**: Let TypeScript infer types from schemas rather than manual definitions

10. **Testing Focus**: Services are the primary unit for testing business logic

The service factory system provides a clean, type-safe way to implement business logic while maintaining separation of concerns and enabling comprehensive testing of your application's core functionality.
