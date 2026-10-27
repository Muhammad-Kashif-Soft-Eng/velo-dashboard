import { useLocation, Outlet } from "react-router-dom";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import Sidebar from "./Sidebar";

const pageTitles = {
    "/": "Overview",
    "/users": "Users",
    "/products": "Products",
    "/orders": "Orders",
    "/analytics": "Analytics",
    "/settings": "Settings",
};

export default function MainLayout() {
    const location = useLocation();
    const pageTitle = pageTitles[location.pathname] || "Dashboard";

    return (
        <SidebarProvider>
            <Sidebar />
            <SidebarInset className="min-w-0">
                <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md sm:px-6">
                    <SidebarTrigger
                        aria-label="Toggle navigation"
                        className="size-9 rounded-xl text-slate-600 hover:bg-slate-100"
                    />
                    <span className="h-5 w-px bg-slate-200" aria-hidden="true" />
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                            {pageTitle}
                        </p>
                        <p className="hidden text-[11px] text-slate-400 sm:block">
                            Velo admin workspace
                        </p>
                    </div>
                </header>
                <div className="min-w-0 flex-1 p-4 sm:p-6">
                    <Outlet />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
