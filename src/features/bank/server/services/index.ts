import { connectedBankServices } from '@/features/bank/server/services/connected-bank';
import { connectedBankAccountServices } from '@/features/bank/server/services/connected-bank-account';
import { globalBankServices } from '@/features/bank/server/services/global-bank';
import { globalBankAccountServices } from '@/features/bank/server/services/global-bank-account';

export const bankServices = {
    globalBank: globalBankServices,
    connectedBank: connectedBankServices,
    connectedBankAccount: connectedBankAccountServices,
    globalBankAccount: globalBankAccountServices,
};
