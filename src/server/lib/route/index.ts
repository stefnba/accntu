import { RouteHandler } from '@/server/lib/route/handler';
import { Context } from 'hono';

export const routeHandler = <TContext extends Context>(c: TContext) => {
    return new RouteHandler<TContext extends Context<any, any, infer I> ? I : never, TContext>(c);
};
