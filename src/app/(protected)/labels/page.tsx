import { MainContent } from '@/components/layout/main';
import { LabelManager, LabelManagerActionBar } from '@/features/label/components/label-manager';

import { SortableTreeOwn } from '@/features/label/components/tree-own/components/sortable-tree';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Labels | Accntu',
    description: 'Manage your transaction labels and categories',
};

export default function LabelsPage() {
    return (
        <MainContent
            pageHeader={{
                title: 'Labels',
                description: 'Manage your transaction labels and categories',
                actionBar: <LabelManagerActionBar />,
            }}
        >
            <LabelManager />

            <SortableTreeOwn />
        </MainContent>
    );
}
