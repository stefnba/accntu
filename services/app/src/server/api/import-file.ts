import { deleteImportFile } from '@/server/actions/import';
import { db } from '@db';
import {
    InsertTransactionImportFileSchema,
    transactionImportFile
} from '@db/schema';
import { getUser } from '@features/auth/server/hono';
import { zValidator } from '@hono/zod-validator';
import {
    SignedS3UrlInputSchema,
    getSignedS3Url
} from '@server/lib/upload/cloud/s3';
import { and, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { createImportFile } from '../actions/import-file';

const app = new Hono()
    .post(
        '/upload-url/create',
        zValidator(
            'json',
            SignedS3UrlInputSchema.pick({
                checksum: true,
                fileSize: true,
                fileType: true
            })
        ),
        async (c) => {
            const user = getUser(c);
            const values = c.req.valid('json');
            const BUCKET = process.env.AWS_BUCKET_NAME_PRIVATE_UPLOAD;

            const signedUrlObject = await getSignedS3Url(
                { ...values, bucket: BUCKET },
                user.id
            );
            return c.json(signedUrlObject, 201);
        }
    )
    .patch(
        '/:id',
        zValidator(
            'json',
            InsertTransactionImportFileSchema.pick({
                url: true,
                type: true
            })
        ),
        zValidator(
            'param',
            z.object({
                id: z.string()
            })
        ),
        async (c) => {
            const { id } = c.req.valid('param');
            const values = c.req.valid('json');
            const user = getUser(c);

            // todo: filter for user
            const data = await db
                .update(transactionImportFile)
                .set({ ...values, updatedAt: new Date() })
                .where(
                    and(
                        eq(transactionImportFile.id, id)
                        // eq(transactionImportFile.userId, user.id)
                    )
                )
                .returning();

            return c.json(data, 201);
        }
    )
    .post(
        '/create',
        zValidator('json', InsertTransactionImportFileSchema),
        async (c) => {
            const user = getUser(c);
            const values = c.req.valid('json');

            const data = await createImportFile({
                userId: user.id,
                values
            });

            return c.json(data, 201);
        }
    )
    .get(
        '/:id',
        zValidator(
            'param',
            z.object({
                id: z.string()
            })
        ),
        async (c) => {
            const user = getUser(c); // todo: filter for user
            const { id } = c.req.valid('param');

            const data = await db.query.transactionImportFile.findFirst({
                where: (fields, { eq, and }) => and(eq(fields.id, id))
            });

            if (!data) {
                return c.json({ error: 'Not Found' }, 404);
            }

            return c.json(data);
        }
    )
    .delete(
        '/:id/delete',
        zValidator(
            'param',
            z.object({
                id: z.string()
            })
        ),
        async (c) => {
            const user = getUser(c);
            const { id } = c.req.valid('param');
            const data = await deleteImportFile(id, user.id);
            return c.json(data, 201);
        }
    );

export default app;
