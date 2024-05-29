import { TFieldErrors } from './types';

export class ValidationError extends Error {
    fieldErrors: TFieldErrors<any>;

    constructor(fieldErrors: TFieldErrors<any>) {
        super('dafdssadf');
        this.name = 'ValidationError';
        this.fieldErrors = fieldErrors;
    }
}
