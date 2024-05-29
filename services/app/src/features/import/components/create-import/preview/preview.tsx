import { Button } from '@/components/ui/button';
import { LuSave } from 'react-icons/lu';

import { ImportForm } from './import-form';
import { CreateImportPreviewFiles } from './preview-files';
import { CreateImportPreviewTable } from './preview-table';

interface Props {}

export const CreateImportPreview: React.FC<Props> = ({}) => {
    return (
        <div className="w-[1200px]">
            <div className="flex space-x-4">
                <CreateImportPreviewFiles />
                <ImportForm />
            </div>
            <CreateImportPreviewTable />

            <div></div>
        </div>
    );
};
