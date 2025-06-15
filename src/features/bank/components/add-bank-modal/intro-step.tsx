import { Button } from '@/components/ui/button';
import { useAddBankModal } from '@/features/bank/hooks';
import { Building2, Lock, Shield } from 'lucide-react';

export const IntroStep = () => {
    const { setCurrentStep } = useAddBankModal();

    const handleContinue = () => {
        setCurrentStep('country');
    };

    return (
        <div className="text-center space-y-6 py-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Connect Bank Account</h2>
                <p className="text-muted-foreground max-w-sm mx-auto">
                    Choose your bank to securely connect your account and start tracking your
                    finances.
                </p>
            </div>

            <div className="space-y-4 text-left max-w-sm mx-auto">
                <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                        <Shield className="w-3 h-3 text-green-600" />
                    </div>
                    <div>
                        <h4 className="font-medium text-sm">Secure</h4>
                        <p className="text-xs text-muted-foreground">
                            Encryption helps protect your personal financial data
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                        <Lock className="w-3 h-3 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="font-medium text-sm">Private</h4>
                        <p className="text-xs text-muted-foreground">
                            This application will never be able to access your credentials
                        </p>
                    </div>
                </div>
            </div>

            <Button onClick={handleContinue} className="w-full">
                Continue
            </Button>
        </div>
    );
};
