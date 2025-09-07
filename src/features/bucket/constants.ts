export const BUCKET_TYPE_OPTIONS = [
    'trip',
    'home', 
    'project',
    'event',
    'other'
] as const;

export const BUCKET_STATUS_OPTIONS = [
    'open',
    'settled'
] as const;

export type BucketType = typeof BUCKET_TYPE_OPTIONS[number];
export type BucketStatus = typeof BUCKET_STATUS_OPTIONS[number];