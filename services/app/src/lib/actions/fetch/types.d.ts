import { TFieldErrors } from '../types';

/**
 * Return object of fetch function. Possible statuses are
 * - SUCCESS: Action was successful and data is returned.
 * - ERROR: Action failed and error message is returned.
 * - VALIDATION_ERROR: Input data validation failed and error message with details on failed validation is returned.
 */
export type TCreateFetchReturn<TInput, TReturn> =
    | {
          status: 'SUCCESS';
          data: TReturn;
          error?: undefined;
          isSuccess: true;
          isError: false;
      }
    | {
          status: 'ERROR';
          error: string;
          data?: undefined;
          isSuccess: false;
          isError: true;
      }
    | {
          status: 'VALIDATION_ERROR';
          error: TFieldErrors<TInput>;
          data?: undefined;
          isSuccess: false;
          isError: true;
      };
