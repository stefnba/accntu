-- Global banks with enhanced configuration
INSERT INTO "global_bank" (
    "id",
    "name",
    "country",
    "currency",
    "bic",
    "color",
    "logo",
    "integration_types"
) VALUES
    (
        'xbl47h8oejgjhhtrjav4gkjx',
        'Barclays',
        'DE',
        'EUR',
        'BARCDE33XXX',
        '#00aeef',
        'https://accntu-public.s3.eu-central-1.amazonaws.com/logos/barclays_de.png',
        'csv'
    ),
    (
        'r8rhl2jkfgtt7cta72me3jr9',
        'Swisscard Miles & More',
        'CH',
        'CHF',
        'CRESCHZZ80A',
        '#28516F',
        'https://accntu-public.s3.eu-central-1.amazonaws.com/logos/swisscard_ch.webp',
        'csv'
    ),
    (
        'e8y3xs64izeciy2wp9tkkavg',
        'UBS',
        'CH',
        'CHF',
        'UBSWCHZH80A',
        '#e60100',
        'https://accntu-public.s3.eu-central-1.amazonaws.com/logos/ubs1508.jpg',
        'csv'
    ) ON CONFLICT (id) DO NOTHING;

-- Global bank account templates with DuckDB queries
INSERT INTO "global_bank_account" (
    "id",
    "global_bank_id",
    "type",
    "name",
    "description",
    "transform_query",
    "csv_config"
) VALUES
    (
        'w6ggjvz6fg9ref0ns5h350af',
        'xbl47h8oejgjhhtrjav4gkjx',
        'credit_card',
        'Barclays Credit Card',
        'Barclays Germany credit card statements',
        'SELECT
            strptime(date_col, ''%d/%m/%Y'') as date,
            description_col as description,
            CAST(amount_col as DECIMAL(12,2)) as amount,
            CAST(balance_col as DECIMAL(12,2)) as balance,
            reference_col as reference
        FROM read_csv_auto(''{{CSV_FILE_PATH}}'',
            delimiter='','', header=true, quote=''"''
        )
        WHERE date_col IS NOT NULL AND amount_col IS NOT NULL
        ORDER BY date_col DESC',
        '{"delimiter": ",", "hasHeader": true, "dateFormat": "dd/MM/yyyy", "decimalSeparator": ".", "encoding": "utf-8"}'
    ),
    (
        'rjs8xjj4kd2ajcybfwulpr49',
        'r8rhl2jkfgtt7cta72me3jr9',
        'credit_card',
        'Miles & More Credit Card',
        'Swisscard Miles & More credit card statements',
        'SELECT
            strptime(date_col, ''%d.%m.%Y'') as date,
            description_col as description,
            CAST(REPLACE(amount_col, '','', ''.'') as DECIMAL(12,2)) as amount,
            reference_col as reference
        FROM read_csv_auto(''{{CSV_FILE_PATH}}'',
            delimiter='';'', header=true, quote=''"''
        )
        WHERE date_col IS NOT NULL AND amount_col IS NOT NULL
        ORDER BY date_col DESC',
        '{"delimiter": ";", "hasHeader": true, "dateFormat": "dd.MM.yyyy", "decimalSeparator": ",", "encoding": "utf-8"}'
    ),
    (
        'l1imsi6ytzu012oxfsro9feo',
        'e8y3xs64izeciy2wp9tkkavg',
        'credit_card',
        'UBS Credit Card',
        'UBS Switzerland credit card statements',
        'SELECT
            strptime(date_col, ''%d.%m.%Y'') as date,
            description_col as description,
            CASE
                WHEN debit_col IS NOT NULL AND debit_col != '''' THEN -CAST(REPLACE(debit_col, '','', ''.'') as DECIMAL(12,2))
                WHEN credit_col IS NOT NULL AND credit_col != '''' THEN CAST(REPLACE(credit_col, '','', ''.'') as DECIMAL(12,2))
                ELSE 0
            END as amount,
            CAST(REPLACE(balance_col, '','', ''.'') as DECIMAL(12,2)) as balance,
            reference_col as reference,
            counterparty_col as counterparty
        FROM read_csv_auto(''{{CSV_FILE_PATH}}'',
            delimiter='';'', header=true, quote=''"''
        )
        WHERE date_col IS NOT NULL AND (debit_col IS NOT NULL OR credit_col IS NOT NULL)
        ORDER BY date_col DESC',
        '{"delimiter": ";", "hasHeader": true, "dateFormat": "dd.MM.yyyy", "decimalSeparator": ",", "encoding": "utf-8"}'
    ),
    (
        'gr3sna76dkypxetpxxwdxtq3',
        'e8y3xs64izeciy2wp9tkkavg',
        'checking',
        'UBS Current Account',
        'UBS Switzerland current account statements',
        'SELECT
            strptime(date_col, ''%d.%m.%Y'') as date,
            description_col as description,
            CAST(REPLACE(amount_col, '','', ''.'') as DECIMAL(12,2)) as amount,
            CAST(REPLACE(balance_col, '','', ''.'') as DECIMAL(12,2)) as balance,
            reference_col as reference,
            counterparty_col as counterparty,
            iban_col as iban
        FROM read_csv_auto(''{{CSV_FILE_PATH}}'',
            delimiter='';'', header=true, quote=''"''
        )
        WHERE date_col IS NOT NULL AND amount_col IS NOT NULL
        ORDER BY date_col DESC',
        '{"delimiter": ";", "hasHeader": true, "dateFormat": "dd.MM.yyyy", "decimalSeparator": ",", "encoding": "utf-8"}'
    ) ON CONFLICT (id) DO NOTHING;
