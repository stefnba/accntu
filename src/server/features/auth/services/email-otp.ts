import { createId } from '@paralleldrive/cuid2';
import * as emailOtpQueries from '../queries/email-otp';

/**
 * Generate a new OTP for email authentication
 * @param params - The generation parameters
 * @param params.email - The user's email
 * @returns The generated OTP and token
 */
export const generateEmailOtp = async ({ email }: { email: string }) => {
    // Generate a secure random OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const token = createId();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store the OTP in the database
    await emailOtpQueries.createEmailOtpRecord({
        token,
        email,
        otpHash: otp, // In a real app, this should be hashed
        expiresAt,
    });

    return { otp, token };
};

/**
 * Verify an email OTP
 * @param params - The verification parameters
 * @param params.token - The token associated with the OTP
 * @param params.otp - The OTP to verify
 * @returns Whether the OTP is valid
 */
export const verifyEmailOtp = async ({ token, otp }: { token: string; otp: string }) => {
    // Get the OTP record
    const otpRecord = await emailOtpQueries.getEmailOtpRecordByToken({ token });

    if (!otpRecord) {
        return false;
    }

    // Check if the OTP has expired
    if (otpRecord.expiresAt < new Date()) {
        return false;
    }

    // Check if the OTP has been used
    if (otpRecord.usedAt) {
        return false;
    }

    // Check if too many attempts
    if (otpRecord.attempts && otpRecord.attempts >= 3) {
        return false;
    }

    // Check if the OTP matches
    if (otpRecord.tokenHash !== otp) {
        // Increment attempts
        await emailOtpQueries.incrementEmailOtpRecordAttempts({ token });
        return false;
    }

    return true;
};

/**
 * Login with email OTP
 * @param params - The login parameters
 * @param params.email - The user's email
 * @returns The token for verification
 */
export const loginWithEmailOTP = async ({
    email,
}: {
    email: string;
}): Promise<{ token: string }> => {
    // Check if there's an existing unused OTP for this email
    const existingOtp = await emailOtpQueries.getEmailOtpRecordByEmail({ email });

    // If there's a recent OTP (less than 1 minute old), don't generate a new one
    if (
        existingOtp &&
        existingOtp.createdAt > new Date(Date.now() - 60 * 1000) &&
        !existingOtp.usedAt
    ) {
        return { token: existingOtp.token };
    }

    // Generate a new OTP
    const { token } = await generateEmailOtp({ email });

    // In a real app, send the OTP to the user's email
    // await sendEmail(email, 'Your OTP', `Your OTP is: ${otp}`);

    return { token };
};
