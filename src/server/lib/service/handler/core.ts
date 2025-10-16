import { AppError } from '@/server/lib/error';
import { validateExists } from '@/server/lib/service/handler/helpers';

export class ServiceHandler<T extends object> {
    private result: Promise<T | null>;

    constructor(handlerFnOrPromise: (() => Promise<T | null>) | Promise<T | null>) {
        this.result = this._handle(handlerFnOrPromise);
    }

    /**
     * Handle a service function or promise
     * @param handlerFnOrPromise - The function to handle or promise to await
     * @returns The service handler
     */
    private async _handle(
        handlerFnOrPromise: (() => Promise<T | null>) | Promise<T | null>
    ): Promise<T | null> {
        try {
            const result =
                typeof handlerFnOrPromise === 'function'
                    ? await handlerFnOrPromise()
                    : await handlerFnOrPromise;
            return result;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw error;
        }
    }

    /**
     * Handle a service function or promise
     * @param handlerFnOrPromise - The function to handle or promise to await
     * @returns The service handler
     */
    static handle<T extends object>(
        handlerFnOrPromise: (() => Promise<T | null>) | Promise<T | null>
    ): ServiceHandler<T> {
        return new ServiceHandler(handlerFnOrPromise);
    }

    /**
     * Make the class awaitable - returns T | null by default
     * @param onfulfilled - The function to call if the result is not null
     * @param onrejected - The function to call if the result is null
     * @returns The result
     */
    private then<TResult1 = T | null, TResult2 = never>(
        onfulfilled?: ((value: T | null) => TResult1 | PromiseLike<TResult1>) | null,
        onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
    ): Promise<TResult1 | TResult2> {
        return this.result.then(onfulfilled, onrejected);
    }

    /**
     * Validate if the result exists. If not, throw an error.
     * @param errorMessage - The error message to throw if the result does not exist
     * @returns The result
     */
    async validateExists(errorMessage: string = 'Resource not found'): Promise<T> {
        const result = await this.result;
        return validateExists(result, errorMessage);
    }

    /**
     * Validate if the result is an array and has a minimum length
     * @param minLength - The minimum length of the array
     * @param errorMessage - The error message to throw if the result is not an array or has a minimum length
     * @returns The result
     */
    async validateLength(
        minLength: number = 1,
        errorMessage: string = 'Resource not found'
    ): Promise<T> {
        const result = await this.result;

        if (!Array.isArray(result)) {
            throw new Error(errorMessage);
        }

        if (result.length < minLength) {
            throw new Error(errorMessage);
        }
        return result;
    }
}

/**
 * Handle a service function or promise
 * @param handlerFnOrPromise - The function to handle or promise to await
 * @returns The service handler
 */
export const serviceHandler = async <T extends object>(
    handlerFnOrPromise: (() => Promise<T | null>) | Promise<T | null>
) => {
    return await new ServiceHandler(handlerFnOrPromise);
};

/**
 * Handle a service function or promise with validate exists
 * @param handlerFnOrPromise - The function to handle or promise to await
 * @returns The service handler
 */
export const serviceHandlerWithValidateExists = async <T extends object>(
    handlerFnOrPromise: (() => Promise<T | null>) | Promise<T | null>
) => {
    return await ServiceHandler.handle(handlerFnOrPromise).validateExists();
};
