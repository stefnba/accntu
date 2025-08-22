import { labelQueriesTest } from '@/features/label/server/db/queries';
import { InferFeatureQueryReturnTypes } from './types';

type a = InferFeatureQueryReturnTypes<typeof labelQueriesTest, 'reorder'>;

type b = a['reorder'];
