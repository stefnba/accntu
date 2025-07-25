# Future Tree Features

## Keyboard Modifiers

### Planned Modifier Behaviors

- **Ctrl + Drag**: Force reorder (disable nesting)
- **Shift + Drag**: Force nesting (disable reorder)
- **Alt + Drag**: Copy instead of move
- **Ctrl + Shift + Drag**: Move to root level

### Implementation Notes

```typescript
const handleDragEnd = ({ active, over, activatorEvent }: DragEndEvent) => {
    const modifiers = {
        ctrl: activatorEvent?.ctrlKey || false,
        shift: activatorEvent?.shiftKey || false,
        alt: activatorEvent?.altKey || false,
    };

    const intent = detectDropIntent(dropPosition, targetItem, modifiers);
    // ...
};
```

### Visual Feedback for Modifiers

- **Ctrl**: Show reorder-only indicators
- **Shift**: Show nest-only indicators
- **Alt**: Show copy cursor and duplicate preview

## Advanced Drop Behaviors

### Multi-Select Drag

- Select multiple items with Ctrl+Click
- Drag selection as a group
- Maintain relative positioning

### Smart Auto-Nesting

- Detect when item should auto-nest based on name similarity
- Suggest nesting locations with animation

### Undo/Redo

- Track move history for undo operations
- Visual undo feedback with ghost positions

## Performance Enhancements

### Virtualization

- For trees with 1000+ items
- Implement react-window integration

### Smart Collision Detection

- Spatial indexing for very large trees
- Predictive drop target highlighting
