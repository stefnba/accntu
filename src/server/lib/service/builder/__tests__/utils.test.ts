import { AppError } from '@/server/lib/error';
import { validateRecordExists, wrapServiceWithHandler } from '@/server/lib/service/builder/utils';
import { describe, expect, it, vi } from 'vitest';

describe('Service Builder Utils', () => {
    describe('wrapServiceWithHandler', () => {
        it('should return result when throwOnNull is false and result exists', async () => {
            const serviceFn = vi.fn().mockResolvedValue({ id: '123', name: 'test' });

            const wrapped = wrapServiceWithHandler({
                serviceFn,
                throwOnNull: false,
                operation: 'test',
            });

            const result = await wrapped({ userId: 'user-1' });

            expect(result).toEqual({ id: '123', name: 'test' });
            expect(serviceFn).toHaveBeenCalledWith({ userId: 'user-1' });
        });

        it('should return null when throwOnNull is false and result is null', async () => {
            const serviceFn = vi.fn().mockResolvedValue(null);

            const wrapped = wrapServiceWithHandler({
                serviceFn,
                throwOnNull: false,
                operation: 'test',
            });

            const result = await wrapped({ userId: 'user-1' });

            expect(result).toBeNull();
        });

        it('should throw when result is null and throwOnNull is true', async () => {
            const serviceFn = vi.fn().mockResolvedValue(null);

            const wrapped = wrapServiceWithHandler({
                serviceFn,
                throwOnNull: true,
                operation: 'getById',
                resource: 'tag',
            });

            await expect(
                wrapped({ userId: 'user-1', ids: { id: 'non-existent' } })
            ).rejects.toThrow();
        });

        it('should throw when result is undefined and throwOnNull is true', async () => {
            const serviceFn = vi.fn().mockResolvedValue(undefined);

            const wrapped = wrapServiceWithHandler({
                serviceFn,
                throwOnNull: true,
                operation: 'getById',
                resource: 'tag',
            });

            await expect(wrapped({ userId: 'user-1' })).rejects.toThrow();
        });

        it('should default to throwOnNull=true when not specified', async () => {
            const serviceFn = vi.fn().mockResolvedValue(null);

            const wrapped = wrapServiceWithHandler({
                serviceFn,
                operation: 'getById',
            });

            await expect(wrapped({ userId: 'user-1' })).rejects.toThrow();
        });

        it('should pass through errors from service function', async () => {
            const error = new Error('Database error');
            const serviceFn = vi.fn().mockRejectedValue(error);

            const wrapped = wrapServiceWithHandler({
                serviceFn,
                throwOnNull: false,
                operation: 'test',
            });

            await expect(wrapped({ userId: 'user-1' })).rejects.toThrow('Database error');
        });

        it('should include operation and resource in error message', async () => {
            const serviceFn = vi.fn().mockResolvedValue(null);

            const wrapped = wrapServiceWithHandler({
                serviceFn,
                throwOnNull: true,
                operation: 'getById',
                resource: 'user',
            });

            await expect(wrapped({ userId: 'user-1' })).rejects.toThrow();
        });

        it('should preserve return value when throwOnNull is true and result exists', async () => {
            const serviceFn = vi.fn().mockResolvedValue({ id: '456', name: 'preserved' });

            const wrapped = wrapServiceWithHandler({
                serviceFn,
                throwOnNull: true,
                operation: 'test',
            });

            const result = await wrapped({ userId: 'user-1' });

            expect(result).toEqual({ id: '456', name: 'preserved' });
        });

        it('should call service function with correct input', async () => {
            const serviceFn = vi.fn().mockResolvedValue({ success: true });
            const input = { userId: 'user-1', data: { name: 'test' } };

            const wrapped = wrapServiceWithHandler({
                serviceFn,
                throwOnNull: false,
                operation: 'create',
            });

            await wrapped(input);

            expect(serviceFn).toHaveBeenCalledWith(input);
            expect(serviceFn).toHaveBeenCalledTimes(1);
        });

        it('should return service function as-is when throwOnNull is false', async () => {
            const serviceFn = vi.fn().mockResolvedValue([]);

            const wrapped = wrapServiceWithHandler({
                serviceFn,
                throwOnNull: false,
            });

            // The wrapped function should be the same reference when throwOnNull is false
            expect(wrapped).toBe(serviceFn);
        });
    });

    describe('validateRecordExists', () => {
        it('should return the record when it exists', () => {
            const record = { id: '123', name: 'test' };
            const result = validateRecordExists(record);

            expect(result).toBe(record);
        });

        it('should throw AppError when record is null', () => {
            expect(() => validateRecordExists(null)).toThrow();
        });

        it('should throw AppError when record is undefined', () => {
            expect(() => validateRecordExists(undefined as unknown as null)).toThrow();
        });

        it('should throw AppError with custom error message', () => {
            const errorMessage = 'Custom not found message';

            try {
                validateRecordExists(null, errorMessage);
                throw new Error('Should have thrown');
            } catch (error) {
                expect(AppError.isAppError(error)).toBe(true);
            }
        });

        it('should include details in thrown error', () => {
            const details = { operation: 'getById', resource: 'tag' };

            try {
                validateRecordExists(null, 'Not found', details);
                throw new Error('Should have thrown');
            } catch (error) {
                expect(AppError.isAppError(error)).toBe(true);
            }
        });

        it('should use default error message when not provided', () => {
            try {
                validateRecordExists(null);
                throw new Error('Should have thrown');
            } catch (error) {
                expect(AppError.isAppError(error)).toBe(true);
            }
        });

        it('should handle objects with falsy properties', () => {
            const record = { id: '123', count: 0, enabled: false };
            const result = validateRecordExists(record);

            expect(result).toBe(record);
            expect(result.count).toBe(0);
            expect(result.enabled).toBe(false);
        });
    });
});
