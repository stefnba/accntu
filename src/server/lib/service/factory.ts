import { FeatureServiceBuilder } from './core';

/**
 * Factory function to create a new FeatureServiceBuilder instance.
 *
 * @param config - Table configuration
 * @param name - Service name (optional, defaults to config name)
 */
export const createFeatureServices = (name: string) => {
    return new FeatureServiceBuilder({
        services: {},
        queries: {},
        schemas: {},
        name,
    });
};
