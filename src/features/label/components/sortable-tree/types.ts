import { TreeItem } from '@/components/sortable-tree';

/**
 * Label-specific tree item extending the base TreeItem
 */
export type TLabelTreeItem = TreeItem & {
    name: string;
    color?: string | null;
    icon?: string | null;
    imageUrl?: string | null;
    parentId?: string | null;
    sortOrder: number;
    userId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
};
