import { Upload } from 'lucide-react';

export const UploadHeader = () => {
    return (
        <div className="text-center space-y-3">
            <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
                <Upload className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Upload Transaction Files</h2>
            <p className="text-gray-500 max-w-md mx-auto">
                Upload your CSV, XLS, or XLSX files containing transaction data. You can upload
                multiple files at once.
            </p>
        </div>
    );
};
