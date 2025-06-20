import { Dropzone } from '@/components/ui/dropzone';

interface FileDropzoneProps {
    getRootProps: () => any;
    getInputProps: () => any;
    isDragActive: boolean;
}

export const FileDropzone = ({ getRootProps, getInputProps, isDragActive }: FileDropzoneProps) => {
    return (
        <div>
            {/* <Card className="border-dashed border-2 border-gray-300 hover:border-blue-400 transition-colors">
                <CardContent className="p-8">
                    <div
                        {...getRootProps()}
                        className={cn(
                            'text-center cursor-pointer transition-colors',
                            isDragActive ? 'text-blue-600' : 'text-gray-600'
                        )}
                    >
                        <input {...getInputProps()} />
                        <div className="space-y-4">
                            <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                <Plus className="h-8 w-8 text-gray-400" />
                            </div>
                            {isDragActive ? (
                                <p className="text-lg font-medium">Drop files here...</p>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-lg font-medium">
                                        Drag files here or click to browse
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Supports CSV, XLS, XLSX files up to 10MB each
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card> */}
            <Dropzone
                name="file"
                title="Drag files here or click to browse"
                description="Supports CSV, XLS, XLSX files up to 10MB each"
                rootProps={getRootProps}
                inputProps={getInputProps}
                isDragActive={isDragActive}
            />
        </div>
    );
};
