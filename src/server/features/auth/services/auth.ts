import { clearCookie } from '@/server/lib/cookies';
import { errorFactory } from '@/server/lib/error';
import { Context } from 'hono';

// /**
//  * Authenticate a user with email OTP
//  * @param params - Authentication parameters
//  * @param params.email - User's email
//  * @returns Token for verification
//  */
// export const authenticateWithEmailOtp = async ({ email }: { email: string }) => {
//     return emailOtpServices.loginWithEmailOTP({ email });
// };

// /**
//  * Verify email OTP and create a session
//  * @param params - Verification parameters
//  * @param params.token - Token from authenticateWithEmailOtp
//  * @param params.otp - OTP code
//  * @param params.ipAddress - User's IP address (optional)
//  * @param params.userAgent - User's browser/device info (optional)
//  * @returns Session data if successful
//  */
// export const verifyEmailOtpAndCreateSession = async ({
//     token,
//     otp,
//     ipAddress,
//     userAgent,
// }: {
//     token: string;
//     otp: string;
//     ipAddress?: string;
//     userAgent?: string;
// }) => {
//     // Verify the OTP
//     const isValid = await emailOtpServices.verifyEmailOtp({ token, otp });

//     if (!isValid) {
//         throw errorFactory.createAuthError({
//             message: 'Invalid or expired OTP',
//             code: 'AUTH.OTP_INVALID',
//             statusCode: 401,
//         });
//     }

//     // Get the token record to find the user's email
//     const otpRecord = await verificationTokenQueries.getVerificationTokenRecordByToken({ token });

//     if (!otpRecord || !otpRecord.email) {
//         throw errorFactory.createAuthError({
//             message: 'Invalid token',
//             code: 'AUTH.OTP_INVALID',
//             statusCode: 401,
//         });
//     }

//     // Find or create the user
//     let user = await userQueries.getUserRecordByEmail({ email: otpRecord.email });

//     if (!user) {
//         // Create a new user
//         const newUser = await userQueries.createUserRecord({
//             email: otpRecord.email,
//             firstName: '',
//             lastName: '',
//             // Email is verified since they received the OTP, but we'll handle this separately
//         });

//         user = await userQueries.getUserRecordById({ userId: newUser.id });

//         if (!user) {
//             throw errorFactory.createServiceError({
//                 message: 'Failed to create user',
//                 code: 'INTERNAL_SERVER_ERROR',
//                 statusCode: 500,
//             });
//         }
//     }

//     // Create a session
//     const expiresAt = new Date();
//     expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

//     const sessionData: z.infer<typeof InsertSessionSchema> = {
//         userId: user.id,
//         expiresAt,
//         ipAddress,
//         userAgent,
//     };

//     const session = await sessionServices.createSession(sessionData);

//     return {
//         user,
//         session,
//     };
// };

// /**
//  * Authenticate with OAuth
//  * @param params - OAuth authentication parameters
//  * @param params.provider - OAuth provider (github or google)
//  * @param params.providerAccountId - Provider's account ID
//  * @param params.userData - User data from the provider
//  * @param params.userData.email - User's email
//  * @param params.userData.name - User's name (optional)
//  * @param params.userData.image - User's profile image (optional)
//  * @param params.ipAddress - User's IP address (optional)
//  * @param params.userAgent - User's browser/device info (optional)
//  * @returns Session data if successful
//  */
// export const authenticateWithOAuth = async ({
//     provider,
//     providerAccountId,
//     userData,
//     ipAddress,
//     userAgent,
// }: {
//     provider: 'github' | 'google';
//     providerAccountId: string;
//     userData: {
//         email: string;
//         name?: string;
//         image?: string;
//     };
//     ipAddress?: string;
//     userAgent?: string;
// }) => {
//     // Check if the account exists
//     const account = await oauthServices.getOAuthAccount({
//         provider,
//         providerAccountId,
//     });

//     let user;

//     if (account) {
//         // Get the user
//         user = await userQueries.getUserRecordById({ userId: account.userId });

//         if (!user) {
//             throw errorFactory.createAuthError({
//                 message: 'User not found',
//                 code: 'AUTH.USER_NOT_FOUND',
//                 statusCode: 404,
//             });
//         }
//     } else {
//         // Check if a user with this email exists
//         user = await userQueries.getUserRecordByEmail({ email: userData.email });

//         if (user) {
//             // Link the account to the existing user
//             await oauthServices.linkOAuthAccount({
//                 userId: user.id,
//                 provider,
//                 providerAccountId,
//                 data: {},
//             });
//         } else {
//             // Create a new user
//             const nameParts = userData.name?.split(' ') || ['', ''];
//             const firstName = nameParts[0] || '';
//             const lastName = nameParts.slice(1).join(' ') || '';

//             const newUser = await userQueries.createUserRecord({
//                 email: userData.email,
//                 firstName,
//                 lastName,
//                 image: userData.image,
//                 // Email is verified through OAuth, but we'll handle this separately
//             });

//             // Link the account
//             await oauthServices.linkOAuthAccount({
//                 userId: newUser.id,
//                 provider,
//                 providerAccountId,
//                 data: {},
//             });

//             user = await userQueries.getUserRecordById({ userId: newUser.id });
//         }
//     }

//     if (!user) {
//         throw errorFactory.createAuthError({
//             message: 'User not found',
//             code: 'AUTH.USER_NOT_FOUND',
//             statusCode: 404,
//         });
//     }

//     // Create a session
//     const expiresAt = new Date();
//     expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

//     const sessionData: z.infer<typeof InsertSessionSchema> = {
//         userId: user.id,
//         expiresAt,
//         ipAddress,
//         userAgent,
//     };

//     const session = await sessionServices.createSession(sessionData);

//     return {
//         user,
//         session,
//     };
// };

/**
 * Get the user from the context
 * @param c - The context
 * @returns The user
 */
export const getUserFromContext = (c: Context) => {
    const user = c.get('user');
    if (!user) {
        // remove session cookie

        clearCookie(c, 'SESSION');

        throw errorFactory.createAuthError({
            message: 'User not found',
            code: 'AUTH.USER_NOT_IN_CONTEXT',
        });
    }
    return user;
};
