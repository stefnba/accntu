import { getUser } from '@/lib/auth';
import { AuthContext } from '@/lib/auth/server/types';
import { handleRouteError } from '@/server/lib/error';
import { SuccessResponseCode } from '@/server/lib/error/handler/route';
import { getAllValidated } from '@/server/lib/route/helpers';
import { ExtractCoreValidatedData } from '@/server/lib/route/types';
import { Context, Input, TypedResponse } from 'hono';
import { ContentfulStatusCode } from 'hono/utils/http-status';
import { InvalidJSONValue, JSONValue, SimplifyDeepArray } from 'hono/utils/types';

export class RouteHandler<I extends Input, TContext extends Context<any, any, I>> {
    constructor(private readonly c: TContext) {}

    /**
     * Get the authenticated user from the context.
     * If the user is not authenticated, an error will be thrown.
     * If the user is authenticated, a new route handler with the user will be returned and the user can be accessed in the handler function.
     * @example
     * ```
     * const handler = routeHandler.withUser().handle(async ({ user }) => {
     *     return user;
     * });
     * ```
     */
    withUser() {
        const user = getUser(this.c);
        return new RouteHandlerWithUser<I, TContext>(this.c, user);
    }

    /**
     * Handle a route with error handling
     * @param handler - The handler function to execute
     *
     * @example
     * ```
     * const handler = routeHandler.handle(async () => service.getMany());
     * ```
     */
    async handle<T extends JSONValue | SimplifyDeepArray<unknown> | InvalidJSONValue>(
        handler: (input: {
            context: TContext;
            validatedInput: ExtractCoreValidatedData<I>;
        }) => Promise<T>,
        statusCode: ContentfulStatusCode = 200
    ) {
        try {
            const validatedInput = getAllValidated<I>(this.c);
            console.log('validatedInput', validatedInput);
            const result = await handler({
                context: this.c,
                validatedInput,
            });
            return this.c.json(result, statusCode) as TypedResponse<T, SuccessResponseCode, 'json'>;
        } catch (error: unknown) {
            return handleRouteError(this.c, error);
        }
    }

    async handleMutation<T extends JSONValue | SimplifyDeepArray<unknown> | InvalidJSONValue>(
        handler: (input: {
            context: TContext;
            validatedInput: ExtractCoreValidatedData<I>;
        }) => Promise<T>
    ) {
        return this.handle((input) => handler({ ...input }));
    }
}

class RouteHandlerWithUser<
    I extends Input,
    TContext extends Context<any, any, I>,
    TUser extends NonNullable<AuthContext['user']> = NonNullable<AuthContext['user']>,
> extends RouteHandler<I, TContext> {
    constructor(
        c: TContext,
        private readonly user: TUser
    ) {
        super(c);
    }

    /**
     * Handle a route with error handling and the authenticated user
     * @param handler - The handler function to execute
     * @returns The result of the handler function
     * @example
     * ```
     * const handler = routeHandler.withUser().handle(async ({ user }) => service.getMany({ userId: user.id }));
     * ```
     */
    handle<T extends JSONValue | SimplifyDeepArray<unknown> | InvalidJSONValue>(
        handler: (input: {
            context: TContext;
            validatedInput: ExtractCoreValidatedData<I>;
            user: TUser;
            userId: TUser['id'];
        }) => Promise<T>
    ) {
        return super.handle((input) =>
            handler({ ...input, user: this.user, userId: this.user.id })
        );
    }
}
