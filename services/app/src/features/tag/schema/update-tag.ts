import { z } from 'zod';

import { CreateTagSchema } from './create-tag';

export const UpdateTagSchema = CreateTagSchema;

export type TUpdateTagValues = z.input<typeof UpdateTagSchema>;
