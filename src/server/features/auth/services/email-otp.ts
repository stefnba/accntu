import { verificationTokenQueries } from '@/server/features/auth/queries';
import { generateOtp, verifyOtp } from '@/server/features/auth/services/verification-token';
import * as userQueries from '@/server/features/user/queries';
import * as userServices from '@/server/features/user/services';
import { errorFactory } from '@/server/lib/error';

/**
 * Initiate login with email OTP
 * @param params - The login parameters
 * @param params.email - The user's email
 * @returns The token for verification
 */
export const initiateLoginWithEmailOTP = async ({
    email,
}: {
    email: string;
}): Promise<{ token: string }> => {
    // Check if there's an existing unused OTP for this email
    const existingOtps = await verificationTokenQueries.getVerificationTokenRecordsByEmailAndType({
        email,
        type: 'login',
    });

    const existingOtp = existingOtps?.[0];

    // If there's a recent OTP (less than 1 minute old), don't generate a new one
    if (
        existingOtp &&
        existingOtp.createdAt > new Date(Date.now() - 60 * 1000) &&
        !existingOtp.usedAt
    ) {
        return { token: existingOtp.token };
    }

    // Generate a new OTP
    const { token } = await generateOtp({ email });

    // In a real app, send the OTP to the user's email
    // TODO: Implement email sending
    // await sendEmail(email, 'Your OTP', `Your OTP is: ${otp}`);

    return { token };
};

export const verifyLoginWithEmailOTP = async ({
    token,
    otp,
    email,
}: {
    token: string;
    otp: string;
    email: string;
}) => {
    // check if valid, throw respective auth error if not
    await verifyOtp({ token, otp });

    // token is valid at this point
    let user = await userQueries.getUserRecordByEmail({ email });

    // create new user if not found
    if (!user) {
        const newUser = await userServices.signupNewUser({
            email,
            firstName: email.split('@')[0],
        });
        user = newUser;
    }

    if (!user) {
        throw errorFactory.createAuthError({
            message: 'User not found',
            code: 'AUTH.USER_NOT_FOUND',
        });
    }

    return user;
};
