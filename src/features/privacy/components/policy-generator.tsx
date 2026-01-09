"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Copy, ChevronRight, ChevronLeft, FileText } from "lucide-react"

export function PolicyGenerator() {
    const [step, setStep] = useState(1)

    // Enhanced form data with all 15 required items
    const [formData, setFormData] = useState({
        // 기본 정보
        companyName: "",
        contactEmail: "",
        websiteUrl: "",
        responsiblePerson: "",
        responsibleDept: "",
        responsiblePhone: "",

        // 1. 개인정보의 처리 목적
        purpose: "서비스 제공 및 고객 지원",

        // 2. 처리하는 개인정보의 항목
        collectsName: true,
        collectsEmail: true,
        collectsPhone: false,
        collectsPayment: false,
        collectsAddress: false,

        // 3. 개인정보의 보유 및 이용 기간
        retention: "회원 탈퇴 시까지 또는 법정 보유기간",

        // 4. 개인정보의 제3자 제공
        hasThirdParty: false,
        thirdPartyName: "",
        thirdPartyPurpose: "",
        thirdPartyItems: "",

        // 5. 개인정보처리의 위탁
        hasOutsourcing: false,
        outsourcingCompany: "",
        outsourcingTask: "",

        // 6. 개인정보의 파기 절차 및 방법
        destructionMethod: "전자적 파일: 복구 불가능한 방법으로 영구 삭제\n종이 문서: 분쇄기로 분쇄 또는 소각",

        // 7. 정보주체의 권리·의무 및 행사 방법
        rightsExercise: "열람, 정정·삭제, 처리정지 요구 가능",

        // 8. 개인정보의 안전성 확보조치
        securityMeasures: "암호화, 접근 통제, 보안 프로그램 설치",

        // 10. 쿠키 사용
        usesCookies: true,
        cookiesPurpose: "이용자 식별 및 서비스 개선",

        // 15. CCTV 운영
        cctv: false,
        cctvLocation: "",
        cctvRetention: "30일",
    })

    const handleNext = () => setStep(Math.min(step + 1, 6))
    const handleBack = () => setStep(Math.max(step - 1, 1))

    const generatePolicy = () => {
        const date = new Date().toLocaleDateString('ko-KR')
        return `# 개인정보처리방침

**${formData.companyName}** (이하 "회사")

최종 수정일: ${date}

---

## 1. 개인정보의 처리 목적

회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.

- ${formData.purpose}

---

## 2. 처리하는 개인정보의 항목

회사는 다음의 개인정보 항목을 처리하고 있습니다:

**필수항목:**
${formData.collectsName ? '- 성명 (Name)\n' : ''}${formData.collectsEmail ? '- 이메일 주소 (Email Address)\n' : ''}${formData.collectsPhone ? '- 전화번호 (Phone Number)\n' : ''}${formData.collectsPayment ? '- 결제 정보 (Payment Information)\n' : ''}${formData.collectsAddress ? '- 주소 (Address)\n' : ''}
**자동 수집 항목:**
- 접속 IP 정보, 쿠키, 서비스 이용 기록

---

## 3. 개인정보의 보유 및 이용 기간

회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.

**보유 기간:** ${formData.retention}

**법령에 따른 보유:**
- 계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)
- 대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래법)
- 소비자 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래법)

---

## 4. 개인정보의 제3자 제공

${formData.hasThirdParty ? `회사는 다음과 같이 개인정보를 제3자에게 제공하고 있습니다:

**제공받는 자:** ${formData.thirdPartyName}
**제공 목적:** ${formData.thirdPartyPurpose}
**제공 항목:** ${formData.thirdPartyItems}
**보유 및 이용 기간:** 제공 목적 달성 시까지` : '회사는 원칙적으로 정보주체의 개인정보를 제3자에게 제공하지 않습니다. 다만, 법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우는 예외로 합니다.'}

---

## 5. 개인정보처리의 위탁

${formData.hasOutsourcing ? `회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다:

**수탁업체:** ${formData.outsourcingCompany}
**위탁업무 내용:** ${formData.outsourcingTask}

회사는 위탁계약 체결 시 개인정보 보호법 제26조에 따라 위탁업무 수행목적 외 개인정보 처리금지, 기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독, 손해배상 등 책임에 관한 사항을 계약서 등 문서에 명시하고, 수탁자가 개인정보를 안전하게 처리하는지를 감독하고 있습니다.` : '회사는 현재 개인정보 처리업무를 외부에 위탁하고 있지 않습니다.'}

---

## 6. 개인정보의 파기 절차 및 방법

회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.

**파기 절차:**
- 불필요한 개인정보는 개인정보 보호책임자의 책임 하에 내부 방침 절차에 따라 파기합니다.

**파기 방법:**
${formData.destructionMethod}

---

## 7. 정보주체의 권리·의무 및 그 행사 방법

정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:

1. 개인정보 열람 요구
2. 오류 등이 있을 경우 정정 요구
3. 삭제 요구
4. 처리정지 요구

**권리 행사 방법:**
- 서면, 전화, 이메일, FAX 등을 통하여 하실 수 있으며 회사는 이에 대해 지체없이 조치하겠습니다.
- 정보주체가 개인정보의 오류 등에 대한 정정 또는 삭제를 요구한 경우에는 정정 또는 삭제를 완료할 때까지 당해 개인정보를 이용하거나 제공하지 않습니다.

---

## 8. 개인정보의 안전성 확보조치

회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:

**관리적 조치:**
- 내부관리계획 수립·시행
- 정기적 직원 교육

**기술적 조치:**
- ${formData.securityMeasures}
- 개인정보처리시스템 접근권한 관리
- 접근통제시스템 설치
- 개인정보의 암호화

**물리적 조치:**
- 전산실, 자료보관실 등의 접근통제

---

## 9. 개인정보 보호책임자

회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.

**개인정보 보호책임자:**
- 성명: ${formData.responsiblePerson || '(미입력)'}
- 부서: ${formData.responsibleDept || '(미입력)'}
- 연락처: ${formData.responsiblePhone || '(미입력)'}
- 이메일: ${formData.contactEmail}

---

## 10. 개인정보 자동 수집 장치의 설치·운영 및 거부에 관한 사항

${formData.usesCookies ? `회사는 이용자에게 개별적인 맞춤서비스를 제공하기 위해 이용정보를 저장하고 수시로 불러오는 '쿠키(cookie)'를 사용합니다.

**쿠키의 사용 목적:**
- ${formData.cookiesPurpose}

**쿠키의 설치·운영 및 거부:**
- 웹브라우저 상단의 도구 > 인터넷 옵션 > 개인정보 메뉴의 옵션 설정을 통해 쿠키 저장을 거부할 수 있습니다.
- 쿠키 저장을 거부할 경우 맞춤형 서비스 이용에 어려움이 발생할 수 있습니다.` : '회사는 쿠키를 사용하지 않습니다.'}

---

## 11. 개인정보 처리방침의 변경

이 개인정보 처리방침은 ${date}부터 적용됩니다.

이전의 개인정보 처리방침은 아래에서 확인하실 수 있습니다.
- 공고일자: ${date}
- 시행일자: ${date}

개인정보 처리방침의 내용 추가, 삭제 및 수정이 있을 시에는 개정 최소 7일 전에 홈페이지를 통해 고지할 것입니다.

---

## 12. 정보주체의 권익침해에 대한 구제방법

정보주체는 아래의 기관에 대해 개인정보 침해에 대한 피해구제, 상담 등을 문의하실 수 있습니다.

**개인정보 침해신고센터 (한국인터넷진흥원 운영)**
- 전화: (국번없이) 118
- 홈페이지: privacy.kisa.or.kr

**개인정보 분쟁조정위원회**
- 전화: (국번없이) 1833-6972
- 홈페이지: www.kopico.go.kr

**대검찰청 사이버범죄수사단**
- 전화: 02-3480-3573
- 홈페이지: www.spo.go.kr

**경찰청 사이버안전국**
- 전화: (국번없이) 182
- 홈페이지: cyberbureau.police.go.kr

---

## 13. 개인정보 열람청구

정보주체는 개인정보 보호법 제35조에 따른 개인정보의 열람 청구를 아래의 부서에 할 수 있습니다.

**개인정보 열람청구 접수·처리 부서:**
- 부서명: ${formData.responsibleDept || '고객지원팀'}
- 담당자: ${formData.responsiblePerson || '개인정보 보호책임자'}
- 연락처: ${formData.contactEmail}

---

## 14. 개인정보의 추가적인 이용·제공 판단기준

회사는 개인정보 보호법 제15조제3항 및 제17조제4항에 따라 개인정보를 목적 외의 용도로 이용하거나 이를 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다:

1. 정보주체로부터 별도의 동의를 받은 경우
2. 다른 법률에 특별한 규정이 있는 경우
3. 정보주체 또는 그 법정대리인이 의사표시를 할 수 없는 상태에 있거나 주소불명 등으로 사전 동의를 받을 수 없는 경우로서 명백히 정보주체 또는 제3자의 급박한 생명, 신체, 재산의 이익을 위하여 필요하다고 인정되는 경우

---

${formData.cctv ? `## 15. 영상정보처리기기 운영·관리

회사는 아래와 같이 영상정보처리기기를 설치·운영하고 있습니다.

**설치 근거 및 목적:**
- 시설안전 및 화재 예방, 고객의 안전을 위한 범죄 예방

**설치 대수, 설치 위치 및 촬영 범위:**
- ${formData.cctvLocation}

**관리책임자 및 접근권한자:**
- 개인정보 보호책임자 및 관리부서 직원

**영상정보의 촬영시간, 보관기간, 보관장소 및 처리방법:**
- 촬영시간: 24시간
- 보관기간: ${formData.cctvRetention}
- 보관장소: 관리실 내 영상정보처리기기 저장장치
- 처리방법: 보관기간 만료 시 자동 삭제

**영상정보 확인 방법 및 장소:**
- 개인정보 보호책임자에게 미리 연락하고 회사를 방문하시면 확인 가능합니다.

**정보주체의 영상정보 열람 등 요구에 대한 조치:**
- 개인영상정보 열람·존재확인 청구서를 작성하여 제출하여야 합니다.

**영상정보 보호를 위한 기술적·관리적·물리적 조치:**
- 영상정보의 안전한 관리를 위하여 접근권한 제한, 암호화 조치 등을 시행하고 있습니다.

---` : ''}

## 문의

본 개인정보처리방침에 대한 문의사항이 있으시면 아래로 연락주시기 바랍니다.

- 이메일: ${formData.contactEmail}
- 웹사이트: ${formData.websiteUrl}
        `
    }

    // AI Helper State
    const [aiInput, setAiInput] = useState("")
    const [aiPromptResult, setAiPromptResult] = useState("")

    const generateAiPrompt = () => {
        const base = `당신은 한국의 개인정보보호법(PIPA) 전문가입니다. 다음 상황에 맞는 개인정보처리방침의 특정 조항을 작성해주세요.\n\n`
        const context = `상황: ${aiInput}\n\n`
        const requirement = `요구사항: 법적으로 문제가 없도록 전문적인 용어를 사용하여 상세히 작성해주세요. 개인정보 보호법의 15개 필수 항목을 고려하여 작성해주세요.`
        setAiPromptResult(base + context + requirement)
    }

    return (
        <Tabs defaultValue="wizard" className="w-full space-y-4">
            <TabsList className="bg-slate-50 p-1 rounded-lg border border-slate-200 h-10 w-fit">
                <TabsTrigger value="wizard" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-secondary data-[state=active]:shadow-sm px-6 h-8 transition-all text-slate-500 text-[12px] font-black">
                    기본 생성 마법사
                </TabsTrigger>
                <TabsTrigger value="ai-helper" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm px-6 h-8 transition-all text-slate-500 text-[12px] font-black flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    AI 프롬프트 도우미
                </TabsTrigger>
            </TabsList>

            {/* Standard Wizard Tab */}
            <TabsContent value="wizard" className="grid gap-6 md:grid-cols-2">
                <Card className="border border-slate-200 shadow-sm rounded-lg overflow-hidden bg-white h-fit">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-bold text-slate-800">방침 생성 (단계 {step}/6)</CardTitle>
                            <span className="text-[10px] font-black text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded">
                                PIPA 규정 준수
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-5 p-6 pb-6">
                        {step === 1 && (
                            <div className="space-y-4">
                                <Label className="text-[11px] font-black text-slate-500 uppercase tracking-wider underline underline-offset-4 decoration-secondary/30 decoration-2">1단계: 기본 정보</Label>
                                <div className="grid gap-3">
                                    <Input
                                        placeholder="회사명 (Company Name)"
                                        value={formData.companyName}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, companyName: e.target.value })}
                                        className="rounded-lg border-slate-200 h-9 text-xs font-bold focus-visible:ring-secondary"
                                    />
                                    <Input
                                        placeholder="담당자 이메일 (Contact Email)"
                                        value={formData.contactEmail}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, contactEmail: e.target.value })}
                                        className="rounded-lg border-slate-200 h-9 text-xs font-bold focus-visible:ring-secondary"
                                    />
                                    <Input
                                        placeholder="웹사이트 주소 (Website URL)"
                                        value={formData.websiteUrl}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, websiteUrl: e.target.value })}
                                        className="rounded-lg border-slate-200 h-9 text-xs font-bold focus-visible:ring-secondary"
                                    />
                                    <Input
                                        placeholder="개인정보 보호책임자 성명"
                                        value={formData.responsiblePerson}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, responsiblePerson: e.target.value })}
                                        className="rounded-lg border-slate-200 h-9 text-xs font-bold focus-visible:ring-secondary"
                                    />
                                    <Input
                                        placeholder="담당 부서명"
                                        value={formData.responsibleDept}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, responsibleDept: e.target.value })}
                                        className="rounded-lg border-slate-200 h-9 text-xs font-bold focus-visible:ring-secondary"
                                    />
                                    <Input
                                        placeholder="담당자 연락처"
                                        value={formData.responsiblePhone}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, responsiblePhone: e.target.value })}
                                        className="rounded-lg border-slate-200 h-9 text-xs font-bold focus-visible:ring-secondary"
                                    />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
                                <Label className="text-[11px] font-black text-slate-500 uppercase tracking-wider underline underline-offset-4 decoration-secondary/30 decoration-2">2단계: 수집 항목 및 목적</Label>
                                <div className="space-y-3">
                                    <Label className="text-[11px] font-black text-slate-400">수집하는 개인정보 항목</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { id: "c-name", label: "성명", key: "collectsName" },
                                            { id: "c-email", label: "이메일", key: "collectsEmail" },
                                            { id: "c-phone", label: "전화번호", key: "collectsPhone" },
                                            { id: "c-pay", label: "결제 정보", key: "collectsPayment" },
                                            { id: "c-addr", label: "주소", key: "collectsAddress" },
                                        ].map((item) => (
                                            <div key={item.id} className="flex items-center space-x-2 bg-slate-50 p-2 rounded border border-slate-100">
                                                <Checkbox id={item.id} checked={(formData as any)[item.key]} onCheckedChange={(c: boolean | 'indeterminate') => setFormData({ ...formData, [item.key]: !!c })} className="rounded-sm border-slate-300 data-[state=checked]:bg-secondary data-[state=checked]:border-secondary" />
                                                <Label htmlFor={item.id} className="text-xs font-bold text-slate-600 cursor-pointer">{item.label}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-black text-slate-400">처리 목적</Label>
                                    <Textarea
                                        placeholder="예: 서비스 제공, 고객 지원, 마케팅 활용 등"
                                        value={formData.purpose}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, purpose: e.target.value })}
                                        rows={3}
                                        className="rounded-lg border-slate-200 text-xs font-bold focus-visible:ring-secondary resize-none"
                                    />
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4">
                                <Label className="text-[11px] font-black text-slate-500 uppercase tracking-wider underline underline-offset-4 decoration-secondary/30 decoration-2">3단계: 보유기간 및 제3자 제공</Label>
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-black text-slate-400">보유 및 이용 기간</Label>
                                    <Input
                                        placeholder="예: 회원 탈퇴 시까지, 1년"
                                        value={formData.retention}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, retention: e.target.value })}
                                        className="rounded-lg border-slate-200 h-9 text-xs font-bold focus-visible:ring-secondary"
                                    />
                                </div>
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                                        <Checkbox id="has-3rd" checked={formData.hasThirdParty} onCheckedChange={(c: boolean | 'indeterminate') => setFormData({ ...formData, hasThirdParty: !!c })} className="rounded-sm border-slate-300 data-[state=checked]:bg-secondary data-[state=checked]:border-secondary" />
                                        <Label htmlFor="has-3rd" className="text-xs font-black text-slate-700 cursor-pointer">제3자에게 개인정보 제공</Label>
                                    </div>
                                    {formData.hasThirdParty && (
                                        <div className="space-y-2 pl-6 animate-in slide-in-from-top-2 duration-300">
                                            <Input
                                                placeholder="제공받는 자"
                                                value={formData.thirdPartyName}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, thirdPartyName: e.target.value })}
                                                className="rounded-lg border-slate-200 h-9 text-xs font-bold"
                                            />
                                            <Input
                                                placeholder="제공 목적"
                                                value={formData.thirdPartyPurpose}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, thirdPartyPurpose: e.target.value })}
                                                className="rounded-lg border-slate-200 h-9 text-xs font-bold"
                                            />
                                            <Input
                                                placeholder="제공 항목"
                                                value={formData.thirdPartyItems}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, thirdPartyItems: e.target.value })}
                                                className="rounded-lg border-slate-200 h-9 text-xs font-bold"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-4">
                                <Label className="text-[11px] font-black text-slate-500 uppercase tracking-wider underline underline-offset-4 decoration-secondary/30 decoration-2">4단계: 위탁 및 파기</Label>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                                        <Checkbox id="has-out" checked={formData.hasOutsourcing} onCheckedChange={(c: boolean | 'indeterminate') => setFormData({ ...formData, hasOutsourcing: !!c })} className="rounded-sm border-slate-300 data-[state=checked]:bg-secondary data-[state=checked]:border-secondary" />
                                        <Label htmlFor="has-out" className="text-xs font-black text-slate-700 cursor-pointer">개인정보 처리 위탁</Label>
                                    </div>
                                    {formData.hasOutsourcing && (
                                        <div className="space-y-2 pl-6 animate-in slide-in-from-top-2 duration-300">
                                            <Input
                                                placeholder="수탁업체명"
                                                value={formData.outsourcingCompany}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, outsourcingCompany: e.target.value })}
                                                className="rounded-lg border-slate-200 h-9 text-xs font-bold"
                                            />
                                            <Input
                                                placeholder="위탁업무 내용"
                                                value={formData.outsourcingTask}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, outsourcingTask: e.target.value })}
                                                className="rounded-lg border-slate-200 h-9 text-xs font-bold"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1.5 pt-2">
                                    <Label className="text-[11px] font-black text-slate-400">파기 방법</Label>
                                    <Textarea
                                        value={formData.destructionMethod}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, destructionMethod: e.target.value })}
                                        rows={3}
                                        className="rounded-lg border-slate-200 text-xs font-bold focus-visible:ring-secondary resize-none"
                                    />
                                </div>
                            </div>
                        )}

                        {step === 5 && (
                            <div className="space-y-4">
                                <Label className="text-[11px] font-black text-slate-500 uppercase tracking-wider underline underline-offset-4 decoration-secondary/30 decoration-2">5단계: 안전성 확보조치</Label>
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-black text-slate-400">안전성 확보조치</Label>
                                    <Textarea
                                        placeholder="예: 암호화, 접근 통제, 보안 프로그램 설치"
                                        value={formData.securityMeasures}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, securityMeasures: e.target.value })}
                                        rows={3}
                                        className="rounded-lg border-slate-200 text-xs font-bold focus-visible:ring-secondary resize-none"
                                    />
                                </div>
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                                        <Checkbox id="cookies" checked={formData.usesCookies} onCheckedChange={(c: boolean | 'indeterminate') => setFormData({ ...formData, usesCookies: !!c })} className="rounded-sm border-slate-300 data-[state=checked]:bg-secondary data-[state=checked]:border-secondary" />
                                        <Label htmlFor="cookies" className="text-xs font-black text-slate-700 cursor-pointer">쿠키 사용</Label>
                                    </div>
                                    {formData.usesCookies && (
                                        <Input
                                            className="ml-6 rounded-lg border-slate-200 h-9 text-xs font-bold animate-in slide-in-from-top-2 duration-300"
                                            placeholder="쿠키 사용 목적"
                                            value={formData.cookiesPurpose}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, cookiesPurpose: e.target.value })}
                                        />
                                    )}
                                </div>
                            </div>
                        )}

                        {step === 6 && (
                            <div className="space-y-4">
                                <Label className="text-[11px] font-black text-slate-500 uppercase tracking-wider underline underline-offset-4 decoration-secondary/30 decoration-2">6단계: CCTV 및 기타</Label>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                                        <Checkbox id="c-cctv" checked={formData.cctv} onCheckedChange={(c: boolean | 'indeterminate') => setFormData({ ...formData, cctv: !!c })} className="rounded-sm border-slate-300 data-[state=checked]:bg-secondary data-[state=checked]:border-secondary" />
                                        <Label htmlFor="c-cctv" className="text-xs font-black text-slate-700 cursor-pointer">CCTV 운영</Label>
                                    </div>
                                    {formData.cctv && (
                                        <div className="space-y-2 pl-6 animate-in slide-in-from-top-2 duration-300">
                                            <Input
                                                placeholder="설치 위치 (예: 출입구, 주차장)"
                                                value={formData.cctvLocation}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, cctvLocation: e.target.value })}
                                                className="rounded-lg border-slate-200 h-9 text-xs font-bold"
                                            />
                                            <Input
                                                placeholder="보관 기간 (예: 30일)"
                                                value={formData.cctvRetention}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, cctvRetention: e.target.value })}
                                                className="rounded-lg border-slate-200 h-9 text-xs font-bold"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <span className="text-emerald-600 font-black text-[10px]">VERIFIED</span>
                                        <p className="text-xs font-bold text-emerald-800">모든 필수 항목이 포함되었습니다.</p>
                                    </div>
                                    <p className="text-[10px] text-emerald-600 mt-1 font-bold">개인정보보호위원회 처리방침 작성 가이드를 100% 준수합니다.</p>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between mt-4 pt-4 border-t border-slate-100">
                            <Button variant="ghost" onClick={handleBack} disabled={step === 1} className="h-9 px-4 text-xs font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg disabled:opacity-30">
                                <ChevronLeft className="mr-1.5 h-3.5 w-3.5" /> 이전
                            </Button>
                            {step < 6 ? (
                                <Button onClick={handleNext} className="h-9 px-6 bg-secondary hover:bg-secondary/90 text-white rounded-lg text-xs font-black shadow-sm">
                                    다음 <ChevronRight className="ml-1.5 h-3.5 w-3.5" />
                                </Button>
                            ) : (
                                <Button className="h-9 px-6 bg-secondary hover:bg-secondary/90 text-white rounded-lg text-xs font-black shadow-sm">
                                    생성 완료 ✓
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 shadow-sm rounded-lg overflow-hidden bg-white flex flex-col">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-secondary text-sm font-black flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                처리방침 미리보기
                            </CardTitle>
                            <span className="text-[10px] font-black text-slate-400">MD FORMAT</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 flex flex-col flex-grow">
                        <div className="bg-slate-50 p-6 rounded-lg flex-grow overflow-auto whitespace-pre-wrap text-[12px] text-slate-600 border border-slate-200 leading-relaxed font-mono custom-scrollbar max-h-[500px]">
                            {generatePolicy()}
                        </div>
                        <div className="mt-6 flex gap-2">
                            <Button className="flex-grow bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg h-10 text-xs font-black shadow-sm" onClick={() => navigator.clipboard.writeText(generatePolicy())}>
                                <Copy className="mr-2 h-3.5 w-3.5 text-slate-400" /> 방침 내용 복사
                            </Button>
                            <Button className="bg-secondary hover:bg-secondary/90 text-white rounded-lg h-10 px-4 text-xs font-black shadow-sm">
                                파일 다운로드
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="ai-helper" className="grid gap-6 md:grid-cols-2">
                <Card className="border border-slate-200 shadow-sm rounded-lg overflow-hidden bg-white">
                    <CardHeader className="bg-purple-50/50 border-b border-purple-100 py-4 px-6">
                        <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-800">
                            <Sparkles className="h-4 w-4 text-purple-600" />
                            AI 프롬프트 생성기
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 p-6">
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">특수 상황 설명</Label>
                            <Textarea
                                placeholder="예: 저희는 카페를 운영하며, 방범용 CCTV를 설치했고, 영상을 30일간 보관합니다."
                                className="min-h-[150px] rounded-lg border-slate-200 focus-visible:ring-purple-500 text-xs font-bold resize-none"
                                value={aiInput}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAiInput(e.target.value)}
                            />
                        </div>
                        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg h-10 font-black text-xs shadow-sm" onClick={generateAiPrompt} disabled={!aiInput}>
                            <Sparkles className="mr-2 h-3.5 w-3.5" /> 프롬프트 생성하기
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 shadow-sm rounded-lg overflow-hidden bg-white flex flex-col">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
                        <CardTitle className="text-sm font-bold text-slate-800">생성된 질문 프롬프트</CardTitle>
                        <CardDescription className="text-[11px] font-bold text-slate-400">복사하여 ChatGPT 등 AI 모델에 전달하세요.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 flex flex-col flex-grow">
                        <div className="bg-purple-50/50 p-6 rounded-lg h-[241px] overflow-auto whitespace-pre-wrap text-[12px] text-purple-900 border border-purple-100 font-mono leading-relaxed custom-scrollbar">
                            {aiPromptResult || "왼쪽에서 상황을 입력하고 생성 버튼을 눌러주세요."}
                        </div>
                        <div className="mt-6">
                            <Button className="w-full border border-purple-200 bg-white text-purple-600 hover:bg-purple-50 rounded-lg h-10 font-black text-xs shadow-sm" onClick={() => navigator.clipboard.writeText(aiPromptResult)} disabled={!aiPromptResult}>
                                <Copy className="mr-2 h-3.5 w-3.5" /> 프롬프트 복사
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}
