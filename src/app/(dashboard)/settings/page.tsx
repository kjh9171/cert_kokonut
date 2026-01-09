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
        if (!teamMemberEmail || !user) return
        if (user.role !== 'COMPANY_ADMIN') {
            alert("팀원 초대는 슈퍼 관리자(Company Admin)만 가능합니다.")
            return
        }

        addTeamMember(user.email, teamMemberEmail)
        alert(`${teamMemberEmail} 님을 팀원으로 등록했습니다.\n(초기 비밀번호: password)`)
        setTeamMemberEmail("")
    }

    if (!user) {
        return <div className="p-6 text-center text-slate-500 font-bold">사용자 정보를 불러올 수 없습니다. 로그인 상태를 확인하세요.</div>
    }

    return (
        <div className="space-y-6 p-6 min-h-full bg-[#F5F7FA]">
            <header className="flex flex-col gap-4 mb-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">계정 설정</h1>
                        <p className="text-sm text-slate-500 font-medium mt-1">계정 정보, 보안, 팀원 관리를 한곳에서 설정하세요.</p>
                    </div>
                </div>
            </header>

            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList className="bg-slate-50 p-1 rounded-lg border border-slate-200 h-10 w-fit">
                    <TabsTrigger value="profile" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-secondary data-[state=active]:shadow-sm px-6 h-8 transition-all text-slate-500 text-[12px] font-black">
                        내 프로필
                    </TabsTrigger>
                    <TabsTrigger value="security" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-secondary data-[state=active]:shadow-sm px-6 h-8 transition-all text-slate-500 text-[12px] font-black">
                        보안 설정
                    </TabsTrigger>
                    <TabsTrigger value="team" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-secondary data-[state=active]:shadow-sm px-6 h-8 transition-all text-slate-500 text-[12px] font-black">
                        팀 관리
                    </TabsTrigger>
                </TabsList>

                {/* Profile Section */}
                <TabsContent value="profile" className="animate-in fade-in-50 duration-500">
                    <Card className="border border-slate-200 shadow-sm rounded-lg overflow-hidden bg-white max-w-2xl">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
                            <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                                <User className="h-4 w-4 text-secondary" />
                                내 계정 정보
                            </CardTitle>
                            <CardDescription className="text-[11px] font-bold text-slate-400">가입 시 등록된 계정 정보입니다. 수정은 관리자에게 문의하세요.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5 p-6 pb-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">관리자명</Label>
                                    <Input value={user.adminName} disabled className="rounded-lg border-slate-200 h-9 font-bold text-sm bg-slate-50 text-slate-500" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">권한 등급</Label>
                                    <div className="h-9 flex items-center px-3 rounded-lg border border-slate-200 bg-slate-50">
                                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-secondary/10 text-secondary border border-secondary/20">
                                            {user.role === 'COMPANY_ADMIN' ? 'SUPER ADMIN' : 'TEAM MEMBER'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">로그인 이메일</Label>
                                <Input value={user.email} disabled className="rounded-lg border-slate-200 h-9 font-bold text-sm bg-slate-50 text-slate-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">소속 회사명</Label>
                                    <Input value={user.companyName} disabled className="rounded-lg border-slate-200 h-9 font-bold text-sm bg-slate-50 text-slate-500" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">사업자번호</Label>
                                    <Input value={user.businessRegistrationNumber} disabled className="rounded-lg border-slate-200 h-9 font-bold text-sm bg-slate-50 text-slate-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Section */}
                <TabsContent value="security" className="animate-in fade-in-50 duration-500">
                    <Card className="border border-slate-200 shadow-sm rounded-lg overflow-hidden bg-white max-w-2xl">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
                            <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                                <Key className="h-4 w-4 text-secondary" />
                                비밀번호 변경
                            </CardTitle>
                            <CardDescription className="text-[11px] font-bold text-slate-400">정기적인 비밀번호 변경으로 계정을 안전하게 보호하세요.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5 p-6">
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">현재 비밀번호</Label>
                                <Input
                                    type="password"
                                    className="rounded-lg h-9 border-slate-200 focus-visible:ring-secondary text-sm font-bold"
                                    value={passwordData.current}
                                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">새 비밀번호</Label>
                                    <Input
                                        type="password"
                                        className="rounded-lg h-9 border-slate-200 focus-visible:ring-secondary text-sm font-bold"
                                        value={passwordData.new}
                                        onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">비밀번호 확인</Label>
                                    <Input
                                        type="password"
                                        className="rounded-lg h-9 border-slate-200 focus-visible:ring-secondary text-sm font-bold"
                                        value={passwordData.confirm}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50/30 border-t border-slate-100 p-4 px-6 flex justify-end">
                            <Button onClick={handlePasswordChange} className="bg-secondary hover:bg-secondary/90 text-white rounded-lg px-6 h-9 font-black text-xs shadow-sm">
                                비밀번호 저장
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Team Section */}
                <TabsContent value="team" className="space-y-6 animate-in fade-in-50 duration-500">
                    <Card className="border border-slate-200 shadow-sm rounded-lg overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
                            <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                                <Users className="h-4 w-4 text-secondary" />
                                팀원 초대하기
                            </CardTitle>
                            <CardDescription className="text-[11px] font-bold text-slate-400">새로운 팀원을 등록하고 권한을 부여하세요.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row items-end gap-3">
                                <div className="space-y-1.5 flex-1 w-full">
                                    <Label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">초대할 이메일 주소</Label>
                                    <Input
                                        placeholder="teammate@company.com"
                                        className="rounded-lg h-9 border-slate-200 focus-visible:ring-secondary text-sm font-bold"
                                        value={teamMemberEmail}
                                        onChange={(e) => setTeamMemberEmail(e.target.value)}
                                        disabled={user.role !== 'COMPANY_ADMIN'}
                                    />
                                </div>
                                <Button onClick={handleInviteMember} disabled={user.role !== 'COMPANY_ADMIN'} className="bg-secondary hover:bg-secondary/90 text-white rounded-lg px-6 h-9 font-black text-xs shadow-sm w-full sm:w-auto">
                                    초대장 발송
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-slate-200 shadow-sm rounded-lg overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
                            <CardTitle className="text-sm font-black text-slate-800">소속 팀원 현황</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {users.filter(u => u.companyName === user.companyName && u.id !== user.id).length === 0 ? (
                                <div className="text-center py-12 text-slate-400 bg-white">
                                    <Users className="h-10 w-10 text-slate-100 mx-auto mb-3" />
                                    <p className="text-[12px] font-bold">아직 등록된 팀원이 없습니다.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {users.filter(u => u.companyName === user.companyName && u.id !== user.id).map(member => (
                                        <div key={member.id} className="flex justify-between items-center px-6 py-4 hover:bg-slate-50/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-slate-100 h-8 w-8 rounded-full flex items-center justify-center text-slate-400 font-bold text-xs uppercase">
                                                    {member.email.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-slate-900">{member.email}</div>
                                                    <div className="mt-1">
                                                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${member.role === 'COMPANY_ADMIN' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                                                            {member.role === 'COMPANY_ADMIN' ? '관리자' : '일반 팀원'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {user.role === 'COMPANY_ADMIN' && (
                                                <Button variant="ghost" size="sm" className="h-8 text-[11px] font-bold text-slate-300 hover:text-primary hover:bg-primary/5 rounded-md">
                                                    멤버 제거
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Alert className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
                        <Shield className="h-4 w-4 text-secondary mt-0.5" />
                        <div>
                            <AlertTitle className="text-secondary font-black text-[12px] mb-1">권한 및 보안 안내</AlertTitle>
                            <AlertDescription className="text-slate-600 text-[11px] font-bold leading-relaxed">
                                팀원 추가 시 초기 비밀번호는 <code className="bg-white border border-blue-100 px-1 rounded text-secondary">password</code>로 설정됩니다. 보안을 위해 팀원 접속 후 즉시 비밀번호를 변경하도록 안내해 주세요.
                            </AlertDescription>
                        </div>
                    </Alert>
                </TabsContent>
            </Tabs>
        </div>
    )
}
