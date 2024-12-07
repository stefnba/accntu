import { github } from '@auth/oauth/github';
import { GitHubEmail, GitHubUser } from '@auth/types/oauth';
import { db } from '@db';
import { createUser } from '@features/user/server/actions';
import { generateState } from 'arctic';

import { createOAuthAccount } from './oauth';

const { provider, providerId } = github;

/**
 * Redirect the user to the GitHub OAuth page.
 */
export const initiateGitHubOAuth = async () => {
    const state = generateState();
    const url = await provider.createAuthorizationURL(state, {
        scopes: ['user:email']
    });

    return { url: url.toString(), state };
};

/**
 * Callback to verify the GitHub OAuth response.
 */
export async function verifyGitHubOAuth(code: string) {
    const tokens = await provider.validateAuthorizationCode(code);
    const headers = {
        Authorization: `Bearer ${tokens.accessToken}`
    };

    const githubUserResponse = await fetch('https://api.github.com/user', {
        headers
    });
    const githubUser: GitHubUser = await githubUserResponse.json();

    const response = await fetch('https://api.github.com/user/emails', {
        headers
    });
    const githubEmail: GitHubEmail[] = await response.json();
    const primaryEmail =
        githubEmail.find((email) => email.primary)?.email ?? null;

    if (!primaryEmail) {
        // todo handle error
        throw new Error('No primary email found');
    }

    const providerUserId = String(githubUser.id);

    const oauthAccountRecord = await db.query.oauthAccount.findFirst({
        where: (fields, { eq, and }) =>
            and(
                eq(fields.providerUserId, providerUserId),
                eq(fields.provider, github.providerId)
            )
    });
    let userId = oauthAccountRecord?.userId;

    // user already authenticated with github
    if (!oauthAccountRecord || !userId) {
        // create user
        const user = await createUser({
            email: primaryEmail,
            firstName: githubUser.name,
            image: githubUser.avatar_url
        });

        // create OAuth account record
        await createOAuthAccount({
            provider: providerId,
            providerUserId,
            userId: user.id
        });

        userId = user.id;
    }

    return {
        userId,
        success: true
    };
}
