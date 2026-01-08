import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import ProtectedRoute from "@/components/protected-route"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ProtectedRoute>
            <SidebarProvider>
                <AppSidebar />
                <main className="w-full">
                    <div className="p-2">
                        <SidebarTrigger />
                    </div>
                    <div className="p-4">
                        {children}
                    </div>
                </main>
            </SidebarProvider>
        </ProtectedRoute>
    )
}
