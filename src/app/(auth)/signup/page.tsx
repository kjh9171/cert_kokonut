"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { authenticator } from 'otplib'
import QRCode from 'qrcode'
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function SignupPage() {
    const router = useRouter()
    const { signup, generateOtpSecret } = useAuthStore()
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        adminName: "",
        companyName: "",
        bizId: ""
    })
    const [secret, setSecret] = useState("")
    const [qrUrl, setQrUrl] = useState("")

    useEffect(() => {
        if (formData.email) {
            const newSecret = generateOtpSecret(formData.email)
            setSecret(newSecret)
            // Generate OTPauth URL
            const otpauth = authenticator.keyuri(formData.email, 'SmartFinance', newSecret)
            QRCode.toDataURL(otpauth).then(setQrUrl)
        }
    }, [step]) // Generate valid QR when moving to step 2 (assuming email is entered)

    const handleSignup = () => {
        // In real app, we verify that the user scanned it by asking for a token first
        signup({
            email: formData.email,
            passwordHash: formData.password, // Mock hashing
            adminName: formData.adminName,
            companyName: formData.companyName,
            businessRegistrationNumber: formData.bizId,
            twoFactorSecret: secret
        })
        router.push('/login')
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/20">
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle>회원가입 (Signup)</CardTitle>
                    <CardDescription>
                        {step === 1 ? "관리자 및 회사 정보를 입력해주세요." : "Google OTP를 설정해주세요."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {step === 1 && (
                        <>
                            <div className="space-y-2">
                                <Label>이메일</Label>
                                <Input
                                    type="email"
                                    placeholder="admin@company.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>비밀번호</Label>
                                <Input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>관리자 이름</Label>
                                <Input
                                    placeholder="홍길동"
                                    value={formData.adminName}
                                    onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>회사명</Label>
                                <Input
                                    placeholder="(주)스마트파이낸스"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>사업자등록번호</Label>
                                <Input
                                    placeholder="123-45-67890"
                                    value={formData.bizId}
                                    onChange={(e) => setFormData({ ...formData, bizId: e.target.value })}
                                />
                            </div>
                            <Button
                                className="w-full"
                                onClick={() => setStep(2)}
                                disabled={!formData.email || !formData.password || !formData.companyName}
                            >
                                다음 (Next)
                            </Button>
                        </>
                    )}

                    {step === 2 && (
                        <div className="flex flex-col items-center space-y-4">
                            <div className="text-center text-sm text-muted-foreground">
                                아래 QR 코드를 Google Authenticator 앱으로 스캔해주세요.
                            </div>
                            {qrUrl && <img src={qrUrl} alt="QR Code" className="border rounded-lg" />}
                            <div className="text-xs text-gray-500 break-all">
                                Secret: {secret}
                            </div>
                            <Button className="w-full" onClick={handleSignup}>
                                계정 생성 완료 (Complete)
                            </Button>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="justify-center flex-col gap-4">
                    <Button variant="outline" className="w-full" onClick={() => router.push('/login')}>
                        이미 계정이 있으신가요? 로그인
                    </Button>
                    <div className="relative w-full">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Admin Only</span>
                        </div>
                    </div>
                    <Link href="/admin/signup" className="text-sm font-medium text-slate-500 hover:text-slate-900 hover:underline">
                        플랫폼 관리자 가입하기
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}
