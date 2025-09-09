import { getUser } from '@/lib/auth';
import { AuthContext } from '@/lib/auth/server/types';
import { handleRouteError } from '@/server/lib/error';
import { SuccessResponseCode } from '@/server/lib/error/handler/route';
import { getAllValidated } from '@/server/lib/route/helpers';
import { ExtractCoreValidatedData } from '@/server/lib/route/types';
import { Context, Env, Input, TypedResponse } from 'hono';
import { JSONValue } from 'hono/utils/types';

export class RouteHandler<I extends Input, TContext extends Context<Env, string, I>> {
    constructor(protected readonly c: TContext) {}

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
    async handle<T extends JSONValue>(
        handler: (input: {
            context: TContext;
            validatedInput: ExtractCoreValidatedData<I>;
        }) => Promise<T>
    ) {
        try {
            const validatedInput = getAllValidated<I>(this.c);

            const result = await handler({
                context: this.c,
                validatedInput,
            });

            // TypeScript tries to infer the full complex type chain through Hono's JSON response system, leading to infinite type recursion. But when we create an explicit response object
            // with a defined structure, TypeScript can work with the concrete type.
            return this.c.json(result, 200) as TypedResponse<T, SuccessResponseCode, 'json'>;
        } catch (error: unknown) {
            return handleRouteError(this.c, error);
        }
    }

    /**
     * Handle a mutation route with error handling and standardized response
     * @param handler - The handler function to execute
     * @returns A typed response with { success: true, data } format and 201 status
     * @example
     * ```
     * const handler = routeHandler.handleMutation(async ({ validatedInput }) => service.create({ data: validatedInput.json }));
     * ```
     */
    async handleMutation<T extends JSONValue | void>(
        handler: (input: {
            context: TContext;
            validatedInput: ExtractCoreValidatedData<I>;
        }) => Promise<T>
    ) {
        try {
            const validatedInput = getAllValidated<I>(this.c);
            const result = await handler({
                context: this.c,
                validatedInput,
            });
            const response: { success: true; data: T } = {
                success: true as const,
                data: result,
            };

            return this.c.json(response, 201);
        } catch (error: unknown) {
            return handleRouteError(this.c, error);
        }
    }
}

class RouteHandlerWithUser<
    I extends Input,
    TContext extends Context<Env, string, I>,
    TUser extends NonNullable<AuthContext['user']> = NonNullable<AuthContext['user']>,
> extends RouteHandler<I, TContext> {
    constructor(
        c: TContext,
        private readonly user: TUser
    ) {
        super(c);
    }

    /**
     * Check if the user is an admin and return a new route handler with the admin user
     * @returns A new route handler with the admin user
     * @example
     * ```
     * const handler = routeHandler.withAdmin().handle(async ({ user }) => service.getMany({ userId: user.id }));
     * ```
     */
    withAdmin() {
        const user = getUser(this.c);
        if (!user || user.role !== 'admin') {
            throw new Error('Admin access required');
        }
        return new RouteHandlerWithUser<I, TContext>(this.c, user);
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
    handle<T extends JSONValue>(
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

    /**
     * Handle a mutation route with error handling, authenticated user, and standardized response
     * @param handler - The handler function to execute
     * @returns A typed response with { success: true, data } format and 201 status
     * @example
     * ```
     * const handler = routeHandler.withUser().handleMutation(async ({ user, validatedInput }) =>
     *     service.create({ data: validatedInput.json, userId: user.id })
     * );
     * ```
     */
    handleMutation<T extends JSONValue | void>(
        handler: (input: {
            context: TContext;
            validatedInput: ExtractCoreValidatedData<I>;
            user: TUser;
            userId: TUser['id'];
        }) => Promise<T>
    ) {
        return super.handleMutation((input) =>
            handler({ ...input, user: this.user, userId: this.user.id })
        );
    }
}
