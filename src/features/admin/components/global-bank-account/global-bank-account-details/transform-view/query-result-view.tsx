import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TransformationResult } from '@/lib/duckdb/types';
import { AlertCircle, CheckCircle, ChevronDown, ChevronRight, Info } from 'lucide-react';
import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coy } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface QueryResultViewProps<T> {
    transformResult: TransformationResult<T> | undefined | null;
    isLoading: boolean;
}

export const QueryResultView = <T,>({ transformResult, isLoading }: QueryResultViewProps<T>) => {
    const [showResults, setShowResults] = useState(false);
    const [previewType, setPreviewType] = useState<'raw' | 'validated'>('raw');

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!transformResult) {
        return null;
    }

    const {
        data = [],
        validatedData = [],
        aggregatedErrors: rawAggregatedErrors,
        totalRows = 0,
        validRows = 0,
    } = transformResult;

    // TODO: add error handling
    const { isError, error } = { isError: false, error: { message: 'Test error' } };

    const aggregatedErrors = rawAggregatedErrors || {};
    const hasAggregatedErrors = Object.keys(aggregatedErrors).length > 0;

    const renderResultSummary = () => {
        if (isError) {
            return (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Query Error</AlertTitle>
                    <AlertDescription>{error?.message}</AlertDescription>
                </Alert>
            );
        }

        if (totalRows > 0 && validRows === totalRows) {
            return (
                <Alert variant="default">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Validation Success!</AlertTitle>
                    <AlertDescription>All {totalRows} rows are valid.</AlertDescription>
                </Alert>
            );
        }

        if (totalRows > 0 && validRows > 0) {
            return (
                <Alert variant="default">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Partial Success</AlertTitle>
                    <AlertDescription>
                        {validRows} of {totalRows} rows are valid.
                    </AlertDescription>
                </Alert>
            );
        }

        if (totalRows > 0 && validRows === 0) {
            return (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Validation Failed</AlertTitle>
                    <AlertDescription>No rows passed validation.</AlertDescription>
                </Alert>
            );
        }

        return (
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>No Results</AlertTitle>
                <AlertDescription>The query returned no data.</AlertDescription>
            </Alert>
        );
    };

    return (
        <div className="space-y-4">
            {renderResultSummary()}

            {hasAggregatedErrors && (
                <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Field Validation Errors</h4>
                    <Accordion type="multiple" className="w-full">
                        {Object.entries(aggregatedErrors).map(([field, summary]) => (
                            <AccordionItem value={field} key={field}>
                                <AccordionTrigger>
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 text-destructive" />
                                        <span className="font-mono text-sm">{field}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-2 pl-6">
                                        {summary.messages.map((message, i) => (
                                            <p key={i} className="text-sm text-destructive">
                                                {message}
                                            </p>
                                        ))}
                                        <h5 className="font-semibold pt-2 text-xs uppercase text-muted-foreground">
                                            Examples of Invalid Data
                                        </h5>
                                        <div className="text-xs bg-muted p-2 rounded-md whitespace-pre-wrap">
                                            <SyntaxHighlighter
                                                language="json"
                                                // style={coy}
                                                customStyle={{
                                                    fontSize: '8px',
                                                }}
                                            >
                                                {JSON.stringify(summary.examples, null, 2)}
                                            </SyntaxHighlighter>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            )}

            {data.length > 0 && (
                <Collapsible open={showResults} onOpenChange={setShowResults}>
                    <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full">
                            {showResults ? (
                                <ChevronDown className="mr-2 h-4 w-4" />
                            ) : (
                                <ChevronRight className="mr-2 h-4 w-4" />
                            )}
                            View Results (Raw: {data.length}, Validated: {validatedData.length})
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <Tabs
                            value={previewType}
                            onValueChange={(value) => setPreviewType(value as any)}
                            className="mt-4"
                        >
                            <TabsList>
                                <TabsTrigger value="raw">Raw Data</TabsTrigger>
                                <TabsTrigger value="validated">Validated Data</TabsTrigger>
                            </TabsList>
                            <TabsContent value="raw">
                                <div className="mt-4 border rounded-lg">
                                    <div className="max-h-96 overflow-auto">
                                        <SyntaxHighlighter language="json" style={coy}>
                                            {JSON.stringify(data, null, 2)}
                                        </SyntaxHighlighter>
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="validated">
                                <div className="mt-4 border rounded-lg">
                                    <div className="max-h-96 overflow-auto">
                                        <SyntaxHighlighter language="json" style={coy}>
                                            {JSON.stringify(validatedData, null, 2)}
                                        </SyntaxHighlighter>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CollapsibleContent>
                </Collapsible>
            )}
        </div>
    );
};
