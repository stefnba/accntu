SELECT
    Description AS title,
    -- strptime("Transaction date", '%m-%d-%y')::date AS date,      
    "Transaction date"::date AS date,
    Currency AS spending_currency,
    Currency AS account_currency,
    Currency AS user_currency,
    UPPER("Debit/Credit") AS type,
    CAST(ABS(Amount) * 100 AS int) AS spending_amount,
    spending_amount AS account_amount,
    spending_amount AS user_amount,
    spending_amount / account_amount AS spending_account_rate,
    NULL AS country,
    "key",
FROM
    df