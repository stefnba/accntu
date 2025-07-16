# Tab Query State System

A comprehensive, type-safe tab navigation system built with React and TypeScript that provides maximum flexibility, performance, and developer experience.

## 🚀 Features

- **DRY & Flexible** - Tabs and content can be placed anywhere in your layout
- **Performance Optimized** - Built-in lazy loading with React Suspense
- **Hook-First Design** - Leverages existing `useTabNav` pattern
- **Type Safety** - Full TypeScript inference and type checking
- **Multiple Variants** - Support for different tab styles (default, pills, underline)
- **Animations** - Built-in fade and slide animations
- **Error Handling** - Safe rendering with error boundaries
- **Customizable** - Full control over styling and rendering

## 📁 Structure

```
src/components/tab-query-state/
├── index.ts           # Main exports
├── types.ts           # TypeScript types
├── utils.ts           # Utility functions
├── tab-nav.tsx        # Navigation component
├── tab-content.tsx    # Content component
├── example.tsx        # Usage examples
└── README.md          # This documentation
```

## 🎯 Quick Start

### Basic Usage

```tsx
import { useTabNav } from '@/hooks/tab-nav';
import { TabNav, TabContent } from '@/components/tab-query-state';

const MyComponent = () => {
    const tabNav = useTabNav({
        views: [
            { label: 'Details', value: 'details' },
            { label: 'Settings', value: 'settings' },
        ] as const,
        defaultView: 'details',
    });

    return (
        <div>
            <header>
                <TabNav tabNav={tabNav} />
            </header>

            <main>
                <TabContent
                    tabNav={tabNav}
                    components={{
                        details: ({ viewKey }) => <div>Details for {viewKey}</div>,
                        settings: ({ viewKey }) => <div>Settings for {viewKey}</div>,
                    }}
                    lazy={true}
                />
            </main>
        </div>
    );
};
```

### Advanced Usage with Animations

```tsx
import { AnimatedTabContent } from '@/components/tab-query-state';

const AnimatedExample = () => {
    const tabNav = useTabNav({
        views: [
            { label: 'Dashboard', value: 'dashboard', icon: '📊' },
            { label: 'Analytics', value: 'analytics', icon: '📈' },
        ] as const,
        defaultView: 'dashboard',
    });

    return (
        <div>
            <TabNav tabNav={tabNav} variant="pills" size="lg" />

            <AnimatedTabContent
                tabNav={tabNav}
                components={{
                    dashboard: ({ viewKey }) => <DashboardComponent />,
                    analytics: ({ viewKey }) => <AnalyticsComponent />,
                }}
                animation="fade"
                lazy={true}
            />
        </div>
    );
};
```

## 🔧 Components

### TabNav

The navigation component that renders tab triggers.

**Props:**

- `tabNav`: Return value from `useTabNav` hook
- `variant`: `'default' | 'pills' | 'underline'` (default: 'default')
- `size`: `'sm' | 'md' | 'lg'` (default: 'md')
- `className`: Additional CSS classes
- `render`: Custom render function for complete control

**Variants:**

- **Default**: Standard tab appearance with background
- **Pills**: Pill-shaped tabs with borders
- **Underline**: Borderless tabs with underline indicator

### TabContent

The content component that renders the active tab's content.

**Props:**

- `tabNav`: Return value from `useTabNav` hook
- `components`: Object mapping tab values to components
- `lazy`: Enable lazy loading (default: false)
- `fallback`: Fallback content when no component found
- `className`: Additional CSS classes
- `suspenseFallback`: Loading fallback for Suspense

### AnimatedTabContent

Enhanced content component with built-in animations.

**Additional Props:**

- `animation`: `'fade' | 'slide' | 'none'` (default: 'fade')

### SafeTabContent

Content component with error boundary protection.

**Additional Props:**

- `errorFallback`: Content to show when rendering fails

## 🛠️ Utilities

### createTabViews

Creates tab view definitions from a configuration object.

```tsx
const tabs = createTabViews({
    dashboard: { label: 'Dashboard', icon: '📊' },
    settings: { label: 'Settings', icon: '⚙️' },
});
```

### createCompleteTabSetup

Creates both tabs and components mapping from separate configurations.

```tsx
const { tabs, components } = createCompleteTabSetup(
    {
        overview: { label: 'Overview', icon: '📊' },
        details: { label: 'Details', icon: '📄' },
    },
    {
        overview: ({ viewKey }) => <OverviewComponent />,
        details: ({ viewKey }) => <DetailsComponent />,
    }
);
```

## 🎨 Styling

### Custom Variants

```tsx
<TabNav tabNav={tabNav} variant="underline" size="lg" className="custom-tabs" />
```

### Custom Rendering

```tsx
<TabNav
    tabNav={tabNav}
    render={({ tabs, activeTab, onTabChange }) => (
        <div className="flex space-x-2">
            {tabs.map((tab) => (
                <button
                    key={tab.value}
                    onClick={() => onTabChange(tab.value)}
                    className={`px-4 py-2 rounded ${
                        activeTab === tab.value ? 'bg-blue-500 text-white' : 'bg-gray-200'
                    }`}
                >
                    {tab.icon} {tab.label}
                </button>
            ))}
        </div>
    )}
/>
```

## 🔄 Programmatic Navigation

```tsx
import { useTabNavigation } from '@/components/tab-query-state';

const MyComponent = () => {
    const tabNav = useTabNav({
        /* ... */
    });
    const { navigateToTab, navigateToNext, navigateToPrevious } = useTabNavigation(tabNav);

    return (
        <div>
            <button onClick={() => navigateToTab('settings')}>Go to Settings</button>
            <button onClick={navigateToNext}>Next Tab</button>
            <button onClick={navigateToPrevious}>Previous Tab</button>
        </div>
    );
};
```

## 🏗️ Layout Patterns

### Header + Main Layout

```tsx
<div>
    <header className="border-b">
        <TabNav tabNav={tabNav} />
    </header>
    <main className="p-4">
        <TabContent tabNav={tabNav} components={components} />
    </main>
</div>
```

### Sidebar + Content Layout

```tsx
<div className="flex">
    <aside className="w-64 border-r">
        <TabNav tabNav={tabNav} variant="default" />
    </aside>
    <main className="flex-1 p-6">
        <TabContent tabNav={tabNav} components={components} />
    </main>
</div>
```

## ⚡ Performance

- **Lazy Loading**: Components are only loaded when needed
- **Suspense**: Built-in loading states
- **Memoization**: Automatic re-render optimization
- **Tree Shaking**: Import only what you need

## 🔒 Type Safety

The system provides full TypeScript support with:

- Automatic type inference from `useTabNav` hook
- Type-safe component props
- IntelliSense support for tab values
- Compile-time validation

## 📝 Examples

See `example.tsx` for comprehensive usage examples including:

- Basic tab navigation
- Animated content transitions
- Custom styling and variants
- Real-world transaction details implementation

## 🤝 Integration

### With useTabNav Hook

```tsx
// hooks/details.ts
export const useTransactionDetails = () => {
    return useTabNav({
        views: [
            { label: 'Details', value: 'details' },
            { label: 'Banking', value: 'banking' },
            { label: 'Amount', value: 'amount' },
            { label: 'Metadata', value: 'metadata' },
        ] as const,
        defaultView: 'details',
    });
};

// component.tsx
const TransactionDetails = () => {
    const tabNav = useTransactionDetails();

    return (
        <div>
            <TabNav tabNav={tabNav} />
            <TabContent tabNav={tabNav} components={components} />
        </div>
    );
};
```

This system provides everything needed for flexible, performant, and type-safe tab navigation! 🎉
