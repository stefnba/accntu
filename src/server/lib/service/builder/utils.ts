import { ServiceFn } from '@/server/lib/service/factory/types';
import { validateExists } from '@/server/lib/service/handler/helpers';

type InferServiceInput<T> = T extends ServiceFn<infer I, any> ? I : never;
type InferServiceOutput<T> = T extends ServiceFn<any, infer O> ? O : never;

export function wrapServiceWithHandler<S extends ServiceFn<any, any>>(
    serviceFn: S,
    returnHandler: 'nonNull',
    operation?: string
): ServiceFn<InferServiceInput<S>, NonNullable<InferServiceOutput<S>>>;
export function wrapServiceWithHandler<S extends ServiceFn<any, any>>(
    serviceFn: S,
    returnHandler: 'nullable',
    operation?: string
): ServiceFn<InferServiceInput<S>, InferServiceOutput<S>>;
export function wrapServiceWithHandler<S extends ServiceFn<any, any>>(
    serviceFn: S,
    returnHandler: 'nonNull' | 'nullable',
    operation?: string
) {
    if (returnHandler === 'nonNull') {
        return async (input: InferServiceInput<S>) => {
            const result = await serviceFn(input);
            return validateExists(
                result as object | null,
                `${operation || 'Operation'}: Resource not found`
            );
        };
    }

    return serviceFn;
}
