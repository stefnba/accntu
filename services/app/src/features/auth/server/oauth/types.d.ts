export interface IOAuthProvider<P> {
    providerId: OAuthProvider;
    provider: P;
    cookieName: string;
}
