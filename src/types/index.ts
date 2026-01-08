export type TransactionType = 'INCOME' | 'EXPENSE'
export type RecurringInterval = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'

export interface User {
    id: string
    email: string
    passwordHash: string // In real app, never store plain password
    adminName: string
    companyName: string
    businessRegistrationNumber: string
    isVerified: boolean
    twoFactorSecret?: string // Secret for Google OTP
    twoFactorSecret?: string // Secret for Google OTP
    role: 'PLATFORM_ADMIN' | 'COMPANY_ADMIN' | 'COMPANY_USER'
    status?: 'PENDING' | 'ACTIVE' | 'SUSPENDED'
    status?: 'PENDING' | 'ACTIVE' | 'SUSPENDED'
}

export interface Category {
    id: string
    userId: string // Link to specific user
    name: string
    color: string
    type: TransactionType
}

export interface Transaction {
    id: string
    userId: string // Link to specific user
    amount: number
    description: string
    date: Date
    categoryId: string
    type: TransactionType
    isRecurring?: boolean
    recurringInterval?: RecurringInterval
    receiptUrl?: string
}

export interface FinancialGoal {
    id: string
    name: string
    targetAmount: number
    currentAmount: number
    deadline: Date
}

// Privacy/Security related types
export interface SecureDocument {
    id: string
    userId: string // Link to specific user
    name: string
    encryptedData: string // Base64 or Blob url
    uploadedAt: Date
    isViewOnly: boolean
}

export interface PrivacyPolicyDraft {
    id: string
    userId: string // Link to specific user
    companyName: string
    collectionItems: string[]
    usagePurpose: string
    retentionPeriod: string
    createdAt: Date
}
