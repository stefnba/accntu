import { makeError } from '@/server/lib/errorNew/error/factory';

const test = () => {
    throw makeError('PERMISSION.ACCESS_DENIED');
};

test();
