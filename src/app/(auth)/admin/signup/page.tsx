"use client"

import { useState } from "react"
import { useAuthStore } from "@/store/auth-store"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShieldAlert, UserPlus } from "lucide-react"

export default function AdminSignupPage() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        adminName: "",
        companyName: "BizGuard Corp", // Default for internal admins
        businessRegistrationNumber: "000-00-00000",
        adminCode: ""
    })
    const [error, setError] = useState("")
    const { signup } = useAuthStore()
    const router = useRouter()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value })
    }

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        // ADMIN SECRET KEY CHECK
        if (formData.adminCode !== "super_secret_admin_key") {
            setError("관리자 등록 코드가 올바르지 않습니다.")
            return
        }

        try {
            signup({
                email: formData.email,
                passwordHash: formData.password, // Mock hash
                adminName: formData.adminName,
                companyName: formData.companyName,
                businessRegistrationNumber: formData.businessRegistrationNumber,
            }, 'PLATFORM_ADMIN')

            alert("관리자 등록이 완료되었습니다. 로그인해주세요.")
            router.push("/admin/login")
        } catch (err) {
            setError("가입 중 오류가 발생했습니다.")
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900 px-4">
            <Card className="w-full max-w-lg border-slate-700 bg-slate-800 text-slate-100">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <ShieldAlert className="w-8 h-8 text-yellow-500" />
                    </div>
                    <CardTitle className="text-center">플랫폼 관리자 등록</CardTitle>
                    <CardDescription className="text-center text-slate-400">
                        신규 관리자 계정을 생성합니다. <br />
                        보안 코드가 필요합니다.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="adminName">관리자명</Label>
                                <Input id="adminName" placeholder="홍길동" className="bg-slate-900 border-slate-700" onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">이메일</Label>
                                <Input id="email" type="email" placeholder="admin@bizguard.co.kr" className="bg-slate-900 border-slate-700" onChange={handleChange} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">비밀번호</Label>
                            <Input id="password" type="password" className="bg-slate-900 border-slate-700" onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="adminCode" className="text-yellow-500 font-bold">관리자 보안 코드 (Secret Key)</Label>
                            <Input id="adminCode" type="password" placeholder="발급받은 코드 입력" className="bg-slate-900 border-yellow-600 focus:ring-yellow-500" onChange={handleChange} />
                        </div>

                        {error && (
                            <Alert variant="destructive" className="bg-red-900/50 border-red-900 text-red-200">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold" type="submit">
                            <UserPlus className="mr-2 h-4 w-4" /> 관리자 등록 완료
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center">
                    <Button variant="link" className="text-slate-400" onClick={() => router.push("/admin/login")}>
                        이미 계정이 있으신가요? 관리자 로그인
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
