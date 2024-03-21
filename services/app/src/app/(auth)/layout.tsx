// import Logo from '@/app/(root)/_components/navbar/Logo';

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex h-screen w-full flex-col">
            <div className="p-6">{/* <Logo /> */}</div>
            <div className="flex h-full flex-1 pt-32">
                <div className=" mx-auto mb-auto rounded-lg bg-slate-100 p-8">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;
