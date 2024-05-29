import { Button } from '@/components/ui/button';
import { FileCard } from '@/features/import/components/file-card';
import { CreateImportSelectionSchema } from '@/features/import/schema/create-import';
import { FileWithPath } from 'react-dropzone';
import { UseFormReturn } from 'react-hook-form';
import { LuTrash } from 'react-icons/lu';
import { z } from 'zod';

interface Props {
    file: FileWithPath;
    form: UseFormReturn<
        z.infer<typeof CreateImportSelectionSchema>,
        any,
        undefined
    >;
}

/**
 * One card for a dropped file within list of dropped files for a new import.
 */
export const DroppedFileCard: React.FC<Props> = ({ file, form }) => {
    const filePath = file.path;

    if (!filePath) {
        return <>Invalid file path</>;
    }

    const handleDelete = () => {
        const files = form.getValues('files') || [];
        form.setValue(
            'files',
            files.filter((f) => f.path !== file.path),
            { shouldValidate: true }
        );
    };

    return (
        <FileCard
            type={file.type}
            name={file.name}
            action={
                <Button
                    size="icon"
                    variant="ghost"
                    className=" text-muted-foreground"
                    onClick={handleDelete}
                >
                    <LuTrash className="size-4" />
                </Button>
            }
        />
    );
};
