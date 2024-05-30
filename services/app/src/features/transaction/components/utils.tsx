export const Amount: React.FC<{ amount: number; currency: string }> = ({
    amount,
    currency
}) => {
    return (
        <div>
            <span className="text-4xl font-bold">
                {Math.trunc(amount).toLocaleString('en-US', {
                    maximumFractionDigits: 0,
                    minimumFractionDigits: 0,
                    currency: currency
                })}
            </span>
            <span>.{Math.round((amount % 1) * 100)}</span>
            <span className="text-sm ml-1">{currency}</span>
        </div>
    );
};
