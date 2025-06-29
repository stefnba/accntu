'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { SqlEditor } from './sql-editor';

interface GlobalBankAccountFormProps {
    account?: any;
    bankId: string;
    onClose: () => void;
}

export const GlobalBankAccountForm = ({ account, bankId, onClose }: GlobalBankAccountFormProps) => {
    const [formData, setFormData] = useState({
        type: account?.type || 'checking',
        name: account?.name || '',
        description: account?.description || '',
        transformQuery:
            account?.transformQuery ||
            `SELECT
    strptime(date_col, '%d/%m/%Y') as date,
    description_col as description,
    CAST(amount_col as DECIMAL(12,2)) as amount,
    CAST(balance_col as DECIMAL(12,2)) as balance,
    reference_col as reference
FROM read_csv_auto('{{CSV_FILE_PATH}}',
    delimiter=',', header=true, quote='"'
)
WHERE date_col IS NOT NULL AND amount_col IS NOT NULL
ORDER BY date_col DESC`,
        transformConfig: {
            delimiter: account?.transformConfig?.delimiter || ',',
            hasHeader: account?.transformConfig?.hasHeader ?? true,
            encoding: account?.transformConfig?.encoding || 'utf-8',
            skipRows: account?.transformConfig?.skipRows || 0,
            dateFormat: account?.transformConfig?.dateFormat || '%d/%m/%Y',
            decimalSeparator: account?.transformConfig?.decimalSeparator || '.',
            thousandsSeparator: account?.transformConfig?.thousandsSeparator || '',
            quoteChar: account?.transformConfig?.quoteChar || '"',
            escapeChar: account?.transformConfig?.escapeChar || '"',
            nullValues: account?.transformConfig?.nullValues || ['', 'NULL', 'null'],
        },
        sampleTransformData:
            account?.sampleTransformData ||
            `Date,Description,Amount,Balance,Reference
01/01/2024,Opening Balance,0.00,1000.00,
02/01/2024,Grocery Store,-45.67,954.33,TXN001
03/01/2024,Salary,2500.00,3454.33,SAL001`,
        isActive: account?.isActive ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onClose();
    };

    const handleCsvConfigChange = (key: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            transformConfig: {
                ...prev.transformConfig,
                [key]: value,
            },
        }));
    };

    const handleNullValuesChange = (value: string) => {
        const nullValues = value
            .split(',')
            .map((v) => v.trim())
            .filter((v) => v);
        handleCsvConfigChange('nullValues', nullValues);
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {account ? 'Edit Bank Account Template' : 'Add Bank Account Template'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Account Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                                }
                                placeholder="e.g., Personal Checking"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type">Account Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) =>
                                    setFormData((prev) => ({ ...prev, type: value }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="checking">Checking</SelectItem>
                                    <SelectItem value="savings">Savings</SelectItem>
                                    <SelectItem value="credit_card">Credit Card</SelectItem>
                                    <SelectItem value="investment">Investment</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, description: e.target.value }))
                            }
                            placeholder="Additional information about this account type"
                            rows={2}
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="isActive"
                            checked={formData.isActive}
                            onCheckedChange={(checked) =>
                                setFormData((prev) => ({ ...prev, isActive: checked }))
                            }
                        />
                        <Label htmlFor="isActive">Active</Label>
                    </div>

                    <Tabs defaultValue="transform" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="transform">Transform Query</TabsTrigger>
                            <TabsTrigger value="csv">CSV Configuration</TabsTrigger>
                            <TabsTrigger value="sample">Sample Data</TabsTrigger>
                        </TabsList>

                        <TabsContent value="transform" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        DuckDB Transform Query
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        SQL query to transform CSV data. Use{' '}
                                        <code>{'{{CSV_FILE_PATH}}'}</code> as placeholder.
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <SqlEditor
                                        value={formData.transformQuery}
                                        onChange={(value) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                transformQuery: value,
                                            }))
                                        }
                                        height={300}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="csv" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        CSV Parsing Configuration
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="delimiter">Delimiter</Label>
                                            <Select
                                                value={formData.transformConfig.delimiter}
                                                onValueChange={(value) =>
                                                    handleCsvConfigChange('delimiter', value)
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value=",">Comma (,)</SelectItem>
                                                    <SelectItem value=";">Semicolon (;)</SelectItem>
                                                    <SelectItem value="\t">Tab</SelectItem>
                                                    <SelectItem value="|">Pipe (|)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="encoding">Encoding</Label>
                                            <Select
                                                value={formData.transformConfig.encoding}
                                                onValueChange={(value) =>
                                                    handleCsvConfigChange('encoding', value)
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="utf-8">UTF-8</SelectItem>
                                                    <SelectItem value="iso-8859-1">
                                                        ISO-8859-1
                                                    </SelectItem>
                                                    <SelectItem value="windows-1252">
                                                        Windows-1252
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="dateFormat">Date Format</Label>
                                            <Input
                                                id="dateFormat"
                                                value={formData.transformConfig.dateFormat}
                                                onChange={(e) =>
                                                    handleCsvConfigChange(
                                                        'dateFormat',
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="%d/%m/%Y"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="skipRows">Skip Rows</Label>
                                            <Input
                                                id="skipRows"
                                                type="number"
                                                min="0"
                                                value={formData.transformConfig.skipRows}
                                                onChange={(e) =>
                                                    handleCsvConfigChange(
                                                        'skipRows',
                                                        parseInt(e.target.value) || 0
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="decimalSeparator">
                                                Decimal Separator
                                            </Label>
                                            <Select
                                                value={formData.transformConfig.decimalSeparator}
                                                onValueChange={(value) =>
                                                    handleCsvConfigChange('decimalSeparator', value)
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value=".">Period (.)</SelectItem>
                                                    <SelectItem value=",">Comma (,)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="thousandsSeparator">
                                                Thousands Separator
                                            </Label>
                                            <Select
                                                value={formData.transformConfig.thousandsSeparator}
                                                onValueChange={(value) =>
                                                    handleCsvConfigChange(
                                                        'thousandsSeparator',
                                                        value
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">None</SelectItem>
                                                    <SelectItem value=",">Comma (,)</SelectItem>
                                                    <SelectItem value=".">Period (.)</SelectItem>
                                                    <SelectItem value=" ">Space</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="quoteChar">Quote Character</Label>
                                            <Input
                                                id="quoteChar"
                                                value={formData.transformConfig.quoteChar}
                                                onChange={(e) =>
                                                    handleCsvConfigChange(
                                                        'quoteChar',
                                                        e.target.value
                                                    )
                                                }
                                                placeholder='"'
                                                maxLength={1}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="escapeChar">Escape Character</Label>
                                            <Input
                                                id="escapeChar"
                                                value={formData.transformConfig.escapeChar}
                                                onChange={(e) =>
                                                    handleCsvConfigChange(
                                                        'escapeChar',
                                                        e.target.value
                                                    )
                                                }
                                                placeholder='"'
                                                maxLength={1}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="nullValues">
                                            Null Values (comma-separated)
                                        </Label>
                                        <Input
                                            id="nullValues"
                                            value={formData.transformConfig.nullValues.join(', ')}
                                            onChange={(e) => handleNullValuesChange(e.target.value)}
                                            placeholder="NULL, null, empty"
                                        />
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="hasHeader"
                                            checked={formData.transformConfig.hasHeader}
                                            onCheckedChange={(checked) =>
                                                handleCsvConfigChange('hasHeader', checked)
                                            }
                                        />
                                        <Label htmlFor="hasHeader">CSV has header row</Label>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="sample" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Sample CSV Data</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        Sample data for testing the transform query and CSV
                                        configuration.
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <Textarea
                                        value={formData.sampleTransformData}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                sampleTransformData: e.target.value,
                                            }))
                                        }
                                        rows={10}
                                        className="font-mono text-sm"
                                        placeholder="Date,Description,Amount,Balance,Reference&#10;01/01/2024,Opening Balance,0.00,1000.00,&#10;02/01/2024,Grocery Store,-45.67,954.33,TXN001"
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {account ? 'Update' : 'Create'} Account Template
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
