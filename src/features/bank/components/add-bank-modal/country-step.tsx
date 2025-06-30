import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAddBankModal } from '@/features/bank/hooks';
import { ArrowLeft, Globe } from 'lucide-react';

export const COUNTRIES = [
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
];

export const CountryStep = () => {
    const { setCurrentStep, handleSelectCountry, setSelectedCountry } = useAddBankModal();

    const handleBack = () => {
        setCurrentStep('intro');
        setSelectedCountry('');
    };

    const handleShowAllBanks = () => {
        setCurrentStep('bank-selection');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={handleBack}>
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-lg font-semibold">Select Country</h2>
            </div>

            <div className="space-y-3">
                {COUNTRIES.map((country) => (
                    <button
                        key={country.code}
                        onClick={() => handleSelectCountry(country.code)}
                        className="w-full p-4 border rounded-lg hover:bg-muted/50 transition-colors text-left flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{country.flag}</span>
                            <span className="font-medium">{country.name}</span>
                        </div>
                    </button>
                ))}
            </div>

            <Separator />

            <Button variant="outline" onClick={handleShowAllBanks} className="w-full">
                <Globe className="w-4 h-4 mr-2" />
                Show All Banks
            </Button>
        </div>
    );
};
