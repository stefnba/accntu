import { FileWithPath } from 'react-dropzone';
import { IconType } from 'react-icons';
import { BsFileExcel, BsFiletypeCsv } from 'react-icons/bs';
import { LuCheck, LuTrash } from 'react-icons/lu';

interface Props {
    // file: FileWithPath;
    name: string;
    type: string;
    action?: React.ReactElement;
}

const FileIcon: React.FC<{ type: string }> = ({ type }) => {
    const Icons: Record<string, IconType> = {
        'application/vnd.ms-excel': BsFileExcel,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            BsFileExcel,
        'text/csv': BsFiletypeCsv
    };

    if (!(type in Icons)) {
        return null;
    }

    const Icon = Icons[type] || null;

    return <Icon className="text-2xl" />;
};

export const FileCard: React.FC<Props> = ({ name, type, action }) => {
    return (
        <div className="border rounded-md p-2 flex items-center group h-14">
            <div className="mr-2">
                <FileIcon type={type} />
            </div>
            <div className="text-sm mr-8 text-muted-foreground overflow-hidden">
                {name}
            </div>
            {action && <div className="ml-auto">{action}</div>}
            <div className="ml-auto"></div>
        </div>
    );
};
