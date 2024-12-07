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
