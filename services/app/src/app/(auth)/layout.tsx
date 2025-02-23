const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex h-screen w-full flex-col bg-foreground">
            <div className="flex h-full flex-1 pt-32">
                <div className="mx-auto mb-auto rounded-lg bg-card p-8">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;
