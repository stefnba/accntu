import { OptType } from '@/server/db/schemas/auth';
import { verificationTokenQueries } from '@/server/features/auth/queries';
import { createId } from '@paralleldrive/cuid2';

/**
 * Initiate email verification process
 * @param email - User's email address
 * @param userId - User's ID
 * @returns The created verification token
 */
export async function initiateEmailVerification(email: string, userId: string) {
    const token = createId();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create verification token record
    await verificationTokenQueries.createEmailVerificationTokenRecord(
        token,
        email,
        token, // Using token as hash for simplicity in this example
        'email-verification' as OptType,
        expiresAt
    );

    return token;
}

/**
 * Verify email with token
 * @param token - Verification token
 * @param userId - User's ID
 * @returns Whether verification was successful
 */
export async function verifyEmail(token: string, userId: string) {
    // Get verification token
    const verificationToken = await verificationTokenQueries.getVerificationTokenRecord(
        userId,
        token,
        'email-verification' as OptType
    );

    if (!verificationToken || verificationToken.usedAt) {
        return false;
    }

    if (verificationToken.expiresAt < new Date()) {
        return false;
    }

    // Mark token as used
    await verificationTokenQueries.markVerificationTokenRecordAsUsed(token);

    return true;
}

/**
 * Clean up expired verification tokens
 */
export async function cleanupExpiredTokens() {
    await verificationTokenQueries.deleteExpiredVerificationTokenRecords();
}
