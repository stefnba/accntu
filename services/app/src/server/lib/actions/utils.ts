import { User } from 'lucia';

import {
    Action,
    ActionEmpty,
    ActionWithInputData,
    ActionWithUser,
    ActionWithUserAndInputData
} from './types';

export const isActionWithUserAndInputData = <D, R>(
    action: Action<D, R>,
    input?: D,
    user?: User
): action is ActionWithUserAndInputData<D, R> => {
    return !!input && !!user;
};

export const isActionWithInputData = <D, R>(
    action: Action<D, R>,
    input?: D,
    user?: User
): action is ActionWithInputData<D, R> => {
    return !!input && !user;
};

export const isActionWithUser = <D, R>(
    action: Action<D, R>,
    input?: D,
    user?: User
): action is ActionWithUser<R> => {
    return !input && !!user;
};
export const isActionEmpty = <D, R>(
    action: Action<D, R>,
    input?: D,
    user?: User
): action is ActionEmpty<R> => {
    return !input && !user;
};
