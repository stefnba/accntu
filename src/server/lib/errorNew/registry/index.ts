import { ERROR_REGISTRY, PUBLIC_ERROR_REGISTRY } from '@/server/lib/errorNew/registry/registry';
import type { InferErrorKeys } from '@/server/lib/errorNew/registry/types';

export { ERROR_REGISTRY, PUBLIC_ERROR_REGISTRY };
export type TErrorCategory = keyof typeof ERROR_REGISTRY;
export type TErrorKeys = InferErrorKeys<typeof ERROR_REGISTRY>;
