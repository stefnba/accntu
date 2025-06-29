'use client';

import { Editor } from '@monaco-editor/react';

interface SqlEditorProps {
    value: string;
    onChange: (value: string) => void;
    height?: number;
    readOnly?: boolean;
}

export const SqlEditor = ({ value, onChange, height = 200, readOnly = false }: SqlEditorProps) => {
    const handleChange = (newValue: string | undefined) => {
        if (newValue !== undefined && !readOnly) {
            onChange(newValue);
        }
    };

    return (
        <div className="border rounded-md overflow-hidden w-full h-full">
            <Editor
                height={height}
                language="sql"
                // theme="vs-dark"
                value={value}
                onChange={handleChange}
                options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 12,
                    lineNumbers: 'on',
                    folding: true,
                    wordWrap: 'off',
                    automaticLayout: true,
                    formatOnPaste: true,
                    formatOnType: true,
                    tabSize: 2,
                    insertSpaces: true,
                }}
            />
        </div>
    );
};
