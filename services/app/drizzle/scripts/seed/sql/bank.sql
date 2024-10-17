INSERT INTO
    "bank" ("id", "name", "country", "color", "logo")
VALUES
    (
        'xbl47h8oejgjhhtrjav4gkjx',
        'Barclays',
        'DE',
        '#00aeef',
        'https://accntu-public.s3.eu-central-1.amazonaws.com/logos/barclays_de.png'
    ),
    (
        'r8rhl2jkfgtt7cta72me3jr9',
        'Swisscard Miles & More',
        'CH',
        '#28516F',
        'https://accntu-public.s3.eu-central-1.amazonaws.com/logos/swisscard_ch.webp'
    ),
    (
        'e8y3xs64izeciy2wp9tkkavg',
        'UBS',
        'CH',
        '#e60100',
        'https://accntu-public.s3.eu-central-1.amazonaws.com/logos/ubs1508.jpg'
    ) ON CONFLICT DO NOTHING;

-- Insert bank account records
INSERT INTO
    "bank_upload_account" ("id", "type", "parserKey", "bankId")
VALUES
    (
        'w6ggjvz6fg9ref0ns5h350af',
        'CREDIT_CARD',
        'BARCLAYS_DE_CREDITCARD',
        'xbl47h8oejgjhhtrjav4gkjx'
    ),
    (
        'rjs8xjj4kd2ajcybfwulpr49',
        'CREDIT_CARD',
        'MILESANDMORE_CH_CREDITCARD',
        'r8rhl2jkfgtt7cta72me3jr9'
    ),
    (
        'l1imsi6ytzu012oxfsro9feo',
        'CREDIT_CARD',
        'UBS_CH_CREDITCARD',
        'e8y3xs64izeciy2wp9tkkavg'
    ),
    (
        'gr3sna76dkypxetpxxwdxtq3',
        'CURRENT',
        'UBS_CH_ACCOUNT',
        'e8y3xs64izeciy2wp9tkkavg'
    ) ON CONFLICT DO NOTHING;