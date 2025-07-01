# Next.js App Router Patterns

Guidelines for developing pages and layouts using Next.js 15 App Router.

## Page Component Structure

### Basic Page Pattern
```typescript
// app/(protected)/transactions/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Transactions | Accntu',
  description: 'Manage your financial transactions',
};

interface TransactionsPageProps {
  params: Promise<{ [key: string]: string | string[] | undefined }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TransactionsPage({ 
  params, 
  searchParams 
}: TransactionsPageProps) {
  // Server-side data fetching if needed
  return (
    <div>
      {/* Page content */}
    </div>
  );
}
```

### Dynamic Route Pattern
```typescript
// app/(protected)/transactions/[transactionId]/page.tsx
interface TransactionDetailsPageProps {
  params: Promise<{ transactionId: string }>;
}

export default async function TransactionDetailsPage({ 
  params 
}: TransactionDetailsPageProps) {
  const { transactionId } = await params;
  
  return (
    <div>
      {/* Transaction details for {transactionId} */}
    </div>
  );
}
```

## Layout Patterns

### Protected Layout
```typescript
// app/(protected)/layout.tsx
import { AuthGuard } from '@/components/auth/auth-guard';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <nav>{/* Navigation */}</nav>
        <main className="container mx-auto py-6">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
```

## Data Fetching Patterns

### Server Components (Preferred)
- Use Server Components by default
- Fetch data directly in the component
- Handle loading and error states properly

```typescript
import { TransactionList } from '@/features/transaction/components/transaction-list';

export default async function TransactionsPage() {
  // Could fetch server-side if needed, but prefer client-side with React Query
  return (
    <div>
      <h1>Transactions</h1>
      <TransactionList />
    </div>
  );
}
```

### Client Components
- Use sparingly, only when interactivity is needed
- Mark with `'use client'` directive
- Use React Query for data fetching

```typescript
'use client';

import { useTransactionEndpoints } from '@/features/transaction/api';

export default function InteractiveTransactionPage() {
  const { data, isLoading } = useTransactionEndpoints.getAll();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {/* Interactive content */}
    </div>
  );
}
```

## URL Parameters & Search Params

### Handling Parameters
```typescript
// For dynamic routes
const { transactionId } = await params;

// For search parameters  
const searchParamsObj = await searchParams;
const page = searchParamsObj.page || '1';
const filter = searchParamsObj.filter || 'all';
```

### Type-Safe Parameters
```typescript
import { z } from 'zod';

const ParamsSchema = z.object({
  transactionId: z.string(),
});

const SearchParamsSchema = z.object({
  page: z.string().optional(),
  filter: z.enum(['all', 'income', 'expense']).optional(),
});

export default async function TransactionPage({ params, searchParams }) {
  const validatedParams = ParamsSchema.parse(await params);
  const validatedSearchParams = SearchParamsSchema.parse(await searchParams);
  
  // Use validated params
}
```

## State Management in Pages

### URL State with nuqs
```typescript
'use client';

import { useQueryState, parseAsString } from 'nuqs';

export default function TransactionsPage() {
  const [filter, setFilter] = useQueryState('filter', parseAsString.withDefault('all'));
  const [search, setSearch] = useQueryState('search', parseAsString.withDefault(''));
  
  return (
    <div>
      {/* UI that updates URL state */}
    </div>
  );
}
```

### Modal State Management
```typescript
'use client';

import { useQueryState, parseAsBoolean, parseAsString } from 'nuqs';

export default function TransactionsPage() {
  const [modalOpen, setModalOpen] = useQueryState('modal', parseAsBoolean.withDefault(false));
  const [editId, setEditId] = useQueryState('edit', parseAsString.withDefault(''));
  
  const openEditModal = (id: string) => {
    setEditId(id);
    setModalOpen(true);
  };
  
  const closeModal = () => {
    setModalOpen(false);
    setEditId('');
  };
  
  return (
    <div>
      {/* Page content with modal */}
    </div>
  );
}
```

## Error Handling

### Error Pages
```typescript
// app/(protected)/transactions/error.tsx
'use client';

export default function TransactionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Loading Pages
```typescript
// app/(protected)/transactions/loading.tsx
import { Skeleton } from '@/components/ui/skeleton';

export default function TransactionLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-[200px]" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}
```

## Best Practices

1. **Server Components First**: Use Server Components by default, Client Components only when needed
2. **Type-Safe Parameters**: Always validate params and searchParams with Zod
3. **Proper Metadata**: Include metadata for SEO and accessibility
4. **Error Boundaries**: Implement error.tsx files for error handling
5. **Loading States**: Provide loading.tsx files for better UX
6. **URL State**: Use nuqs for state that should persist across navigation
7. **Authentication**: Protect routes with proper auth guards
8. **Performance**: Optimize for Core Web Vitals and mobile performance

For component patterns: @src/components/CLAUDE.md
For feature architecture: @src/features/CLAUDE.md