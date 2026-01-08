"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Copy } from "lucide-react"

export function PolicyGenerator() {
    const [step, setStep] = useState(1)

    // Standard Wizard State
    const [formData, setFormData] = useState({
        companyName: "",
        contactEmail: "",
        websiteUrl: "",
        collectsName: true,
        collectsEmail: true,
        collectsPhone: false,
        collectsPayment: false,
        purpose: "서비스 제공 및 고객 지원 (To provide service and customer support)",
        retention: "1년 (1 year)",
        cctv: false
    })

    // AI Helper State
    const [aiInput, setAiInput] = useState("")
    const [aiPromptResult, setAiPromptResult] = useState("")

    const handleNext = () => setStep(step + 1)
    const handleBack = () => setStep(step - 1)

    const generatePolicy = () => {
        const date = new Date().toLocaleDateString()
        return `
# 개인정보처리방침 (${formData.companyName})

최종 수정일: ${date}

## 1. 총칙
${formData.companyName} (이하 "회사")는 정보주체의 자유와 권리 보호를 위해 「개인정보 보호법」 및 관계 법령이 정한 바를 준수하여, 적법하게 개인정보를 처리하고 안전하게 관리하고 있습니다.

## 2. 개인정보의 수집 및 이용 목적
회사는 다음의 목적을 위하여 개인정보를 처리합니다:
- ${formData.purpose}

## 3. 수집하는 개인정보의 항목
회사는 다음의 개인정보 항목을 처리하고 있습니다:
${formData.collectsName ? '- 성명 (Name)' : ''}
${formData.collectsEmail ? '- 이메일 (Email Address)' : ''}
${formData.collectsPhone ? '- 전화번호 (Phone Number)' : ''}
${formData.collectsPayment ? '- 결제 정보 (Payment Information)' : ''}
${formData.cctv ? '- 영상정보 (CCTV)' : ''}

## 4. 개인정보의 보유 및 이용 기간
회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
- 보유 근거: 관련 법령 및 이용약관
- 보유 기간: ${formData.retention}

## 5. 개인정보 보호책임자
- 이메일: ${formData.contactEmail}
- 웹사이트: ${formData.websiteUrl}
        `
    }

    const generateAiPrompt = () => {
        // Simple logic to build a prompt for an LLM
        const base = `당신은 한국의 개인정보보호법(PIPA) 전문가입니다. 다음 상황에 맞는 개인정보처리방침의 특정 조항을 작성해주세요.\n\n`
        const context = `상황: ${aiInput}\n\n`
        const requirement = `요구사항: 법적으로 문제가 없도록 전문적인 용어를 사용하여 상세히 작성해주세요.`
        setAiPromptResult(base + context + requirement)
    }

    return (
        <Tabs defaultValue="wizard" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="wizard">기본 생성 마법사 (Wizard)</TabsTrigger>
                <TabsTrigger value="ai-helper">AI 프롬프트 도우미 (AI Helper)</TabsTrigger>
            </TabsList>

            {/* Standard Wizard Tab */}
            <TabsContent value="wizard" className="grid gap-6 md:grid-cols-2 mt-4">
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>방침 생성 (단계 {step}/4)</CardTitle>
                        <CardDescription>기본적인 정보를 입력하여 법적 고지사항을 생성합니다.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {step === 1 && (
                            <div className="space-y-4">
                                <Label>기본 정보 (Company Details)</Label>
                                <Input
                                    placeholder="회사명 (Company Name)"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                />
                                <Input
                                    placeholder="담당자 이메일 (Contact Email)"
                                    value={formData.contactEmail}
                                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                />
                                <Input
                                    placeholder="웹사이트 주소 (Website URL)"
                                    value={formData.websiteUrl}
                                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                                />
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
                                <Label>수집 항목 (Data Collection)</Label>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="c-name" checked={formData.collectsName} onCheckedChange={(c) => setFormData({ ...formData, collectsName: !!c })} />
                                        <Label htmlFor="c-name">성명 (Name)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="c-email" checked={formData.collectsEmail} onCheckedChange={(c) => setFormData({ ...formData, collectsEmail: !!c })} />
                                        <Label htmlFor="c-email">이메일 (Email)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="c-phone" checked={formData.collectsPhone} onCheckedChange={(c) => setFormData({ ...formData, collectsPhone: !!c })} />
                                        <Label htmlFor="c-phone">전화번호 (Phone)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="c-pay" checked={formData.collectsPayment} onCheckedChange={(c) => setFormData({ ...formData, collectsPayment: !!c })} />
                                        <Label htmlFor="c-pay">결제 정보 (Payment Info)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="c-cctv" checked={formData.cctv} onCheckedChange={(c) => setFormData({ ...formData, cctv: !!c })} />
                                        <Label htmlFor="c-cctv">CCTV 촬영 (Video)</Label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4">
                                <Label>목적 및 보유기간 (Purpose & Retention)</Label>
                                <Textarea
                                    placeholder="수집 목적 (예: 서비스 제공)"
                                    value={formData.purpose}
                                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                />
                                <Input
                                    placeholder="보유 기간 (예: 1년)"
                                    value={formData.retention}
                                    onChange={(e) => setFormData({ ...formData, retention: e.target.value })}
                                />
                            </div>
                        )}

                        <div className="flex justify-between mt-4">
                            <Button variant="outline" onClick={handleBack} disabled={step === 1}>이전 (Back)</Button>
                            {step < 4 ? (
                                <Button onClick={handleNext}>다음 (Next)</Button>
                            ) : (
                                <Button onClick={() => { }} disabled>완료 (Done)</Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="h-full min-h-[500px]">
                    <CardHeader>
                        <CardTitle>미리보기 (Preview)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-muted p-4 rounded-md h-[400px] overflow-auto whitespace-pre-wrap font-mono text-xs">
                            {generatePolicy()}
                        </div>
                        <div className="mt-4">
                            <Button className="w-full" onClick={() => navigator.clipboard.writeText(generatePolicy())}>
                                <Copy className="mr-2 h-4 w-4" /> 복사하기 (Copy)
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* AI Helper Tab */}
            <TabsContent value="ai-helper" className="grid gap-6 md:grid-cols-2 mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-purple-500" />
                            AI 프롬프트 생성기
                        </CardTitle>
                        <CardDescription>
                            특수한 상황에 맞는 방침 조항을 만들기 위해, AI(ChatGPT 등)에게 질문할 최적의 프롬프트를 만들어드립니다.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>상황 설명 (Situation)</Label>
                            <Textarea
                                placeholder="예: 저희는 카페를 운영하며, 방범용 CCTV를 설치했고, 영상을 30일간 보관합니다."
                                rows={5}
                                value={aiInput}
                                onChange={(e) => setAiInput(e.target.value)}
                            />
                        </div>
                        <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={generateAiPrompt} disabled={!aiInput}>
                            <Sparkles className="mr-2 h-4 w-4" /> 프롬프트 생성 (Generate Prompt)
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>생성된 프롬프트 (Result)</CardTitle>
                        <CardDescription>아래 내용을 복사하여 AI 모델에게 질문하세요.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-muted p-4 rounded-md h-[300px] overflow-auto whitespace-pre-wrap font-mono text-xs border border-purple-200">
                            {aiPromptResult || "왼쪽에서 상황을 입력하고 생성 버튼을 눌러주세요."}
                        </div>
                        <div className="mt-4">
                            <Button className="w-full" variant="outline" onClick={() => navigator.clipboard.writeText(aiPromptResult)} disabled={!aiPromptResult}>
                                <Copy className="mr-2 h-4 w-4" /> 프롬프트 복사 (Copy Prompt)
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}
