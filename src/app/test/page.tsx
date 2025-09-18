import Link from 'next/link';

export default function TestPage() {
    return (
        <div>
            <Link className="text-blue-500 hover:text-blue-600 hover:underline" href="/test/form">
                Form
            </Link>
        </div>
    );
}
