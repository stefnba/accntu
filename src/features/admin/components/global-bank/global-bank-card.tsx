import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { BankLogo } from '@/features/bank/components/bank-logo';
import { IntegrationTypeBadge } from '@/features/bank/components/integration-type';
import { TGlobalBank } from '@/features/bank/schemas';
import Link from 'next/link';

interface GlobalBankCardProps {
    bank: TGlobalBank;
}

export const GlobalBankCard: React.FC<GlobalBankCardProps> = ({ bank }) => {
    return (
        <Link href={`/admin/banks/${bank.id}`} className="block">
            <Card className="group transition-all duration-200 hover:shadow-lg hover:shadow-gray-100 border-gray-200">
                <CardContent className="">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <BankLogo logoUrl={bank.logo} color={bank.color} size="lg" />
                            <div>
                                <CardTitle size="xl">{bank?.name || 'Unknown Bank'}</CardTitle>
                                <CardDescription className="flex items-center gap-2">
                                    <IntegrationTypeBadge
                                        integrationType={bank?.integrationTypes}
                                    />
                                </CardDescription>
                            </div>
                        </div>
                        {/* <MenuDropdown /> */}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
};
