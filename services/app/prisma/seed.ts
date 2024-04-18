import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
    await db.bank.deleteMany();
    await db.bank.create({
        data: {
            name: 'Barclays',
            country: 'DE',
            bankUploadAccounts: {
                create: [
                    {
                        type: 'CREDIT_CARD'
                    }
                ]
            }
        }
    });
    await db.bank.create({
        data: {
            name: 'UBS',
            country: 'CH',
            bankUploadAccounts: {
                create: [
                    {
                        type: 'CREDIT_CARD'
                    },
                    {
                        type: 'CURRENT'
                    }
                ]
            }
        }
    });
}
main()
    .then(async () => {
        await db.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await db.$disconnect();
    });
