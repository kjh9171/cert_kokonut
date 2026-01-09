export type TransactionType = 'INCOME' | 'EXPENSE'
export type RecurringInterval = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'

export interface User {
    id: string
    email: string
    passwordHash: string
    adminName: string
    companyName: string
    businessRegistrationNumber: string
    isVerified: boolean // 전반적인 승인 상태
    emailVerified: boolean // 이메일 인증 여부
    emailVerificationToken?: string
    emailVerificationExpiry?: Date
    twoFactorEnabled: boolean // OTP 2단계 인증 활성화 여부
    twoFactorSecret?: string // Secret for Google OTP
    role: 'PLATFORM_ADMIN' | 'COMPANY_ADMIN' | 'COMPANY_USER'
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
