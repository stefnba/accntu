import { Context } from 'hono';
import { StatusCode } from 'hono/utils/http-status';

interface ErrorDetails {
    message: string;
    status: StatusCode;
}

export class ApiResponseException<T extends Record<string, ErrorDetails>> {
    constructor(public errors: T) {}

    getError<K extends keyof T>(
        key: K
    ): { error: K; message: string; status: T[K]['status'] } {
        const errorDetails = this.errors[key];
        return {
            error: key,
            message: errorDetails.message,
            status: errorDetails.status
        };
    }

    /**
     * Send a JSON response with the error message.
     * @param c Hono Context.
     * @param key error key.
     */
    json<K extends keyof T>(c: Context, key: K) {
        const { status, error, message } = this.getError(key);

        return c.json({ error, message }, status);
    }
}
