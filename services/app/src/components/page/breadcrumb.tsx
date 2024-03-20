import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export interface Breadcrumb {
    page: string;
    href: string;
}

interface BreadcrumbProps {
    breadcrumbs?: Breadcrumb[];
}

export const Breadcrumbs = ({ breadcrumbs }: BreadcrumbProps) => {
    if (!breadcrumbs) return;

    return (
        <ol className="mb-3 flex items-center space-x-2 md:space-x-3">
            {breadcrumbs.map((b, i) => (
                <>
                    {i > 0 && (
                        <ChevronRight
                            key={`${i}-icon`}
                            className="m-0 h-5 w-4"
                        />
                    )}
                    <li key={i} className="inline-flex items-center">
                        {i + 1 < breadcrumbs.length ? (
                            <Link
                                className="text-sm font-medium hover:underline"
                                href={b.href}
                            >
                                {b.page}
                            </Link>
                        ) : (
                            <span className="text-sm font-medium">
                                {b.page}
                            </span>
                        )}
                    </li>
                </>
            ))}
        </ol>
    );

    return (
        <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 rtl:space-x-reverse md:space-x-2">
                <li className="inline-flex items-center">
                    <Link
                        href="#"
                        className="inline-flex items-center text-sm  text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
                    >
                        Home
                    </Link>
                </li>
                <li>
                    <div className="flex items-center">
                        <svg
                            className="mx-1 h-3 w-3 text-gray-400 rtl:rotate-180"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 6 10"
                        >
                            <path
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="m1 9 4-4-4-4"
                            />
                        </svg>
                        <a
                            href="#"
                            className="ms-1 text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white md:ms-2"
                        >
                            Projects
                        </a>
                    </div>
                </li>
                <li aria-current="page">
                    <div className="flex items-center">
                        <svg
                            className="mx-1 h-3 w-3 text-gray-400 rtl:rotate-180"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 6 10"
                        >
                            <path
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="m1 9 4-4-4-4"
                            />
                        </svg>
                        <span className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ms-2">
                            Flowbite
                        </span>
                    </div>
                </li>
            </ol>
        </nav>
    );
};
