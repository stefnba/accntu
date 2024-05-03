import { InferResultType, Label } from '@/lib/db/types';

// export type TLabel = Pick<Label, 'id' | 'name' | 'parentId'>;

export type TLabel = InferResultType<'label', { childLabels: true }>;
