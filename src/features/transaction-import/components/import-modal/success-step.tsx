import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, TrendingUp, Eye, ArrowRight, Sparkles } from 'lucide-react';

interface SuccessStepProps {
    onContinue: () => void;
    transactionCount?: number;
}

export const SuccessStep = ({ onContinue, transactionCount = 0 }: SuccessStepProps) => {
    return (
        <div className="space-y-8 py-8">
            <div className="text-center space-y-6">
                <div className="relative mx-auto w-24 h-24">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center shadow-2xl">
                        <Check className="w-12 h-12 text-white drop-shadow-sm" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            Import Complete!
                        </h2>
                        <div className="flex items-center justify-center gap-2">
                            <Badge variant="secondary" className="bg-green-100 text-green-700 text-lg px-4 py-2">
                                <TrendingUp className="w-4 h-4 mr-2" />
                                {transactionCount} transactions imported
                            </Badge>
                        </div>
                    </div>
                    <p className="text-muted-foreground text-lg max-w-lg mx-auto leading-relaxed">
                        {transactionCount === 0
                            ? 'Your transactions have been successfully imported and are now available in your account.'
                            : `All ${transactionCount} transactions have been successfully imported and are now available in your account.`}
                    </p>
                </div>
            </div>

            <Card className="border-2 border-green-100 bg-gradient-to-br from-green-50/80 to-emerald-50/50">
                <CardContent className="p-8">
                    <div className="text-center space-y-6">
                        <div className="flex justify-center">
                            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                                <Eye className="w-8 h-8 text-green-600" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-2xl font-semibold text-green-900">
                                Ready to Explore
                            </h3>
                            <p className="text-green-700 text-lg leading-relaxed max-w-md mx-auto">
                                Your imported transactions are now part of your financial overview. 
                                Start tracking, categorizing, and analyzing your spending patterns.
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                            <div className="text-center space-y-2">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto">
                                    <TrendingUp className="w-6 h-6 text-blue-600" />
                                </div>
                                <h4 className="font-semibold text-blue-900">Analyze Trends</h4>
                                <p className="text-sm text-blue-700">Track spending patterns</p>
                            </div>
                            <div className="text-center space-y-2">
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto">
                                    <Check className="w-6 h-6 text-purple-600" />
                                </div>
                                <h4 className="font-semibold text-purple-900">Categorize</h4>
                                <p className="text-sm text-purple-700">Organize transactions</p>
                            </div>
                            <div className="text-center space-y-2">
                                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto">
                                    <Sparkles className="w-6 h-6 text-orange-600" />
                                </div>
                                <h4 className="font-semibold text-orange-900">Insights</h4>
                                <p className="text-sm text-orange-700">Get smart reports</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4">
                <Button
                    variant="outline"
                    onClick={onContinue}
                    className="flex-1 h-14 text-lg border-2 border-green-200 hover:border-green-300 hover:bg-green-50"
                >
                    <Eye className="w-5 h-5 mr-2" />
                    View All Transactions
                </Button>
                <Button
                    onClick={onContinue}
                    className="flex-1 h-14 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                    <span className="flex items-center gap-2">
                        Continue to Dashboard
                        <ArrowRight className="w-5 h-5" />
                    </span>
                </Button>
            </div>
        </div>
    );
};