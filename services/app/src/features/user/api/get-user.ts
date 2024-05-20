import { useMutation } from '@tanstack/react-query';

export const useGetUser = () => {
    const mutation = useMutation({
        mutationFn: async (data: any) => {}
    });
};
