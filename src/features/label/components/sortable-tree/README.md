# Label Sortable Tree

A specialized sortable tree implementation for labels with drag & drop functionality.

## Structure

```
sortable-tree/
├── index.ts                     # Main exports
├── types.ts                     # Label-specific types and interfaces
├── utils.ts                     # Data transformation utilities
├── label-sortable-tree.tsx      # Main tree component
├── label-tree-item.tsx          # Individual item renderer
└── README.md                    # This file
```

## Components

### LabelSortableTree
Main sortable tree component with:
- Drag & drop reordering
- Expand/collapse functionality
- Label-specific styling and features

### LabelTreeItem
Individual label item renderer with:
- Color indicator
- Expand/collapse button
- Children count display
- Custom styling for labels

## Usage

```tsx
import { LabelSortableTree } from '@/features/label/components';

export const MyComponent = () => {
  return <LabelSortableTree className="my-custom-class" />;
};
```

## Advanced Usage

For custom implementations, you can import individual pieces:

```tsx
import { 
  LabelTreeItem, 
  LabelTreeItemType, 
  labelsToTree 
} from '@/features/label/components/sortable-tree';
```

## Architecture

This implementation extends the generic `@/components/sortable-tree` with label-specific:
- Data types (color, icon, name, etc.)
- Transformation utilities
- Custom rendering logic
- API integration patterns

The separation into multiple files follows React best practices:
- **Single Responsibility**: Each file has one clear purpose
- **Reusability**: Components can be imported individually
- **Maintainability**: Related functionality is grouped logically
- **Testability**: Utilities and components can be tested in isolation