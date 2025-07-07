import { MainContent } from '@/components/layout/main';
import { LabelManager } from '@/features/label/components';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Labels | Accntu',
    description: 'Manage your transaction labels and categories',
};

export default function LabelsPage() {
    return (
        <MainContent>
            <LabelManager />
        </MainContent>
    );
}
