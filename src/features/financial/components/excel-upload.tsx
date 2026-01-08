"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Upload, FileSpreadsheet, Sparkles } from "lucide-react"
import * as XLSX from "xlsx"
import { useFinancialStore } from "@/store/financial-store"
import { useAuthStore } from "@/store/auth-store"

export default function ExcelUpload() {
    const { addTransaction } = useFinancialStore()
    const { user } = useAuthStore()
    const [stats, setStats] = useState<{ count: number, prediction: string | null } | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !user) return

        setIsLoading(true)
        const reader = new FileReader()
        reader.onload = (evt) => {
            const bstr = evt.target?.result
            const wb = XLSX.read(bstr, { type: 'binary' })
            const wsname = wb.SheetNames[0]
            const ws = wb.Sheets[wsname]
            const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 })

            // Assume Row 1 is header, Data starts from Row 2
            // Format: Date | Description | Amount | Type (INCOME/EXPENSE) | Category
            let count = 0

            // Skipping header
            data.slice(1).forEach((row: any) => {
                if (row[0] && row[2]) {
                    addTransaction({
                        userId: user.id,
                        date: new Date(row[0]).toISOString(),
                        description: row[1] || "Imported",
                        amount: Number(row[2]),
                        type: row[3] === '수입' ? 'INCOME' : 'EXPENSE',
                        categoryId: 'uncategorized' // Simplify for MVP
                    })
                    count++
                }
            })

            // Mock AI Prediction Simulation
            setTimeout(() => {
                setStats({
                    count,
                    prediction: "업로드된 데이터를 기반으로 분석한 결과, 다음 달 예상 매출은 약 ₩4,500,000 입니다. (전월 대비 15% 상승 예상)"
                })
                setIsLoading(false)
            }, 1500)
        }
        reader.readAsBinaryString(file)
    }

    const downloadTemplate = () => {
        // Create a dummy workbook
        const ws = XLSX.utils.aoa_to_sheet([
            ["날짜 (Date)", "내용 (Desc)", "금액 (Amount)", "구분 (Type: 수입/지출)", "카테고리"],
            ["2024-01-01", "예시 매출", "50000", "수입", "판매"],
            ["2024-01-02", "재료비", "15000", "지출", "원자재"]
        ])
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Template")
        XLSX.writeFile(wb, "BizGuard_Template.xlsx")
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-green-600" />
                    엑셀 일괄 등록 & AI 분석
                </CardTitle>
                <CardDescription>
                    기존 장부 데이터를 엑셀로 업로드하여, AI 기반의 매출 예측 리포트를 받아보세요.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Input id="excel-upload" type="file" accept=".xlsx, .xls" onChange={handleFileUpload} disabled={isLoading} />
                </div>

                {isLoading && (
                    <div className="text-sm text-blue-500 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 animate-spin" /> AI가 데이터를 분석 중입니다...
                    </div>
                )}

                {stats && (
                    <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
                        <Sparkles className="h-4 w-4 text-blue-600" />
                        <AlertTitle>분석 완료!</AlertTitle>
                        <AlertDescription className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                            총 <strong>{stats.count}</strong>건의 내역이 성공적으로 등록되었습니다.<br />
                            <div className="mt-2 p-2 bg-white dark:bg-black rounded border border-blue-100 font-medium text-blue-800 dark:text-blue-300">
                                {stats.prediction}
                            </div>
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
            <CardFooter>
                <Button variant="outline" size="sm" onClick={downloadTemplate}>
                    <Upload className="mr-2 h-4 w-4" /> 양식 다운로드
                </Button>
            </CardFooter>
        </Card>
    )
}
