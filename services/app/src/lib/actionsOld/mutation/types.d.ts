/**
 * Params for action without user object.
 */
export type TActionParams<TData> = {
    data: TData;
};

export type TActionUser = {
    user: User;
};

/**
 * Params for action with user object.
 */
export type TActionParamsWithUser<TData> = TActionParams<TData> & TActionUser;

/**
 * Action with user object.
 */
export type TActionWithUser<TData, TReturn> = ({
    user,
    data
}: TActionParamsWithUser<TData>) => Promise<TReturn>;

/**
 * Action without user object.
 */
export type TActionWithoutUser<TData, TReturn> = ({
    data
}: TActionParams<TData>) => Promise<TReturn>;

/**
 * Options for createMutation function.
 */
export type TCreateMutationOptions = {
    auth: 'public' | 'protected';
};

/**
 * Return type of createMutation function. It's a function which takes data as input and returns a TActionReturnObject promise.
 */
export type CreateMutationReturn<TDataInput, TActionReturnData> = (
    data: TDataInput
) => Promise<TActionReturnObject<TDataInput, TActionReturnData>>;

/**
 * Return type of createFetch function. It's a function which takes data as input and returns a TActionReturnObject promise.
 */
export type CreateFetchReturn<TDataInput, TActionReturnData> = (
    params: TDataInput
) => Promise<TActionReturnObject<TDataInput, TActionReturnData>>;
