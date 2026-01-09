"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Send } from "lucide-react"

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
        <div className="max-w-3xl mx-auto space-y-8 min-h-full bg-gradient-to-b from-background to-slate-50 p-4 md:p-8">
            <header className="flex flex-col gap-3">
                <div className="inline-flex items-center gap-2 w-fit">
                    <span className="px-4 py-2 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">💬 고객 지원</span>
                </div>
                <div>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mb-2">고객 지원 센터</h1>
                    <p className="text-lg text-slate-600 font-medium">
                        서비스 이용 중 궁금한 점이나 불편한 점이 있다면 언제든 연락주세요. 24시간 내에 답변해드립니다.
                    </p>
                </div>
            </header>

            <Card className="border-2 border-blue-200 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-25 border-b border-blue-100 pb-6 pt-6 px-6 md:px-8">
                    <CardTitle className="flex items-center gap-3 text-xl md:text-2xl font-bold text-slate-900">
                        <div className="bg-blue-600 p-2.5 rounded-lg text-white shadow-lg">
                            <Mail className="h-6 w-6" />
                        </div>
                        문의 작성
                    </CardTitle>
                    <CardDescription className="text-slate-600 font-medium text-sm md:text-base mt-1">
                        작성하신 내용은 플랫폼 관리자에게 즉시 전달됩니다.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-slate-700 font-bold">문의 유형</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(val) => setFormData({ ...formData, category: val })}
                            >
                                <SelectTrigger className="h-12 rounded-lg border-slate-300 bg-white focus:ring-blue-500 text-base font-medium">
                                    <SelectValue placeholder="유형을 선택하세요" />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg border-slate-200 shadow-lg">
                                    <SelectItem value="general">📋 일반 문의</SelectItem>
                                    <SelectItem value="billing">💳 결제/요금 문의</SelectItem>
                                    <SelectItem value="technical">🔧 기술/오류 문의</SelectItem>
                                    <SelectItem value="feature">💡 기능 제안</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-700 font-bold">제목 *</Label>
                            <Input
                                placeholder="문의 제목을 간단히 입력해주세요"
                                className="h-12 rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-base"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-700 font-bold">문의 내용 *</Label>
                            <Textarea
                                placeholder="상세한 내용을 작성해주세요. 더 자세할수록 빠른 답변이 가능합니다."
                                className="min-h-48 rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-base p-4 resize-none"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            />
                        </div>

                        <Button 
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-12 text-lg font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50" 
                            type="submit" 
                            disabled={isSending || !formData.subject || !formData.message}
                        >
                            {isSending ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    발송 중...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Send className="h-5 w-5" />
                                    문의하기
                                </span>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="border-2 border-slate-200 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-25 border-b border-slate-100 pb-5 pt-5 px-6 md:px-8">
                    <CardTitle className="text-lg font-bold text-slate-900">❓ 자주 묻는 질문</CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                    <div className="space-y-4">
                        {[
                            { q: "구독을 취소하려면 어떻게 해야 하나요?", a: "계정 설정 > 결제 정보에서 언제든 구독을 취소할 수 있습니다." },
                            { q: "데이터는 얼마나 안전한가요?", a: "AES-256 군사 등급 암호화를 사용하여 최고 수준의 보안을 제공합니다." },
                            { q: "팀원 초대는 어떻게 하나요?", a: "설정 > 팀 관리에서 팀원의 이메일을 입력하여 초대할 수 있습니다." },
                        ].map((faq, idx) => (
                            <div key={idx} className="p-4 rounded-lg border border-slate-200 hover:bg-blue-50/30 transition-colors cursor-pointer">
                                <p className="font-bold text-slate-900 mb-1">{faq.q}</p>
                                <p className="text-slate-600 text-sm">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
