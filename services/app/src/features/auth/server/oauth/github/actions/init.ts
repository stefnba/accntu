import { db } from '@db';
import { github } from '@features/auth/server/oauth/github/provider';
import type {
    GitHubEmail,
    GitHubUser
} from '@features/auth/server/oauth/github/types';
import { createUser } from '@features/user/server/actions';
import { generateState } from 'arctic';

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
