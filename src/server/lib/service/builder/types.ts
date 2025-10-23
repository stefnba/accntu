import { TOperationSchemaObject } from '@/lib/schemas/types';
import { QueryFn } from '@/server/lib/db/query/builder/types';
import { ServiceFn } from '@/server/lib/service/factory/types';

export type TServiceDefinition<
    TQueries extends Record<string, QueryFn>,
    TSchemas extends Record<string, TOperationSchemaObject>,
    TWrappedServices extends Record<string, ServiceFn> = Record<string, ServiceFn>,
> = (input: {
    queries: TQueries;
    schemas: TSchemas;
    services: TWrappedServices;
}) => TServiceDefinitionResult;

export type TServiceDefinitionResult = {
    operation: string;
    returnHandler: 'nonNull' | 'nullable';
    serviceFn: ServiceFn<unknown, unknown>;
};

export type WrapNonNull<TFn extends ServiceFn<unknown, unknown>> = TFn extends ServiceFn<
    infer Input,
    infer Output
>
    ? ServiceFn<Input, NonNullable<Output>>
    : TFn;

export type WrapServiceCollection<
    TDefinitions extends Record<string, TServiceDefinitionResult>,
> = {
    [K in keyof TDefinitions]: TDefinitions[K] extends {
        serviceFn: ServiceFn<infer Input, infer Output>;
        returnHandler: infer Handler;
    }
        ? Handler extends 'nonNull'
            ? ServiceFn<Input, NonNullable<Output>>
            : ServiceFn<Input, Output>
        : never;
};

export type BuildOptions = {
    includeRaw?: boolean;
};

export type BuildResult<
    TDefinitions extends Record<string, TServiceDefinitionResult>,
    TIncludeRaw extends boolean = false,
> = TIncludeRaw extends true
    ? {
          services: WrapServiceCollection<TDefinitions>;
          rawServices: {
              [K in keyof TDefinitions]: TDefinitions[K]['serviceFn'];
          };
      }
    : WrapServiceCollection<TDefinitions>;
