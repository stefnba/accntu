# Test Utilities

Centralized testing utilities for API endpoint testing with authentication.

## Setup

The test utilities provide a consistent way to set up authenticated tests across all features.

### Basic Usage

```typescript
import { beforeAll, describe, expect, it } from 'vitest';
import { createTestClient, setupTestAuth, type TestAuthSetup } from '@/../test/utils';

describe('Feature API Endpoints', () => {
    let auth: TestAuthSetup;

    beforeAll(async () => {
        auth = await setupTestAuth();
    });

    describe('Protected Operations', () => {
        const client = createTestClient();

        it('should access protected endpoint', async () => {
            const res = await client.api.feature.items.$get(
                { query: {} },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(200);
        });

        it('should reject unauthenticated requests', async () => {
            const res = await client.api.feature.items.$get({
                query: {},
            });

            expect(res.status).toBe(401);
        });
    });
});
```

### Available Utilities

#### Authentication Setup

- `setupTestAuth()`: Creates a test user and returns auth headers
- `createTestAuth()`: Lower-level auth creation (used internally)
- `TestAuthSetup`: Type for auth setup result

#### Test Client

- `createTestClient()`: Returns typed Hono test client for all routes

#### Assertion Helpers

- `expectUnauthorized(status)`: Asserts 401 status
- `expectSuccess(status)`: Asserts 200 or 201 status  
- `expectValidationError(status)`: Asserts 400 status

### Test Structure Pattern

```typescript
describe('Feature Name', () => {
    let auth: TestAuthSetup;

    beforeAll(async () => {
        auth = await setupTestAuth();
    });

    describe('Authentication Tests', () => {
        // Test auth requirements
    });

    describe('CRUD Operations', () => {
        // Test create, read, update, delete
    });

    describe('Input Validation', () => {
        // Test validation rules
    });

    describe('Business Logic', () => {
        // Test feature-specific logic
    });
});
```

## Benefits

1. **Consistent Auth Setup**: Same authentication pattern across all features
2. **Type Safety**: Full TypeScript support with Hono client
3. **Reusable**: Import once, use in any feature test
4. **Real Authentication**: Uses actual better-auth system
5. **Clean Test Code**: Minimal boilerplate in individual tests