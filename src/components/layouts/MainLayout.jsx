import {
    BarChart3,
    Boxes,
    LayoutDashboard,
    PackageCheck,
    Settings2,
    UsersRound,
} from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import Sidebar from "./Sidebar";

const pageDetails = {
    "/": { title: "Overview", icon: LayoutDashboard },
    "/users": { title: "Users", icon: UsersRound },
    "/products": { title: "Products", icon: Boxes },
    "/orders": { title: "Orders", icon: PackageCheck },
    "/analytics": { title: "Analytics", icon: BarChart3 },
    "/settings": { title: "Settings", icon: Settings2 },
};

export default function MainLayout() {
    const location = useLocation();
    const page = pageDetails[location.pathname] || {
        title: "Dashboard",
        icon: LayoutDashboard,
    };
    const PageIcon = page.icon;

    return (
        <SidebarProvider>
            <Sidebar />
            <SidebarInset className="min-w-0">
                <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-gradient-to-r from-white via-white to-indigo-50/60 px-4 shadow-[0_4px_20px_-18px_rgba(15,23,42,0.35)] backdrop-blur-md sm:px-6">
                    <div className="flex min-w-0 items-center gap-3">
                        <SidebarTrigger
                            aria-label="Toggle navigation"
                            className="size-9 shrink-0 rounded-xl border border-slate-200/80 bg-white text-slate-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                        />
                        <span className="h-8 w-px shrink-0 bg-gradient-to-b from-transparent via-slate-200 to-transparent" aria-hidden="true" />
                        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-100/80">
                            <PageIcon size={17} strokeWidth={2} aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                                Velo workspace
                            </p>
                            <h1 className="truncate text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
                                {page.title}
                            </h1>
                        </div>
                    </div>
                    <div className="ml-3 hidden shrink-0 items-center gap-2 rounded-full border border-emerald-100 bg-white/80 px-3 py-1.5 shadow-sm sm:flex">
                        <span className="relative flex size-2">
                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                        </span>
                        <span className="text-xs font-medium text-slate-600">
                            Workspace active
                        </span>
                    </div>
                </header>
                <div className="min-w-0 flex-1 p-4 sm:p-6">
                    <Outlet />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
