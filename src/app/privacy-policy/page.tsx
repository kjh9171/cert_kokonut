import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPolicySample() {
    return (
        <div className="container max-w-3xl py-12 px-4 md:px-6">
            <div className="mb-8">
                <Link href="/">
                    <Button variant="ghost" className="pl-0 gap-2">
                        <ArrowLeft className="h-4 w-4" /> 메인으로 돌아가기
                    </Button>
                </Link>
            </div>

            <h1 className="text-3xl font-bold mb-8">개인정보처리방침 (예시)</h1>
            <p className="text-sm text-gray-500 mb-8 border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 dark:bg-blue-900/20">
                본 방침은 '안전한 비즈니스 운영'을 위한 예시이며, 실제 서비스 운영 시에는 비즈가드(BizGuard)의 "개인정보처리방침 생성기"를 통해 귀사의 상황에 맞는 방침을 생성하시기 바랍니다.
            </p>

            <div className="space-y-8 prose dark:prose-invert max-w-none">
                <section>
                    <h2 className="text-xl font-bold mb-4">제1조 (개인정보의 처리 목적)</h2>
                    <p className="mb-2">비즈가드(이하 '회사')는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
                    <ol className="list-decimal pl-5 space-y-1 text-sm">
                        <li><strong>홈페이지 회원가입 및 관리</strong>: 회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지 목적으로 개인정보를 처리합니다.</li>
                        <li><strong>재화 또는 서비스 제공</strong>: 서비스 제공, 콘텐츠 제공, 맞춤서비스 제공, 요금결제·정산을 목적으로 개인정보를 처리합니다.</li>
                    </ol>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4">제2조 (개인정보의 처리 및 보유 기간)</h2>
                    <p className="mb-2">① 회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>
                    <p className="mb-2">② 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.</p>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li><strong>홈페이지 회원 가입 및 관리</strong>: 사업자/단체 홈페이지 탈퇴 시까지. 다만, 다음의 사유에 해당하는 경우에는 해당 사유 종료 시까지 1) 관계 법령 위반에 따른 수사·조사 등이 진행 중인 경우에는 해당 수사·조사 종료 시까지</li>
                        <li><strong>전자상거래 시 대금결제 및 재화 기록</strong>: 5년</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4">제3조 (정보주체와 법정대리인의 권리·의무 및 그 행사방법)</h2>
                    <p className="mb-2">① 정보주체는 회사에 대해 언제든지 개인정보 열람·정정·삭제·처리정지 요구 등의 권리를 행사할 수 있습니다.</p>
                    <p className="mb-2">② 제1항에 따른 권리 행사는 회사에 대해 「개인정보 보호법」 시행령 제41조제1항에 따라 서면, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 회사는 이에 대해 지체 없이 조치하겠습니다.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4">제4조 (처리하는 개인정보의 항목)</h2>
                    <p className="mb-2">회사는 다음의 개인정보 항목을 처리하고 있습니다.</p>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li><strong>필수항목</strong>: 이메일, 비밀번호, 관리자 이름, 회사명, 사업자등록번호</li>
                        <li><strong>수집방법</strong>: 홈페이지 회원가입</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4">제5조 (개인정보의 안전성 확보 조치)</h2>
                    <p className="mb-2">회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li><strong>관리적 조치</strong>: 내부관리계획 수립·시행, 정기적 직원 교육</li>
                        <li><strong>기술적 조치</strong>: 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 고유식별정보 등의 암호화 (AES-256), 보안프로그램 설치</li>
                    </ul>
                </section>

                <div className="mt-12 pt-8 border-t text-sm text-gray-500">
                    <p>공고일자: 2024년 1월 1일 / 시행일자: 2024년 1월 7일</p>
                </div>
            </div>
        </div>
    )
}
