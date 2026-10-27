
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function MainLayout() {
    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <main className="min-w-0 flex-1 p-4 sm:p-6">
                <Outlet />
            </main>
        </div>
    );
}
