import { CreateImportSelectionSchema } from '@/features/import/schema/create-import';
import { z } from 'zod';
import { create } from 'zustand';

interface State {
    importId?: string;
    importData?: z.infer<typeof CreateImportSelectionSchema>;
    importedTransactionsCount: number;
}

const initialState: State = {
    importId: undefined,
    importData: undefined,
    importedTransactionsCount: 0
};

interface Actions {
    // import id
    setImportId: (importId: string) => void;
    setImportData: (data: z.infer<typeof CreateImportSelectionSchema>) => void;
    updateImportedTransactionCount: (count: number) => void;
    reset: () => void;
}

export const storeCreateImportData = create<State & Actions>()((set, get) => ({
    ...initialState,
    reset: () => {
        set(initialState);
    },
    updateImportedTransactionCount: (count) => {
        const current = get().importedTransactionsCount;
        set({
            importedTransactionsCount: current + count
        });
    },
    setImportData: (data) => set({ importData: data }),
    setImportId: (importId) => set({ importId })
}));
