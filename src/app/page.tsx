import { ThemeToggle } from '@/components/layout/theme-selector';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
export default function Home() {
    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Welcome to Accntu</h1>
                <ThemeToggle />
            </div>
            <div className="grid gap-4">
                <Button>Get Started</Button>
            </div>
            <Link href="/dashboard">Dashboard</Link>
        </div>
    );
}
