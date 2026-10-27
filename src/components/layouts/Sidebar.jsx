import {
    BarChart3,
    Boxes,
    LayoutDashboard,
    PackageCheck,
    Settings2,
    UsersRound,
    Zap,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
    Sidebar as SidebarPrimitive,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarSeparator,
    useSidebar,
} from "@/components/ui/sidebar";

const navigation = [
    { title: "Overview", url: "/", icon: LayoutDashboard },
    { title: "Users", url: "/users", icon: UsersRound },
    { title: "Products", url: "/products", icon: Boxes },
    { title: "Orders", url: "/orders", icon: PackageCheck },
    { title: "Analytics", url: "/analytics", icon: BarChart3 },
    { title: "Settings", url: "/settings", icon: Settings2 },
];

export default function Sidebar() {
    const location = useLocation();
    const { isMobile, setOpenMobile } = useSidebar();

    return (
        <SidebarPrimitive
            collapsible="icon"
            className="border-sidebar-border bg-sidebar"
        >
            <SidebarHeader className="p-4 group-data-[collapsible=icon]:p-2">
                <div className="flex items-center gap-3 px-1 py-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
                    <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20 group-data-[collapsible=icon]:size-7">
                        <Zap className="size-[18px] group-data-[collapsible=icon]:size-3.5" fill="currentColor" aria-hidden="true" />
                    </div>
                    <div className="grid min-w-0 flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                        <span className="truncate text-sm font-bold tracking-tight text-slate-900">
                            Velo
                        </span>
                        <span className="truncate text-xs text-slate-500">
                            Admin workspace
                        </span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarSeparator
                className="mx-4"
                style={{ width: "calc(100% - 2rem)" }}
            />

            <SidebarContent className="px-2 py-3">
                <SidebarGroup className="p-0">
                    <SidebarGroupLabel className="px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 group-data-[collapsible=icon]:-mt-8">
                        Workspace
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1">
                            {navigation.map((item) => {
                                const isActive = location.pathname === item.url;
                                const Icon = item.icon;

                                return (
                                    <SidebarMenuItem key={item.url}>
                                        <SidebarMenuButton
                                            isActive={isActive}
                                            tooltip={item.title}
                                            render={<NavLink to={item.url} />}
                                            onClick={() => {
                                                if (isMobile) setOpenMobile(false);
                                            }}
                                            className="h-10 rounded-xl px-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 data-active:bg-indigo-50 data-active:text-indigo-700 data-active:shadow-sm [&>svg]:size-[18px] data-active:[&>svg]:text-indigo-600"
                                        >
                                            <Icon aria-hidden="true" />
                                            <span>{item.title}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-3">
                <div className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-white/70 p-2.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-1">
                    <div className="grid size-8 shrink-0 place-items-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                        A
                    </div>
                    <div className="grid min-w-0 flex-1 leading-tight group-data-[collapsible=icon]:hidden">
                        <span className="truncate text-xs font-semibold text-slate-800">
                            Admin
                        </span>
                        <span className="truncate text-[11px] text-slate-500">
                            Dashboard access
                        </span>
                    </div>
                </div>
            </SidebarFooter>
            <SidebarRail />
        </SidebarPrimitive>
    );
}
