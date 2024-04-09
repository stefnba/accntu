import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { useMutation } from '@/hooks/mutation';
import { deleteUploadRecord } from '@/lib/upload/cloud/s3';
import { FileWithPath } from 'react-dropzone';
import { IconType } from 'react-icons';
import { AiOutlineLoading } from 'react-icons/ai';
import { BsFileExcel, BsFiletypeCsv } from 'react-icons/bs';
import { LuCheckCircle } from 'react-icons/lu';

import type { UploadFile } from './upload-form';

interface Props {
    file: UploadFile;
    handleDelete: (fileId: string) => void;
}

const FileIcon: React.FC<{ type: string }> = ({ type }) => {
    const Icons: Record<string, IconType> = {
        'application/vnd.ms-excel': BsFileExcel,
        'text/csv': BsFiletypeCsv
    };

    if (!(type in Icons)) {
        return null;
    }

    const Icon = Icons[type] || null;

    return <Icon className="text-2xl" />;
};

export const FileCard: React.FC<Props> = ({
    file: { file, fileId },
    handleDelete
}) => {
    const { execute: deleteUpload } = useMutation(deleteUploadRecord, {
        onSuccess() {
            handleDelete(fileId!);
        }
    });

    const isUploading = fileId === undefined;

    const uploadingIcon = isUploading ? (
        <AiOutlineLoading className="animate-spin" />
    ) : (
        <LuCheckCircle className="text-green-600 h-6 w-6" />
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>{file.name}</CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription>{uploadingIcon}</CardDescription>
                <FileIcon type={file.type} />
            </CardContent>
            <CardFooter>
                {!isUploading && (
                    <Button
                        variant={'ghost'}
                        onClick={() =>
                            deleteUpload({
                                id: fileId
                            })
                        }
                    >
                        Delete
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
};
