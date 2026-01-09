"use client"

import * as React from "react"
import { useAuthStore } from "@/store/auth-store"
import {
    PieChart,
    ShieldCheck,
    Settings,
    Home,
    FileText,
    CreditCard,
    Lock,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarFooter,
} from "@/components/ui/sidebar"

// Identify the current path for active state highlighting would be nice, 
// strictly basic structure for now.

const data = {
    navMain: [
        {
            title: "재무 관리 (Financials)",
            url: "/financial",
            icon: PieChart,
            items: [
                {
                    title: "대시보드 (Dashboard)",
                    url: "/financial/dashboard",
                },
                {
                    title: "장부 관리 (Ledger)",
                    url: "/financial/ledger",
                },
                {
                    title: "재무 보고서 (Reports)",
                    url: "/financial/reports",
                },
            ],
        },
        {
            title: "개인정보 보호 (Privacy)",
            url: "/privacy",
            icon: ShieldCheck,
            items: [
                {
                    title: "관리 대시보드 (Dashboard)",
                    url: "/privacy/dashboard",
                },
                {
                    title: "보안 금고 (Vault)",
                    url: "/privacy/vault",
                },
                {
                    title: "방침 생성기 (Generator)",
                    url: "/privacy/policy-generator",
                },
                {
                    title: "법률 상담 (Consulting)",
                    url: "/privacy/consulting",
                },
            ],
        },
        {
            title: "설정 및 지원 (Settings)",
            url: "/settings",
            icon: Settings,
            items: [
                {
                    title: "계정 설정",
                    url: "/settings",
                },
                {
                    title: "문의하기 (Support)",
                    url: "/support",
                },
            ],
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { logout, user } = useAuthStore()

    return (
        <Sidebar collapsible="icon" className="border-r border-slate-100 shadow-xl shadow-slate-200/50" {...props}>
            <SidebarHeader className="border-b border-slate-50 bg-white/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 px-3 py-6">
                    <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 text-white shadow-lg shadow-blue-200">
                        <ShieldCheck className="size-6" />
                    </div>
                    <div className="grid flex-1 text-left leading-tight">
                        <span className="truncate text-base font-bold text-slate-900 tracking-tight">비즈가드</span>
                        <span className="truncate text-[10px] font-medium text-blue-500 uppercase tracking-wider">BizGuard Platform</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent className="bg-white px-2 pt-4">
                {data.navMain.map((item) => (
                    <SidebarGroup key={item.title} className="py-2">
                        <SidebarGroupLabel className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em]">{item.title}</SidebarGroupLabel>
                        <SidebarGroupContent className="pt-2">
                            <SidebarMenu className="gap-1">
                                {item.items.map((subItem) => (
                                    <SidebarMenuItem key={subItem.title}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={subItem.title}
                                            className="h-10 rounded-lg transition-all duration-200 hover:bg-slate-50 hover:text-blue-600 group data-[active=true]:bg-blue-50 data-[active=true]:text-blue-600"
                                        >
                                            <a href={subItem.url} className="flex items-center gap-3 font-medium">
                                                {item.icon && <item.icon className="size-4.5 transition-transform group-hover:scale-110" />}
                                                <span className="text-sm">{subItem.title}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarFooter className="border-t border-slate-50 bg-slate-50/50 p-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex flex-col gap-4">
                            <SidebarMenuButton
                                className="h-11 rounded-xl bg-white border border-slate-100 shadow-sm text-slate-600 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all group"
                                onClick={() => {
                                    logout()
                                    window.location.href = '/login'
                                }}
                            >
                                <Lock className="h-4 w-4 transition-colors group-hover:text-red-500" />
                                <span className="font-semibold text-sm">시스템 로그아웃</span>
                            </SidebarMenuButton>

                            <div className="flex items-center gap-3 px-2 py-2">
                                <div className="size-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs shadow-inner">
                                    {user?.adminName?.[0] || 'A'}
                                </div>
                                <div className="flex flex-col text-[11px]">
                                    <span className="font-bold text-slate-700 leading-none">{user?.adminName || 'Admin'}</span>
                                    <span className="text-slate-400 mt-1">{user?.email || 'admin@bizguard.io'}</span>
                                </div>
                            </div>
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
                <div className="mt-4 px-2 text-[10px] font-medium text-slate-300 tracking-widest uppercase">
                    © 2024 BizGuard Securty
                </div>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
