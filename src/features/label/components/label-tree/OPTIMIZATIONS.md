# Label Tree Optimizations

This document outlines the performance and accessibility optimizations implemented in the label tree component.

## 🚀 Performance Optimizations

### 1. **Component Memoization**

- All components wrapped with `React.memo()` to prevent unnecessary re-renders
- Components only re-render when their specific props change

### 2. **Split Context Architecture**

```tsx
// Separate contexts for better performance isolation
const LabelTreeStateContext = createContext<LabelTreeState | null>(null);
const LabelTreeConfigContext = createContext<LabelTreeConfig | null>(null);
const LabelTreeDataContext = createContext<LabelTreeData | null>(null);

// Granular hooks for specific data access
export const useLabelTreeState = () => {
    /* state only */
};
export const useLabelTreeConfig = () => {
    /* config only */
};
export const useLabelTreeData = () => {
    /* data only */
};
```

### 3. **Memoized Context Values**

- All context values are memoized with `useMemo()` to prevent recreation on every render
- Callbacks are memoized with `useCallback()` for stable references

### 4. **Optimized Child Rendering**

```tsx
const childLabels = useMemo(() => currentLabel.children || [], [currentLabel.children]);

const hasChildren = useMemo(
    () => Boolean(currentLabel.children && currentLabel.children.length > 0),
    [currentLabel.children]
);
```

## ♿ Accessibility Enhancements

### 1. **Keyboard Navigation**

```tsx
const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleExpandedLabelId(currentLabel.id);
        }
        // Arrow key navigation for expand/collapse
        if (e.key === 'ArrowRight' && !expanded && hasChildren) {
            e.preventDefault();
            toggleExpandedLabelId(currentLabel.id);
        }
        if (e.key === 'ArrowLeft' && expanded && hasChildren) {
            e.preventDefault();
            toggleExpandedLabelId(currentLabel.id);
        }
    },
    [currentLabel.id, toggleExpandedLabelId, expanded, hasChildren]
);
```

### 2. **ARIA Attributes**

- `aria-expanded` for expand/collapse buttons
- `aria-label` for meaningful button descriptions
- `role="tree"` for the main container
- Proper `tabIndex` management for keyboard navigation

### 3. **Enhanced Loading States**

```tsx
// Better loading indicator with spinner and text
if (isLoading) {
    return (
        <div className="p-4 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            <span className="ml-2">Loading labels...</span>
        </div>
    );
}
```

## 🏗️ Architecture Improvements

### 1. **Collocated Types**

- Types moved from central `types.ts` to individual component files
- Better locality and easier maintenance
- No more import dependencies between type definitions

### 2. **Enhanced Action System**

```tsx
// More flexible action button with variants
export interface LabelTreeItemActionProps {
    children?: React.ReactNode;
    onClick?: (labelId: string) => void;
    tooltip?: string;
    className?: string;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}
```

### 3. **Better Error Boundaries**

- Granular context hooks with specific error messages
- Clear separation of concerns between state, config, and data

## 📊 Performance Benefits

1. **Reduced Re-renders**: Context splitting prevents components from re-rendering when unrelated data changes
2. **Stable References**: Memoized callbacks and values prevent child re-renders
3. **Efficient Updates**: Only components that actually need updates will re-render
4. **Better UX**: Keyboard navigation and proper ARIA support for screen readers

## 🎯 Usage Patterns

### Basic Usage

```tsx
<LabelTree>
    <LabelTreeItem>
        <LabelTreeItemContent>
            <LabelTreeItemButton />
            <LabelTreeItemBadge />
            <LabelTreeItemActions>
                <LabelTreeItemAction onClick={handleEdit} tooltip="Edit">
                    <Edit2 className="w-3 h-3" />
                </LabelTreeItemAction>
            </LabelTreeItemActions>
        </LabelTreeItemContent>
        <LabelTreeChildren>{/* Recursive rendering */}</LabelTreeChildren>
    </LabelTreeItem>
</LabelTree>
```

### Granular Context Access

```tsx
// Only subscribes to state changes, not config or data
const { isExpandedLabelId } = useLabelTreeState();

// Only subscribes to data changes, not state or config
const { currentLabel } = useLabelTreeData();

// Only subscribes to config changes, not state or data
const { onSelect } = useLabelTreeConfig();
```

## 🧪 Future Optimizations

Consider these additional optimizations for large datasets:

1. **Virtualization**: For trees with 1000+ items
2. **Lazy Loading**: Load children on demand
3. **Search Optimization**: Debounced search with memoized results
4. **Drag & Drop**: With proper accessibility support
