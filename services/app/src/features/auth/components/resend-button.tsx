'use client';

interface Props {
    email: string;
}

export default function ResendButton({ email }: Props) {
    return (
        <button
            className="ml-1 text-primary hover:underline"
            onClick={() => sendToken({ email })}
        >
            Resend
        </button>
    );
}
