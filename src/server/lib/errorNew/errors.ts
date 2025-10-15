import { AppError, TDomainErrorParams } from '@/server/lib/errorNew/error/base';

export class ValidationError extends AppError {
    constructor(params: TDomainErrorParams<'VALIDATION'>) {
        super({
            ...params,
            category: 'VALIDATION',
        });
    }
}

export class AuthError extends AppError {
    constructor(params: TDomainErrorParams<'AUTH'>) {
        super({
            ...params,
            category: 'AUTH',
        });
    }
}

export class ResourceError extends AppError {
    constructor(params: TDomainErrorParams<'RESOURCE'>) {
        super({
            ...params,
            category: 'RESOURCE',
        });
    }
}

export class OperationError extends AppError {
    constructor(params: TDomainErrorParams<'OPERATION'>) {
        super({
            ...params,
            category: 'OPERATION',
        });
    }
}

export class PermissionError extends AppError {
    constructor(params: TDomainErrorParams<'PERMISSION'>) {
        super({
            ...params,
            category: 'PERMISSION',
        });
    }
}

export class ServerError extends AppError {
    constructor(params: TDomainErrorParams<'SERVER'>) {
        super({
            ...params,
            category: 'SERVER',
        });
    }
}
