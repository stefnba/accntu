# ResponsiveModal - Compound Component Pattern

A responsive modal component that automatically adapts between Dialog (desktop) and Drawer (mobile) using compound components for maximum flexibility.

## Why This New Pattern?

### Problems with Old Pattern:
- ❌ Props-based API (title, description, footer) forced specific structure
- ❌ Couldn't customize individual parts (Header, Content, Footer)
- ❌ Inconsistent padding between Dialog and Drawer
- ❌ Multi-step modals required complex external config functions
- ❌ Limited flexibility for custom layouts

### Benefits of New Pattern:
- ✅ **Composable**: Build modals like Lego blocks
- ✅ **Flexible**: Customize or omit any part
- ✅ **Type-Safe**: Full TypeScript support
- ✅ **Consistent**: Same structure for Dialog/Drawer
- ✅ **Standard Pattern**: Similar to shadcn/ui components
- ✅ **Great DX**: Reads like HTML, autocompletes perfectly

## Basic Usage

```typescript
import { ResponsiveModal } from '@/components/ui/responsive-modal-new';

<ResponsiveModal open={open} onOpenChange={setOpen}>
  <ResponsiveModal.Header>
    <ResponsiveModal.Title>Modal Title</ResponsiveModal.Title>
    <ResponsiveModal.Description>Optional description</ResponsiveModal.Description>
  </ResponsiveModal.Header>

  <ResponsiveModal.Content>
    {/* Your content here */}
  </ResponsiveModal.Content>

  <ResponsiveModal.Footer>
    <Button onClick={() => setOpen(false)}>Close</Button>
  </ResponsiveModal.Footer>
</ResponsiveModal>
```

## API Reference

### `<ResponsiveModal>`
Main container that switches between Dialog (desktop) and Drawer (mobile).

**Props:**
- `open: boolean` - Whether modal is open
- `onOpenChange: (open: boolean) => void` - Callback when open state changes
- `size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'auto'` - Modal size (default: 'auto')
- `className?: string` - Additional CSS classes

### `<ResponsiveModal.Header>`
Container for title and description. Automatically uses `DialogHeader` or `DrawerHeader`.

**Props:**
- `className?: string` - Additional CSS classes

### `<ResponsiveModal.Title>`
Modal title. Automatically uses `DialogTitle` or `DrawerTitle`.

**Props:**
- `className?: string` - Additional CSS classes

### `<ResponsiveModal.Description>`
Optional description text. Automatically uses `DialogDescription` or `DrawerDescription`.

**Props:**
- `className?: string` - Additional CSS classes

### `<ResponsiveModal.Content>`
Main content area with consistent padding and optional scrolling.

**Props:**
- `scrollable?: boolean` - Enable scrolling (default: true)
- `className?: string` - Additional CSS classes

### `<ResponsiveModal.Footer>`
Footer area for action buttons. Automatically uses `DialogFooter` or `DrawerFooter`.

**Props:**
- `className?: string` - Additional CSS classes

## Usage Patterns

### 1. Simple Confirmation Modal

```typescript
<ResponsiveModal open={open} onOpenChange={setOpen}>
  <ResponsiveModal.Header>
    <ResponsiveModal.Title>Delete Item</ResponsiveModal.Title>
    <ResponsiveModal.Description>
      This action cannot be undone
    </ResponsiveModal.Description>
  </ResponsiveModal.Header>

  <ResponsiveModal.Content>
    <p>Are you sure you want to delete this item?</p>
  </ResponsiveModal.Content>

  <ResponsiveModal.Footer>
    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
    <Button variant="destructive" onClick={handleDelete}>Delete</Button>
  </ResponsiveModal.Footer>
</ResponsiveModal>
```

### 2. Multi-Step Modal (Inline Conditionals)

```typescript
const { step, setStep } = useStepModal();

<ResponsiveModal open={open} onOpenChange={setOpen}>
  <ResponsiveModal.Header>
    <ResponsiveModal.Title>
      {step === 'select' && 'Select Image'}
      {step === 'edit' && 'Edit Image'}
    </ResponsiveModal.Title>
  </ResponsiveModal.Header>

  <ResponsiveModal.Content>
    {step === 'select' && <FileDropzone />}
    {step === 'edit' && <ImageEditor />}
  </ResponsiveModal.Content>

  <ResponsiveModal.Footer>
    {step === 'select' && (
      <Button onClick={() => setStep('edit')}>Next</Button>
    )}
    {step === 'edit' && (
      <>
        <Button onClick={() => setStep('select')}>Back</Button>
        <Button onClick={handleSave}>Save</Button>
      </>
    )}
  </ResponsiveModal.Footer>
</ResponsiveModal>
```

### 3. Multi-Step with Config Object

```typescript
const STEPS = {
  select: {
    title: 'Select Image',
    content: <FileDropzone onSelect={handleSelect} />,
    footer: <Button onClick={() => setStep('edit')}>Next</Button>,
  },
  edit: {
    title: 'Edit Image',
    content: <ImageEditor />,
    footer: (
      <>
        <Button onClick={() => setStep('select')}>Back</Button>
        <Button onClick={handleSave}>Save</Button>
      </>
    ),
  },
};

const stepConfig = STEPS[step];

<ResponsiveModal open={open} onOpenChange={setOpen}>
  <ResponsiveModal.Header>
    <ResponsiveModal.Title>{stepConfig.title}</ResponsiveModal.Title>
  </ResponsiveModal.Header>
  <ResponsiveModal.Content>{stepConfig.content}</ResponsiveModal.Content>
  <ResponsiveModal.Footer>{stepConfig.footer}</ResponsiveModal.Footer>
</ResponsiveModal>
```

### 4. Form Modal (No Footer)

```typescript
<ResponsiveModal open={open} onOpenChange={setOpen}>
  <ResponsiveModal.Header>
    <ResponsiveModal.Title>Create Tag</ResponsiveModal.Title>
  </ResponsiveModal.Header>

  <ResponsiveModal.Content>
    <TagForm onSubmit={handleSubmit} />
  </ResponsiveModal.Content>

  {/* No footer - form has its own submit button */}
</ResponsiveModal>
```

### 5. Custom Layout (Advanced)

```typescript
<ResponsiveModal open={open} onOpenChange={setOpen} size="2xl">
  {/* Completely custom layout - no Header/Footer components */}
  <ResponsiveModal.Content scrollable={false}>
    <div className="grid grid-cols-2 gap-6 h-[80vh]">
      <div className="border-r pr-6">
        {/* Left panel */}
      </div>
      <div>
        {/* Right panel */}
      </div>
    </div>
  </ResponsiveModal.Content>
</ResponsiveModal>
```

## Migration from Old Pattern

### Before (Props API):
```typescript
<ResponsiveModal
  open={open}
  onOpenChange={setOpen}
  title="Delete Item"
  description="This action cannot be undone"
  footer={
    <>
      <Button onClick={() => setOpen(false)}>Cancel</Button>
      <Button onClick={handleDelete}>Delete</Button>
    </>
  }
>
  <p>Are you sure?</p>
</ResponsiveModal>
```

### After (Compound Components):
```typescript
<ResponsiveModal open={open} onOpenChange={setOpen}>
  <ResponsiveModal.Header>
    <ResponsiveModal.Title>Delete Item</ResponsiveModal.Title>
    <ResponsiveModal.Description>
      This action cannot be undone
    </ResponsiveModal.Description>
  </ResponsiveModal.Header>

  <ResponsiveModal.Content>
    <p>Are you sure?</p>
  </ResponsiveModal.Content>

  <ResponsiveModal.Footer>
    <Button onClick={() => setOpen(false)}>Cancel</Button>
    <Button onClick={handleDelete}>Delete</Button>
  </ResponsiveModal.Footer>
</ResponsiveModal>
```

## Implementation Details

### How It Works

1. **Context**: `ResponsiveModal` provides `isMobile` state via React Context
2. **Compound Components**: Each part (Header, Title, etc.) consumes context and renders the appropriate Dialog or Drawer component
3. **Automatic Adaptation**: No conditional logic needed in your code - components handle it internally
4. **Consistent Padding**: Each compound component applies appropriate spacing for Dialog vs Drawer

### Type Safety

All components are fully typed with TypeScript:
```typescript
interface ResponsiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'auto';
  className?: string;
}

interface HeaderProps {
  children: ReactNode;
  className?: string;
}

// ... etc
```

## Examples

See `responsive-modal-new.example.tsx` for comprehensive usage examples.

## Testing Checklist

Before migrating a modal:
- [ ] Test on desktop (Dialog rendering)
- [ ] Test on mobile (Drawer rendering)
- [ ] Test step navigation (if applicable)
- [ ] Test form submission (if applicable)
- [ ] Test keyboard navigation
- [ ] Test close on outside click
- [ ] Test close on escape key
- [ ] Verify no layout shifts
- [ ] Check mobile scroll behavior
- [ ] Verify button alignment in footer

## Next Steps

1. Review examples in `responsive-modal-new.example.tsx`
2. Try migrating one simple modal to test the pattern
3. Migrate ProfileUpdateModal to test multi-step support
4. Gradually migrate remaining modals
5. Once all migrated, replace old `responsive-modal.tsx` with new implementation
