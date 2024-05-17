interface Props {
    onClick?: () => void;
    label: string;
}

/**
 * Bank & account card component used in Modal.
 */
export const BankAccountCard: React.FC<Props> = ({ onClick, label }) => {
    return (
        <div
            onClick={onClick}
            className="flex text-2xl rounded-md border align-middle items-center justify-center h-24 cursor-pointer hover:shadow-md transition hover:border-gray-300"
        >
            {label}
        </div>
    );
};
