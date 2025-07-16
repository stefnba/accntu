import { ReactNode } from 'react';

/**
 * Tab item type
 * @param label - The label of the tab
 * @param value - The value of the tab
 * @param icon - The icon of the tab
 */
export type TTabItem = {
    label: string | ReactNode;
    value: string;
};

export type {
    InferQueryStateTabNavHookOptions,
    TTabNavHookOptions,
    UseTabNavReturn,
} from './hooks';
