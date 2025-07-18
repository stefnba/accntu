import { globalBankQuerySchemas } from '@/features/bank/schemas/global-bank';
import { z } from 'zod';

const globalBanks = [
    {
        id: 'xbl47h8oejgjhhtrjav4akjx',
        name: 'DKB Miles & More',
        country: 'DE',
        currency: 'EUR',
        bic: 'BARCDE33XXX',
        color: '#00aeef',
        logo: 'https://accntu-public.s3.eu-central-1.amazonaws.com/logos/barclays_de.png',
        integrationTypes: 'csv',
    },
    {
        id: 'xbl47h8oejgjhhtrjav4gkjx',
        name: 'Barclays',
        country: 'DE',
        currency: 'EUR',
        bic: 'BARCDE33XXX',
        color: '#00aeef',
        logo: 'https://accntu-public.s3.eu-central-1.amazonaws.com/logos/barclays_de.png',
        integrationTypes: 'csv',
    },
    {
        id: 'r8rhl2jkfgtt7cta72me3jr9',
        name: 'Swisscard Miles & More',
        country: 'CH',
        currency: 'CHF',
        bic: 'CRESCHZZ80A',
        color: '#28516F',
        logo: 'https://accntu-public.s3.eu-central-1.amazonaws.com/logos/swisscard_ch.webp',
        integrationTypes: 'csv',
    },
    {
        id: 'e8y3xs64izeciy2wp9tkkavg',
        name: 'UBS',
        country: 'CH',
        currency: 'CHF',
        bic: 'UBSWCHZH80A',
        color: '#e60100',
        logo: 'https://accntu-public.s3.eu-central-1.amazonaws.com/logos/ubs1508.jpg',
        integrationTypes: 'csv',
    },
] as const;

/**
 * Global bank seed data.
 *
 * We need to extend the schema with an id field because the id is not generated by the database.
 */
export const globalBankSeedData = globalBankQuerySchemas.insert
    .extend({
        id: z.string(),
    })
    .array()
    .parse(globalBanks);

/**
 * Literal list of the global bank names.
 */
export type TGlobalBankNames = (typeof globalBanks)[number]['name'];
