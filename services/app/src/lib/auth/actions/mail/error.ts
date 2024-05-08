import { CustomError } from '@/lib/error/custom';
import { logger } from '@/logger';

type TAuthError =
    | {
          publicMessage: string;
          message: string;
      }
    | string;

/**
 * AuthError for invalid authentication like wrong password, OTP code.
 */
export class AuthError extends CustomError {
    publicMessage: string;
    extra?: Record<string, any>;

    constructor(message: TAuthError, extra?: Record<string, any>) {
        if (typeof message === 'string') {
            super(message);
            this.publicMessage = message;
        } else {
            super(message.message);
            this.publicMessage = message.publicMessage;
        }

        this.extra = extra;
        this.name = 'AuthError';
    }

    log() {
        // issue a warning for auth errors
        logger.warning(this.message, { error: this.name, ...this.extra });
    }
}
