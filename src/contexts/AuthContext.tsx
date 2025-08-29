'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  login: (password: string) => boolean
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = () => {
      const authData = sessionStorage.getItem('narrowcasting_auth')
      if (authData) {
        try {
          const { timestamp, authenticated } = JSON.parse(authData)
          const now = Date.now()
          const sessionDuration = 4 * 60 * 60 * 1000 // 4 hours
          
          if (authenticated && (now - timestamp) < sessionDuration) {
            setIsAuthenticated(true)
          } else {
            // Session expired
            sessionStorage.removeItem('narrowcasting_auth')
            setIsAuthenticated(false)
          }
        } catch (error) {
          console.error('Error parsing auth data:', error)
          sessionStorage.removeItem('narrowcasting_auth')
          setIsAuthenticated(false)
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = (password: string): boolean => {
    // In production, you would set this via environment variable
    const correctPassword = process.env.NEXT_PUBLIC_SETTINGS_PASSWORD || 'admin123'
    
    if (password === correctPassword) {
      const authData = {
        authenticated: true,
        timestamp: Date.now()
      }
      sessionStorage.setItem('narrowcasting_auth', JSON.stringify(authData))
      setIsAuthenticated(true)
      return true
    }
    return false
  }

  const logout = () => {
    sessionStorage.removeItem('narrowcasting_auth')
    setIsAuthenticated(false)
  }

  // Auto logout on page visibility change (security feature)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched away from page, start inactivity timer
        const timeoutId = setTimeout(() => {
          logout()
        }, 30 * 60 * 1000) // 30 minutes of inactivity
        
        // Store timeout ID to clear it if user returns
        sessionStorage.setItem('inactivity_timeout', timeoutId.toString())
      } else {
        // User returned to page, clear inactivity timer
        const timeoutId = sessionStorage.getItem('inactivity_timeout')
        if (timeoutId) {
          clearTimeout(parseInt(timeoutId))
          sessionStorage.removeItem('inactivity_timeout')
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      const timeoutId = sessionStorage.getItem('inactivity_timeout')
      if (timeoutId) {
        clearTimeout(parseInt(timeoutId))
        sessionStorage.removeItem('inactivity_timeout')
      }
    }
  }, [])

  const value = {
    isAuthenticated,
    login,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
