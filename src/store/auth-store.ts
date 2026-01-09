import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types'
import { authenticator } from 'otplib'

interface AuthState {
    user: User | null
    pendingUser: User | null // User waiting for OTP
    users: User[]
    isAuthenticated: boolean
    login: (email: string, passwordHash: string) => boolean
    signup: (user: Omit<User, 'id' | 'isVerified' | 'role' | 'status' | 'emailVerified' | 'twoFactorEnabled'>, role?: 'PLATFORM_ADMIN' | 'COMPANY_ADMIN') => void
    sendVerificationEmail: (email: string) => string // Returns mock token
    verifyEmail: (email: string, token: string) => boolean
    addTeamMember: (adminEmail: string, newMemberEmail: string) => void
    logout: () => void
    verifyOtp: (token: string) => boolean
    generateOtpSecret: (email: string) => string
    updateUserStatus: (userId: string, status: 'PENDING' | 'ACTIVE' | 'SUSPENDED') => void
    resetAllUsers: () => void
    _hasHydrated: boolean
    setHasHydrated: (state: boolean) => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            pendingUser: null,
            users: [
                {
                    id: 'test-user-1',
                    email: 'test@test.com',
                    passwordHash: '1111',
                    adminName: '테스트 계정',
                    companyName: 'Test Company',
                    businessRegistrationNumber: '000-00-00000',
                    isVerified: true,
                    emailVerified: true,
                    twoFactorEnabled: true,
                    twoFactorSecret: 'JBSWY3DPEHPK3PXP', // Example secret
                    role: 'COMPANY_USER',
                    status: 'ACTIVE'
                }
            ],
            isAuthenticated: false,
            _hasHydrated: false,
            setHasHydrated: (state) => set({ _hasHydrated: state }),
            login: (email, passwordHash) => {
                const user = get().users.find(u => u.email === email && u.passwordHash === passwordHash)
                if (user) {
                    if (user.twoFactorEnabled) {
                        set({ pendingUser: user })
                        return true
                    } else {
                        set({ user, isAuthenticated: true })
                        return true
                    }
                }
                return false
            },
            signup: (userData, role = 'COMPANY_ADMIN') => {
                const newUser: User = {
                    ...userData,
                    id: crypto.randomUUID(),
                    isVerified: false,
                    emailVerified: false,
                    twoFactorEnabled: false,
                    role: role,
                    status: 'PENDING' // Default to Pending for new signups
                }
                set((state) => ({ users: [...state.users, newUser] }))
            },
            sendVerificationEmail: (email) => {
                const mockToken = Math.floor(100000 + Math.random() * 900000).toString()
                const expiry = new Date(Date.now() + 3 * 60 * 1000) // 3 mins

                set((state) => ({
                    users: state.users.map(u =>
                        u.email === email
                            ? { ...u, emailVerificationToken: mockToken, emailVerificationExpiry: expiry }
                            : u
                    )
                }))
                console.log(`[Mock Email] Verification code for ${email}: ${mockToken}`)
                return mockToken
            },
            verifyEmail: (email, token) => {
                const users = get().users
                const user = users.find(u => u.email === email)

                if (user && user.emailVerificationToken === token) {
                    const now = new Date()
                    if (user.emailVerificationExpiry && user.emailVerificationExpiry > now) {
                        set((state) => ({
                            users: state.users.map(u =>
                                u.email === email
                                    ? { ...u, emailVerified: true, status: 'ACTIVE' as const }
                                    : u
                            )
                        }))
                        return true
                    }
                }
                return false
            },
            addTeamMember: (adminEmail, newMemberEmail) => {
                const users = get().users
                const admin = users.find(u => u.email === adminEmail)
                if (!admin || admin.role !== 'COMPANY_ADMIN') return

                const newMember: User = {
                    id: crypto.randomUUID(),
                    email: newMemberEmail,
                    passwordHash: "password", // Default password
                    adminName: "팀원",
                    companyName: admin.companyName, // Inherit company
                    businessRegistrationNumber: admin.businessRegistrationNumber,
                    isVerified: true,
                    emailVerified: true,
                    twoFactorEnabled: false,
                    role: 'COMPANY_USER',
                    status: 'ACTIVE'
                }
                set((state) => ({ users: [...state.users, newMember] }))
            },
            logout: () => set({ user: null, isAuthenticated: false, pendingUser: null }),
            verifyOtp: (token) => {
                const pending = get().pendingUser
                if (!pending || !pending.twoFactorSecret) return false

                // Real verification with otplib (token check against stored secret)
                const isValid = authenticator.check(token, pending.twoFactorSecret)

                if (isValid) {
                    set({ user: pending, isAuthenticated: true, pendingUser: null })
                    return true
                }
                return false
            },
            generateOtpSecret: (email) => {
                const secret = authenticator.generateSecret()
                // Store the secret for the pending signup user if needed, 
                // but usually handled during actual registration flow
                return secret
            },
            updateUserStatus: (userId, status) => {
                set((state) => ({
                    users: state.users.map(u => u.id === userId ? { ...u, status } : u)
                }))
            },
            resetAllUsers: () => {
                set({ user: null, pendingUser: null, users: [], isAuthenticated: false })
            }
        }),
        {
            name: 'auth-storage',
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true)
            }
        }
    )
)
