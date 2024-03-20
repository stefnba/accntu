import { useForm as useHookForm, UseFormProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export const useForm = <T extends z.Schema<any, any>>(
    schema: T,
    options?: UseFormProps<z.infer<typeof schema>>
) => {
    return useHookForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        ...options
    });
};
