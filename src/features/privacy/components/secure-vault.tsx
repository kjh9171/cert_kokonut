"use client"

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
    const userDocuments = documents.filter(doc => doc.userId === user?.id)

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
        <div className="grid gap-8 lg:grid-cols-2">
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white/80 backdrop-blur-md">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                        <Lock className="h-5 w-5 text-indigo-600" />
                        보안 문서 업로드
                    </CardTitle>
                    <CardDescription>
                        문서는 저장 전 브라우저에서 AES-256으로 암호화됩니다.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="doc-name">Document Name</Label>
                        <Input
                            id="doc-name"
                            placeholder="e.g. Employee Contract"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="file">File (Text/HTML/JSON)</Label>
                        <Input
                            id="file"
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                    </div>
                    <Button onClick={handleUpload} disabled={!name || !fileContent} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 shadow-lg shadow-indigo-200">
                        <Shield className="mr-2 h-4 w-4" /> 암호화 및 업로드
                    </Button>
                </CardContent>
            </Card>

            <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
                <CardHeader className="bg-slate-900 border-b border-slate-800">
                    <CardTitle className="text-white flex items-center gap-2">
                        <Lock className="h-5 w-5 text-indigo-400" />
                        암호화된 문서 보관함
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-800/50">
                            <TableRow className="hover:bg-transparent border-slate-800">
                                <TableHead className="text-slate-300 font-medium">문서명</TableHead>
                                <TableHead className="text-slate-300 font-medium">업로드 날짜</TableHead>
                                <TableHead className="text-slate-300 font-medium text-right">관리</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="bg-slate-900">
                            {userDocuments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-40 text-slate-500">
                                        보관함이 비어 있습니다.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                userDocuments.map((doc) => (
                                    <TableRow key={doc.id} className="hover:bg-slate-800/30 border-slate-800 transition-colors">
                                        <TableCell className="font-medium text-slate-200 flex items-center gap-2 py-4">
                                            <Shield className="h-4 w-4 text-indigo-400" />
                                            {doc.name}
                                        </TableCell>
                                        <TableCell className="text-slate-400 text-sm">
                                            {format(new Date(doc.uploadedAt), 'yyyy년 MM월 dd일')}
                                        </TableCell>
                                        <TableCell className="text-right space-x-2 pr-6">
                                            <Button size="sm" variant="ghost" className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/50 rounded-lg" onClick={() => handleView(doc.id)}>
                                                <Eye className="h-4 w-4 mr-1" /> 열람
                                            </Button>
                                            <Button size="sm" variant="ghost" className="text-slate-500 hover:text-red-400 hover:bg-red-900/30 rounded-lg" onClick={() => removeDocument(doc.id)}>
                                                <Trash2 className="h-4 w-4" />
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
