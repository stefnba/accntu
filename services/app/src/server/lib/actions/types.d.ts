import { User } from 'lucia';
import { z } from 'zod';

type ActionWithUserAndInputData<D, R> = ({
    user,
    data
}: {
    user: User;
    data: D;
}) => Promise<R>;

type ActionWithInputData<D, R> = ({ data }: { data: D }) => Promise<R>;

type ActionWithUser<R> = ({ user }: { user: User }) => Promise<R>;

type ActionEmpty<R> = () => Promise<R>;

export type Action<D, R> =
    | ActionWithUserAndInputData<D, R>
    | ActionWithInputData<D, R>
    | ActionWithUser<R>
    | ActionEmpty<R>;

/**
 * Options for createMutation and createFetch function.
 */
export type TCreateActionOptions = {
    auth: 'public' | 'protected';
};

/**
 * Result of action function.
 */
export type TActionResult = {} | void;

/**
 * Zod field errors from input data validation.
 */
export type TFieldErrors<T> = {
    [K in keyof T]?: string[];
};

/**
 *
 */
export type TInputDataValidationReturn<TInput, TOutput> =
    | { fieldErrors: TFieldErrors<TInput> }
    | { validatedData: TOutput };
