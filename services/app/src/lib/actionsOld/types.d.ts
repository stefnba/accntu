import { User } from 'lucia';
import { z } from 'zod';

export type TFieldErrors<T> = {
    [K in keyof T]?: string[];
};

export type TValidateInputData<TInput, TOutput> =
    | { fieldErrors: TFieldErrors<TInput> }
    | { validatedData: TOutput };

/**
 * Options for createMutation and createFetch function.
 */
export type TCreateActionOptions = {
    auth: 'public' | 'protected';
};

/**
 * Return object of action function. Possible statuses are
 * - SUCCESS: Action was successful and data is returned.
 * - ERROR: Action failed and error message is returned.
 * - VALIDATION_ERROR: Input data validation failed and error message with details on failed validation is returned.
 */
export type TActionReturnObject<TInput, TReturn> =
    | {
          status: 'SUCCESS';
          data: TReturn;
      }
    | { status: 'ERROR'; error: string }
    | {
          status: 'VALIDATION_ERROR';
          error: TFieldErrors<TInput>;
      };

export type ActionSchema<TDataOutput, TDataInput> = z.Schema<
    TDataOutput,
    z.ZodTypeDef,
    TDataInput
>;

type ActionWithUserAndData<D, R> = ({
    data,
    user
}: {
    data: D;
    user: User;
}) => Promise<R>;
type ActionDataOnly<D, R> = ({ data }: { data: D }) => Promise<R>;
type ActionUserOnly<R> = ({ user }: { user: User }) => Promise<R>;
type ActionEmpty<R> = () => Promise<R>;

export type ExecuteAction<D, R> = ActionDataOnly<D, R> &
    ActionUserOnly<R> &
    ActionEmpty<R> &
    ActionWithUserAndData<D, R>;
