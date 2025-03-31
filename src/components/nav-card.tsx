import { Card } from '@/components/ui/card';
import Link, { LinkProps } from 'next/link';
import { UrlObject } from 'url';

type NavCardProps = LinkProps<UrlObject> & React.ComponentProps<'div'>;

export const NavCard: React.FC<NavCardProps> = ({ href, children }) => {
    return (
        <Link href={href}>
            <Card className="hover:scale-[1.01]">{children}</Card>
        </Link>
    );
};
