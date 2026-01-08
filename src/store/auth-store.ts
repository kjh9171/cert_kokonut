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
    signup: (user: Omit<User, 'id' | 'isVerified' | 'role' | 'status'>, role?: 'PLATFORM_ADMIN' | 'COMPANY_ADMIN') => void
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
            users: [],
            isAuthenticated: false,
            _hasHydrated: false,
            setHasHydrated: (state) => set({ _hasHydrated: state }),
            login: (email, passwordHash) => {
                const user = get().users.find(u => u.email === email && u.passwordHash === passwordHash)
                if (user) {
                    set({ pendingUser: user })
                    return true
                }
                return false
            },
            signup: (userData, role = 'COMPANY_ADMIN') => {
                const newUser: User = {
                    ...userData,
                    id: crypto.randomUUID(),
                    isVerified: false,
                    role: role,
                    status: 'ACTIVE' // Default to Active
                }
                set((state) => ({ users: [...state.users, newUser] }))
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
                    isVerified: true, // Auto verify internal members for now
                    role: 'COMPANY_USER',
                    status: 'ACTIVE'
                }
                set((state) => ({ users: [...state.users, newMember] }))
            },
            logout: () => set({ user: null, isAuthenticated: false, pendingUser: null }),
            verifyOtp: (token) => {
                const pending = get().pendingUser
                if (!pending) return false

                // In a real app, verify token with otplib using pending.twoFactorSecret
                // const isValid = authenticator.check(token, pending.twoFactorSecret)

                // For Mock: Accept any token for now as we don't effectively sync secrets in client-mock
                const isValid = true

                if (isValid) {
                    set({ user: pending, isAuthenticated: true, pendingUser: null })
                    return true
                }
                return false
            },
            generateOtpSecret: (email) => {
                return authenticator.generateSecret()
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
