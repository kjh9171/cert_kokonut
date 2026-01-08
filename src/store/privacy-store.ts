import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SecureDocument } from '@/types'
import AES from 'crypto-js/aes'
import Utf8 from 'crypto-js/enc-utf8'

// Mock key for demo - in production this should be user-provided or handled securely
const SECRET_KEY = "my_super_secret_key"

interface PrivacyState {
    documents: SecureDocument[]
    addDocument: (doc: { userId: string, name: string, data: string }) => void
    getDocument: (id: string, userId: string) => string | null
    getUserDocuments: (userId: string) => SecureDocument[]
    removeDocument: (id: string) => void
    resetAllDocuments: () => void
}

export const usePrivacyStore = create<PrivacyState>()(
    persist(
        (set, get) => ({
            documents: [],
            addDocument: ({ userId, name, data }) => {
                // ENCRYPT DATA BEFORE STORING
                const encrypted = AES.encrypt(data, SECRET_KEY).toString()

                set((state) => ({
                    documents: [
                        {
                            id: crypto.randomUUID(),
                            userId, // Link to user
                            name,
                            encryptedData: encrypted,
                            uploadedAt: new Date(),
                            isViewOnly: true
                        },
                        ...state.documents
                    ]
                }))
            },
            getDocument: (id, userId) => {
                const doc = get().documents.find(d => d.id === id && d.userId === userId) // Strict Check
                if (!doc) return null

                // DECRYPT DATA WHEN REQUESTED
                try {
                    const bytes = AES.decrypt(doc.encryptedData, SECRET_KEY)
                    return bytes.toString(Utf8)
                } catch (e) {
                    console.error("Decryption failed", e)
                    return null
                }
            },
            getUserDocuments: (userId) => {
                return get().documents.filter(d => d.userId === userId)
            },
            removeDocument: (id) => set((state) => ({
                documents: state.documents.filter((d) => d.id !== id)
            })),
            resetAllDocuments: () => {
                set({ documents: [] })
            }
        }),
        {
            name: 'privacy-storage',
        }
    )
)
