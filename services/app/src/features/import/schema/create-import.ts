import { FileWithPath } from 'react-dropzone';
import { z } from 'zod';

export const CreateImportSelectionSchema = z.object({
    accountId: z.string(),
    files: z.array(z.custom<FileWithPath>()).min(1)
});
