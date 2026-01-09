"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Copy, ChevronRight, ChevronLeft } from "lucide-react"

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
        <Tabs defaultValue="wizard" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="wizard">기본 생성 마법사 (Wizard)</TabsTrigger>
                <TabsTrigger value="ai-helper">AI 프롬프트 도우미 (AI Helper)</TabsTrigger>
            </TabsList>

            {/* Standard Wizard Tab */}
            <TabsContent value="wizard" className="grid gap-6 md:grid-cols-2 mt-4">
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>방침 생성 (단계 {step}/6)</CardTitle>
                        <CardDescription>개인정보보호위원회 가이드에 따른 15개 필수 항목 포함</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {step === 1 && (
                            <div className="space-y-4">
                                <Label className="text-base font-semibold">1단계: 기본 정보</Label>
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
                                <Input
                                    placeholder="개인정보 보호책임자 성명"
                                    value={formData.responsiblePerson}
                                    onChange={(e) => setFormData({ ...formData, responsiblePerson: e.target.value })}
                                />
                                <Input
                                    placeholder="담당 부서명"
                                    value={formData.responsibleDept}
                                    onChange={(e) => setFormData({ ...formData, responsibleDept: e.target.value })}
                                />
                                <Input
                                    placeholder="담당자 연락처"
                                    value={formData.responsiblePhone}
                                    onChange={(e) => setFormData({ ...formData, responsiblePhone: e.target.value })}
                                />
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
                                <Label className="text-base font-semibold">2단계: 수집 항목 및 목적</Label>
                                <div className="space-y-3">
                                    <Label>수집하는 개인정보 항목</Label>
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
                                            <Checkbox id="c-addr" checked={formData.collectsAddress} onCheckedChange={(c) => setFormData({ ...formData, collectsAddress: !!c })} />
                                            <Label htmlFor="c-addr">주소 (Address)</Label>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <Label>처리 목적</Label>
                                    <Textarea
                                        placeholder="예: 서비스 제공, 고객 지원, 마케팅 활용 등"
                                        value={formData.purpose}
                                        onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4">
                                <Label className="text-base font-semibold">3단계: 보유기간 및 제3자 제공</Label>
                                <div>
                                    <Label>보유 및 이용 기간</Label>
                                    <Input
                                        placeholder="예: 회원 탈퇴 시까지, 1년"
                                        value={formData.retention}
                                        onChange={(e) => setFormData({ ...formData, retention: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="has-3rd" checked={formData.hasThirdParty} onCheckedChange={(c) => setFormData({ ...formData, hasThirdParty: !!c })} />
                                        <Label htmlFor="has-3rd">제3자에게 개인정보 제공</Label>
                                    </div>
                                    {formData.hasThirdParty && (
                                        <div className="space-y-2 pl-6">
                                            <Input
                                                placeholder="제공받는 자"
                                                value={formData.thirdPartyName}
                                                onChange={(e) => setFormData({ ...formData, thirdPartyName: e.target.value })}
                                            />
                                            <Input
                                                placeholder="제공 목적"
                                                value={formData.thirdPartyPurpose}
                                                onChange={(e) => setFormData({ ...formData, thirdPartyPurpose: e.target.value })}
                                            />
                                            <Input
                                                placeholder="제공 항목"
                                                value={formData.thirdPartyItems}
                                                onChange={(e) => setFormData({ ...formData, thirdPartyItems: e.target.value })}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-4">
                                <Label className="text-base font-semibold">4단계: 위탁 및 파기</Label>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="has-out" checked={formData.hasOutsourcing} onCheckedChange={(c) => setFormData({ ...formData, hasOutsourcing: !!c })} />
                                        <Label htmlFor="has-out">개인정보 처리 위탁</Label>
                                    </div>
                                    {formData.hasOutsourcing && (
                                        <div className="space-y-2 pl-6">
                                            <Input
                                                placeholder="수탁업체명"
                                                value={formData.outsourcingCompany}
                                                onChange={(e) => setFormData({ ...formData, outsourcingCompany: e.target.value })}
                                            />
                                            <Input
                                                placeholder="위탁업무 내용"
                                                value={formData.outsourcingTask}
                                                onChange={(e) => setFormData({ ...formData, outsourcingTask: e.target.value })}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <Label>파기 방법</Label>
                                    <Textarea
                                        value={formData.destructionMethod}
                                        onChange={(e) => setFormData({ ...formData, destructionMethod: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                            </div>
                        )}

                        {step === 5 && (
                            <div className="space-y-4">
                                <Label className="text-base font-semibold">5단계: 안전성 확보조치</Label>
                                <div>
                                    <Label>안전성 확보조치</Label>
                                    <Textarea
                                        placeholder="예: 암호화, 접근 통제, 보안 프로그램 설치"
                                        value={formData.securityMeasures}
                                        onChange={(e) => setFormData({ ...formData, securityMeasures: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="cookies" checked={formData.usesCookies} onCheckedChange={(c) => setFormData({ ...formData, usesCookies: !!c })} />
                                        <Label htmlFor="cookies">쿠키 사용</Label>
                                    </div>
                                    {formData.usesCookies && (
                                        <Input
                                            className="pl-6"
                                            placeholder="쿠키 사용 목적"
                                            value={formData.cookiesPurpose}
                                            onChange={(e) => setFormData({ ...formData, cookiesPurpose: e.target.value })}
                                        />
                                    )}
                                </div>
                            </div>
                        )}

                        {step === 6 && (
                            <div className="space-y-4">
                                <Label className="text-base font-semibold">6단계: CCTV 및 기타</Label>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="c-cctv" checked={formData.cctv} onCheckedChange={(c) => setFormData({ ...formData, cctv: !!c })} />
                                        <Label htmlFor="c-cctv">CCTV 운영</Label>
                                    </div>
                                    {formData.cctv && (
                                        <div className="space-y-2 pl-6">
                                            <Input
                                                placeholder="설치 위치 (예: 출입구, 주차장)"
                                                value={formData.cctvLocation}
                                                onChange={(e) => setFormData({ ...formData, cctvLocation: e.target.value })}
                                            />
                                            <Input
                                                placeholder="보관 기간 (예: 30일)"
                                                value={formData.cctvRetention}
                                                onChange={(e) => setFormData({ ...formData, cctvRetention: e.target.value })}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-sm text-green-800 font-medium">✓ 모든 필수 항목이 포함됩니다</p>
                                    <p className="text-xs text-green-700 mt-1">개인정보보호위원회 가이드 준수</p>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between mt-6 pt-4 border-t">
                            <Button variant="outline" onClick={handleBack} disabled={step === 1}>
                                <ChevronLeft className="mr-2 h-4 w-4" /> 이전
                            </Button>
                            {step < 6 ? (
                                <Button onClick={handleNext}>
                                    다음 <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button className="bg-green-600 hover:bg-green-700">
                                    완료 ✓
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="h-full min-h-[600px]">
                    <CardHeader>
                        <CardTitle>미리보기 (Preview)</CardTitle>
                        <CardDescription>생성된 개인정보처리방침 - 15개 필수 항목 포함</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-gray-50 p-4 rounded-md h-[500px] overflow-auto whitespace-pre-wrap text-sm border">
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
                        <div className="bg-gray-50 p-4 rounded-md h-[300px] overflow-auto whitespace-pre-wrap text-sm border border-purple-200">
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
