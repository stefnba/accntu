import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useGlobalBankAccountEndpoints, useGlobalBankEndpoints } from '@/features/bank/api';
import { useAddBankModal } from '@/features/bank/hooks';
import { ArrowLeft, CreditCard, DollarSign, PiggyBank, TrendingUp } from 'lucide-react';

const ACCOUNT_TYPE_ICONS = {
    checking: { icon: DollarSign, color: 'text-green-600', bgColor: 'bg-green-100' },
    savings: { icon: PiggyBank, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    credit_card: { icon: CreditCard, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    investment: { icon: TrendingUp, color: 'text-orange-600', bgColor: 'bg-orange-100' },
};

interface AccountSelectionStepProps {
    onContinue: () => void;
}

export const AccountSelectionStep = ({ onContinue }: AccountSelectionStepProps) => {
    const {
        selectedBankId,
        selectedAccountIds,
        handleAccountToggle,
        setCurrentStep,
        setSelectedAccountIds,
    } = useAddBankModal();

    const handleBack = () => {
        setCurrentStep('bank-selection');
        setSelectedAccountIds([]);
    };

    // Fetch the selected bank details
    const { data: selectedBank } = useGlobalBankEndpoints.getById({
        param: { id: selectedBankId },
    });

    // Fetch available bank accounts for the selected bank
    const { data: bankAccounts, isLoading } = useGlobalBankAccountEndpoints.getByBankId({
        param: { id: selectedBankId },
    });

    if (!selectedBankId || !selectedBank) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={handleBack}>
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-semibold text-xs">
                                {selectedBank.name.substring(0, 2).toUpperCase()}
                            </span>
                        </div>
                        <h3 className="font-semibold">{selectedBank.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Select the account types you want to connect
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-semibold">Choose Account Types</h2>
                <p className="text-sm text-muted-foreground">
                    Select all the account types you have with {selectedBank.name} that you'd like
                    to connect.
                </p>

                <div className="space-y-3">
                    {isLoading
                        ? Array.from({ length: 3 }).map((_, i) => (
                              <div key={i} className="border rounded-lg p-4">
                                  <div className="flex items-start gap-3">
                                      <Skeleton className="w-10 h-10 rounded-full" />
                                      <div className="flex-1 space-y-2">
                                          <Skeleton className="h-4 w-32" />
                                          <Skeleton className="h-3 w-48" />
                                      </div>
                                  </div>
                              </div>
                          ))
                        : bankAccounts?.map((account) => {
                              const isSelected = selectedAccountIds.includes(account.id);
                              const accountTypeConfig =
                                  ACCOUNT_TYPE_ICONS[
                                      account.type as keyof typeof ACCOUNT_TYPE_ICONS
                                  ];
                              const Icon = accountTypeConfig?.icon || DollarSign;
                              const color = accountTypeConfig?.color || 'text-gray-600';
                              const bgColor = accountTypeConfig?.bgColor || 'bg-gray-100';

                              return (
                                  <div
                                      key={account.id}
                                      className={`border rounded-lg p-4 transition-all cursor-pointer hover:bg-muted/50 ${
                                          isSelected
                                              ? 'border-primary bg-primary/5'
                                              : 'border-border'
                                      }`}
                                      onClick={() => handleAccountToggle(account.id)}
                                  >
                                      <div className="flex items-start gap-3">
                                          <div
                                              className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center mt-1`}
                                          >
                                              <Icon className={`w-5 h-5 ${color}`} />
                                          </div>

                                          <div className="flex-1 min-w-0">
                                              <div className="flex items-center justify-between">
                                                  <div>
                                                      <h4 className="font-medium">
                                                          {account.name}
                                                      </h4>
                                                      <p className="text-sm text-muted-foreground mt-1">
                                                          {account.description ||
                                                              `${account.type.replace('_', ' ')} account`}
                                                      </p>
                                                  </div>

                                                  <Checkbox
                                                      checked={isSelected}
                                                      onCheckedChange={() =>
                                                          handleAccountToggle(account.id)
                                                      }
                                                      className="ml-3"
                                                  />
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              );
                          })}
                </div>

                {!isLoading && bankAccounts?.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        <CreditCard className="w-8 h-8 mx-auto mb-3 opacity-50" />
                        <p>No account types available for this bank.</p>
                    </div>
                )}

                <Button
                    onClick={onContinue}
                    disabled={selectedAccountIds.length === 0 || isLoading}
                    className="w-full"
                >
                    Continue with {selectedAccountIds.length} account
                    {selectedAccountIds.length !== 1 ? 's' : ''}
                </Button>
            </div>
        </div>
    );
};
