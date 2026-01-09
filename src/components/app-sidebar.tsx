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
    const { logout } = useAuthStore()

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <div className="flex items-center gap-2 px-2 py-4">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-primary-foreground">
                        <ShieldCheck className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">비즈가드</span>
                        <span className="truncate text-xs">BizGuard Platform</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                {data.navMain.map((item) => (
                    <SidebarGroup key={item.title}>
                        <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {item.items.map((subItem) => (
                                    <SidebarMenuItem key={subItem.title}>
                                        <SidebarMenuButton asChild tooltip={subItem.title}>
                                            <a href={subItem.url}>
                                                {item.icon && <item.icon />}
                                                <span>{subItem.title}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                            onClick={() => {
                                logout()
                                // The ProtectedRoute will handle redirect, or user can click login
                                window.location.href = '/login'
                            }}
                        >
                            <Lock className="h-4 w-4" />
                            <span>로그아웃 (Logout)</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <div className="p-4 text-xs text-center text-muted-foreground">
                    © 2024 BizGuard
                </div>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
