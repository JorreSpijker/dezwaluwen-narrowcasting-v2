'use client'

import { useTheme } from '@/hooks/useTheme'
import { ReactNode } from 'react'

interface ThemeProviderProps {
  children: ReactNode
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const { loading } = useTheme()

  // Show a minimal loading state only on the very first load when no cached theme exists
  // This prevents any flash and ensures themes are applied
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-6"></div>
          <div className="text-gray-700 text-xl font-semibold mb-2">
            🏐 Zwaluwen Narrowcasting
          </div>
          <div className="text-gray-500 text-sm">
            Thema wordt toegepast...
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
