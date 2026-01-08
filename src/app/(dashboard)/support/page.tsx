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
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">문의하기 (Support)</h2>
                <p className="text-muted-foreground">
                    서비스 이용 중 궁금한 점이나 불편한 점이 있다면 문의해주세요.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" /> 문의 작성
                    </CardTitle>
                    <CardDescription>
                        문의 내용은 플랫폼 관리자에게 이메일로 발송됩니다.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>문의 유형</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(val) => setFormData({ ...formData, category: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="유형 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="general">일반 문의</SelectItem>
                                    <SelectItem value="billing">결제/요금</SelectItem>
                                    <SelectItem value="technical">기술/오류</SelectItem>
                                    <SelectItem value="feature">기능 제안</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>제목</Label>
                            <Input
                                placeholder="문의 제목을 입력해주세요"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>내용</Label>
                            <Textarea
                                placeholder="상세 내용을 입력해주세요..."
                                className="min-h-[150px]"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            />
                        </div>

                        <Button className="w-full" type="submit" disabled={isSending || !formData.subject || !formData.message}>
                            <Send className="mr-2 h-4 w-4" />
                            {isSending ? "발송 중..." : "문의하기"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
