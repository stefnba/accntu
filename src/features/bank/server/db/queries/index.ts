// ====================
// Global banks
// ====================
import * as globalBankQueries from './global-bank';
import * as globalBankAccountQueries from './global-bank-account';

// ====================
// Connected banks
// ====================
import * as connectedBankQueries from './connected-bank';
import * as connectedBankAccountQueries from './connected-bank-account';

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
