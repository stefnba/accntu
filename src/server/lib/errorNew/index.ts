// ============================================
// PUBLIC API
// ============================================

// Core error class
export { AppError } from './base';

// Domain error classes
export {
    AuthError,
    OperationError,
    PermissionError,
    ResourceError,
    ServerError,
    ValidationError,
} from './errors';

// Factory functions and classes
export {
    AuthErrors,
    makeError,
    OperationErrors,
    PermissionErrors,
    QueryErrors,
    ResourceErrors,
    ServerErrors,
    ValidationErrors,
} from './factories';

// Registry
export { ERROR_REGISTRY } from './registry';
export type { TErrorCategory, TErrorCodeByCategory, TErrorKeys } from './registry';
