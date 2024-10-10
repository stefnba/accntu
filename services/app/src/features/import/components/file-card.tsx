import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from '@/components/ui/tooltip';
import { CircleIcon, StarIcon } from 'lucide-react';
import { FileWithPath } from 'react-dropzone';
import { IconType } from 'react-icons';
import { BsFileExcel, BsFiletypeCsv } from 'react-icons/bs';
import { LuCheck, LuTrash } from 'react-icons/lu';
import { LuImport } from 'react-icons/lu';

interface Props {
    name: string;
    type: string;
    action?: React.ReactElement;
    description?: React.ReactElement;
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

export const FileCardOld: React.FC<Props> = ({ name, type, action }) => {
    return (
        <div className="border rounded-md p-2 flex items-center group h-14">
            <div className="mr-2">
                <FileIcon type={type} />
            </div>

            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger className="text-sm mr-8 text-muted-foreground overflow-hidden truncate">
                        {name}
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{name}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            {action && <div className="ml-auto">{action}</div>}
        </div>
    );
};
export const FileCard: React.FC<Props> = ({
    name,
    type,
    action,
    description
}) => {
    // return <ListCard icon={<FileIcon type={type} />} />;
    return (
        <Card className="flex items-center p-2 min-h-14">
            <div className="mr-2">
                <FileIcon type={type} />
            </div>
            <div className="">
                <CardHeader className="m-0 p-0">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger className="text-sm overflow-hidden truncate">
                                <Button
                                    className="m-0 p-0 h-0"
                                    size="sm"
                                    variant="link"
                                >
                                    {name}
                                </Button>
                                {/* <CardTitle className="text-sm"> */}
                                {/* </CardTitle> */}
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{name}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </CardHeader>
                {description && (
                    <CardContent className="m-0 p-0">{description}</CardContent>
                )}
            </div>
            {action && <div className="ml-auto">{action}</div>}
        </Card>
    );
};
