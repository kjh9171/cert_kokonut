import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Transaction, Category, TransactionType } from '@/types'

interface FinancialState {
    transactions: Transaction[]
    categories: Category[]
    addTransaction: (transaction: Omit<Transaction, 'id' | 'date'> & { date?: Date | string }) => void
    removeTransaction: (id: string) => void
    addCategory: (category: Omit<Category, 'id'>) => void
    getTransactionsByType: (type: TransactionType, userId: string) => Transaction[]
    getUserTransactions: (userId: string) => Transaction[]
    resetAllTransactions: () => void
}

export const useFinancialStore = create<FinancialState>()(
    persist(
        (set, get) => ({
            transactions: [],
            categories: [
                { id: '1', userId: 'global', name: 'Salary', color: '#10b981', type: 'INCOME' },
                { id: '2', userId: 'global', name: 'Freelance', color: '#3b82f6', type: 'INCOME' },
                { id: '3', userId: 'global', name: 'Food', color: '#ef4444', type: 'EXPENSE' },
                { id: '4', userId: 'global', name: 'Rent', color: '#f59e0b', type: 'EXPENSE' },
                { id: '5', userId: 'global', name: 'Utilities', color: '#8b5cf6', type: 'EXPENSE' },
            ],
            addTransaction: (transaction) => set((state) => ({
                transactions: [
                    {
                        ...transaction,
                        id: crypto.randomUUID(),
                        date: transaction.date ? new Date(transaction.date) : new Date()
                    },
                    ...state.transactions
                ]
            })),
            removeTransaction: (id) => set((state) => ({
                transactions: state.transactions.filter((t) => t.id !== id)
            })),
            addCategory: (category) => set((state) => ({
                categories: [...state.categories, { ...category, id: crypto.randomUUID() }]
            })),
            getTransactionsByType: (type, userId) => {
                return get().transactions.filter((t) => t.type === type && t.userId === userId)
            },
            getUserTransactions: (userId) => {
                return get().transactions.filter((t) => t.userId === userId)
            },
            resetAllTransactions: () => {
                set({ transactions: [] })
            }
        }),
        {
            name: 'financial-storage',
        }
    )
)
