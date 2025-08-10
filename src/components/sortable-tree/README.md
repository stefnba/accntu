# Generic Sortable Tree Component

A reusable, type-safe sortable tree component built with dnd-kit and React Query.

## Features

- **Generic**: Works with any data type that extends `TreeItem`
- **Custom Renderers**: Provide your own item rendering logic
- **React Query Integration**: Built-in optimistic updates and server synchronization
- **Type Safe**: Full TypeScript support with proper generics
- **Performance Optimized**: Efficient drag operations with throttling and memoization
- **Drag & Drop**: Full drag and drop support with visual feedback

## Basic Usage

```tsx
import { SortableTree, SortableTreeOptions, TreeItem } from '@/components/sortable-tree';

// 1. Define your data type that extends TreeItem
interface MyDataItem extends TreeItem {
    name: string;
    description?: string;
}

// 2. Create options with your query and mutation functions
const options: SortableTreeOptions<MyDataItem> = {
    queryKey: ['my-data'],
    queryFn: async () => {
        // Fetch your data and transform to tree structure
        const response = await fetch('/api/my-data');
        return response.json();
    },
    onDragEnd: async ({ activeId, intent }) => {
        // Handle the move operation
        await fetch('/api/my-data/reorder', {
            method: 'PUT',
            body: JSON.stringify({ activeId, intent }),
        });
        // Return updated data
        const response = await fetch('/api/my-data');
        return response.json();
    },
};

// 3. Use the component with custom rendering
export const MyTree = () => {
    return (
        <SortableTree options={options}>
            {(item, dragButton) => (
                <div className="flex items-center gap-2 p-2 border rounded">
                    {dragButton}
                    <span>{item.name}</span>
                    {item.description && (
                        <span className="text-gray-500 text-sm">{item.description}</span>
                    )}
                </div>
            )}
        </SortableTree>
    );
};
```

## Advanced Usage

### Custom Expand/Collapse Logic

```tsx
import { useSortableTreeUIStore } from '@/components/sortable-tree';

const MyTreeItem = ({ item, dragButton }) => {
    const { expandedIds, toggleExpandedId } = useSortableTreeUIStore();
    const isExpanded = expandedIds.has(item.id);

    return (
        <div className="flex items-center gap-2">
            {item.hasChildren && (
                <button onClick={() => toggleExpandedId(item.id)}>{isExpanded ? '−' : '+'}</button>
            )}
            {dragButton}
            <span>{item.name}</span>
        </div>
    );
};
```

### Direct Hook Usage

```tsx
import { useSortableTree, SortableTreeOptions } from '@/components/sortable-tree';

const MyCustomTree = () => {
    const options: SortableTreeOptions<MyDataItem> = {
        /* ... */
    };
    const {
        items, // Raw tree data
        flattenedItems, // Flattened for rendering
        isLoading, // Loading state
        error, // Error state
        expandedIds, // Expanded items
        toggleExpandedId, // Toggle function
        handleOptimisticMove, // Move handler
        isMoving, // Move in progress
    } = useSortableTree(options);

    // Build your own UI
    return (
        <div>
            {flattenedItems.map((item) => (
                <div key={item.id} style={{ marginLeft: item.depth * 20 }}>
                    {item.name}
                </div>
            ))}
        </div>
    );
};
```

## API Reference

### Types

```typescript
interface TreeItem {
    id: UniqueIdentifier;
    children: TreeItem[];
}

interface FlattenedItem extends TreeItem {
    parent: ParentItem | null;
    index: number;
    index: number;
    depth: number;
    collapsed: boolean;
    childrenCount: number;
    hasChildren: boolean;
}

interface SortableTreeOptions<T extends TreeItem> {
    queryKey: string[];
    queryFn: () => Promise<T[]>;
    onDragEnd: (data: { activeId: UniqueIdentifier; intent: DropIntent }) => Promise<T[]>;
}
```

### Components

- `SortableTree<T>`: Main tree component with drag & drop
- `SortableItem<T>`: Individual draggable item wrapper

### Hooks

- `useSortableTree<T>(options)`: Main hook for tree state management
- `useSortableTreeUIStore()`: Global UI state (expanded items)

### Utilities

- `flattenTree()`: Converts tree to flat array
- `buildTreeFromFlattenedItems()`: Rebuilds tree from flat array
- `performMove()`: Handles drag & drop operations

## Label Feature Example

See `src/features/label/components/label-sortable-tree.tsx` for a complete implementation example that demonstrates:

- Custom data transformation
- API integration
- Custom item rendering with colors and icons
- Proper TypeScript integration

## Performance Notes

- Uses `React.memo` for item components
- Throttled drag operations with `requestAnimationFrame`
- Optimistic updates for immediate feedback
- Efficient re-rendering with proper dependency arrays

## Migration from tree-own

The new generic tree replaces the old `tree-own` implementation with:

1. Better type safety
2. Customizable rendering
3. Cleaner API
4. Better performance
5. Proper React Query integration

Old usage is deprecated and should be migrated to the new API.
