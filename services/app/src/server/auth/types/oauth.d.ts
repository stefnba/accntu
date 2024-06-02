export interface GitHubUser {
    id: string;
    login: string;
    image: string;
    name: string;
}

export interface GitHubEmail {
    email: string;
    primary: boolean;
    verified: boolean;
    visibility?: string;
}

export interface IOAuthProvider<P> {
    providerId: OAuthProvider;
    provider: P;
    cookieName: string;
}
