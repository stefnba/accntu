import { TFieldErrors } from '@/server/lib/actions/types';

export type TUseMutationError<TInput = {}> =
    | {
          error: string;
          type: 'SERVER' | 'OTHER';
      }
    | {
          type: 'VALIDATION_ERROR';
          fields: TFieldErrors<TInput>;
      };

export interface IUseMutationOptions<TInput, TOutput> {
    /* Callback to execute before action is triggered */
    onExecution?: (data: TInput) => TInput;
    /* Callback to execute on success */
    onSuccess?: (data: TOutput) => void;
    onError?: (error: TUseMutationError<TInput>) => void;
    // onFieldError?: (error: TFieldErrors<TInput>) => void;
    onComplete?: () => void;
    resetOnSuccess?: boolean;
    useFormData?: boolean;
}

export type TActionStatus =
    | 'IDLE'
    | 'LOADING'
    | 'ERROR'
    | 'SUCCESS'
    | 'VALIDATION_ERROR';
