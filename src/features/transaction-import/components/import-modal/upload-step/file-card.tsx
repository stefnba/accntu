import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle2, Download, Upload, X } from 'lucide-react';
import { formatFileSize, getFileIconComponent } from '../../../file-utils';
import type { FileUpload } from '../../../types';

interface FileCardProps {
    fileUpload: FileUpload;
    onRetry: (fileId: string) => void;
    onRemove: (fileId: string) => void;
    onDownload?: (fileUpload: FileUpload) => void;
}

export const FileCard = ({ fileUpload, onRetry, onRemove, onDownload }: FileCardProps) => {
    const FileIcon = getFileIconComponent(fileUpload.file);

    return (
        <Card className="border-gray-200 overflow-hidden w-full max-w-full">
            <CardContent className="p-4">
                <div className="flex items-center gap-3 w-full">
                    {/* File Icon */}
                    <div className="flex-shrink-0">
                        <FileIcon
                            className={`h-8 w-8 ${
                                fileUpload.file.type.includes('csv')
                                    ? 'text-green-600'
                                    : 'text-gray-600'
                            }`}
                        />
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0 overflow-hidden max-w-[180px]">
                        <p
                            className="font-medium text-gray-900 truncate"
                            title={fileUpload.file.name}
                        >
                            {fileUpload.file.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                            {formatFileSize(fileUpload.file.size)}
                        </p>
                    </div>

                    {/* Status & Progress */}
                    <div className="flex-shrink-0 w-20">
                        {fileUpload.status === 'pending' && (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                                <span className="text-sm text-yellow-600">Pending</span>
                            </div>
                        )}

                        {fileUpload.status === 'uploading' && (
                            <div className="space-y-1">
                                <Progress value={fileUpload.progress} className="h-2" />
                                <p className="text-xs text-gray-500 text-center">
                                    {fileUpload.progress}%
                                </p>
                            </div>
                        )}

                        {fileUpload.status === 'completed' && (
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                <span className="text-sm text-green-600">Complete</span>
                            </div>
                        )}

                        {fileUpload.status === 'error' && (
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                                <span className="text-sm text-red-600">Error</span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                        {fileUpload.status === 'error' && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRetry(fileUpload.id)}
                                className="h-8 w-8 p-0"
                            >
                                <Upload className="h-4 w-4" />
                            </Button>
                        )}

                        {fileUpload.status === 'completed' && onDownload && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDownload(fileUpload)}
                                className="h-8 w-8 p-0"
                            >
                                <Download className="h-4 w-4" />
                            </Button>
                        )}

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemove(fileUpload.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Error Message */}
                {fileUpload.status === 'error' && fileUpload.error && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        {fileUpload.error}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
