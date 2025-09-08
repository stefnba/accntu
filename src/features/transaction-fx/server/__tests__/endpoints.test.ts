import { createTestClient, setupTestAuth, type TestAuthSetup } from '@/../test/utils';
import { beforeAll, describe, expect, it } from 'vitest';

// Response validation helper functions
const validateExchangeRateResponse = (rate: any) => {
    expect(rate).toHaveProperty('baseCurrency');
    expect(rate).toHaveProperty('targetCurrency');
    expect(rate).toHaveProperty('date');
    expect(rate).toHaveProperty('exchangeRate');
    
    expect(typeof rate.baseCurrency).toBe('string');
    expect(typeof rate.targetCurrency).toBe('string');
    expect(typeof rate.date).toBe('string');
    expect(typeof rate.exchangeRate).toBe('number');
};

const validateStoredRateResponse = (rate: any) => {
    expect(rate).toHaveProperty('id');
    expect(rate).toHaveProperty('baseCurrency');
    expect(rate).toHaveProperty('targetCurrency');
    expect(rate).toHaveProperty('exchangeRate');
    expect(rate).toHaveProperty('date');
    expect(rate).toHaveProperty('createdAt');
    expect(rate).toHaveProperty('updatedAt');
    
    expect(typeof rate.id).toBe('string');
    expect(typeof rate.baseCurrency).toBe('string');
    expect(typeof rate.targetCurrency).toBe('string');
    expect(typeof rate.exchangeRate).toBe('string'); // Decimal stored as string
    expect(typeof rate.date).toBe('string');
    expect(typeof rate.createdAt).toBe('string');
    expect(typeof rate.updatedAt).toBe('string');
};

const validateConvertAmountResponse = (conversion: any) => {
    expect(conversion).toHaveProperty('originalAmount');
    expect(conversion).toHaveProperty('convertedAmount');
    expect(conversion).toHaveProperty('baseCurrency');
    expect(conversion).toHaveProperty('targetCurrency');
    expect(conversion).toHaveProperty('date');
    
    expect(typeof conversion.originalAmount).toBe('number');
    expect(typeof conversion.convertedAmount).toBe('number');
    expect(typeof conversion.baseCurrency).toBe('string');
    expect(typeof conversion.targetCurrency).toBe('string');
    expect(typeof conversion.date).toBe('string');
};

describe('Transaction FX API Endpoints', () => {
    let auth: TestAuthSetup;

    beforeAll(async () => {
        auth = await setupTestAuth();
    });

    describe('Authentication Tests', () => {
        const client = createTestClient();

        it('should reject unauthenticated requests', async () => {
            const res = await client.api['transaction-fx'].rate.$get({
                query: {
                    baseCurrency: 'USD',
                    targetCurrency: 'EUR',
                    date: '2024-01-01',
                },
            });

            expect(res.status).toBe(401);
        });

        it('should accept authenticated requests', async () => {
            const res = await client.api['transaction-fx'].rate.$get(
                {
                    query: {
                        baseCurrency: 'USD',
                        targetCurrency: 'EUR',
                        date: '2024-01-01',
                    },
                },
                { headers: auth.authHeaders }
            );

            expect([200, 404]).toContain(res.status); // 404 if rate not found is acceptable
        });
    });

    describe('Exchange Rate Operations', () => {
        const client = createTestClient();

        it('should get exchange rate', async () => {
            const queryParams = {
                baseCurrency: 'USD',
                targetCurrency: 'EUR',
                date: '2024-01-01',
            };

            const res = await client.api['transaction-fx'].rate.$get({
                query: queryParams,
            });

            expect([200, 404]).toContain(res.status); // 404 if rate not found
            
            if (res.status === 200) {
                const rateData = await res.json();
                validateExchangeRateResponse(rateData);
                expect(rateData.baseCurrency).toBe(queryParams.baseCurrency);
                expect(rateData.targetCurrency).toBe(queryParams.targetCurrency);
                expect(rateData.date).toBe(queryParams.date);
                expect(rateData.exchangeRate).toBeGreaterThan(0);
            }
        });

        it('should store exchange rate', async () => {
            const rateData = {
                baseCurrency: 'USD',
                targetCurrency: 'GBP',
                exchangeRate: 0.8123,
                date: '2024-01-15',
            };

            const res = await client.api['transaction-fx'].rate.$post(
                {
                    json: rateData,
                },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(201);
            
            if (res.status === 201) {
                const storedRate = await res.json();
                validateStoredRateResponse(storedRate);
                expect(storedRate.baseCurrency).toBe(rateData.baseCurrency);
                expect(storedRate.targetCurrency).toBe(rateData.targetCurrency);
                expect(parseFloat(storedRate.exchangeRate)).toBe(rateData.exchangeRate);
                expect(storedRate.date).toBe(rateData.date);
            }
        });

        it('should handle duplicate rate storage', async () => {
            const rateData = {
                baseCurrency: 'USD',
                targetCurrency: 'GBP',
                exchangeRate: 0.8200,
                date: '2024-01-15', // Same date as previous test
            };

            const res = await client.api['transaction-fx'].rate.$post(
                {
                    json: rateData,
                },
                { headers: auth.authHeaders }
            );

            // Should either update existing or return conflict
            expect([201, 409]).toContain(res.status);
        });
    });

    describe('Batch Rate Operations', () => {
        const client = createTestClient();

        it('should store multiple rates in batch', async () => {
            const batchData = {
                rates: [
                    {
                        baseCurrency: 'EUR',
                        targetCurrency: 'USD',
                        exchangeRate: 1.0856,
                        date: '2024-02-01',
                    },
                    {
                        baseCurrency: 'EUR',
                        targetCurrency: 'GBP',
                        exchangeRate: 0.8567,
                        date: '2024-02-01',
                    },
                    {
                        baseCurrency: 'USD',
                        targetCurrency: 'JPY',
                        exchangeRate: 149.32,
                        date: '2024-02-01',
                    },
                ],
            };

            const res = await client.api['transaction-fx'].rates.batch.$post(
                {
                    json: batchData,
                },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(201);
            
            if (res.status === 201) {
                const result = await res.json();
                expect(result).toHaveProperty('success');
                expect(result).toHaveProperty('count');
                if ('success' in result) {
                    expect(result.success).toBe(true);
                }
                if ('count' in result) {
                    expect(result.count).toBe(batchData.rates.length);
                }
            }
        });

        it('should handle empty batch', async () => {
            const res = await client.api['transaction-fx'].rates.batch.$post(
                {
                    json: { rates: [] },
                },
                { headers: auth.authHeaders }
            );

            expect([201, 400]).toContain(res.status);
        });
    });

    describe('Currency Conversion', () => {
        const client = createTestClient();

        it('should convert amount between currencies', async () => {
            // First, ensure we have a rate stored
            await client.api['transaction-fx'].rate.$post(
                {
                    json: {
                        baseCurrency: 'USD',
                        targetCurrency: 'EUR',
                        exchangeRate: 0.85,
                        date: '2024-03-01',
                    },
                },
                { headers: auth.authHeaders }
            );

            const conversionData = {
                amount: 100,
                baseCurrency: 'USD',
                targetCurrency: 'EUR',
                date: '2024-03-01',
            };

            const res = await client.api['transaction-fx'].convert.$post(
                {
                    json: conversionData,
                },
                { headers: auth.authHeaders }
            );

            expect([200, 404]).toContain(res.status); // 404 if rate not found
            
            if (res.status === 200) {
                const conversion = await res.json();
                validateConvertAmountResponse(conversion);
                expect(conversion.originalAmount).toBe(conversionData.amount);
                expect(conversion.baseCurrency).toBe(conversionData.baseCurrency);
                expect(conversion.targetCurrency).toBe(conversionData.targetCurrency);
                expect(conversion.date).toBe(conversionData.date);
                expect(conversion.convertedAmount).toBeCloseTo(85, 2); // 100 * 0.85
            }
        });

        it('should handle same currency conversion', async () => {
            const conversionData = {
                amount: 100,
                baseCurrency: 'USD',
                targetCurrency: 'USD',
                date: '2024-03-01',
            };

            const res = await client.api['transaction-fx'].convert.$post(
                {
                    json: conversionData,
                },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(200);
            
            if (res.status === 200) {
                const conversion = await res.json();
                validateConvertAmountResponse(conversion);
                expect(conversion.originalAmount).toBe(100);
                expect(conversion.convertedAmount).toBe(100); // Should be 1:1
            }
        });

        it('should handle zero amount conversion', async () => {
            const conversionData = {
                amount: 0,
                baseCurrency: 'USD',
                targetCurrency: 'EUR',
                date: '2024-03-01',
            };

            const res = await client.api['transaction-fx'].convert.$post(
                {
                    json: conversionData,
                },
                { headers: auth.authHeaders }
            );

            expect([200, 404]).toContain(res.status);
            
            if (res.status === 200) {
                const conversion = await res.json();
                validateConvertAmountResponse(conversion);
                expect(conversion.originalAmount).toBe(0);
                expect(conversion.convertedAmount).toBe(0);
            }
        });

        it('should handle negative amount conversion', async () => {
            const conversionData = {
                amount: -50,
                baseCurrency: 'USD',
                targetCurrency: 'EUR',
                date: '2024-03-01',
            };

            const res = await client.api['transaction-fx'].convert.$post(
                {
                    json: conversionData,
                },
                { headers: auth.authHeaders }
            );

            expect([200, 404]).toContain(res.status);
            
            if (res.status === 200) {
                const conversion = await res.json();
                validateConvertAmountResponse(conversion);
                expect(conversion.originalAmount).toBe(-50);
                expect(conversion.convertedAmount).toBeCloseTo(-42.5, 2); // -50 * 0.85
            }
        });
    });

    describe('Input Validation', () => {
        const client = createTestClient();

        it('should validate currency code format in get rate', async () => {
            const res = await client.api['transaction-fx'].rate.$get(
                {
                    query: {
                        // @ts-expect-error - Invalid currency format
                        baseCurrency: 'INVALID',
                        targetCurrency: 'EUR',
                        date: '2024-01-01',
                    },
                },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(400);
        });

        it('should validate date format in get rate', async () => {
            const res = await client.api['transaction-fx'].rate.$get(
                {
                    query: {
                        baseCurrency: 'USD',
                        targetCurrency: 'EUR',
                        // @ts-expect-error - Invalid date format
                        date: '01-01-2024',
                    },
                },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(400);
        });

        it('should validate exchange rate value in store rate', async () => {
            const res = await client.api['transaction-fx'].rate.$post(
                {
                    json: {
                        baseCurrency: 'USD',
                        targetCurrency: 'EUR',
                        exchangeRate: -0.5, // Negative rate should be invalid
                        date: '2024-01-01',
                    },
                },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(400);
        });

        it('should validate currency codes are exactly 3 characters', async () => {
            const invalidCurrencies = ['US', 'EURO', 'A', '123'];
            
            for (const currency of invalidCurrencies) {
                const res = await client.api['transaction-fx'].rate.$get(
                    {
                        query: {
                            // @ts-expect-error - Testing invalid currency
                            baseCurrency: currency,
                            targetCurrency: 'EUR',
                            date: '2024-01-01',
                        },
                    },
                    { headers: auth.authHeaders }
                );

                expect(res.status).toBe(400);
            }
        });

        it('should validate required fields in conversion', async () => {
            const res = await client.api['transaction-fx'].convert.$post(
                {
                    json: {
                        // @ts-expect-error - Missing required fields
                        amount: 100,
                        baseCurrency: 'USD',
                        // Missing targetCurrency and date
                    },
                },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(400);
        });
    });

    describe('Error Handling', () => {
        const client = createTestClient();

        it('should handle non-existent rate gracefully', async () => {
            const res = await client.api['transaction-fx'].rate.$get(
                {
                    query: {
                        baseCurrency: 'ZZZ', // Non-existent currency
                        targetCurrency: 'AAA', // Non-existent currency
                        date: '1990-01-01', // Very old date
                    },
                },
                { headers: auth.authHeaders }
            );

            expect([404, 500]).toContain(res.status);
        });

        it('should handle conversion with missing rate', async () => {
            const res = await client.api['transaction-fx'].convert.$post(
                {
                    json: {
                        amount: 100,
                        baseCurrency: 'XYZ', // Non-existent currency pair
                        targetCurrency: 'ABC',
                        date: '1990-01-01',
                    },
                },
                { headers: auth.authHeaders }
            );

            expect([404, 500]).toContain(res.status);
        });
    });
});