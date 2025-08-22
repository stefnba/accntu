import { InferFeatureQueryReturnTypes, TCustomQueries } from '@/server/lib/db/query/factory/types';
import { Table } from 'drizzle-orm';
import { BuildSchema } from 'drizzle-zod';

// ============================================================================
// Type Inference Helpers
// ============================================================================

/**
 * Infer return type from query function
 */
export type InferQuerySchemas<TQueryFn, TBaseSchema> = TQueryFn extends (
    baseSchema: TBaseSchema
) => infer R
    ? R
    : Record<string, never>;

/**
 * Infer return type from service function
 */
export type InferServiceSchemas<TServiceFn, TQuerySchemas> = TServiceFn extends (
    querySchemas: TQuerySchemas
) => infer R
    ? R
    : Record<string, never>;

/**
 * Infer return type from custom function
 */
export type InferCustomSchemas<TCustomFn, TBaseSchema, TQuerySchemas, TServiceSchemas> =
    TCustomFn extends (schemas: {
        baseSchema: TBaseSchema;
        querySchemas: TQuerySchemas;
        serviceSchemas: TServiceSchemas;
    }) => infer R
        ? R
        : Record<string, never>;

// ============================================================================
// Schema Configuration Types
// ============================================================================

/**
 * Three-layer schema configuration with full type inference
 */
export type TFeatureSchemaConfig<
    TFeature extends string,
    TQueries extends TCustomQueries,
    TTable extends Table,
    TBaseSchema extends BuildSchema<'select', TTable['_']['columns'], undefined>,
    TInputSchemas extends {
        query?: (baseSchema: TBaseSchema) => unknown;
        service?: (querySchemas: unknown) => unknown;
        custom?: (schemas: {
            baseSchema: TBaseSchema;
            querySchemas: unknown;
            serviceSchemas: unknown;
        }) => unknown;
    } = {
        query?: (baseSchema: TBaseSchema) => unknown;
        service?: (querySchemas: unknown) => unknown;
        custom?: (schemas: {
            baseSchema: TBaseSchema;
            querySchemas: unknown;
            serviceSchemas: unknown;
        }) => unknown;
    },
> = {
    feature: TFeature;
    queries: TQueries;
    table: TTable;
    inputSchemas: TInputSchemas;
};

// ============================================================================
// Result Types
// ============================================================================

/**
 * Infer complete schema result types from configuration
 */
export type InferFeatureSchemas<TInputSchemas, TBaseSchema> = TInputSchemas extends {
    query?: infer TQueryFn;
    service?: infer TServiceFn;
    custom?: infer TCustomFn;
}
    ? {
          query: InferQuerySchemas<TQueryFn, TBaseSchema>;
          service: InferServiceSchemas<TServiceFn, InferQuerySchemas<TQueryFn, TBaseSchema>>;
          custom: InferCustomSchemas<
              TCustomFn,
              TBaseSchema,
              InferQuerySchemas<TQueryFn, TBaseSchema>,
              InferServiceSchemas<TServiceFn, InferQuerySchemas<TQueryFn, TBaseSchema>>
          >;
      }
    : {
          query: Record<string, never>;
          service: Record<string, never>;
          custom: Record<string, never>;
      };

// ============================================================================
// Schemas Types
// ============================================================================

// ============================================================================
// Schema Types Inference
// ============================================================================

/**
 * 🔍 **Zod Schema Type Inferencer** - Extract TypeScript types from Zod schema records
 *
 * Transforms a record of Zod schemas into their corresponding TypeScript types.
 * This is the core utility that powers input type inference throughout the system.
 *
 * @template T - Record of Zod schemas to infer types from
 *
 * @example
 * ```typescript
 * const schemas = {
 *     create: z.object({ name: z.string(), email: z.string().email() }),
 *     update: z.object({ id: z.string(), name: z.string().optional() }),
 *     search: z.object({ query: z.string() }).partial(),
 * };
 *
 * type SchemaTypes = InferZodSchemaTypes<typeof schemas>;
 * // Result:
 * // {
 * //     create: { name: string; email: string };
 * //     update: { id: string; name?: string };
 * //     search: { query?: string };
 * // }
 *
 * // Use the inferred types
 * type CreateInput = SchemaTypes['create'];  // { name: string; email: string }
 * type UpdateInput = SchemaTypes['update'];  // { id: string; name?: string }
 * ```
 */
export type InferZodSchemaTypes<T extends Record<string, unknown>> = {
    [K in keyof T]: T[K] extends import('zod').ZodType<infer R> ? R : never;
};

/**
 * 🎯 **Complete Schema Type Inferencer** - Extract all types from createFeatureSchemas result
 *
 * This is the main type utility that transforms your schema factory result into a comprehensive
 * type system. It provides both return types (from queries) and input types (from Zod schemas)
 * along with runtime schema access and feature metadata.
 *
 * ## Type Categories Provided
 *
 * ### `return` - Database Query Result Types
 * - Automatically inferred from your actual query function return types
 * - Use these for API responses, component props, data processing
 * - Reflects what your database actually returns
 *
 * ### `input` - Request Validation Types
 * - Generated from your Zod schemas across all three layers
 * - Use these for API request validation, form types, parameter types
 * - Organized by schema layer: `query`, `service`, `custom`
 *
 * ### `schemas` - Runtime Zod Schema Access
 * - Direct access to all Zod schemas for `.parse()`, `.safeParse()`, etc.
 * - Maintains the three-layer structure for organization
 *
 * ### `feature` - Literal Feature Name
 * - Preserves your feature name as a literal type
 * - Perfect for discriminated unions, routing, feature detection
 *
 * @template TFeatureSchemas - Result object from createFeatureSchemas()
 *
 * @example
 * ```typescript
 * // 1. Create your schemas
 * const userSchemas = createFeatureSchemas({
 *     feature: 'user',
 *     table: userTable,
 *     queries: userQueries, // { getAll, getById, create, update, delete }
 *     inputSchemas: {
 *         query: (base) => ({
 *             getAll: base.pick({ id: true, email: true }),
 *             search: base.pick({ email: true }).partial(),
 *         }),
 *         service: (query) => ({
 *             create: query.getAll.omit({ id: true }),
 *             update: query.getAll.partial().required({ id: true }),
 *         }),
 *         custom: ({ base }) => ({
 *             resetPassword: z.object({ email: z.string().email() }),
 *         }),
 *     },
 * });
 *
 * // 2. Infer comprehensive type system
 * type UserTypes = InferSchemaTypes<typeof userSchemas>;
 *
 * // 3. Use return types (what queries actually return from database)
 * type UserList = UserTypes['return']['getAll'];     // User[] from database
 * type SingleUser = UserTypes['return']['getById'];  // User | null from database
 * type CreatedUser = UserTypes['return']['create'];  // User from database
 *
 * // 4. Use input types (for request validation)
 * type CreateUserRequest = UserTypes['input']['service']['create'];     // { email: string, ... }
 * type SearchUsersQuery = UserTypes['input']['query']['search'];        // { email?: string }
 * type ResetPasswordData = UserTypes['input']['custom']['resetPassword']; // { email: string }
 *
 * // 5. Runtime validation with full type safety
 * function validateCreateUser(data: unknown): CreateUserRequest {
 *     const schemas: UserTypes['schemas'] = userSchemas.inputSchemas;
 *     return schemas.service.create.parse(data); // Throws on validation error
 * }
 *
 * function safeValidateSearch(params: unknown): { success: true; data: SearchUsersQuery } | { success: false; error: any } {
 *     const schemas = userSchemas.inputSchemas;
 *     return schemas.query.search.safeParse(params);
 * }
 *
 * // 6. Feature-based type discrimination
 * type AllFeatures = UserTypes | ProductTypes | OrderTypes;
 *
 * function handleFeature(feature: AllFeatures) {
 *     switch (feature.feature) {
 *         case 'user':    // TypeScript knows this is UserTypes
 *         case 'product': // TypeScript knows this is ProductTypes
 *         case 'order':   // TypeScript knows this is OrderTypes
 *     }
 * }
 *
 * // 7. API endpoint with full type safety
 * app.post('/users', async (c) => {
 *     const body = await c.req.json();
 *     const userData: CreateUserRequest = validateCreateUser(body);
 *
 *     const newUser: CreatedUser = await userQueries.create(userData);
 *     return c.json(newUser);
 * });
 * ```
 *
 * ## Benefits
 *
 * - **🔄 Dual Type System**: Return types from actual queries, input types from Zod schemas
 * - **📝 Zero Manual Definitions**: All types automatically inferred
 * - **🛡️ Runtime + Compile Time**: Both validation and typing in one system
 * - **🎨 Three-Layer Organization**: Clean separation of concerns
 * - **⚡ Direct Schema Access**: No wrapper functions needed for validation
 * - **🏷️ Literal Features**: Perfect for discriminated unions and routing
 */
export type InferSchemaTypes<
    TFeatureSchemas extends {
        inputSchemas: {
            query: Record<string, unknown>;
            service: Record<string, unknown>;
            custom: Record<string, unknown>;
        };
        queries: TCustomQueries;
        feature: string;
    },
> = {
    // Return types - for API responses and data retrieval (from actual query functions)
    return: InferFeatureQueryReturnTypes<TFeatureSchemas['queries']>;

    // Input types - for API parameters and operations (from Zod schemas)
    input: {
        // Service layer operations (create, update, etc.)
        service: InferZodSchemaTypes<TFeatureSchemas['inputSchemas']['service']>;

        // Query parameters and filters
        query: InferZodSchemaTypes<TFeatureSchemas['inputSchemas']['query']>;

        // Custom schemas (assignments, filters, etc.)
        custom: InferZodSchemaTypes<TFeatureSchemas['inputSchemas']['custom']>;
    };

    // Raw schemas - for runtime validation and schema composition
    schemas: TFeatureSchemas['inputSchemas'];

    // Feature metadata
    feature: TFeatureSchemas['feature'];
};

/**
 * 🎨 **Select Return Types Helper** - Extract common "many" and "one" patterns from queries
 *
 * A specialized utility for the extremely common pattern of needing both "list" and "detail"
 * return types from your queries. Perfect for components that handle both collection views
 * (tables, lists) and individual item views (detail pages, modals).
 *
 * ## Default Behavior
 * - `many` defaults to `getAll` query return type (arrays/collections)
 * - `one` defaults to `getById` query return type (single items)
 *
 * ## Custom Query Keys
 * You can specify different query methods if your naming differs from the defaults.
 *
 * @template TFeatureSchemas - Result object from createFeatureSchemas()
 * @template TManyKey - Query key for "get many" operations (defaults to 'getAll')
 * @template TOneKey - Query key for "get one" operations (defaults to 'getById')
 *
 * @example
 * ```typescript
 * // Your schema setup
 * const userSchemas = createFeatureSchemas({
 *     feature: 'user',
 *     queries: userQueries, // { getAll, getById, getAllActive, getByEmail, ... }
 *     // ... other config
 * });
 *
 * // 1. Default usage - uses getAll/getById automatically
 * type UserSelectTypes = InferSelectReturnTypes<typeof userSchemas>;
 *
 * type UserList = UserSelectTypes['many'];  // Return type of userQueries.getAll
 * type SingleUser = UserSelectTypes['one']; // Return type of userQueries.getById
 *
 * // 2. Custom query keys for different patterns
 * type ActiveUserTypes = InferSelectReturnTypes<
 *     typeof userSchemas,
 *     'getAllActive',  // Custom "many" - gets all active users
 *     'getByEmail'     // Custom "one" - gets user by email
 * >;
 *
 * type ActiveUsers = ActiveUserTypes['many']; // Return type of userQueries.getAllActive
 * type UserByEmail = ActiveUserTypes['one'];  // Return type of userQueries.getByEmail
 *
 * // 3. Real-world component usage
 * interface UserTableProps {
 *     users: UserSelectTypes['many'];     // Array of users for table
 *     onSelectUser: (user: UserSelectTypes['one']) => void; // Single user for selection
 * }
 *
 * function UserTable({ users, onSelectUser }: UserTableProps) {
 *     return (
 *         <table>
 *             {users.map(user => (
 *                 <tr key={user.id} onClick={() => onSelectUser(user)}>
 *                     <td>{user.name}</td>
 *                     <td>{user.email}</td>
 *                 </tr>
 *             ))}
 *         </table>
 *     );
 * }
 *
 * // 4. API endpoint patterns
 * type UserEndpointTypes = InferSelectReturnTypes<typeof userSchemas>;
 *
 * // GET /users - returns array
 * app.get('/users', async (c) => {
 *     const users: UserEndpointTypes['many'] = await userQueries.getAll();
 *     return c.json(users);
 * });
 *
 * // GET /users/:id - returns single item
 * app.get('/users/:id', async (c) => {
 *     const user: UserEndpointTypes['one'] = await userQueries.getById(c.req.param('id'));
 *     return c.json(user);
 * });
 *
 * // 5. Form handling with different query patterns
 * type SearchTypes = InferSelectReturnTypes<
 *     typeof userSchemas,
 *     'searchUsers',   // Returns filtered array
 *     'getByEmail'     // Returns single user or null
 * >;
 *
 * function UserSearchForm() {
 *     const [results, setResults] = useState<SearchTypes['many']>([]);
 *     const [selected, setSelected] = useState<SearchTypes['one'] | null>(null);
 *
 *     // ... search logic
 * }
 * ```
 *
 * ## Common Use Cases
 *
 * - **📊 Table Components**: `many` for rows, `one` for selected/editing row
 * - **🔍 Search Results**: `many` for result list, `one` for selected result
 * - **📋 Master-Detail Views**: `many` for list panel, `one` for detail panel
 * - **🌐 API Endpoints**: Collection vs single resource endpoints
 * - **📱 Mobile Lists**: List view vs detail view navigation
 * - **🎯 Selection Patterns**: Available options vs selected option
 *
 * ## Benefits
 *
 * - **🎯 Common Pattern**: Handles the 80% use case of needing both list and detail types
 * - **🔄 Flexible Keys**: Defaults work for standard naming, customizable for variants
 * - **📝 Type Safety**: All types come from actual query return types
 * - **⚡ Simple API**: Just two properties to remember: `many` and `one`
 * - **🔗 Query Coupling**: Types automatically stay in sync with your actual queries
 */
export type InferSelectReturnTypes<
    TFeatureSchemas extends {
        queries: TCustomQueries;
        [key: string]: unknown;
    },
    TManyKey extends keyof TFeatureSchemas['queries'] = 'getAll',
    TOneKey extends keyof TFeatureSchemas['queries'] = 'getById',
> = {
    // Return type for "get many" operations (usually getAll)
    many: TManyKey extends keyof TFeatureSchemas['queries']
        ? InferFeatureQueryReturnTypes<TFeatureSchemas['queries'], TManyKey>[TManyKey]
        : never;

    // Return type for "get one" operations (usually getById)
    one: TOneKey extends keyof TFeatureSchemas['queries']
        ? InferFeatureQueryReturnTypes<TFeatureSchemas['queries'], TOneKey>[TOneKey]
        : never;
};
