import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface SuccessStepProps {
    onContinue: () => void;
    accountCount?: number;
}

export const SuccessStep = ({ onContinue, accountCount = 1 }: SuccessStepProps) => {
    return (
        <div className="text-center space-y-6 py-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
            </div>
            <div>
                <h2 className="text-lg font-semibold mb-2">Success!</h2>
                <p className="text-muted-foreground">
                    {accountCount === 1
                        ? 'Your bank has been successfully connected.'
                        : `${accountCount} accounts have been successfully connected.`}
                </p>
            </div>
            <Button onClick={onContinue} className="w-full">
                View Bank
            </Button>
        </div>
    );
};
