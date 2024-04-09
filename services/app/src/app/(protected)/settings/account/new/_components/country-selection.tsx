import Link from 'next/link';

const COUNTRIES = [
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
    { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' }
];

export const CountrySelection = () => {
    return (
        <div>
            <div>
                <ul className="grid grid-cols-4 space-x-2">
                    {COUNTRIES.map((country) => (
                        <Link
                            key={country.code}
                            href={{
                                pathname: '/settings/account/new',
                                query: { country: country.code }
                            }}
                        >
                            <li className="border rounded-md p-4">
                                {country.flag} {country.name}
                            </li>
                        </Link>
                    ))}
                </ul>
            </div>
        </div>
    );
};
