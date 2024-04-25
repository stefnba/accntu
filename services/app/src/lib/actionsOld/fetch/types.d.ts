import { User } from 'lucia';

export type TFetchActionWithoutParams<TReturn> = ({
    user
}: {
    user: User;
}) => Promise<TReturn>;

type TFetchActionWithParams<TParams, TReturn> = ({
    params,
    user
}: {
    user: User;
    params: TParams;
}) => Promise<TReturn>;

export type TFetchAction<TParams, TReturn> =
    TFetchActionWithoutParams<TReturn> &
        TFetchActionWithParams<TParams, TReturn>;

export type TExecuteAction<TParams, TReturn> = ({
    data,
    user
}: {
    user?: User;
    data?: TParams;
}) => Promise<TReturn>;
