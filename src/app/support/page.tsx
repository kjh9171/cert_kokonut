"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Send, ShieldCheck } from "lucide-react"

export default function SupportPage() {
    const [formData, setFormData] = useState({
        subject: "",
        category: "general",
        message: ""
    })
    const [isSending, setIsSending] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.subject || !formData.message) return

        setIsSending(true)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))

        alert("문의가 접수되었습니다. 플랫폼 관리자가 확인 후 이메일로 답변드립니다.")
        setFormData({ subject: "", category: "general", message: "" })
        setIsSending(false)
    }

    return (
        <div className="min-h-screen bg-[#F5F7FA] font-sans">
            <header className="bg-white border-b border-slate-200 py-6">
                <div className="max-w-4xl mx-auto px-6 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="p-2 bg-primary rounded-lg group-hover:rotate-6 transition-transform">
                            <ShieldCheck className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-black text-slate-900 tracking-tight">BizGuard</span>
                    </Link>
                    <nav>
                        <Link href="/" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">
                            메인으로 돌아가기
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="max-w-4xl mx-auto space-y-6 p-6 py-12">
                <header className="flex flex-col gap-4 mb-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">고객 지원 센터</h1>
                            <p className="text-base text-slate-500 font-medium mt-1">
                                서비스 이용 중 궁금한 점이나 불편한 점이 있다면 언제든 연락주세요.
                            </p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <Card className="border border-slate-200 shadow-sm rounded-lg overflow-hidden bg-white">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
                                <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
                                    <Mail className="h-4 w-4 text-secondary" />
                                    문의하기
                                </CardTitle>
                                <CardDescription className="text-[11px] font-bold text-slate-400">
                                    작성하신 내용은 담당자에게 즉시 전달되며, 24시간 내에 이메일로 답변드립니다.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">문의 카테고리</Label>
                                        <Select
                                            value={formData.category}
                                            onValueChange={(val) => setFormData({ ...formData, category: val })}
                                        >
                                            <SelectTrigger className="h-9 rounded-lg border-slate-200 bg-white focus-visible:ring-secondary text-sm font-bold">
                                                <SelectValue placeholder="유형을 선택하세요" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-lg border-slate-200 shadow-lg">
                                                <SelectItem value="general" className="text-xs font-bold">📋 일반 문의</SelectItem>
                                                <SelectItem value="billing" className="text-xs font-bold">💳 결제/요금 문의</SelectItem>
                                                <SelectItem value="technical" className="text-xs font-bold">🔧 기술/오류 문의</SelectItem>
                                                <SelectItem value="feature" className="text-xs font-bold">💡 기능 제안</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">제목 *</Label>
                                        <Input
                                            placeholder="문의 제목을 입력해주세요"
                                            className="h-9 rounded-lg border-slate-200 focus-visible:ring-secondary text-sm font-bold"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">문의 상세 내용 *</Label>
                                        <Textarea
                                            placeholder="상세한 내용을 작성해주세요. 더 자세할수록 빠른 답변이 가능합니다."
                                            className="min-h-[180px] rounded-lg border-slate-200 focus-visible:ring-secondary text-sm font-bold p-4 resize-none"
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        />
                                    </div>

                                    <Button
                                        className="w-full bg-secondary hover:bg-secondary/90 text-white rounded-lg h-10 font-black text-xs shadow-sm disabled:opacity-50"
                                        type="submit"
                                        disabled={isSending || !formData.subject || !formData.message}
                                    >
                                        {isSending ? (
                                            <span className="flex items-center gap-2">
                                                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                문의 발송 중...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Send className="h-3.5 w-3.5" />
                                                온라인 문의 접수 (전달)
                                            </span>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="border border-slate-200 shadow-sm rounded-lg overflow-hidden bg-white">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 px-6">
                                <CardTitle className="text-sm font-bold text-slate-800">자주 묻는 질문</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3">
                                {[
                                    { q: "구독 취소 방법", a: "설정 > 프로필 하단에서 가능합니다." },
                                    { q: "데이터 보안 수준", a: "AES-256 군사 등급 암호화 적용" },
                                    { q: "팀원 초대 한도", a: "현재 플랜에 따라 다릅니다." },
                                ].map((faq, idx) => (
                                    <div key={idx} className="p-3 rounded border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-blue-200 transition-all cursor-pointer group">
                                        <p className="text-[11px] font-black text-slate-900 mb-1 flex items-center gap-1.5">
                                            <span className="text-secondary group-hover:scale-110 transition-transform">Q.</span> {faq.q}
                                        </p>
                                        <p className="text-[10px] text-slate-500 font-bold leading-relaxed">{faq.a}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <div className="bg-secondary/5 border border-secondary/10 rounded-lg p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="bg-secondary/10 p-1.5 rounded-md">
                                    <Mail className="h-4 w-4 text-secondary" />
                                </div>
                                <h3 className="text-sm font-black text-secondary">직통 채널</h3>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Business Support</p>
                                <p className="text-sm font-black text-slate-800">support@kokonut.io</p>
                                <p className="text-[11px] font-bold text-slate-500 mt-2">평일 09:00 - 18:00 (KST)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
