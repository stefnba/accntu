import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card';

import type { IFile } from '../_types';

interface Props {
    file: IFile;
}

export const FileCard: React.FC<Props> = ({ file }) => {
    const { filename, id } = file;
    return (
        <Card>
            <CardHeader>{filename}</CardHeader>
        </Card>
    );
};
