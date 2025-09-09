import { RouteHandler } from '@/server/lib/route/handler';
import { Context, Env } from 'hono';

export const routeHandler = <TContext extends Context>(c: TContext) => {
    return new RouteHandler<TContext extends Context<Env, string, infer I> ? I : never, TContext>(
        c
    );
};
