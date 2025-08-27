'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSettings } from '@/hooks/useSettings'

const SLIDE_ROUTES = ['/standen', '/programma', '/nieuws']

export default function Slideshow() {
  const router = useRouter()
  const pathname = usePathname()
  const { slideshowEnabled, slideDuration, loading } = useSettings()
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<number>(Date.now())

  // Preload/cache the next pages for smooth transitions
  const prefetchPages = async () => {
    try {
      for (const route of SLIDE_ROUTES) {
        router.prefetch(route)
      }
    } catch (error) {
      console.error('Error prefetching pages:', error)
    }
  }

  // Get the next route in the slideshow sequence
  const getNextRoute = () => {
    const currentIndex = SLIDE_ROUTES.indexOf(pathname)
    const nextIndex = (currentIndex + 1) % SLIDE_ROUTES.length
    return SLIDE_ROUTES[nextIndex]
  }

  // Navigate to next slide
  const goToNextSlide = () => {
    if (!slideshowEnabled) return
    
    const nextRoute = getNextRoute()
    router.push(nextRoute)
  }

  // Reset the timer (useful for user interaction)
  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    
    if (slideshowEnabled && SLIDE_ROUTES.includes(pathname)) {
      const duration = slideDuration * 1000 // Convert to milliseconds
      timerRef.current = setTimeout(goToNextSlide, duration)
    }
  }

  // Handle user interaction (mouse movement, clicks, etc.)
  const handleUserActivity = () => {
    const now = Date.now()
    lastActivityRef.current = now
    
    // Reset timer on user activity to prevent interrupting user interaction
    if (slideshowEnabled) {
      resetTimer()
    }
  }

  // Initialize slideshow
  useEffect(() => {
    if (loading) return

    // Prefetch all pages when slideshow is enabled
    if (slideshowEnabled) {
      prefetchPages()
    }

    // Only run slideshow on the defined routes
    if (slideshowEnabled && SLIDE_ROUTES.includes(pathname)) {
      resetTimer()
    } else {
      // Clear timer if slideshow is disabled or we're on a different page
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [slideshowEnabled, slideDuration, pathname, loading])

  // Listen for user interactions to reset the timer
  useEffect(() => {
    if (!slideshowEnabled) return

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true)
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true)
      })
    }
  }, [slideshowEnabled])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  // This component doesn't render anything visible
  return null
}
