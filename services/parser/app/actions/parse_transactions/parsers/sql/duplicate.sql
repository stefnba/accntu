SELECT
    data.*,
    IF(ROW_NUMBER() OVER (PARTITION BY data.key) > 1 OR existing_transactions.key IS NOT NULL, TRUE, FALSE) AS is_duplicate
FROM $data AS data
LEFT JOIN $existing_transactions AS existing_transactions ON data.key = existing_transactions.key