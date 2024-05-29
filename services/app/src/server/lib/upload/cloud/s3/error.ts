import { CustomError } from '@server/lib/error';

export class S3UploadError extends CustomError {
    constructor(message: string) {
        super(message);

        self.name = 'S3UploadError';
    }
}
