"use client"

import { useAuthStore } from "@/store/auth-store"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Activity, Server, AlertTriangle } from "lucide-react"

export default function AdminDashboardPage() {
    const { users, updateUserStatus } = useAuthStore()

    const handleResetPassword = (email: string) => {
        // In real app, trigger password reset email
        alert(`${email} 님에게 비밀번호 재설정 메일을 발송했습니다.`)
    }

    const handleToggleStatus = (id: string, currentStatus: string | undefined) => {
        const newStatus = currentStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED'
        updateUserStatus(id, newStatus)
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">관리자 대시보드 (Admin Dashboard)</h2>

            {/* System Stats Row */}
            {/* ... Stats Cards ... */}

            {/* User Management Table */}
            <Card>
                <CardHeader>
                    <CardTitle>사용자 관리 (User Management)</CardTitle>
                    <CardDescription>가입된 사용자 목록 및 계정 제어</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>이름 (Name)</TableHead>
                                <TableHead>회사명 (Company)</TableHead>
                                <TableHead>이메일 (Email)</TableHead>
                                <TableHead>권한 (Role)</TableHead>
                                <TableHead>상태 (Status)</TableHead>
                                <TableHead className="text-right">관리 (Actions)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.filter(u => u.role !== 'PLATFORM_ADMIN').length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-4">
                                        데이터가 없습니다. (No Users found)
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.filter(u => u.role !== 'PLATFORM_ADMIN').map((u) => (
                                    <TableRow key={u.id}>
                                        <TableCell className="font-medium">{u.adminName}</TableCell>
                                        <TableCell>{u.companyName}</TableCell>
                                        <TableCell>{u.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={u.role === 'COMPANY_ADMIN' ? 'default' : 'secondary'}>
                                                {u.role === 'COMPANY_ADMIN' ? '대표(Admin)' : '팀원(Member)'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={u.status === 'ACTIVE' ? 'default' : u.status === 'SUSPENDED' ? 'destructive' : 'secondary'}>
                                                {u.status || 'ACTIVE'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="outline" size="sm" onClick={() => handleResetPassword(u.email)}>
                                                PW초기화
                                                {u.role !== 'PLATFORM_ADMIN' && (
                                                    <Button
                                                        variant={u.status === 'SUSPENDED' ? 'default' : 'ghost'}
                                                        size="sm"
                                                        onClick={() => handleToggleStatus(u.id, u.status)}
                                                    >
                                                        {u.status === 'SUSPENDED' ? '활성화' : '중지'}
                                                    </Button>
                                                )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
