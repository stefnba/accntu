import { InsertLabelSchema, label } from '@db/schema';
import { z } from 'zod';

import { CreateLabelSchema } from './create-label';

export const UpdateLabelSchema = InsertLabelSchema.pick({
    name: true,
    parentId: true,
    description: true,
    color: true
});
