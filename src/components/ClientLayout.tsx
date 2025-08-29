'use client'

import { ReactNode } from 'react'
import ThemeProvider from '@/components/ThemeProvider'

interface ClientLayoutProps {
  children: ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  )
}
