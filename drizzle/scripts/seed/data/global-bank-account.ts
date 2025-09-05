import { type TGlobalBankAccount } from '../../../../src/features/bank/server/db/tables';
import { globalBankSeedData, type TGlobalBankNames } from './global-bank';

/**
 * Get the global bank id for a given name
 * @param name - The name of the global bank
 * @returns The global bank id
 */
const getGlobalBankId = (name: TGlobalBankNames) => {
    const globalBankId = globalBankSeedData
        .filter((bank) => bank.name === name)
        .map((bank) => bank.id)[0];
    if (!globalBankId) {
        throw new Error(`Global bank with name ${name} not found`);
    }
    return globalBankId;
};

export const globalBankAccountSeedData: Pick<
    TGlobalBankAccount,
    | 'id'
    | 'globalBankId'
    | 'type'
    | 'name'
    | 'transformQuery'
    | 'description'
    | 'transformConfig'
    | 'sampleTransformData'
>[] = [
    {
        id: 'w6ggjvz6fg9ref1ns5h350af',
        globalBankId: getGlobalBankId('DKB Miles & More'),
        type: 'credit_card',
        name: 'DKB Miles & More Current Account',
        description: 'DKB Miles & More current account statements',
        transformQuery: `WITH
    base AS (
        SELECT
            key, -- Deterministic ID generated from raw data
            -- Convert DD.MM.YYYY to YYYY-MM-DD
            strftime("Authorised on", '%Y-%m-%d') AS date,
            CAST(
                regexp_replace(
                    regexp_replace("Amount", '[.−]', ''), -- remove thousands-seps and minus sign
                    ',',
                    '.' -- turn decimal-comma into dot
                ) AS DOUBLE
            ) AS accountAmount,
            Currency AS accountCurrency,
            -- Clean up description
            TRIM("Description") AS title,
            'EUR' AS spendingCurrency,
            CAST(
                regexp_replace(
                    regexp_replace("Amount in foreign currency", '[.−]', ''), -- remove thousands-seps and minus sign
                    ',',
                    '.' -- turn decimal-comma into dot
                ) AS DOUBLE
            ) AS spendingAmount,
        FROM
            {{data}}
    )
SELECT
    key,
    date,
    accountAmount,
    accountCurrency,
    CASE WHEN accountAmount < 0 THEN 'debit' ELSE 'credit' END AS type,
    title,
    spendingCurrency,
    CASE WHEN spendingAmount IS NULL THEN accountAmount ELSE spendingAmount END AS spendingAmount
FROM
    base`,
        transformConfig: {
            type: 'csv',
            encoding: 'utf-8',
            skipRows: 2,
            delimiter: ';',
            idColumns: ['Description', 'Amount', 'Authorised on', 'Currency'],
            sheetName: 'Sheet1',
        },
        sampleTransformData: `Miles & More Gold Credit Card;5310XXXXXXXX1598

Authorised on;Processed on;Amount;Currency;Description;Payment type;Status;Amount in foreign currency;Currency;Exchange rate
28.05.2025;29.05.2025;606,69;EUR;Lastschrift;direct-debit;Processed;;;
28.05.2025;28.05.2025;-11,5;EUR;monatlicher Kartenpreis;product-fee;Processed;;;`,
    },
    {
        id: 'w6ggjvz6fg9ref0ns5h350af',
        globalBankId: getGlobalBankId('Barclays'),
        type: 'credit_card',
        name: 'Barclays Credit Card',
        description: 'Barclays Germany credit card statements',
        transformQuery: `SELECT
    strptime(date_col, '%d/%m/%Y') as date,
    description_col as description,
    CAST(amount_col as DECIMAL(12,2)) as amount,
    CAST(balance_col as DECIMAL(12,2)) as balance,
    reference_col as reference
FROM read_csv_auto('{{CSV_FILE_PATH}}',
    delimiter=',', header=true, quote='"'
)
WHERE date_col IS NOT NULL AND amount_col IS NOT NULL
ORDER BY date_col DESC`,
        transformConfig: {
            type: 'csv',
            delimiter: ',',
            hasHeader: true,
            dateFormat: 'dd/MM/yyyy',
            decimalSeparator: '.',
            encoding: 'utf-8',
        },
        sampleTransformData: 'test',
    },
    {
        id: 'rjs8xjj4kd2ajcybfwulpr49',
        globalBankId: getGlobalBankId('Swisscard Miles & More'),
        type: 'credit_card',
        name: 'Miles & More Credit Card',
        description: 'Swisscard Miles & More credit card statements',
        transformQuery: `SELECT
    strptime(date_col, '%d.%m.%Y') as date,
    description_col as description,
    CAST(REPLACE(amount_col, ',', '.') as DECIMAL(12,2)) as amount,
    reference_col as reference
FROM read_csv_auto('{{CSV_FILE_PATH}}',
    delimiter=';', header=true, quote='"'
)
WHERE date_col IS NOT NULL AND amount_col IS NOT NULL
ORDER BY date_col DESC`,
        transformConfig: {
            type: 'csv',
            delimiter: ';',
            hasHeader: true,
            dateFormat: 'dd.MM.yyyy',
            decimalSeparator: ',',
            encoding: 'utf-8',
        },
        sampleTransformData: 'test',
    },
    {
        id: 'l1imsi6ytzu012oxfsro9feo',
        globalBankId: getGlobalBankId('UBS'),
        type: 'credit_card',
        name: 'UBS Credit Card',
        description: 'UBS Switzerland credit card statements',
        transformQuery: `SELECT
    strptime(date_col, '%d.%m.%Y') as date,
    description_col as description,
    CASE
        WHEN debit_col IS NOT NULL AND debit_col != '' THEN -CAST(REPLACE(debit_col, ',', '.') as DECIMAL(12,2))
        WHEN credit_col IS NOT NULL AND credit_col != '' THEN CAST(REPLACE(credit_col, ',', '.') as DECIMAL(12,2))
        ELSE 0
    END as amount,
    CAST(REPLACE(balance_col, ',', '.') as DECIMAL(12,2)) as balance,
    reference_col as reference,
    counterparty_col as counterparty
FROM read_csv_auto('{{CSV_FILE_PATH}}',
    delimiter=';', header=true, quote='"'
)
WHERE date_col IS NOT NULL AND (debit_col IS NOT NULL OR credit_col IS NOT NULL)
ORDER BY date_col DESC`,
        transformConfig: {
            type: 'csv',
            delimiter: ';',
            hasHeader: true,
            dateFormat: 'dd.MM.yyyy',
            decimalSeparator: ',',
            encoding: 'utf-8',
        },
        sampleTransformData: 'test',
    },
    {
        id: 'gr3sna76dkypxetpxxwdxtq3',
        globalBankId: getGlobalBankId('UBS'),
        type: 'checking',
        name: 'UBS Current Account',
        description: 'UBS Switzerland current account statements',
        transformQuery: `SELECT
    strptime(date_col, '%d.%m.%Y') as date,
    description_col as description,
    CAST(REPLACE(amount_col, ',', '.') as DECIMAL(12,2)) as amount,
    CAST(REPLACE(balance_col, ',', '.') as DECIMAL(12,2)) as balance,
    reference_col as reference,
    counterparty_col as counterparty,
    iban_col as iban
FROM read_csv_auto('{{CSV_FILE_PATH}}',
    delimiter=';', header=true, quote='"'
)
WHERE date_col IS NOT NULL AND amount_col IS NOT NULL
ORDER BY date_col DESC`,
        transformConfig: {
            type: 'csv',
            delimiter: ';',
            hasHeader: true,
            dateFormat: 'dd.MM.yyyy',
            decimalSeparator: ',',
            encoding: 'utf-8',
        },
        sampleTransformData: 'test',
    },
];
