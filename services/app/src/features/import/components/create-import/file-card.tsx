import { FileWithPath } from 'react-dropzone';
import { IconType } from 'react-icons';
import { BsFileExcel, BsFiletypeCsv } from 'react-icons/bs';
import { LuCheck, LuTrash } from 'react-icons/lu';

interface Props {
    file: FileWithPath;
    action?: React.ReactElement;
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

export const FileCard: React.FC<Props> = ({ file, action }) => {
    return (
        <div className="border rounded-md p-2 flex items-center group h-14">
            <div className="mr-2">
                <FileIcon type={file.type} />
            </div>
            <div className="text-sm mr-8 text-muted-foreground overflow-hidden">
                {file.name}
            </div>
            {action && <div className="ml-auto">{action}</div>}
            <div className="ml-auto">
                {/* <div className="group-hover:hidden h-10 w-10 inline-flex items-center justify-center">
                    {uploadingIcon}
                </div>
                <Button
                    size="icon"
                    variant={'ghost'}
                    className="group-hover:flex hidden text-red-500"
                    onClick={handleFileDelete}
                >
                    <LuTrash className="size-4" />
                </Button> */}
            </div>
        </div>
    );
};
