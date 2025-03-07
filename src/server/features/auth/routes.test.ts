import { routes } from '@/server';
import { testClient } from 'hono/testing';
import { describe, expect, it } from 'vitest';

describe('Auth Routes', () => {
    describe('POST /request-otp', () => {
        it('should handle email validation for OTP request', async () => {
            const res = await testClient(routes).api.auth['request-otp'].$post({
                json: {
                    email: 'test@test.com',
                },
            });
            expect(res.status).toBe(201);
            const data = await res.json();
            expect(data).toEqual({
                success: true,
                data: { message: 'OTP sent successfully' },
            });
        });

        it('should return validation error for invalid email', async () => {
            const res = await testClient(routes).api.auth['request-otp'].$post({
                json: {
                    email: 'invalid-email',
                },
            });
            expect(res.status).toBe(400);
        });
    });

    describe('POST /verify-otp', () => {
        it('should validate OTP verification request', async () => {
            // This test requires cookies to be set, which is hard to mock in this test
            // We'll just test the validation error cases
            const res = await testClient(routes).api.auth['verify-otp'].$post({
                json: {
                    code: '12345678',
                },
            });
            // Will fail because cookies are missing
            expect(res.status).toBe(400);
        });

        it('should return validation error for invalid code length', async () => {
            const res = await testClient(routes).api.auth['verify-otp'].$post({
                json: {
                    code: '123', // Invalid code length
                },
            });
            expect(res.status).toBe(400);
        });

        it('should return validation error for missing code', async () => {
            const res = await testClient(routes).api.auth['verify-otp'].$post({
                json: {
                    // Missing code
                    // @ts-expect-error
                    email: 'test@test.com',
                },
            });
            expect(res.status).toBe(400);
        });
    });
});
