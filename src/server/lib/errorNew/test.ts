import { typedEntries } from '@/lib/utils';
import { ContentfulStatusCode } from 'hono/utils/http-status';

type TErrorRegistryDefinition = Readonly<{
    message?: string;
    httpStatus?: ContentfulStatusCode;
}>;

type TErrorRegistryObject = Readonly<
    Record<string, Readonly<Record<string, TErrorRegistryDefinition>>>
>;

type InferErrorKeys<R extends TErrorRegistryObject> = {
    [K in keyof R & string]: { [S in keyof R[K] & string]: `${K}.${S}` }[keyof R[K] & string];
}[keyof R & string];

type InferErrorKeysFromRegistry<C extends ErrorRegistry<TErrorRegistryObject>> = InferErrorKeys<
    C['registry']
>;

type InferErrorCategoriesFromRegistry<C extends ErrorRegistry<TErrorRegistryObject>> =
    keyof C['registry'];

type InferErrorDefinitionFromKey<
    R extends TErrorRegistryObject,
    K extends string,
> = K extends `${infer Category}.${infer Code}`
    ? Category extends keyof R
        ? Code extends keyof R[Category]
            ? R[Category][Code]
            : never
        : never
    : never;

export class ErrorRegistry<const R extends TErrorRegistryObject> {
    readonly registry: R;
    private cache?: Map<InferErrorKeys<R>, InferErrorDefinitionFromKey<R, InferErrorKeys<R>>>;

    constructor(obj: R) {
        this.registry = obj;
    }

    private buildMap() {
        const map = new Map<InferErrorKeys<R>, InferErrorDefinitionFromKey<R, InferErrorKeys<R>>>();
        for (const [category, i] of typedEntries(this.registry)) {
            for (const [code, def] of typedEntries(i)) {
                const key = `${String(category)}.${String(code)}` as InferErrorKeys<R>;
                map.set(key, def as InferErrorDefinitionFromKey<R, typeof key>);
            }
        }
        return map;
    }

    /**
     * Lazily builds the flattened cache
     */
    getMap(): Map<InferErrorKeys<R>, InferErrorDefinitionFromKey<R, InferErrorKeys<R>>> {
        if (!this.cache) this.cache = this.buildMap();
        return this.cache;
    }

    /**
     * Gets a value from the registry
     */
    get<K extends InferErrorKeys<R>>(key: K): InferErrorDefinitionFromKey<R, K> {
        const val = this.getMap().get(key);
        if (val === undefined) throw new Error(`Key ${String(key)} not found`);
        return val as InferErrorDefinitionFromKey<R, K>;
    }

    /**
     * Checks if a key exists in the registry
     */
    has<K extends InferErrorKeys<R>>(key: K): boolean {
        return this.getMap().has(key);
    }

    /**
     * Creates a new ErrorRegistry instance from an object
     */
    static fromObject<const U extends TErrorRegistryObject>(obj: U) {
        return new ErrorRegistry(obj);
    }
}

// Usage
const ERROR_REGISTRY = ErrorRegistry.fromObject({
    AUTH: { INVALID_TOKEN: { message: 'Invalid token', httpStatus: 401 } },
    VALIDATION: { INVALID_FORMAT: { message: 'Bad format', httpStatus: 400 } },
});

const a = ERROR_REGISTRY.get('AUTH.INVALID_TOKEN');
console.log(a);

type Keys = InferErrorKeysFromRegistry<typeof ERROR_REGISTRY>;
type Categories = InferErrorCategoriesFromRegistry<typeof ERROR_REGISTRY>;
