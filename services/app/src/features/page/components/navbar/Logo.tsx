import Image from 'next/image';
import Link from 'next/link';

const Logo = () => {
    return (
        <Link href="/">
            <Image src="/images/logo.png" width={40} height={40} alt="logo" />
        </Link>
    );
};

export default Logo;
