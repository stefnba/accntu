# Source Directory Patterns

Common patterns and conventions for all code in the `src/` directory.

## Import Patterns

### Path Aliases
- Use `@/` prefix for all absolute imports
- `@/components/ui/button` for UI components
- `@/features/transaction/api` for feature APIs
- `@/lib/utils` for shared utilities
- `@/server/db` for database operations

### Import Organization
```typescript
// 1. External packages
import { z } from 'zod';
import { Hono } from 'hono';

// 2. Internal absolute imports (with @/)
import { Button } from '@/components/ui/button';
import { createQuery } from '@/lib/api';

// 3. Relative imports
import { TransactionSchema } from './schemas';
import * as queries from '../server/db/queries';
```

## File Naming Conventions

- **Components**: PascalCase (`TransactionTable.tsx`)
- **Utilities**: kebab-case (`format-currency.ts`)
- **Hooks**: camelCase with `use` prefix (`useTransactionModal.ts`)
- **Types**: PascalCase (`TransactionType.ts`)
- **Constants**: SCREAMING_SNAKE_CASE or kebab-case files

## TypeScript Patterns

### Type Definitions
- Export types from the file where they're defined
- Use `type` for object shapes, `interface` for extensible contracts
- Prefix type names with feature name for clarity

```typescript
// Good
export type TransactionCreateData = {
  amount: number;
  description: string;
};

// Avoid generic names
export type CreateData = { ... };
```

### Function Types
- Define return types for all exported functions
- Use generic types when appropriate
- Prefer `const` over `function` declarations

```typescript
// Good
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};
```

## Error Handling

- Use try-catch blocks for async operations
- Throw descriptive errors with context
- Use error utilities from `@/lib/error`

```typescript
try {
  const result = await apiCall();
  return result;
} catch (error) {
  throw new Error(`Failed to fetch data: ${error.message}`);
}
```

## Code Organization

### Barrel Exports
Use `index.ts` files for clean exports:

```typescript
// src/features/transaction/components/index.ts
export { TransactionTable } from './transaction-table';
export { TransactionForm } from './transaction-form';
export { TransactionDetails } from './transaction-details';
```

### Utility Functions
- Keep utilities focused and pure when possible
- Export individual functions rather than default exports
- Include JSDoc comments for complex utilities

## Performance Considerations

- Use React.memo for expensive components
- Implement proper dependency arrays in useEffect
- Avoid creating objects/functions in render cycles
- Use useMemo/useCallback judiciously

For specific domain guidance:
- **Features**: @src/features/CLAUDE.md
- **Components**: @src/components/CLAUDE.md  
- **App Router**: @src/app/CLAUDE.md
- **Server**: @src/server/CLAUDE.md