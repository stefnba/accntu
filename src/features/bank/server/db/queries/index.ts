// ====================
// Global banks
// ====================
import { globalBankQueries } from './global-bank';
import { globalBankAccountQueries } from './global-bank-account';

// ====================
// Connected banks
// ====================
import { connectedBankQueries } from './connected-bank';
import { connectedBankAccountQueries } from './connected-bank-account';

export const bankQueries = {
    globalBank: globalBankQueries,
    globalBankAccount: globalBankAccountQueries,
    connectedBank: connectedBankQueries,
    connectedBankAccount: connectedBankAccountQueries,
};

export {
    connectedBankAccountQueries,
    connectedBankQueries,
    globalBankAccountQueries,
    globalBankQueries,
};
