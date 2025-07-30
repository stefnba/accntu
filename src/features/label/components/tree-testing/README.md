# Sortable Tree Component Documentation

https://github.com/clauderic/dnd-kit/blob/e9215e820798459ae036896fce7fd9a6fe855772/stories/3%20-%20Examples/Tree/components/TreeItem/TreeItem.module.css

## Overview

This directory contains a comprehensive sortable tree component built with React and [@dnd-kit](https://dndkit.com/). The component provides a fully-featured hierarchical tree structure with drag-and-drop reordering, nesting/un-nesting, collapsing/expanding, and keyboard navigation.

## Features

- **Drag & Drop Reordering**: Move items up and down within the tree
- **Hierarchical Nesting**: Drag items horizontally to change their depth level
- **Collapse/Expand**: Hide/show child items for better organization
- **Keyboard Navigation**: Full accessibility with arrow key navigation
- **Remove Items**: Delete items from the tree structure
- **Touch Support**: Works on mobile devices with touch gestures
- **Accessibility**: Screen reader support with announcements

## Architecture

### Core Components

```
tree-testing/
├── sortable-tree.tsx        # Main component orchestrating the tree
├── utils.ts                 # Tree manipulation utilities
├── types.ts                 # TypeScript type definitions
├── keyboard-coordinates.ts  # Keyboard navigation logic
├── components/
│   ├── tree-item/
│   │   ├── sortable.tsx     # DndKit sortable wrapper
│   │   └── item.tsx         # Visual tree item component
├── action.tsx               # Generic action button
├── handle.tsx               # Drag handle component
└── remove.tsx               # Remove button component
```

### Data Flow

1. **Tree Data**: Hierarchical structure with `TreeItem[]` interface
2. **Flattening**: Tree is flattened to `FlattenedItem[]` for DndKit
3. **Drag Operations**: Items are reordered in the flat array
4. **Rebuilding**: Flat array is converted back to hierarchical structure
5. **State Update**: Tree state is updated with new structure

## Key Algorithms

### Tree Flattening (`utils.ts`)

The tree structure is flattened to work with DndKit's sortable system:

```typescript
// Hierarchical structure
TreeItem[] -> FlattenedItem[]

// Each flattened item contains:
{
  id: UniqueIdentifier,
  parentId: UniqueIdentifier | null,
  depth: number,
  index: number,
  children: TreeItem[],
  collapsed?: boolean
}
```

### Projection System (`getProjection`)

The projection algorithm determines where a dragged item will be placed:

1. **Position Calculation**: Based on drag offset and current position
2. **Depth Calculation**: Horizontal drag determines nesting level
3. **Constraint Validation**: Ensures valid tree structure
4. **Parent Resolution**: Finds appropriate parent for new position

### Drag Operations

#### Vertical Movement (Up/Down)

- Changes item position within the same or different levels
- Maintains hierarchical relationships
- Updates item indices

#### Horizontal Movement (Left/Right)

- Changes item depth (nesting level)
- Left: Un-nest (move to parent level)
- Right: Nest (move under previous sibling)
- Respects depth constraints

### Keyboard Navigation

Custom keyboard coordinate getter enables:

- **Arrow Keys**: Navigate between items
- **Left/Right**: Change nesting depth
- **Up/Down**: Move between items
- **Space/Enter**: Activate drag mode

## Component Details

### SortableTree (`sortable-tree.tsx`)

Main component that orchestrates the entire tree functionality:

- **State Management**: Tracks active drag, position, and tree data
- **Event Handlers**: Manages drag start/move/end events
- **Rendering**: Renders flattened items with proper depth
- **Accessibility**: Provides screen reader announcements

Key props:

- `collapsible`: Enable collapse/expand functionality
- `indicator`: Show drop indicators during drag
- `removable`: Enable item removal
- `indentationWidth`: Pixel width per depth level

### Tree Utilities (`utils.ts`)

Essential algorithms for tree manipulation:

- **`flattenTree`**: Converts hierarchical to flat structure
- **`buildTree`**: Reconstructs hierarchy from flat array
- **`getProjection`**: Calculates drop position and constraints
- **`removeChildrenOf`**: Filters out collapsed children
- **`findItemDeep`**: Recursively searches tree structure

### Keyboard Navigation (`keyboard-coordinates.ts`)

Custom coordinate getter for keyboard-based drag operations:

- **Direction Handling**: Processes arrow key input
- **Depth Control**: Left/right arrows change nesting
- **Position Calculation**: Converts key presses to coordinates
- **Constraint Validation**: Ensures valid movements

## Performance Optimizations

### Implemented Optimizations

1. **Memoization**: `useMemo` for expensive calculations
2. **Stable References**: `useRef` for sensor context
3. **Efficient Rendering**: Conditional rendering of collapsed items
4. **Animation Control**: Disable animations during drag for performance

### Recommended Optimizations

1. **Virtual Scrolling**: For trees with 1000+ items
2. **React.memo**: Prevent unnecessary re-renders
3. **Debouncing**: Throttle rapid drag movements
4. **Caching**: Cache projection calculations
5. **Lazy Loading**: Load tree branches on demand

## Usage Examples

### Basic Usage

```tsx
import { SortableTree } from './sortable-tree';

const MyTree = () => {
    return (
        <SortableTree
            collapsible
            removable
            indicator
            indentationWidth={50}
            defaultItems={[
                {
                    id: 'root',
                    children: [
                        { id: 'child1', children: [] },
                        { id: 'child2', children: [] },
                    ],
                },
            ]}
        />
    );
};
```

### Advanced Configuration

```tsx
<SortableTree
    collapsible={true} // Enable collapse/expand
    removable={true} // Enable item removal
    indicator={true} // Show drop indicators
    indentationWidth={40} // Custom indentation width
    defaultItems={treeData} // Initial tree data
/>
```

## Data Structure

### TreeItem Interface

```typescript
interface TreeItem {
    id: UniqueIdentifier; // Unique identifier
    children: TreeItem[]; // Child items
    collapsed?: boolean; // Collapse state
}
```

### FlattenedItem Interface

```typescript
interface FlattenedItem extends TreeItem {
    parentId: UniqueIdentifier | null; // Parent reference
    depth: number; // Nesting level
    index: number; // Position in flat array
}
```

## Accessibility Features

### Screen Reader Support

- **Drag Announcements**: Announces drag start/end
- **Movement Description**: Describes item position changes
- **Relationship Context**: Explains parent/child relationships
- **Action Feedback**: Confirms successful operations

### Keyboard Navigation

- **Arrow Keys**: Navigate between items
- **Enter/Space**: Activate drag mode
- **Escape**: Cancel drag operation
- **Tab**: Move between interactive elements

## Browser Compatibility

- **Modern Browsers**: Full support for Chrome, Firefox, Safari, Edge
- **Mobile Browsers**: Touch support for iOS Safari, Chrome Mobile
- **Legacy Support**: Graceful degradation for older browsers

## Testing Considerations

### Unit Tests

- Tree manipulation utilities
- Projection calculations
- Keyboard navigation logic
- Component rendering

### Integration Tests

- Drag and drop workflows
- Keyboard navigation flows
- Accessibility compliance
- Cross-browser compatibility

### End-to-End Tests

- Complete user workflows
- Performance under load
- Mobile device testing
- Screen reader testing

## Common Use Cases

1. **File Explorer**: Hierarchical file/folder structure
2. **Navigation Menu**: Nested menu items
3. **Category Management**: Product categories
4. **Organization Chart**: Company hierarchy
5. **Task Management**: Nested task lists

## Troubleshooting

### Common Issues

1. **Performance**: Large trees (1000+ items) may be slow

    - Solution: Implement virtual scrolling

2. **Touch Devices**: Drag may not work on mobile

    - Solution: Configure touch sensors properly

3. **Keyboard Navigation**: May not work in all browsers

    - Solution: Test keyboard sensor configuration

4. **Memory Usage**: Large trees consume significant memory
    - Solution: Implement lazy loading and cleanup

### Debug Tips

1. **Console Logging**: Enable debug logs in utils functions
2. **React DevTools**: Monitor component re-renders
3. **Performance Tab**: Profile drag operations
4. **Accessibility Tools**: Test with screen readers

## Future Enhancements

1. **Virtual Scrolling**: Support for massive datasets
2. **Custom Animations**: Configurable animation system
3. **Theming Support**: CSS custom properties for styling
4. **Plugin System**: Extensible functionality
5. **Multi-selection**: Select and move multiple items
6. **Search/Filter**: Find items in large trees
7. **Persistence**: Save/load tree state
8. **Validation**: Custom validation rules

## Contributing

When modifying this component:

1. **Maintain Types**: Keep TypeScript interfaces up to date
2. **Update Tests**: Add tests for new functionality
3. **Consider Performance**: Profile changes with large datasets
4. **Test Accessibility**: Ensure keyboard and screen reader support
5. **Document Changes**: Update this README with new features

## Dependencies

- **@dnd-kit/core**: Core drag and drop functionality
- **@dnd-kit/sortable**: Sortable list implementation
- **@dnd-kit/utilities**: CSS utilities for transforms
- **React**: Component framework
- **TypeScript**: Type safety

## License

This component is part of the Accntu project and follows the project's licensing terms.
