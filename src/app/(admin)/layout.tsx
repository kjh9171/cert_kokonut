import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin-sidebar"
import ProtectedAdminRoute from "@/components/protected-admin-route"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ProtectedAdminRoute>
            <SidebarProvider>
                <AdminSidebar />
                <main className="w-full">
                    <div className="p-2 border-b flex items-center bg-background">
                        <SidebarTrigger />
                        <span className="ml-4 font-semibold text-red-600">관리자 모드 (Admin Mode)</span>
                    </div>
                    <div className="p-4">
                        {children}
                    </div>
                </main>
            </SidebarProvider>
        </ProtectedAdminRoute>
    )
}
