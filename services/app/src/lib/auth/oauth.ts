import { OAuthProvider } from '@prisma/client';
import { GitHub } from 'arctic';

interface IOAuthProvider<P> {
    providerId: OAuthProvider;
    provider: P;
    cookieName: string;
}

export const github: IOAuthProvider<GitHub> = {
    providerId: OAuthProvider.GITHUB,
    cookieName: 'github_oauth_state',
    provider: new GitHub(
        process.env.GITHUB_CLIENT_ID!,
        process.env.GITHUB_CLIENT_SECRET!
    )
};
