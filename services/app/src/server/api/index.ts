import authRouter from '@features/auth/server/api';
import tagRouter from '@features/tag/server/api/routes';
import transactionRouter from '@features/transaction/server/api/routes';
import userRouter from '@features/user/server/api/routes';

import bankRouter from './bank';
import connectedRouter from './connected';
import importRouter from './import';
import labelRouter from './label';

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
