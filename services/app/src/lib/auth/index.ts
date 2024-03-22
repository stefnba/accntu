import { createSession, createSessionAndRedirect } from './authenticate';
import { lucia } from './lucia';
import * as oauth from './oauth';
import * as authRoutes from './routes';
import {
    getSession,
    getSessionIdFromCookie,
    getUser,
    validateRequest
} from './validate';

export {
    lucia,
    authRoutes,
    oauth,
    getSession,
    getUser,
    validateRequest,
    createSessionAndRedirect,
    createSession,
    getSessionIdFromCookie
};
