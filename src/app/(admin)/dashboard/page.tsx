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
        <div className="space-y-6 p-6 bg-slate-50/50 min-h-full rounded-xl">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">관리자 대시보드 (Admin Dashboard)</h2>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-white px-3 py-1">
                        <Activity className="mr-1 h-3 w-3 text-emerald-500" /> 시스템 정상 (Normal)
                    </Badge>
                </div>
            </div>

            {/* System Stats Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none shadow-sm bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">전체 사용자</CardTitle>
                        <Users className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.length}명</div>
                        <p className="text-xs text-muted-foreground">+2명 새로운 가입</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">활동량 (API Call)</CardTitle>
                        <Activity className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,284</div>
                        <p className="text-xs text-muted-foreground">지난 24시간 기준</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">서버 상태</CardTitle>
                        <Server className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">안정적 (Stable)</div>
                        <p className="text-xs text-muted-foreground">가동률 99.9%</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">보안 알림</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0건</div>
                        <p className="text-xs text-muted-foreground">위험 감지 없음</p>
                    </CardContent>
                </Card>
            </div>

            {/* User Management Table */}
            <Card className="border-none shadow-sm bg-white overflow-hidden">
                <CardHeader className="border-b bg-slate-50/50">
                    <CardTitle className="text-xl">사용자 관리 (User Management)</CardTitle>
                    <CardDescription>가입된 사용자 목록 및 계정 제어</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/80">
                            <TableRow>
                                <TableHead className="font-semibold text-slate-700">이름</TableHead>
                                <TableHead className="font-semibold text-slate-700">회사명</TableHead>
                                <TableHead className="font-semibold text-slate-700">이메일</TableHead>
                                <TableHead className="font-semibold text-slate-700">권한</TableHead>
                                <TableHead className="font-semibold text-slate-700">상태</TableHead>
                                <TableHead className="text-right font-semibold text-slate-700">관리</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.filter(u => u.role !== 'PLATFORM_ADMIN').length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                                        데이터가 없습니다. (No Users found)
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.filter(u => u.role !== 'PLATFORM_ADMIN').map((u) => (
                                    <TableRow key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="font-semibold text-slate-900">{u.adminName}</TableCell>
                                        <TableCell className="text-slate-600">{u.companyName}</TableCell>
                                        <TableCell className="text-slate-600">{u.email}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={u.role === 'COMPANY_ADMIN' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 text-slate-600 border-slate-200'}>
                                                {u.role === 'COMPANY_ADMIN' ? '대표(Admin)' : '팀원(Member)'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={u.status === 'SUSPENDED' ? 'bg-rose-100 text-rose-700 hover:bg-rose-100 border-none' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none'}>
                                                {u.status || 'ACTIVE'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right space-x-1">
                                            <Button variant="outline" size="sm" className="h-8 text-xs font-medium border-slate-200 hover:bg-white hover:border-slate-400" onClick={() => handleResetPassword(u.email)}>
                                                PW초기화
                                            </Button>
                                            {u.role !== 'PLATFORM_ADMIN' && (
                                                <Button
                                                    variant={u.status === 'SUSPENDED' ? 'default' : 'ghost'}
                                                    size="sm"
                                                    className={`h-8 text-xs font-medium ${u.status === 'SUSPENDED' ? 'bg-emerald-600 hover:bg-emerald-700' : 'text-slate-600'}`}
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
