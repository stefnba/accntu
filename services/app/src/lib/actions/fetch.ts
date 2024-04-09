import { getUser } from '@/lib/auth';
import { User } from 'lucia';

type TAction<TData, TReturnData extends Record<string, any>> = (
    data: TData,
    user: User
) => Promise<TReturn<TReturnData>>;

type TReturn<R extends Record<string, any>> =
    | { error?: undefined; success: R }
    | { error: string; success?: undefined };

export function createAction<TData, TReturnData extends Record<string, any>>(
    action: TAction<TData, TReturnData>
) {
    return async (data: TData): Promise<TReturn<TReturnData>> => {
        const user = await getUser();

        const result = await action(data, user);

        if (result.error) {
            // todo log errors
            console.error('error in fetch', result.error);

            return { error: result.error };
        }

        return result;
    };
}
