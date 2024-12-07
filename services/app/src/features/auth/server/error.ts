import { logger } from '@logger';
import { ActionError } from '@server/lib/error';

type TAuthError =
    | {
          internalMessage: string;
          message: 'Invalid code';
      }
    | string;

/**
 * AuthError for invalid authentication like wrong password, OTP code.
 */
export class AuthError extends ActionError {
    internalMessage: string;
    extra?: Record<string, any>;

    constructor(message: TAuthError, extra?: Record<string, any>) {
        if (typeof message === 'string') {
            super(message);
            this.internalMessage = message;
        } else {
            super(message.message);
            this.internalMessage = message.internalMessage;
        }

        this.extra = extra;
        this.name = 'AuthError';
    }

    log() {
        // issue a warning for auth errors
        logger.warning(this.message, { error: this.name, ...this.extra });
    }
}
