import { GitHub, Google } from 'arctic';
// import { env } from 'process';

// Initialize OAuth clients
export const github = new GitHub(
    process.env.GITHUB_CLIENT_ID!,
    process.env.GITHUB_CLIENT_SECRET!,
    null
);

export interface GitHubUser {
    id: string;
    login: string;
    avatar_url: string;
    name: string;
}

export interface GitHubEmail {
    email: string;
    primary: boolean;
    verified: boolean;
    visibility?: string;
}

export const google = new Google(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    `${process.env.NEXT_PUBLIC_APP_URL}/auth/google/callback`
);
