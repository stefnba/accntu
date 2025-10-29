import { tag } from '@/server/db/tables';
import { createFeatureTableConfig } from '@/server/lib/db/table/feature-config';
import z from 'zod';

const aaa = createFeatureTableConfig(tag)
    .setIds(['id'])
    .setUserId('userId')
    // .restrictBase(['name', 'description', 'color'])
    // .defineReturnColumns(['id', 'name', 'description', 'color', 'transactionCount'])
    .build();

const ids = aaa.idSchema;
const userIds = aaa.userIdSchema;

// const base = aaa.baseSchema;

// const insert = aaa.insertSchema;
// const update = aaa.updateSchema;
// const select = aaa.selectSchema;

type TIdSchema = typeof ids extends undefined ? undefined : z.infer<typeof ids>;
type TUserIdSchema = typeof userIds extends undefined ? undefined : z.infer<typeof userIds>;
// type TBaseSchema = typeof base extends undefined ? undefined : z.infer<typeof base>;
// type TInsertSchema = z.infer<typeof insert>;
// type TUpdateSchema = z.infer<typeof update>;
// type TSelectSchema = z.infer<typeof select>;
