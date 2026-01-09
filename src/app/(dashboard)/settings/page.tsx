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
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">설정 (Settings)</h2>
                <p className="text-slate-500 text-lg">계정 정보 및 보안 설정을 관리합니다.</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="bg-slate-100 p-1.5 rounded-2xl h-14 w-fit">
                    <TabsTrigger value="profile" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md px-8 py-2.5 transition-all text-slate-500 text-base font-semibold">내 프로필</TabsTrigger>
                    <TabsTrigger value="security" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md px-8 py-2.5 transition-all text-slate-500 text-base font-semibold">보안 및 비밀번호</TabsTrigger>
                    <TabsTrigger value="team" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md px-8 py-2.5 transition-all text-slate-500 text-base font-semibold">팀원 관리</TabsTrigger>
                </TabsList>

                {/* Profile Section */}
                <TabsContent value="profile">
                    <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-md">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6 pt-8 px-8">
                            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
                                <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                                    <User className="h-5 w-5" />
                                </div>
                                내 정보
                            </CardTitle>
                            <CardDescription>가입 시 등록된 계정 정보입니다.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 p-8">
                            <div className="grid gap-3">
                                <Label className="text-slate-600 font-semibold px-1">이름 (관리자명)</Label>
                                <Input value={user.adminName} disabled className="bg-slate-50 border-slate-200 text-slate-500 rounded-xl h-12" />
                            </div>
                            <div className="grid gap-3">
                                <Label className="text-slate-600 font-semibold px-1">이메일</Label>
                                <Input value={user.email} disabled className="bg-slate-50 border-slate-200 text-slate-500 rounded-xl h-12" />
                            </div>
                            <div className="grid gap-3">
                                <Label className="text-slate-600 font-semibold px-1">회사명</Label>
                                <Input value={user.companyName} disabled className="bg-slate-50 border-slate-200 text-slate-500 rounded-xl h-12" />
                            </div>
                            <div className="grid gap-3">
                                <Label className="text-slate-600 font-semibold px-1">사업자등록번호</Label>
                                <Input value={user.businessRegistrationNumber} disabled className="bg-slate-50 border-slate-200 text-slate-500 rounded-xl h-12" />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Section */}
                <TabsContent value="security">
                    <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-md">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6 pt-8 px-8">
                            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
                                <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
                                    <Key className="h-5 w-5" />
                                </div>
                                비밀번호 변경
                            </CardTitle>
                            <CardDescription>주기적인 비밀번호 변경으로 계정을 안전하게 보호하세요.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 p-8">
                            <div className="grid gap-3">
                                <Label className="text-slate-600 font-semibold px-1">현재 비밀번호</Label>
                                <Input
                                    type="password"
                                    className="rounded-xl h-12 border-slate-200 focus:ring-amber-500"
                                    value={passwordData.current}
                                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-3">
                                <Label className="text-slate-600 font-semibold px-1">새 비밀번호</Label>
                                <Input
                                    type="password"
                                    className="rounded-xl h-12 border-slate-200 focus:ring-amber-500"
                                    value={passwordData.new}
                                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-3">
                                <Label className="text-slate-600 font-semibold px-1">새 비밀번호 확인</Label>
                                <Input
                                    type="password"
                                    className="rounded-xl h-12 border-slate-200 focus:ring-amber-500"
                                    value={passwordData.confirm}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="p-8 pt-0 flex justify-end">
                            <Button onClick={handlePasswordChange} className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl px-8 h-12 font-bold shadow-lg shadow-amber-200">
                                비밀번호 변경
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Team Section */}
                <TabsContent value="team">
                    <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-md">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6 pt-8 px-8">
                            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
                                <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
                                    <Users className="h-5 w-5" />
                                </div>
                                팀원 관리 및 권한 설정
                            </CardTitle>
                            <CardDescription>
                                함께 일할 팀원을 초대하고 관리할 수 있습니다.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8 p-8">
                            <div className="flex items-end gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="grid gap-3 flex-1">
                                    <Label className="text-slate-700 font-semibold px-1">팀원 초대 (이메일)</Label>
                                    <Input
                                        placeholder="teammate@company.com"
                                        className="rounded-xl h-12 bg-white border-slate-200"
                                        value={teamMemberEmail}
                                        onChange={(e) => setTeamMemberEmail(e.target.value)}
                                        disabled={user.role !== 'COMPANY_ADMIN'}
                                    />
                                </div>
                                <Button onClick={handleInviteMember} disabled={user.role !== 'COMPANY_ADMIN'} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 h-12 font-bold shadow-lg shadow-indigo-200">초대하기</Button>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                                    <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                                    현재 팀원 목록
                                </h4>
                                <div className="rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                                    <div className="divide-y divide-slate-50">
                                        {users.filter(u => u.companyName === user.companyName && u.id !== user.id).length === 0 ? (
                                            <div className="text-sm text-center py-12 text-slate-400 bg-white">
                                                현재 등록된 추가 팀원이 없습니다.
                                            </div>
                                        ) : (
                                            users.filter(u => u.companyName === user.companyName && u.id !== user.id).map(member => (
                                                <div key={member.id} className="flex justify-between items-center p-5 bg-white hover:bg-slate-50 transition-colors">
                                                    <div>
                                                        <div className="font-bold text-slate-900">{member.email}</div>
                                                        <div className="text-xs font-semibold mt-1">
                                                            <span className={`px-2 py-0.5 rounded-full ${member.role === 'COMPANY_ADMIN' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                                                                {member.role === 'COMPANY_ADMIN' ? '관리자 (Admin)' : '팀원 (Member)'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {user.role === 'COMPANY_ADMIN' && (
                                                        <Button variant="ghost" size="sm" className="text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg">
                                                            삭제
                                                        </Button>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Alert className="bg-blue-50/50 border-blue-100 rounded-2xl p-4">
                                <Shield className="h-5 w-5 text-blue-600" />
                                <AlertTitle className="text-blue-800 font-bold ml-2">권한 관리 안내</AlertTitle>
                                <AlertDescription className="text-blue-700 ml-2 mt-1">
                                    사용자의 권한 수정은 유저 내부의 슈퍼 관리자만 가능하며,
                                    플랫폼 관리자는 귀사의 내부 권한 설정에 개입할 수 없습니다.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
