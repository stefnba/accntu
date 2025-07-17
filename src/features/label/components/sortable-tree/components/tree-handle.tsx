import { forwardRef } from 'react';
import { TreeAction } from './tree-action';
import type { TreeActionProps } from '../types';
import { ACCESSIBILITY_LABELS } from '../utils/constants';

export const TreeHandle = forwardRef<HTMLButtonElement, TreeActionProps>((props, ref) => {
    return (
        <TreeAction 
            ref={ref} 
            cursor="grab" 
            data-testid="tree-drag-handle"
            aria-label={ACCESSIBILITY_LABELS.dragHandle}
            {...props}
        >
            <svg viewBox="0 0 20 20" width="10" className="fill-gray-600">
                <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
            </svg>
        </TreeAction>
    );
});

TreeHandle.displayName = 'TreeHandle';