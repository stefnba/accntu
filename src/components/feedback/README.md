# Toast System

A sophisticated custom toast notification system built on top of `react-hot-toast` with full TypeScript support, variants, animations, and comprehensive features.

## Features

- 🎨 **Multiple Variants**: Success, Error, Warning, Info, and Default
- 🎭 **Custom Icons**: Automatic icons per variant or custom icons
- 📱 **Responsive Design**: Works on all screen sizes
- 🌙 **Dark Mode Support**: Automatic theme-aware styling
- ⚡ **Actions**: Add interactive buttons to toasts
- 🔄 **Promise Handling**: Built-in promise toast for async operations
- 🎯 **Positioning**: Configurable toast positions
- ♿ **Accessibility**: ARIA labels and keyboard navigation
- 🎪 **Animations**: Smooth enter/exit animations
- 🎛️ **Customizable**: Duration, dismissibility, and more

## Quick Start

```tsx
import { toast } from '@/components/feedback';

// Basic usage
toast.success('Success!', 'Your operation completed successfully.');
toast.error('Error!', 'Something went wrong.');
toast.warning('Warning!', 'Please check your input.');
toast.info('Info', 'Here's some information.');
```

## API Reference

### Basic Toast Functions

#### `toast.success(title, description?, options?)`

```tsx
toast.success('Saved!', 'Your changes have been saved.');

// With action button
toast.success('Saved!', 'Your changes have been saved.', {
    action: <Button onClick={handleUndo}>Undo</Button>,
    duration: 5000,
});
```

#### `toast.error(title, description?, options?)`

```tsx
toast.error('Failed to save', 'Please try again later.', {
    action: <Button onClick={handleRetry}>Retry</Button>,
    duration: 8000, // Errors show longer by default
});
```

#### `toast.warning(title, description?, options?)`

```tsx
toast.warning('Storage full', 'Consider upgrading your plan.', {
    action: <Button onClick={handleUpgrade}>Upgrade</Button>,
});
```

#### `toast.info(title, description?, options?)`

```tsx
toast.info('New feature', 'Check out our latest update!');
```

#### `toast.default(title, description?, options?)`

```tsx
toast.default('Custom notification', 'With custom icon', {
    icon: <CustomIcon />,
    action: <Button>Action</Button>,
});
```

### Advanced Features

#### Promise Toast

Handle async operations with automatic loading, success, and error states:

```tsx
const saveData = async () => {
    const apiCall = fetch('/api/save', { method: 'POST' });

    toast.promise(apiCall, {
        loading: 'Saving your data...',
        success: 'Data saved successfully!',
        error: 'Failed to save data',
    });
};
```

#### Loading Toast

```tsx
const loadingId = toast.loading('Processing...');

// Later, dismiss and show success
toast.dismiss(loadingId);
toast.success('Complete!');
```

#### Manual Control

```tsx
// Dismiss specific toast
const toastId = toast.success('Message');
toast.dismiss(toastId);

// Dismiss all toasts
toast.dismiss();

// Remove toast (no animation)
toast.remove(toastId);
```

### Options

All toast functions accept an optional `options` parameter:

```tsx
interface ToastOptions {
    action?: React.ReactNode; // Action button/element
    duration?: number; // Duration in ms (default: 4000)
    position?: TToastPosition; // Toast position
    icon?: React.ReactNode; // Custom icon (default variant only)
}
```

### Positions

Available positions:

- `'top-left'`
- `'top-center'`
- `'top-right'`
- `'bottom-left'`
- `'bottom-center'`
- `'bottom-right'` (default)

```tsx
toast.success('Message', 'Description', {
    position: 'top-center',
});
```

## Styling

The toast system uses CVA (Class Variance Authority) for consistent styling with Tailwind CSS. It automatically adapts to your theme's color scheme.

### Variants

- **Success**: Green theme with CheckCircle icon
- **Error**: Red theme with XCircle icon
- **Warning**: Yellow theme with AlertTriangle icon
- **Info**: Blue theme with Info icon
- **Default**: Theme-aware with customizable icon

## Examples

### Form Validation

```tsx
const handleSubmit = async (data) => {
    try {
        await saveData(data);
        toast.success('Profile updated', 'Your changes have been saved.');
    } catch (error) {
        toast.error('Update failed', error.message, {
            action: <Button onClick={handleRetry}>Try Again</Button>,
        });
    }
};
```

### File Upload

```tsx
const handleUpload = async (file) => {
    toast.promise(uploadFile(file), {
        loading: `Uploading ${file.name}...`,
        success: (result) => `${file.name} uploaded successfully!`,
        error: (err) => `Failed to upload ${file.name}: ${err.message}`,
    });
};
```

### Bulk Operations

```tsx
const handleBulkDelete = async (items) => {
    const deletePromise = deleteItems(items);

    toast.promise(deletePromise, {
        loading: `Deleting ${items.length} items...`,
        success: `Successfully deleted ${items.length} items`,
        error: 'Some items could not be deleted',
    });
};
```

## Integration

The toast system is already integrated with `react-hot-toast`'s Toaster component. Make sure you have the Toaster in your app root:

```tsx
// In your layout or app component
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }) {
    return (
        <html>
            <body>
                {children}
                <Toaster position="bottom-right" />
            </body>
        </html>
    );
}
```

## Development

Use the `ToastDemo` component to test all variants and features during development:

```tsx
import { ToastDemo } from '@/components/feedback';

// Add to your development page
<ToastDemo />;
```
