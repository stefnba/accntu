import type { IFile } from '../_types';
import { FileCard } from './file-card';

interface Props {
    files: IFile[];
}

export const ParsedFileSelection: React.FC<Props> = ({ files }) => {
    return (
        <div className="mb-8">
            <div className="grid grid-cols-5">
                {files.map((file) => (
                    <FileCard file={file} key={file.id} />
                ))}
            </div>
        </div>
    );
};
