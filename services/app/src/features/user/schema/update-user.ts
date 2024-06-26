import { InsertUserSchema, InsertUserSettingsSchema } from '@db/schema';
import { z } from 'zod';

const MAX_FILE_SIZE = 1024 * 1024 * 5;
const ACCEPTED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
];

export const UpdateUserSchema = InsertUserSchema.pick({
    firstName: true,
    lastName: true
}).and(
    z
        .object({
            settings: InsertUserSettingsSchema.omit({ userId: true })
            // image: z
            //     .custom<File>()
            //     .refine((file) => file, `Image is required`)
            //     .refine(
            //         (file) => !Array.isArray(file),
            //         `Only one image is allowed`
            //     )
            //     .refine(
            //         (file) => file?.size <= MAX_FILE_SIZE,
            //         `Max. image size is 5MB`
            //     )
            //     .refine(
            //         (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
            //         'Only .jpg, .jpeg, .png and .webp formats are supported.'
            //     )
        })
        .optional()
);

export type TUserUpdateValues = z.infer<typeof UpdateUserSchema>;
