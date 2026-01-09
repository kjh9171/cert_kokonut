"use client"

import { useState } from "react"
import { useAuthStore } from "@/store/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { User, Shield, Key, Users } from "lucide-react"

export default function SettingsPage() {
    const { user, users, addTeamMember } = useAuthStore()

    // Mock States for Forms
    const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" })
    const [teamMemberEmail, setTeamMemberEmail] = useState("")

    const handlePasswordChange = () => {
        if (passwordData.new !== passwordData.confirm) {
            alert("새 비밀번호가 일치하지 않습니다.")
            return
        }
        alert("비밀번호가 성공적으로 변경되었습니다.")
        setPasswordData({ current: "", new: "", confirm: "" })
    }

    const handleInviteMember = () => {
        if (!teamMemberEmail) return
        if (user?.role !== 'COMPANY_ADMIN') {
            alert("팀원 초대는 슈퍼 관리자(Company Admin)만 가능합니다.")
            return
        }

        addTeamMember(user.email, teamMemberEmail)
        alert(`${teamMemberEmail} 님을 팀원으로 등록했습니다.\n(초기 비밀번호: password)`)
        setTeamMemberEmail("")
    }

    if (!user) return null

    return (
        <div className="space-y-8 min-h-full bg-gradient-to-b from-background to-slate-50 p-4 md:p-8">
            <header className="flex flex-col gap-3">
                <div className="inline-flex items-center gap-2 w-fit">
                    <span className="px-4 py-2 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">⚙️ 설정 및 관리</span>
                </div>
                <div>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mb-2">계정 설정</h1>
                    <p className="text-lg text-slate-600 font-medium">계정 정보, 보안, 팀원 관리를 한곳에서 설정하세요.</p>
                </div>
            </header>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="bg-slate-100 p-1.5 rounded-xl h-auto w-fit inline-flex">
                    <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md px-6 py-2.5 transition-all text-slate-600 text-sm font-bold hover:text-slate-900">
                        👤 내 프로필
                    </TabsTrigger>
                    <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-md px-6 py-2.5 transition-all text-slate-600 text-sm font-bold hover:text-slate-900">
                        🔐 보안
                    </TabsTrigger>
                    <TabsTrigger value="team" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-md px-6 py-2.5 transition-all text-slate-600 text-sm font-bold hover:text-slate-900">
                        👥 팀 관리
                    </TabsTrigger>
                </TabsList>

                {/* Profile Section */}
                <TabsContent value="profile">
                    <Card className="border-2 border-slate-200 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-25 border-b border-blue-100 pb-6 pt-6 px-6">
                            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                <div className="bg-blue-600 p-2.5 rounded-lg text-white shadow-lg">
                                    <User className="h-5 w-5" />
                                </div>
                                내 계정 정보
                            </CardTitle>
                            <CardDescription className="text-slate-600 font-medium text-sm mt-1">가입 시 등록된 계정 정보입니다.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5 p-6 md:p-8">
                            <div className="grid gap-2">
                                <Label className="text-slate-700 font-bold">관리자명</Label>
                                <Input value={user.adminName} disabled className="bg-slate-50 border-slate-300 text-slate-700 rounded-lg h-11 font-medium" />
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-slate-700 font-bold">이메일 주소</Label>
                                <Input value={user.email} disabled className="bg-slate-50 border-slate-300 text-slate-700 rounded-lg h-11 font-medium" />
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-slate-700 font-bold">회사명</Label>
                                <Input value={user.companyName} disabled className="bg-slate-50 border-slate-300 text-slate-700 rounded-lg h-11 font-medium" />
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-slate-700 font-bold">사업자등록번호</Label>
                                <Input value={user.businessRegistrationNumber} disabled className="bg-slate-50 border-slate-300 text-slate-700 rounded-lg h-11 font-medium" />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Section */}
                <TabsContent value="security">
                    <Card className="border-2 border-amber-200 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all">
                        <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-25 border-b border-amber-100 pb-6 pt-6 px-6">
                            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                <div className="bg-amber-600 p-2.5 rounded-lg text-white shadow-lg">
                                    <Key className="h-5 w-5" />
                                </div>
                                비밀번호 변경
                            </CardTitle>
                            <CardDescription className="text-slate-600 font-medium text-sm mt-1">정기적인 비밀번호 변경으로 계정을 안전하게 보호하세요.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5 p-6 md:p-8">
                            <div className="grid gap-2">
                                <Label className="text-slate-700 font-bold">현재 비밀번호</Label>
                                <Input
                                    type="password"
                                    className="rounded-lg h-11 border-slate-300 focus:border-amber-500 focus:ring-amber-500"
                                    value={passwordData.current}
                                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-slate-700 font-bold">새 비밀번호</Label>
                                <Input
                                    type="password"
                                    className="rounded-lg h-11 border-slate-300 focus:border-amber-500 focus:ring-amber-500"
                                    value={passwordData.new}
                                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-slate-700 font-bold">새 비밀번호 확인</Label>
                                <Input
                                    type="password"
                                    className="rounded-lg h-11 border-slate-300 focus:border-amber-500 focus:ring-amber-500"
                                    value={passwordData.confirm}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                    placeholder="••••••••"
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="p-6 md:p-8 pt-0 flex justify-end">
                            <Button onClick={handlePasswordChange} className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg px-8 h-11 font-bold shadow-lg hover:shadow-xl transition-all">
                                비밀번호 변경
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Team Section */}
                <TabsContent value="team">
                    <div className="space-y-6">
                        <Card className="border-2 border-indigo-200 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all">
                            <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-25 border-b border-indigo-100 pb-6 pt-6 px-6">
                                <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                    <div className="bg-indigo-600 p-2.5 rounded-lg text-white shadow-lg">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    팀원 초대
                                </CardTitle>
                                <CardDescription className="text-slate-600 font-medium text-sm mt-1">함께 일할 팀원을 초대하세요.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 md:p-8">
                                <div className="flex flex-col sm:flex-row items-end gap-4">
                                    <div className="grid gap-2 flex-1 w-full">
                                        <Label className="text-slate-700 font-bold">팀원 이메일</Label>
                                        <Input
                                            placeholder="teammate@company.com"
                                            className="rounded-lg h-11 bg-white border-slate-300"
                                            value={teamMemberEmail}
                                            onChange={(e) => setTeamMemberEmail(e.target.value)}
                                            disabled={user.role !== 'COMPANY_ADMIN'}
                                        />
                                    </div>
                                    <Button onClick={handleInviteMember} disabled={user.role !== 'COMPANY_ADMIN'} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-8 h-11 font-bold shadow-lg hover:shadow-xl transition-all w-full sm:w-auto">
                                        초대하기
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-2 border-slate-200 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all">
                            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-25 border-b border-slate-100 pb-6 pt-6 px-6">
                                <CardTitle className="text-xl font-bold text-slate-900">현재 팀원 목록</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {users.filter(u => u.companyName === user.companyName && u.id !== user.id).length === 0 ? (
                                    <div className="text-center py-12 text-slate-400 bg-white">
                                        <p className="text-sm font-medium">아직 초대된 팀원이 없습니다.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {users.filter(u => u.companyName === user.companyName && u.id !== user.id).map(member => (
                                            <div key={member.id} className="flex justify-between items-center p-5 hover:bg-slate-50 transition-colors">
                                                <div>
                                                    <div className="font-bold text-slate-900">{member.email}</div>
                                                    <div className="text-xs font-bold mt-2">
                                                        <span className={`px-3 py-1 rounded-full ${member.role === 'COMPANY_ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                                                            {member.role === 'COMPANY_ADMIN' ? '👨‍💼 관리자' : '👤 팀원'}
                                                        </span>
                                                    </div>
                                                </div>
                                                {user.role === 'COMPANY_ADMIN' && (
                                                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg font-medium">
                                                        제거
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Alert className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
                            <Shield className="h-5 w-5 text-blue-600" />
                            <AlertTitle className="text-blue-900 font-bold ml-3">ℹ️ 권한 관리 안내</AlertTitle>
                            <AlertDescription className="text-blue-800 ml-3 mt-1 text-sm">
                                사용자 권한 수정은 슈퍼 관리자만 가능하며, 플랫폼 관리자는 내부 권한 설정에 개입할 수 없습니다.
                            </AlertDescription>
                        </Alert>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
