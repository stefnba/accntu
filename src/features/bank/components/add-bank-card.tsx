'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';

interface AddBankCardProps {
    onAddBank?: () => void;
}

export const AddBankCard = ({ onAddBank }: AddBankCardProps) => {
    return (
        <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 group cursor-pointer">
            <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center space-y-4 min-h-[200px]">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="font-semibold text-lg text-foreground">Add Bank Account</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            Connect your bank account to start tracking your finances
                        </p>
                    </div>
                    <Button
                        onClick={onAddBank}
                        variant="outline"
                        className="mt-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Account
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
