import { Outlet } from "react-router-dom";

export default function BlankLayout({

}: {

    }) {
    return (
        <div className="relative flex flex-col ">
            <main className="container mx-auto max-w-7xl px-2 flex-grow pt-4">
                <Outlet />
            </main>
        </div>
    );
}
