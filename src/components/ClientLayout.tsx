'use client'

import { ReactNode } from 'react'
import { useTheme } from '@/hooks/useTheme'

interface ClientLayoutProps {
  children: ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  // Apply dynamic theme
  useTheme()
  
  return <>{children}</>
}
