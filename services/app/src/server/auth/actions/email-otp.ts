'use server';

import { db, schema as dbSchema } from '@/server/db/client';
import { logger } from '@/server/lib/logging/logger';
import { createUser } from '@/server/services/user';
import { EMAIL_OTP_LOGIN } from '@auth/config';
import { AuthError } from '@auth/error';
import { generateEmailOTP } from '@auth/utils';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { TimeSpan, createDate } from 'oslo';

import { checkInvalidLoginAttempts } from './limit-logins';
import { makeLoginAttemptSuccess } from './login-record';

/**
 * Send a verification code to the user's email.
 */
export const requestEmailOTP = async (email: string) => {
    // delete all existing tokens for this email
    try {
        await db
            .delete(dbSchema.verificationToken)
            .where(eq(dbSchema.verificationToken.identifier, email));

        // check if user exists
        const user = await db.query.user.findFirst({
            where: (fields, { eq }) => eq(fields.email, email)
        });

        const code = generateEmailOTP();
        const token = crypto.randomBytes(128).toString('base64url');

        // generate token in db
        await db.insert(dbSchema.verificationToken).values({
            identifier: email,
            code,
            token,
            expiresAt: createDate(new TimeSpan(EMAIL_OTP_LOGIN.EXPIRATION, 'm'))
        });

        console.log({ code });

        // todo send email
        logger.info('OTP code sent', { email });

        return {
            success: true,
            token,
            userId: user?.id
        };
    } catch (error: any) {
        logger.error('Error logging in with email', error);
        throw new Error(
            'An error occurred while logging in. Please try again.'
        );
    }
};

interface IVerifyEmailOTP {
    code: string;
    verificationToken?: string;
    loginAttemptToken?: string;
}

/**
 * Verify the user's email with the given code.
 * @param code - The code to verify.
 * @param verificationToken - The verification token that is saved in db together with the code.
 * @param loginAttemptToken - The login attempt token.
 */
export const verifyEmailOTP = async ({
    code,
    verificationToken,
    loginAttemptToken
}: IVerifyEmailOTP) => {
    // we can't proceed without a token
    if (!verificationToken) {
        throw new AuthError({
            message: 'Invalid code',
            internalMessage: 'No verification token found'
        });
    }

    const verificationRecord = await db.query.verificationToken.findFirst({
        where: (fields, { eq, and, gte }) =>
            and(
                eq(fields.token, verificationToken),
                gte(fields.expiresAt, new Date())
            )
    });

    // record not found, e.g. because expired or invalid token
    if (!verificationRecord) {
        throw new AuthError(
            {
                message: 'Invalid code',
                internalMessage:
                    'No verification record found for specified token'
            },
            {
                token: verificationToken
            }
        );
    }

    // check if code is valid
    if (verificationRecord.code !== code) {
        // check if login attempt is for existing user
        const user = await db.query.user.findFirst({
            where: (fields, { eq }) =>
                eq(fields.email, verificationRecord.identifier)
        });

        await checkInvalidLoginAttempts(user);

        // user exists
        throw new AuthError({
            message: 'Invalid code',
            internalMessage: 'Invalid OTP code entered'
        });
    }

    // code is now validated going forward
    // invalidate code for given identifier
    await db
        .delete(dbSchema.verificationToken)
        .where(
            eq(
                dbSchema.verificationToken.identifier,
                verificationRecord.identifier
            )
        );

    // check if user exists already based on email and identifier saved in verification record
    let user = await db.query.user.findFirst({
        columns: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            image: true
        },
        where: (fields, { eq }) =>
            eq(fields.email, verificationRecord.identifier)
    });

    // user exists already
    if (user) {
        // reset login attempts
        await db
            .update(dbSchema.user)
            .set({
                loginAttempts: 0
            })
            .where(eq(dbSchema.user.id, user.id));
    }
    // user does not exist
    else {
        // create new user
        user = await createUser({
            email: verificationRecord.identifier
        });
    }

    // update login attempt to success
    await makeLoginAttemptSuccess(loginAttemptToken);

    return {
        success: true,
        userId: user.id
    };
};
