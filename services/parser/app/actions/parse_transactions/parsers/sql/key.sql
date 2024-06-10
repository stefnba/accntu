/*

*/
SELECT
    *, 
    sha256(key || '_' || ROW_NUMBER() OVER (PARTITION BY key)) AS "key"
FROM $data