export type TActionStatus = 'IDLE' | 'LOADING' | 'ERROR' | 'SUCCESS';

export type TFetchError = {
    type: 'VALIDATION' | 'SERVER' | 'ACTION';
    message: string;
};
