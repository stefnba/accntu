import { Provider } from '@prisma/client';
import { GitHub } from 'arctic';

interface OAuthProvider<P> {
    providerId: Provider;
    provider: P;
    cookieName: string;
}

export const github: OAuthProvider<GitHub> = {
    providerId: Provider.GITHUB,
    cookieName: 'github_oauth_state',
    provider: new GitHub(
        process.env.GITHUB_CLIENT_ID!,
        process.env.GITHUB_CLIENT_SECRET!
    )
};
