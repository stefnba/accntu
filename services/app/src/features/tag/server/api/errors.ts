import { ApiResponseException } from '@server/lib/error/api';

export const createTagExceptions = new ApiResponseException({
    FAILURE_TO_CREATE: {
        message: 'Tag could not be created',
        status: 400
    },
    DUPLICATE: {
        message: 'Tag already exists',
        status: 400
    }
});
