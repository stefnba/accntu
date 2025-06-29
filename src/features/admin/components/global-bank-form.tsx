'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface GlobalBankFormProps {
    bank?: any;
    onClose: () => void;
}

export const GlobalBankForm = ({ bank, onClose }: GlobalBankFormProps) => {
    const [formData, setFormData] = useState({
        name: bank?.name || '',
        country: bank?.country || '',
        currency: bank?.currency || '',
        bic: bank?.bic || '',
        logo: bank?.logo || '',
        color: bank?.color || '',
        providerSource: bank?.providerSource || '',
        providerId: bank?.providerId || '',
        integrationTypes: bank?.integrationTypes || [],
        isActive: bank?.isActive ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onClose();
    };

    const handleIntegrationTypeToggle = (type: string) => {
        setFormData(prev => ({
            ...prev,
            integrationTypes: prev.integrationTypes.includes(type)
                ? prev.integrationTypes.filter((t: string) => t !== type)
                : [...prev.integrationTypes, type]
        }));
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {bank ? 'Edit Global Bank' : 'Add Global Bank'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Bank Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="country">Country Code</Label>
                            <Input
                                id="country"
                                value={formData.country}
                                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value.toUpperCase() }))}
                                placeholder="DE, CH, etc."
                                maxLength={2}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="currency">Currency Code</Label>
                            <Input
                                id="currency"
                                value={formData.currency}
                                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value.toUpperCase() }))}
                                placeholder="EUR, USD, etc."
                                maxLength={3}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bic">BIC (Optional)</Label>
                            <Input
                                id="bic"
                                value={formData.bic}
                                onChange={(e) => setFormData(prev => ({ ...prev, bic: e.target.value }))}
                                placeholder="DEUTDEFF"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="logo">Logo URL (Optional)</Label>
                            <Input
                                id="logo"
                                value={formData.logo}
                                onChange={(e) => setFormData(prev => ({ ...prev, logo: e.target.value }))}
                                placeholder="https://..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="color">Brand Color (Optional)</Label>
                            <Input
                                id="color"
                                value={formData.color}
                                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                                placeholder="#0066cc"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="providerSource">Provider Source</Label>
                            <Select
                                value={formData.providerSource}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, providerSource: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select provider" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="manual">Manual</SelectItem>
                                    <SelectItem value="nordigen">Nordigen</SelectItem>
                                    <SelectItem value="plaid">Plaid</SelectItem>
                                    <SelectItem value="open-banking">Open Banking</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="providerId">Provider ID (Optional)</Label>
                            <Input
                                id="providerId"
                                value={formData.providerId}
                                onChange={(e) => setFormData(prev => ({ ...prev, providerId: e.target.value }))}
                                placeholder="Provider-specific ID"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Integration Types</Label>
                        <div className="flex gap-4">
                            {['csv', 'api'].map(type => (
                                <div key={type} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={type}
                                        checked={formData.integrationTypes.includes(type)}
                                        onCheckedChange={() => handleIntegrationTypeToggle(type)}
                                    />
                                    <Label htmlFor={type} className="capitalize">{type}</Label>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-1 mt-2">
                            {formData.integrationTypes.map((type: string) => (
                                <Badge key={type} variant="secondary" className="text-xs">
                                    {type}
                                    <X
                                        className="ml-1 h-3 w-3 cursor-pointer"
                                        onClick={() => handleIntegrationTypeToggle(type)}
                                    />
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="isActive"
                            checked={formData.isActive}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                        />
                        <Label htmlFor="isActive">Active</Label>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {bank ? 'Update' : 'Create'} Bank
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};