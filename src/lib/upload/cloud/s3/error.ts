export class S3UploadError extends Error {
    name = 'S3UploadError';

    constructor(message: string) {
        super(message);

        self.name = 'S3UploadError';
    }
}
