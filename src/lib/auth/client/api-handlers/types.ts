import { Prettify } from 'better-auth';

/**
 * Valid reponse type for better-auth api functions
 */
type TBetterFetchData<T> = {
    data: T;
    error: null;
};

/**
 * Valid error type for better-auth api functions
 */
type BetterFetchError<E> = {
    data: null;
    error: Prettify<
        (E extends Record<string, any>
            ? E
            : {
                  message?: string;
              }) & {
            status: number;
            statusText: string;
        }
    >;
};

/**
 * Valid response type for better-auth api functions, either a data object or an error object
 */
type BetterFetchResponse<T> =
    | TBetterFetchData<T>
    | BetterFetchError<{
          code?: string;
          message?: string;
      }>;

/**
 * Function signature for better-auth api functions
 */
export type TBetterAuthApiFn<TResult = any> = (args: any) => Promise<BetterFetchResponse<TResult>>;

/**
 * Infer the response type for a better-auth api function
 */
export type InferBetterFetchResponse<T> =
    T extends TBetterAuthApiFn<infer TResult> ? TResult : never;

/**
 * Infer the parameters type for a better-auth api function
 */
export type InferBetterAuthParams<T extends TBetterAuthApiFn> = Parameters<T>[0];
