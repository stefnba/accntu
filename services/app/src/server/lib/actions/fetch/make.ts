'use server';

import { TActionResult } from '../types';
import { TCreateFetchReturn } from './types';

export async function makeQueryFetch(a: any) {
    console.log(a);
}

// export async function makeQueryFetch<
//     TDataInput,
//     TDataOutput,
//     TResult extends TActionResult = void
// >(
//     createFetchFn: Promise<
//         TCreateFetchReturn<
//             { country: string },
//             {
//                 country: string;
//                 id: string;
//                 name: string;
//                 createdAt: Date;
//                 updatedAt: Date | null;
//                 bic: string | null;
//                 color: string | null;
//                 logo: string | null;
//                 providerSource: string | null;
//                 providerId: string | null;
//             }[]
//         >
//     >
// ) {
//     console.log(createFetchFn);
// }
