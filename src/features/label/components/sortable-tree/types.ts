import { FlattenedTreeItemBase } from '@/components/sortable-tree';
import { TLabelService } from '@/features/label/schemas';

/**
 * Label-specific flattened item extending the base FlattenedTreeItemBase
 * This matches the server response from the /flattened endpoint
 */
export type LabelFlattenedItem = FlattenedTreeItemBase & TLabelService['selectFlattened'];
