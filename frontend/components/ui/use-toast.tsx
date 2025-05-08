"use client"

import { useState, useEffect } from 'react'

export interface Toast {
  id: string
  title: string
  description?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  variant?: 'default' | 'destructive' | 'success'
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const timers = toasts.map((toast) => {
      if (toast.duration) {
        return setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== toast.id))
        }, toast.duration)
      }
      return null
    })

    return () => {
      timers.forEach((timer) => timer && clearTimeout(timer))
    }
  }, [toasts])

  const toast = (props: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { ...props, id }])
  }

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return {
    toast,
    dismiss,
    toasts,
  }
}

export default useToast 