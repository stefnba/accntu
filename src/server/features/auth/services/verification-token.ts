import { verificationTokenQueries } from '@/server/features/auth/queries';
import { errorFactory } from '@/server/lib/error';

import { createHash } from 'node:crypto';
import { alphabet, generateRandomString } from 'oslo/crypto';

/**
 * Hash an OTP
 * @param otp - The OTP to hash
 * @returns The hashed OTP
 */
const hashOtp = (otp: string) => {
    return createHash('sha256').update(otp).digest('hex');
};

/**
 * Generate a random string of numbers that can be used as an OTP

 * @param params - The generation parameters
 * @param params.email - The user's email
 * @param params.userId - The user's ID
 * @returns The generated OTP and token
 */
export const generateOtp = async ({ email, userId }: { email?: string; userId?: string }) => {
    // Generate a secure random OTP
    const code = generateRandomString(8, alphabet('0-9'));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const hashedCode = hashOtp(code);

    console.log('hashedCode', code);

    // Store the OTP in the database
    const otpRecord = await verificationTokenQueries.createVerificationTokenRecord({
        email,
        userId,
        hashedCode,
        type: 'login',
        expiresAt,
    });

    return { token: otpRecord.token };
};

/**
 * Verify an OTP
 * @param params - The verification parameters
 * @param params.token - The token associated with the OTP
 * @param params.otp - The OTP to verify
 * @returns Whether the OTP is valid
 */
export const verifyOtp = async ({ token, otp }: { token: string; otp: string }) => {
    // Get the OTP record
    const otpRecord = await verificationTokenQueries.getVerificationTokenRecordByToken({ token });

    if (!otpRecord) {
        throw errorFactory.createAuthError({
            message: 'Verification record for this token not found',
            code: 'AUTH.OTP_NOT_FOUND',
        });
    }

    // Check if the OTP has expired
    if (otpRecord.expiresAt < new Date()) {
        throw errorFactory.createAuthError({
            message: 'OTP has expired',
            code: 'AUTH.OTP_EXPIRED',
        });
    }

    // Check if the OTP has been used
    if (otpRecord.usedAt) {
        throw errorFactory.createAuthError({
            message: 'OTP has already been used',
            code: 'AUTH.OTP_ALREADY_USED',
        });
    }

    // Check if too many attempts
    if (otpRecord.attempts && otpRecord.attempts >= 3) {
        throw errorFactory.createAuthError({
            message: 'Too many failed attempts',
            code: 'AUTH.TOO_MANY_INVALID_REQUESTS',
        });
    }

    // Check if the OTP matches
    if (otpRecord.hashedCode !== hashOtp(otp)) {
        // Increment attempts
        await verificationTokenQueries.incrementVerificationTokenRecordAttempts({ token });
        throw errorFactory.createAuthError({
            message: 'Invalid OTP',
            code: 'AUTH.INVALID_OTP',
        });
    }

    return true;
};

/**
 * Clean up expired verification tokens
 */
export async function cleanupExpiredTokens() {
    await verificationTokenQueries.deleteExpiredVerificationTokenRecords();
}
