# Component Development Guidelines

Patterns and conventions for building reusable UI components in Accntu.

## Component Architecture

### Component Types

**UI Components** (`src/components/ui/`)
- Base components from shadcn/ui
- Highly reusable, minimal props
- No business logic
- Focus on accessibility and styling

**Layout Components** (`src/components/layout/`)
- Page structure and navigation
- Header, sidebar, footer components
- Responsive design patterns

**Form Components** (`src/components/form/`)
- Form inputs and validation
- Built on React Hook Form + Zod
- Consistent styling and behavior

**Feature Components** (`src/features/[feature]/components/`)
- Feature-specific business logic
- Compose multiple UI components
- Handle data fetching and state

### Component Structure Pattern
```typescript
// TypeScript interface for props
interface ComponentProps {
  required: string;
  optional?: boolean;
  children?: React.ReactNode;
  className?: string;
}

// Component implementation
export const Component = ({ 
  required, 
  optional = false, 
  children,
  className 
}: ComponentProps) => {
  return (
    <div className={cn("base-styles", className)}>
      {children}
    </div>
  );
};

// Default export for dynamic imports if needed
export default Component;
```

## Styling Patterns

### Tailwind CSS Guidelines
```typescript
// Use cn() utility for conditional classes
import { cn } from '@/lib/utils';

const Button = ({ variant, size, className, ...props }) => {
  return (
    <button
      className={cn(
        // Base styles
        "inline-flex items-center justify-center rounded-md font-medium transition-colors",
        // Variant styles
        {
          "bg-primary text-primary-foreground hover:bg-primary/90": variant === "default",
          "border border-input bg-background hover:bg-accent": variant === "outline",
        },
        // Size styles
        {
          "h-10 px-4 py-2": size === "default",
          "h-9 px-3": size === "sm",
        },
        // Custom className override
        className
      )}
      {...props}
    />
  );
};
```

### Responsive Design
```typescript
// Mobile-first approach with Tailwind
<div className="
  flex flex-col gap-4
  sm:flex-row sm:gap-6
  lg:gap-8
">
  {/* Content */}
</div>
```

## Form Components

### Custom Form Components
```typescript
import { Form, FormInput, FormSubmitButton, useForm, createFormSchema } from '@/components/form';

const LoginForm = () => {
  const formSchema = createFormSchema(
    z.object({
      email: z.string().email(),
      password: z.string().min(8),
    }),
    { email: "", password: "" }
  );

  const form = useForm({
    ...formSchema,
    onSubmit: async (data) => {
      // Handle submission
    },
  });

  return (
    <Form form={form}>
      <FormInput name="email" form={form} placeholder="Email" />
      <FormInput name="password" form={form} type="password" placeholder="Password" />
      <FormSubmitButton form={form}>Sign In</FormSubmitButton>
    </Form>
  );
};
```

### Available Form Components
- `FormInput` - Text inputs with validation
- `FormSelect` - Dropdown selects
- `FormCheckbox` - Checkbox inputs
- `FormRadioGroup` - Radio button groups
- `FormSwitch` - Toggle switches
- `FormTextarea` - Multi-line text inputs
- `FormSubmitButton` - Submit buttons with loading states

## Data Fetching in Components

### Server Components (Preferred)
```typescript
// Fetch data on the server when possible
import { TransactionAPI } from '@/features/transaction/server/api';

const TransactionList = async () => {
  // Could fetch server-side, but prefer client-side with React Query
  return (
    <div>
      <TransactionClientList />
    </div>
  );
};
```

### Client Components with React Query
```typescript
'use client';

import { useTransactionEndpoints } from '@/features/transaction/api';

const TransactionList = () => {
  const { data: transactions, isLoading, error } = useTransactionEndpoints.getAll();

  if (isLoading) return <TransactionListSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!transactions?.length) return <EmptyState />;

  return (
    <div className="space-y-4">
      {transactions.map(transaction => (
        <TransactionItem key={transaction.id} transaction={transaction} />
      ))}
    </div>
  );
};
```

## State Management

### Component State
```typescript
const [isOpen, setIsOpen] = useState(false);
const [selectedItems, setSelectedItems] = useState<string[]>([]);

// Use useCallback for event handlers passed as props
const handleSelect = useCallback((id: string) => {
  setSelectedItems(prev => 
    prev.includes(id) 
      ? prev.filter(item => item !== id)
      : [...prev, id]
  );
}, []);
```

### URL State for Modals
```typescript
'use client';

import { useQueryState, parseAsBoolean, parseAsString } from 'nuqs';

const TransactionModal = () => {
  const [isOpen, setIsOpen] = useQueryState('modal', parseAsBoolean.withDefault(false));
  const [editId, setEditId] = useQueryState('edit', parseAsString.withDefault(''));

  const openModal = (id?: string) => {
    if (id) setEditId(id);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditId('');
  };

  return (
    <Modal open={isOpen} onOpenChange={setIsOpen}>
      {/* Modal content */}
    </Modal>
  );
};
```

## Accessibility Patterns

### Keyboard Navigation
```typescript
const handleKeyDown = (event: React.KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleClick();
  }
};

return (
  <div
    role="button"
    tabIndex={0}
    onClick={handleClick}
    onKeyDown={handleKeyDown}
    aria-label="Action button"
  >
    {/* Content */}
  </div>
);
```

### Screen Reader Support
```typescript
<button
  aria-label={`Delete transaction ${transaction.description}`}
  aria-describedby="delete-help-text"
>
  <TrashIcon aria-hidden="true" />
</button>
<div id="delete-help-text" className="sr-only">
  This action cannot be undone
</div>
```

## Component Composition

### Compound Components
```typescript
const Card = ({ children, className }: CardProps) => (
  <div className={cn("rounded-lg border bg-card", className)}>
    {children}
  </div>
);

const CardHeader = ({ children, className }: CardHeaderProps) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)}>
    {children}
  </div>
);

const CardContent = ({ children, className }: CardContentProps) => (
  <div className={cn("p-6 pt-0", className)}>
    {children}
  </div>
);

// Usage
<Card>
  <CardHeader>
    <h3>Transaction Details</h3>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### Render Props Pattern
```typescript
interface DataListProps<T> {
  data: T[];
  renderItem: (item: T) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
}

const DataList = <T,>({ data, renderItem, renderEmpty }: DataListProps<T>) => {
  if (data.length === 0) {
    return renderEmpty?.() || <div>No items found</div>;
  }

  return (
    <div className="space-y-2">
      {data.map((item, index) => (
        <div key={index}>{renderItem(item)}</div>
      ))}
    </div>
  );
};
```

## Performance Optimization

### React.memo for Expensive Components
```typescript
const ExpensiveComponent = React.memo<ExpensiveComponentProps>(({ 
  data, 
  onUpdate 
}) => {
  // Expensive rendering logic
  return <div>{/* Complex UI */}</div>;
});

// Custom comparison function if needed
const areEqual = (prevProps, nextProps) => {
  return prevProps.data.id === nextProps.data.id;
};

const OptimizedComponent = React.memo(ExpensiveComponent, areEqual);
```

### useMemo and useCallback
```typescript
const TransactionList = ({ transactions, filters }) => {
  // Memoize expensive calculations
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => 
      filters.category === 'all' || transaction.category === filters.category
    );
  }, [transactions, filters.category]);

  // Memoize event handlers
  const handleTransactionClick = useCallback((id: string) => {
    router.push(`/transactions/${id}`);
  }, [router]);

  return (
    <div>
      {filteredTransactions.map(transaction => (
        <TransactionItem 
          key={transaction.id}
          transaction={transaction}
          onClick={handleTransactionClick}
        />
      ))}
    </div>
  );
};
```

## Best Practices

1. **Component Composition**: Prefer composition over inheritance
2. **Single Responsibility**: Each component should have one clear purpose
3. **Props Interface**: Always define TypeScript interfaces for props
4. **Default Props**: Use default parameters instead of defaultProps
5. **Event Naming**: Use "handle" prefix for event handlers
6. **Accessibility**: Include proper ARIA attributes and keyboard support
7. **Performance**: Use React.memo, useMemo, and useCallback judiciously
8. **Testing**: Write tests for complex component logic
9. **Storybook**: Document component variations and usage examples

For form system details: @src/components/form/README.md
For feature components: @src/features/CLAUDE.md