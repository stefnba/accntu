import { connectedBankQueries } from './connected-bank';
import { connectedBankAccountQueries } from './connected-bank-account';
import { globalBankQueries } from './global-bank';
import { globalBankAccountQueries } from './global-bank-account';

export const bankQueries = {
    globalBank: globalBankQueries,
    globalBankAccount: globalBankAccountQueries,
    connectedBankAccount: connectedBankAccountQueries,
    connectedBank: connectedBankQueries,
};
