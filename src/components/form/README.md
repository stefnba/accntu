# Form Components

A comprehensive form system built on top of React Hook Form and Zod, providing type-safe, accessible form components with built-in validation and error handling.

## Core Components

### Form Provider (`form-provider.tsx`)

Base form component that provides form context and handles submission:

```typescript
import { Form } from '@/components/form';

<Form form={form}>
  {/* Form fields */}
</Form>
```

### Form Hook (`use-form.ts`)

Enhanced form hook with Zod validation and improved error handling:

```typescript
import { useForm, createFormSchema } from '@/components/form';

// Define schema
const formSchema = createFormSchema(
  z.object({
    field: z.string(),
  }),
  { field: "" }
);

// Use in component
const form = useForm({
  ...formSchema,
  onSubmit: async (data) => {
    // Handle submission
  },
});
```

## Input Components

### Text Input (`input.tsx`)

```typescript
<FormInput
  form={form}
  name="email"
  label="Email"
  description="Enter your email address"
  placeholder="email@example.com"
/>
```

### OTP Input (`input-otp.tsx`)

```typescript
<FormOTPInput
  form={form}
  name="otp"
  length={6}
/>
```

### Select (`select.tsx`)

```typescript
<FormSelect
  form={form}
  name="category"
  label="Category"
  options={[
    { label: "Option 1", value: "1" },
    { label: "Option 2", value: "2" },
  ]}
/>
```

### Checkbox (`checkbox.tsx`)

```typescript
<FormCheckbox
  form={form}
  name="terms"
  label="I agree to the terms"
/>
```

### Radio Group (`radio-group.tsx`)

```typescript
<FormRadioGroup
  form={form}
  name="plan"
  label="Select Plan"
  options={[
    { label: "Free", value: "free" },
    { label: "Pro", value: "pro" },
  ]}
/>
```

### Switch (`switch.tsx`)

```typescript
<FormSwitch
  form={form}
  name="notifications"
  label="Enable notifications"
/>
```

### Textarea (`textarea.tsx`)

```typescript
<FormTextarea
  form={form}
  name="description"
  label="Description"
  rows={4}
/>
```

### Submit Button (`submit-button.tsx`)

```typescript
<FormSubmitButton
  form={form}
  loadingText="Submitting..."
  disabledBeforeValid={true}
>
  Submit
</FormSubmitButton>
```

## Usage Example

Here's a complete example of a form using these components:

```typescript
import {
  Form,
  FormInput,
  FormSubmitButton,
  useForm,
  createFormSchema,
} from '@/components/form';
import { z } from 'zod';

// Define schema
const loginSchema = createFormSchema(
  z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password too short"),
  }),
  {
    email: "",
    password: "",
  }
);

function LoginForm() {
  const form = useForm({
    ...loginSchema,
    onSubmit: async (data) => {
      try {
        await login(data);
      } catch (error) {
        form.setError('root', { message: 'Login failed' });
      }
    },
  });

  return (
    <Form form={form} className="space-y-4">
      <FormInput
        form={form}
        name="email"
        label="Email"
        type="email"
      />
      <FormInput
        form={form}
        name="password"
        label="Password"
        type="password"
      />
      <FormSubmitButton form={form}>
        Login
      </FormSubmitButton>
    </Form>
  );
}
```

## Features

- 🔒 **Type Safety**: Full TypeScript support with inferred types from Zod schemas
- ✨ **Validation**: Built-in Zod validation with custom error messages
- 🎨 **Styling**: Consistent styling using Tailwind CSS and shadcn/ui
- ♿️ **Accessibility**: ARIA attributes and keyboard navigation
- 🔄 **Loading States**: Built-in loading states and error handling
- 📝 **Form State**: Automatic form state management
- 🎯 **Error Handling**: Comprehensive error handling at field and form level

## Best Practices

1. **Schema Definition**
   - Always define schemas in a separate file
   - Use `createFormSchema` to combine schema and default values
   - Add descriptive error messages to schema validations

2. **Form Setup**
   - Use the `useForm` hook for form initialization
   - Handle both success and error cases in onSubmit
   - Implement proper error handling with try/catch

3. **Component Usage**
   - Use the appropriate form component for each input type
   - Include labels and descriptions for better accessibility
   - Implement proper loading states using FormSubmitButton

4. **Error Handling**
   - Display field-level errors using built-in error display
   - Handle form-level errors with proper error messages
   - Use the form's error state for conditional rendering

5. **Styling**
   - Use the provided className props for custom styling
   - Follow the project's spacing and layout patterns
   - Maintain consistency with other forms in the application

## Error Handling

The form system provides multiple levels of error handling:

1. **Field-Level Errors**
   - Automatically displayed below each field
   - Triggered by Zod validation
   - Can be manually set using `form.setError`

2. **Form-Level Errors**
   - Displayed at the form level
   - Set using `form.setError('root', { message: 'Error' })`
   - Useful for API or submission errors

3. **Submission Errors**
   - Handled in the onSubmit handler
   - Can trigger both field and form-level errors
   - Should include proper error messages for users

## TypeScript Support

The form system is built with TypeScript and provides full type inference:

```typescript
// Schema types are inferred
type FormValues = z.infer<typeof formSchema>;

// Form hook is typed
const form = useForm<FormValues>({...});

// Components are type-safe
<FormInput<FormValues> name="email" />;
```
