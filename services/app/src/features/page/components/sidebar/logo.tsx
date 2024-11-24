import Image from 'next/image';
import Link from 'next/link';

const Logo = () => {
    return (
        <Link className="flex items-center h-9" href="/">
            <div className="text-sidebar-foreground gap-2 font-medium flex items-center ml-[10px] text-md leading-6">
                <Image
                    className="[&>img]:shrink-0"
                    src="/images/logo.png"
                    width={24}
                    height={24}
                    alt="logo"
                />
                <span className="text-sidebar-primary delay-200 ease-linear group-data-[collapsible=icon]:hidden">
                    accntu
                </span>
            </div>
        </Link>
    );
};

export default Logo;
