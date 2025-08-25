import { typedKeys } from '@/lib/utils';

/**
 * Extract the query functions from the query config object
 */
type ExtractQueryFns<T extends QueriesConfig> = {
    [K in keyof T]: T[K]['fn'];
};

/**
 * The function signature of the query function
 */
type QueryFn = (...args: any[]) => any;

type QueryConfigObject = {
    fn: QueryFn;
    operation: string;
};

type QueriesConfig = Record<string, QueryConfigObject>;

// ================================

function wrapper<T extends QueriesConfig>(data: T): ExtractQueryFns<T> {
    // Build result step by step in a way TypeScript can track
    const result = {} as ExtractQueryFns<T>;

    // Use type-safe iteration with proper key typing
    typedKeys(data).forEach((key) => {
        result[key] = data[key].fn;
    });

    return result;
}

// ================================
// Usage
// ================================

const result = wrapper({
    a: {
        fn: () => ({ a: 1 }),
        operation: 'a',
    },
    b: {
        fn: () => ({ b: 'string' }),
        operation: 'b',
    },
    c: {
        fn: (x: string) => `Hello ${x}`,
        operation: 'c',
    },
} as const);

// Full type safety - these all work with proper IntelliSense:
const aResult = result.a(); // Type: { a: number }
const bResult = result.b(); // Type: { b: number }
const cResult = result.c('World'); // Type: string

// Verify types
console.log(aResult.a); // ✅ TypeScript knows this is number
console.log(bResult.b); // ✅ TypeScript knows this is number
console.log(cResult.length); // ✅ TypeScript knows this is string
