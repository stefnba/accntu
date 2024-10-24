import tagRouter from '@features/tag/server/api/routes';

import authRouter from '../auth/api';
import bankRouter from './bank';
import connectedRouter from './connected';
import importRouter from './import';
import labelRouter from './label';
import transactionRouter from './transaction';
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
