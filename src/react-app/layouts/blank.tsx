

export default function BlankLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative flex flex-col ">
            <main className="container mx-auto max-w-7xl px-2 flex-grow pt-4">
                {children}
            </main>
        </div>
    );
}
