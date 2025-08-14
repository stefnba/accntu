import * as React from 'react';

import { cn } from '@/lib/utils';
import { type IconType } from 'react-icons';

function Input({ className, type, autoComplete = 'off', ...props }: React.ComponentProps<'input'>) {
    return (
        <input
            type={type}
            data-slot="input"
            // Disable password managers and auto-fill (can be overridden)
            autoComplete={autoComplete}
            data-1p-ignore="true"
            data-lpignore="true"
            data-form-type="other"
            className={cn(
                'border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
                className
            )}
            {...props}
        />
    );
}

function InputWithIcon({ icon, ...props }: React.ComponentProps<'input'> & { icon: IconType }) {
    return (
        <div className="relative">
            {React.createElement(icon, {
                className:
                    'absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground',
            })}
            <Input className={cn(props.className, 'pl-10')} {...props} />
        </div>
    );
}

export { Input, InputWithIcon };
