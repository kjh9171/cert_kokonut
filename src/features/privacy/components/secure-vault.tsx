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
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-purple-500" />
                        Secure Document Upload
                    </CardTitle>
                    <CardDescription>
                        Documents are encrypted with AES-256 before storage. We cannot read them.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                    <Button onClick={handleUpload} disabled={!name || !fileContent}>
                        <Lock className="mr-2 h-4 w-4" /> Encrypt & Upload
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Encrypted Vault</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Uploaded</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {userDocuments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                        Vault is empty.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                userDocuments.map((doc) => (
                                    <TableRow key={doc.id}>
                                        <TableCell className="font-medium">{doc.name}</TableCell>
                                        <TableCell>{format(new Date(doc.uploadedAt), 'MMM d, yyyy')}</TableCell>
                                        <TableCell>
                                            <span className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded w-fit">
                                                <Lock className="h-3 w-3" /> Encrypted
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button size="sm" variant="outline" onClick={() => handleView(doc.id)}>
                                                <Eye className="h-4 w-4 mr-1" /> View
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => removeDocument(doc.id)}>
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
