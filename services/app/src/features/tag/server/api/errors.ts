import { HTTPException } from 'hono/http-exception';

class TagNotFoundError extends Error {
    constructor(tagId: string) {
        super(`Tag with id ${tagId} not found`);
        this.name = 'TagNotFoundError';
    }
}

type Narrowable =
    | string
    | number
    | boolean
    | symbol
    | object
    | undefined
    | void
    | null
    | {};

function literalValues<N extends Narrowable, T extends Record<keyof T, N>>(
    obj: T
) {
    return obj;
}

type ErrorType = 'TEST' | 'NEIN';

type TErrorResponse<T extends ErrorType> = {
    error: T;
    message: string;
};

export class HonoApiError<T extends ErrorType> {
    erorr: T;

    constructor(error: T) {
        this.erorr = error;
        throw new HTTPException();
    }

    returnError(): {
        error: T;
        message: string;
    } {
        return {
            error: this.erorr,
            message: 'Error'
        };
    }
}

const narrow = literalValues({ foo: 'dddd', bar: true });
const narrowaa = { foo: 'dddd', bar: true };
