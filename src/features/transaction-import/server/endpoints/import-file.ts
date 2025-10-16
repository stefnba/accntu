import { transactionImportFileSchemas } from '@/features/transaction-import/schemas/import-file';
import { transactionImportFileServices } from '@/features/transaction-import/server/services/import-file';
import { parseTransactionFile } from '@/features/transaction-import/server/services/transaction-parser';
import { createUploadToS3Endpoints } from '@/lib/upload/cloud/s3/create-endpoints';
import { routeHandler } from '@/server/lib/route';
import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';

const app = new Hono()
    .get('/', zValidator('query', transactionImportFileSchemas.getMany.endpoint.query), (c) =>
        routeHandler(c)
            .withUser()
            .handle(async ({ userId, validatedInput }) => {
                const { page, pageSize, ...filters } = validatedInput.query;
                return await transactionImportFileServices.getMany({
                    userId,
                    filters,
                    pagination: { page, pageSize },
                });
            })
    )

    .get('/:id', zValidator('param', transactionImportFileSchemas.getById.endpoint.param), (c) =>
        routeHandler(c)
            .withUser()
            .handle(async ({ userId, validatedInput }) =>
                transactionImportFileServices.getById({
                    ids: { id: validatedInput.param.id },
                    userId,
                })
            )
    )

    .post('/', zValidator('json', transactionImportFileSchemas.create.endpoint.json), (c) =>
        routeHandler(c)
            .withUser()
            .handleMutation(async ({ userId, validatedInput }) =>
                transactionImportFileServices.create({
                    userId,
                    data: validatedInput.json,
                })
            )
    )

    .patch(
        '/:id',
        zValidator('param', transactionImportFileSchemas.updateById.endpoint.param),
        zValidator('json', transactionImportFileSchemas.updateById.endpoint.json),
        (c) =>
            routeHandler(c)
                .withUser()
                .handleMutation(async ({ userId, validatedInput }) =>
                    transactionImportFileServices.updateById({
                        ids: { id: validatedInput.param.id },
                        userId,
                        data: validatedInput.json,
                    })
                )
    )

    .delete('/:id', zValidator('param', transactionImportFileSchemas.removeById.endpoint.param), (c) =>
        routeHandler(c)
            .withUser()
            .handleMutation(async ({ userId, validatedInput }) =>
                transactionImportFileServices.removeById({
                    ids: { id: validatedInput.param.id },
                    userId,
                })
            )
    )

    .post(
        '/:id/parse',
        zValidator('param', transactionImportFileSchemas.getById.endpoint.param),
        (c) =>
            routeHandler(c)
                .withUser()
                .handleMutation(async ({ userId, validatedInput }) => {
                    const result = await parseTransactionFile({
                        id: validatedInput.param.id,
                        userId,
                    });

                    return result;
                })
    )

    .route(
        '/upload',
        createUploadToS3Endpoints({
            allowedFileTypes: [
                'text/csv',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel',
            ],
            maxFileSize: 10 * 1024 * 1024,
            bucket: process.env.AWS_BUCKET_NAME_PRIVATE_UPLOAD,
        })
    );

export default app;
