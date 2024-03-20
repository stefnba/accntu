interface AccountLayoutProps {
    children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
    return (
        <div className="flex h-full">
            Public
            <main className="w-full px-6">{children}</main>
        </div>
    );
}
