import tagRouter from '@features/tag/server/api/routes';
import transactionRouter from '@features/transaction/server/api/routes';

import authRouter from '../auth/api';
import bankRouter from './bank';
import connectedRouter from './connected';
import importRouter from './import';
import labelRouter from './label';
import userRouter from './user';

export {
    bankRouter,
    labelRouter,
    importRouter,
    userRouter,
    transactionRouter,
    connectedRouter,
    authRouter,
    tagRouter
};
