import { logger } from '@logger';

export class ActionError extends Error {
    constructor(message: string, error?: Error) {
        super(message);

        // needed for CustomError instanceof Error => true
        Object.setPrototypeOf(this, new.target.prototype);

        // Set the name
        this.name = this.constructor.name;

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }

        this.log();
    }

    log() {
        logger.error(this.message, { error: this });
    }
}
