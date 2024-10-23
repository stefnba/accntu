import { ActionError } from '@server/lib/error';

export class S3UploadError extends ActionError {
    name = 'S3UploadError';

    constructor(message: string) {
        super(message);

        self.name = 'S3UploadError';
    }
}
