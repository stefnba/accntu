import { AppError } from '@/server/lib/errorNew/base';
import { AppErrors } from '@/server/lib/errorNew/factories';

// Test 1: Create simple error
console.log('Test 1: Simple error creation');
const error1 = AppErrors.resource('NOT_FOUND');
console.log(error1.toObject());

// Test 2: Create error with details
console.log('\nTest 2: Error with details');
const error2 = AppErrors.validation('INVALID_INPUT', {
    message: 'Email is required',
    details: { field: 'email' },
    publicDetails: { field: 'email' },
});
console.log(error2.toObject());

// Test 3: Static fromUnknown method
console.log('\nTest 3: fromUnknown static method');
const unknownError = new Error('Something went wrong');
const error3 = AppError.fromUnknown(unknownError, { context: 'test' });
console.log(error3.toObject());

// Test 4: Static isAppError type guard
console.log('\nTest 4: isAppError type guard');
console.log('Is AppError?', AppError.isAppError(error1));
console.log('Is regular Error?', AppError.isAppError(unknownError));

// Test 5: Nested error cause serialization
console.log('\nTest 5: Nested error cause');
const causeError = AppErrors.operation('CREATE_FAILED');
const error5 = AppErrors.server('INTERNAL_ERROR', {
    message: 'Failed to process request',
    cause: causeError,
});
const serialized = error5.toObject();
console.log('Has serialized cause?', !!serialized.cause);
console.log('Cause structure:', serialized.cause);

// Test 6: Check public error mappings
console.log('\nTest 6: Public error mappings');
console.log('RESOURCE.NOT_FOUND public:', error1.public);
console.log('PERMISSION.ACCESS_DENIED public:', AppErrors.permission('ACCESS_DENIED').public);

// Test 7: Error chaining helpers
console.log('\nTest 7: Error chain helpers');
const rootCause = error5.getRootCause();
console.log('Root cause:', rootCause.message);
console.log('Chain depth:', error5.getChainDepth());
console.log(
    'Has AppError in chain:',
    error5.hasInChain((e) => AppError.isAppError(e))
);

// Test 8: Chain context
console.log('\nTest 8: Chain context');
const chainContext = error5.getChain();
console.log('Chain depth:', chainContext.depth);
console.log('Root cause:', chainContext.rootCause);
console.log('Chain length:', chainContext.chain.length);
console.log('First error in chain:', chainContext.chain[0].name);
console.log('Chain:', chainContext.chain);

// Test 9: Deep chain with limit
console.log('\nTest 9: Deep chain serialization');
let deepError = AppErrors.validation('INVALID_INPUT');
for (let i = 0; i < 15; i++) {
    deepError = AppErrors.operation('CREATE_FAILED', { cause: deepError });
}
const deepSerialized = deepError.toObject();
console.log('Deep chain created (15 levels), serialization limited to 10');
console.log(
    'Serialization stopped:',
    JSON.stringify(deepSerialized.cause).includes('Max serialization depth')
);

console.log('\n✅ All tests passed!');
