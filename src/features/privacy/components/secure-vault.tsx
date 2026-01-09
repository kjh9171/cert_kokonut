"use client"

import * as React from "react"
import { useState, useRef } from "react"
import { usePrivacyStore } from "@/store/privacy-store"
import { useAuthStore } from "@/store/auth-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Lock, Eye, Trash2, Shield, Upload } from "lucide-react"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export function SecureVault() {
    const { documents, addDocument, getDocument, removeDocument } = usePrivacyStore()
    const { user } = useAuthStore() // Get User
    const [name, setName] = useState("")
    const [fileContent, setFileContent] = useState<string | null>(null)
    const [viewContent, setViewContent] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Filter documents for current user
    const userDocuments = documents.filter((doc) => doc.userId === user?.id)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
                setFileContent(event.target?.result as string)
            }
            reader.readAsText(file) // For demo, assume text files. Binary needs Base64.
        }
    }

    const handleUpload = () => {
        if (!name || !fileContent || !user) return
        addDocument({ userId: user.id, name, data: fileContent })
        setName("")
        setFileContent(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const handleView = (id: string) => {
        if (!user) return
        const content = getDocument(id, user.id)
        setViewContent(content)
    }

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border border-slate-200 shadow-sm rounded-lg overflow-hidden bg-white">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
                    <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
                        <Lock className="h-4 w-4 text-secondary" />
                        보안 문서 업로드
                    </CardTitle>
                    <CardDescription className="text-[11px] font-bold text-slate-400">
                        문서는 저장 전 브라우저에서 AES-256으로 암호화됩니다.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 p-6">
                    <div className="space-y-1.5">
                        <Label htmlFor="doc-name" className="text-[11px] font-black text-slate-500 uppercase tracking-wider">문서 명칭</Label>
                        <Input
                            id="doc-name"
                            placeholder="예: 2024년 근로계약서"
                            value={name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                            className="rounded-lg border-slate-200 h-9 text-sm font-bold focus-visible:ring-secondary"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="file" className="text-[11px] font-black text-slate-500 uppercase tracking-wider">파일 선택 (CSV, TXT, JSON)</Label>
                        <div className="relative group/file">
                            <Input
                                id="file"
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="rounded-lg border-slate-200 h-10 text-xs font-bold focus-visible:ring-secondary file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-[10px] file:font-black file:bg-slate-100 file:text-slate-600 hover:file:bg-slate-200 cursor-pointer"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none group-hover/file:scale-110 transition-transform">
                                <Upload className="h-4 w-4 text-slate-300" />
                            </div>
                        </div>
                    </div>
                    <Button
                        onClick={handleUpload}
                        disabled={!name || !fileContent}
                        className="w-full bg-secondary hover:bg-secondary/90 text-white rounded-lg h-10 font-black text-xs shadow-sm"
                    >
                        <Shield className="mr-2 h-3.5 w-3.5" /> 암호화 및 안전 저장
                    </Button>
                </CardContent>
            </Card>

            <Card className="border border-slate-200 shadow-sm rounded-lg overflow-hidden bg-white">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
                    <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-secondary" />
                        암호화된 문서 보관함
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="hover:bg-transparent border-slate-100">
                                <TableHead className="text-xs font-black text-slate-500 py-3 pl-6 uppercase tracking-wider">문서 내역</TableHead>
                                <TableHead className="text-xs font-black text-slate-500 uppercase tracking-wider">업로드 일자</TableHead>
                                <TableHead className="text-right text-xs font-black text-slate-500 uppercase tracking-wider pr-6">관리</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {userDocuments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-32 text-slate-400 text-xs font-bold">
                                        보관함이 비어 있습니다.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                userDocuments.map((doc) => (
                                    <TableRow key={doc.id} className="hover:bg-slate-50/50 border-slate-50 transition-colors">
                                        <TableCell className="font-bold text-slate-900 flex items-center gap-2 py-3 pl-6">
                                            <div className="bg-secondary/10 p-1.5 rounded-md">
                                                <Lock className="h-3.5 w-3.5 text-secondary" />
                                            </div>
                                            <span className="text-[12px]">{doc.name}</span>
                                        </TableCell>
                                        <TableCell className="text-slate-500 text-[11px] font-bold">
                                            {format(new Date(doc.uploadedAt), 'yyyy.MM.dd')}
                                        </TableCell>
                                        <TableCell className="text-right pr-4 space-x-1">
                                            <Button size="sm" variant="ghost" className="h-8 text-[11px] font-black text-secondary hover:text-secondary hover:bg-secondary/5 rounded-md" onClick={() => handleView(doc.id)}>
                                                <Eye className="h-3.5 w-3.5 mr-1" /> 열람
                                            </Button>
                                            <Button size="sm" variant="ghost" className="h-8 w-8 text-slate-300 hover:text-primary hover:bg-primary/5 rounded-md" onClick={() => removeDocument(doc.id)}>
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={!!viewContent} onOpenChange={(open) => !open && setViewContent(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
                    <DialogHeader>
                        <DialogTitle>Decrypted Document Viewer</DialogTitle>
                        <DialogDescription>
                            This document is only decrypted in your browser memory.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-4 bg-muted rounded-md whitespace-pre-wrap font-mono text-sm">
                        {viewContent}
                    </div>
                    <div className="flex justify-end">
                        <Button variant="secondary" onClick={() => setViewContent(null)}>Close (Wipe Memory)</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
