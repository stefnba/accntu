import { TCoreCrudQueries, TCustomQueries } from './types';

/**
 * Create a feature query object.
 * @param core - core CRUD queries
 * @param custom - Any custom queries that are not part of the core CRUD queries
 */
export const createFeatureQueryObject = <
    TCore extends Partial<TCoreCrudQueries>,
    TCustom extends TCustomQueries,
>({
    core,
    custom,
}: {
    core: TCore;
    custom: TCustom;
}): TCore & TCustom => {
    return {
        ...core,
        ...custom,
    };
};
