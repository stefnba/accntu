declare namespace NodeJS {
    export interface ProcessEnv {
        // General
        NODE_ENV: 'development' | 'production';
        // Database
        DATABASE_URL: string;
        // Server
        NEXT_PUBLIC_URL: string;
        // Auth
        // OAuth
        GITHUB_CLIENT_ID: string;
        GITHUB_CLIENT_SECRET: string;
        // AWS
        AWS_ACCESS_KEY: string;
        AWS_SECRET_ACCESS_KEY: string;
        AWS_BUCKET_REGION: string;
        AWS_BUCKET_NAME_PUBLIC_UPLOAD: string;
        AWS_BUCKET_NAME_PRIVATE_UPLOAD: string;
    }
}
