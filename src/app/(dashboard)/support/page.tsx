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
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">고객 지원 (Support)</h2>
                <p className="text-slate-500 text-lg">
                    서비스 이용 중 궁금한 점이나 불편한 점이 있다면 언제든 문의해주세요.
                </p>
            </div>

            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-md">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-8 pt-10 px-10">
                    <CardTitle className="flex items-center gap-3 text-2xl font-bold text-slate-800">
                        <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-200">
                            <Mail className="h-6 w-6" />
                        </div>
                        문의 작성
                    </CardTitle>
                    <CardDescription className="text-slate-500 text-base">
                        작성하신 내용은 플랫폼 관리자에게 즉시 전달됩니다.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-10">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-3">
                            <Label className="text-slate-700 font-bold px-1">문의 유형</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(val) => setFormData({ ...formData, category: val })}
                            >
                                <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:ring-blue-500 text-base">
                                    <SelectValue placeholder="유형 선택" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                                    <SelectItem value="general" className="rounded-xl">일반 문의</SelectItem>
                                    <SelectItem value="billing" className="rounded-xl">결제/요금 문의</SelectItem>
                                    <SelectItem value="technical" className="rounded-xl">기술/오류 문의</SelectItem>
                                    <SelectItem value="feature" className="rounded-xl">기능 제안</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-slate-700 font-bold px-1">제목</Label>
                            <Input
                                placeholder="제목을 입력해주세요"
                                className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:ring-blue-500 text-base"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-slate-700 font-bold px-1">문의 내용</Label>
                            <Textarea
                                placeholder="문의하실 상세 내용을 상세히 작성해주세요. 재무나 개인정보 관련 구체적인 상담이 필요하신 경우 내용을 자세히 적어주시면 더 정확한 답변이 가능합니다."
                                className="min-h-[200px] rounded-[1.5rem] border-slate-200 bg-slate-50/50 focus:ring-blue-500 text-base p-5 leading-relaxed"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            />
                        </div>

                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-16 text-xl font-bold shadow-xl shadow-blue-500/30 transition-all hover:-translate-y-1 active:scale-95 disabled:hover:translate-y-0" type="submit" disabled={isSending || !formData.subject || !formData.message}>
                            {isSending ? (
                                <span className="flex items-center gap-3">
                                    <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    발송 중...
                                </span>
                            ) : (
                                <span className="flex items-center gap-3">
                                    <Send className="h-6 w-6" />
                                    문의하기
                                </span>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
