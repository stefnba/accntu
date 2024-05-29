import { Button } from '@/components/ui/button';
import { LuSave } from 'react-icons/lu';

import { CreateImportPreviewFiles } from './preview-files';
import { CreateImportPreviewTable } from './preview-table';

interface Props {}

export const CreateImportPreview: React.FC<Props> = ({}) => {
    return (
        <div className="w-[1200px]">
            <div className="flex space-x-4">
                <CreateImportPreviewFiles />
                <Button>
                    <LuSave className="size-4 mr-2" /> Import
                </Button>
            </div>
            <CreateImportPreviewTable />

            <div></div>
        </div>
    );
};
