import { db } from '@db';
import { bank, bankUploadAccount } from '@db/schema';
import { createId } from '@paralleldrive/cuid2';

import { TSeedBanks } from './types';

const banksSeed: TSeedBanks = [
    {
        id: createId(),
        name: 'Barclays',
        country: 'DE',
        accounts: [
            {
                type: 'CREDIT_CARD',
                id: createId(),
                parserKey: 'BARCLAYS_DE_CREDITCARD'
            }
        ]
    },
    {
        id: createId(),
        name: 'Swiss Miles & More',
        country: 'CH',
        accounts: [
            {
                type: 'CREDIT_CARD',
                id: createId(),
                parserKey: 'MILESANDMORE_CH_CREDITCARD'
            }
        ]
    },

    {
        id: createId(),
        name: 'UBS',
        country: 'CH',
        accounts: [
            {
                type: 'CREDIT_CARD',
                id: createId(),
                parserKey: 'UBS_CH_CREDITCARD'
            },
            {
                type: 'CURRENT',
                id: createId(),
                parserKey: 'UBS_CH_CURRENT'
            }
        ]
    }
];

export const seedBanks = async () => {
    await db
        .insert(bank)
        .values(
            banksSeed.map((b) => {
                const { accounts, ...bank } = b;
                return bank;
            })
        )
        .returning();

    await Promise.all(
        banksSeed.map(async (bank) => {
            const bankId = bank.id;
            const accounts = bank.accounts.map((a) => {
                return {
                    ...a,
                    bankId
                };
            });

            return db.insert(bankUploadAccount).values(accounts);
        })
    );
};
