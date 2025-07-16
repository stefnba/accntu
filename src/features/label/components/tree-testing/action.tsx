import React, { CSSProperties, forwardRef } from 'react';

export interface Props extends React.HTMLAttributes<HTMLButtonElement> {
    active?: {
        fill: string;
        background: string;
    };
    cursor?: CSSProperties['cursor'];
}

export const Action = forwardRef<HTMLButtonElement, Props>(
    ({ active, className, cursor, style, ...props }, ref) => {
        return (
            <button
                ref={ref}
                {...props}
                className={`
                    inline-flex items-center justify-center p-0.5 rounded
                    hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500
                    ${className || ''}
                `.trim()}
                tabIndex={0}
                style={
                    {
                        ...style,
                        cursor,
                        '--fill': active?.fill,
                        '--background': active?.background,
                    } as CSSProperties
                }
            />
        );
    }
);
