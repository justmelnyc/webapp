import { create } from 'zustand'

export type ToastKind = 'error' | 'success' | 'info'

export interface Toast {
  id: number
  kind: ToastKind
  message: string
  /** Optional heading, like the original alerts' `title` (the message is then the body). */
  title?: string
}

interface ToastState {
  toasts: Toast[]
  push: (kind: ToastKind, message: string, title?: string) => void
  dismiss: (id: number) => void
}

let nextId = 1

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (kind, message, title) => {
    const id = nextId++
    set((state) => ({ toasts: [...state.toasts, { id, kind, message, ...(title ? { title } : {}) }] }))
    setTimeout(() => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })), 5000)
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))

/** Imperative helpers so callers don't need the hook: toast.error('...') */
export const toast = {
  error: (message: string, title?: string) => useToastStore.getState().push('error', message, title),
  success: (message: string, title?: string) => useToastStore.getState().push('success', message, title),
  info: (message: string, title?: string) => useToastStore.getState().push('info', message, title),
}
