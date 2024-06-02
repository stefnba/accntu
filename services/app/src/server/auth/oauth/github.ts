import { IOAuthProvider } from '@auth/types/oauth';
import { OAuthProviderSchema } from '@db/schema';
import { GitHub } from 'arctic';

const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = process.env;

if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    throw new Error('Missing GitHub client ID or secret');
}

export const github: IOAuthProvider<GitHub> = {
    providerId: OAuthProviderSchema.Enum.GITHUB,
    cookieName: 'github_oauth_state',
    provider: new GitHub(GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET)
};
