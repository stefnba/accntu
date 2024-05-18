import { InferResultType, Label } from '@/server/db/types';

// export type TLabel = Pick<Label, 'id' | 'name' | 'parentId'>;

export type TLabel = InferResultType<'label', { childLabels: true }>;
