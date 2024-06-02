import { getUser } from '@/server/auth';
import { db } from '@db';
import {
    InsertTransactionImportFileSchema,
    transactionImportFile
} from '@db/schema';
import { zValidator } from '@hono/zod-validator';
import { createId } from '@paralleldrive/cuid2';
import {
    SignedS3UrlInputSchema,
    getSignedS3Url
} from '@server/lib/upload/cloud/s3';
import { deleteImportFile } from '@server/services/import';
import { Hono } from 'hono';
import { z } from 'zod';

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
            const BUCKET = 'accntu';

            const signedUrlObject = await getSignedS3Url(
                { ...values, bucket: BUCKET },
                user.id
            );
            return c.json(signedUrlObject, 201);
        }
    )
    .post(
        '/create',
        zValidator(
            'json',
            InsertTransactionImportFileSchema.pick({
                url: true,
                type: true,
                filename: true,
                importId: true
            })
        ),
        async (c) => {
            const user = getUser(c);
            const values = c.req.valid('json');
            const [newImportFile] = await db
                .insert(transactionImportFile)
                .values({ id: createId(), userId: user.id, ...values })
                .returning();
            return c.json(newImportFile, 201);
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
            const user = getUser(c);
            const { id } = c.req.valid('param');

            const data = await db.query.transactionImportFile.findFirst({
                where: (fields, { eq, and }) =>
                    and(eq(fields.id, id), eq(fields.userId, user.id))
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
