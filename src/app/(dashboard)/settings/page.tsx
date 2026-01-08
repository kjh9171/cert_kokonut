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
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">설정 (Settings)</h2>
                <p className="text-muted-foreground">계정 정보 및 보안 설정을 관리합니다.</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="profile">내 프로필</TabsTrigger>
                    <TabsTrigger value="security">보안 및 비밀번호</TabsTrigger>
                    <TabsTrigger value="team">팀원 관리</TabsTrigger>
                </TabsList>

                {/* Profile Section */}
                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>내 정보</CardTitle>
                            <CardDescription>가입 시 등록된 계정 정보입니다.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label>이름 (관리자명)</Label>
                                <Input value={user.adminName} disabled />
                            </div>
                            <div className="grid gap-2">
                                <Label>이메일</Label>
                                <Input value={user.email} disabled />
                            </div>
                            <div className="grid gap-2">
                                <Label>회사명</Label>
                                <Input value={user.companyName} disabled />
                            </div>
                            <div className="grid gap-2">
                                <Label>사업자등록번호</Label>
                                <Input value={user.businessRegistrationNumber} disabled />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Section */}
                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle>비밀번호 변경</CardTitle>
                            <CardDescription>주기적인 비밀번호 변경으로 계정을 안전하게 보호하세요.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label>현재 비밀번호</Label>
                                <Input
                                    type="password"
                                    value={passwordData.current}
                                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>새 비밀번호</Label>
                                <Input
                                    type="password"
                                    value={passwordData.new}
                                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>새 비밀번호 확인</Label>
                                <Input
                                    type="password"
                                    value={passwordData.confirm}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handlePasswordChange}>비밀번호 변경</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Team Section */}
                <TabsContent value="team">
                    <Card>
                        <CardHeader>
                            <CardTitle>팀원 관리 및 권한 설정</CardTitle>
                            <CardDescription>
                                함께 일할 팀원을 초대하고 관리할 수 있습니다.<br />
                                <span className="text-red-500 font-bold">* 이 기능은 '슈퍼 관리자(Super Admin)'만 사용할 수 있습니다.</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-end gap-4">
                                <div className="grid gap-2 flex-1">
                                    <Label>팀원 초대 (이메일)</Label>
                                    <Input
                                        placeholder="teammate@company.com"
                                        value={teamMemberEmail}
                                        onChange={(e) => setTeamMemberEmail(e.target.value)}
                                        disabled={user.role !== 'COMPANY_ADMIN'}
                                    />
                                </div>
                                <Button onClick={handleInviteMember} disabled={user.role !== 'COMPANY_ADMIN'}>초대하기</Button>
                            </div>

                            <div className="rounded-md border p-4">
                                <h4 className="font-medium mb-4 flex items-center gap-2">
                                    <Users className="h-4 w-4" /> 현재 팀원 목록
                                </h4>
                                {users.filter(u => u.companyName === user.companyName && u.id !== user.id).length === 0 ? (
                                    <div className="text-sm text-center py-8 text-muted-foreground">
                                        현재 등록된 추가 팀원이 없습니다.
                                    </div>
                                ) : (
                                    <ul className="space-y-2">
                                        {users.filter(u => u.companyName === user.companyName && u.id !== user.id).map(member => (
                                            <li key={member.id} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-900 rounded">
                                                <div>
                                                    <div className="font-medium">{member.email}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {member.role === 'COMPANY_ADMIN' && '관리자 (Admin)'}
                                                        {member.role === 'COMPANY_USER' && '팀원 (Member)'}
                                                    </div>
                                                </div>
                                                {user.role === 'COMPANY_ADMIN' && (
                                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                                                        삭제
                                                    </Button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <Alert>
                                <Shield className="h-4 w-4" />
                                <AlertTitle>권한 관리 안내</AlertTitle>
                                <AlertDescription>
                                    사용자의 권한(일반/관리자) 수정은 유저 내부의 슈퍼 관리자만 가능하며,
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
