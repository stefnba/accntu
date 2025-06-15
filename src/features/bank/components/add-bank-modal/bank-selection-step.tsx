import { Button } from '@/components/ui/button';
import { InputWithIcon } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useGlobalBankEndpoints } from '@/features/bank/api';
import { useAddBankModal } from '@/features/bank/hooks';
import { ArrowLeft, Building2, Search } from 'lucide-react';
import { COUNTRIES } from './country-step';

export const BankSelectionStep = () => {
    const {
        setCurrentStep,
        handleSelectBank,
        searchQuery,
        setSearchQuery,
        selectedCountry,
        setSelectedBankId,
    } = useAddBankModal();

    const { data: globalBanksData, isLoading } = useGlobalBankEndpoints.getAll({
        query: { country: selectedCountry },
    });

    const handleBack = () => {
        setCurrentStep('country');
        setSelectedBankId('');
    };

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={handleBack}>
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="flex-1">
                    <h2 className="text-lg font-semibold">Select your institution</h2>
                    {selectedCountry && (
                        <p className="text-sm text-muted-foreground">
                            Banks in {COUNTRIES.find((c) => c.code === selectedCountry)?.name}
                        </p>
                    )}
                </div>
            </div>

            <InputWithIcon
                icon={Search}
                placeholder="Search for your bank..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
            />

            <div className="space-y-3 max-h-80 overflow-y-auto">
                {isLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="flex items-center gap-3 p-3">
                              <Skeleton className="w-10 h-10 rounded-full" />
                              <div className="space-y-2 flex-1">
                                  <Skeleton className="h-4 w-32" />
                                  <Skeleton className="h-3 w-24" />
                              </div>
                          </div>
                      ))
                    : globalBanksData?.map((bank) => (
                          <button
                              key={bank.id}
                              onClick={() => handleSelectBank(bank.id)}
                              className="w-full p-3 border rounded-lg hover:bg-muted/50 transition-colors text-left flex items-center gap-3"
                          >
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                  <span className="text-white font-semibold text-sm">
                                      {bank.name.substring(0, 2).toUpperCase()}
                                  </span>
                              </div>
                              <div>
                                  <h4 className="font-medium">{bank.name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                      www.{bank.name.toLowerCase().replace(/\s+/g, '')}.com
                                  </p>
                              </div>
                          </button>
                      ))}
            </div>

            {globalBanksData?.length === 0 && !isLoading && (
                <div className="text-center py-8 text-muted-foreground">
                    <Building2 className="w-8 h-8 mx-auto mb-3 opacity-50" />
                    <p>No banks found matching your search.</p>
                </div>
            )}
        </div>
    );
};
