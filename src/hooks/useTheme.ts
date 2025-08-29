import { useEffect, useLayoutEffect, useState } from 'react'
import { useSettings } from './useSettings'

// Utility function to create color variations
const createColorVariations = (hexColor: string) => {
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)  
  const b = parseInt(hex.substr(4, 2), 16)
  
  // Create lighter and darker variations
  const lighterColor = `rgb(${Math.min(255, r + 30)}, ${Math.min(255, g + 30)}, ${Math.min(255, b + 30)})`
  const darkerColor = `rgb(${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 30)})`
  
  return { lighterColor, darkerColor }
}

// Function to apply theme colors to CSS custom properties
const applyThemeColors = (themeColor: string) => {
  const root = document.documentElement
  const { lighterColor, darkerColor } = createColorVariations(themeColor)
  
  // Update CSS custom properties
  root.style.setProperty('--teamnl-orange', themeColor)
  root.style.setProperty('--teamnl-orange-light', lighterColor)
  root.style.setProperty('--teamnl-orange-dark', darkerColor)
  root.style.setProperty('--color-teamnl-orange', themeColor)
  root.style.setProperty('--color-teamnl-orange-light', lighterColor)
  root.style.setProperty('--color-teamnl-orange-dark', darkerColor)
  
  // Cache the theme color in localStorage to prevent FOUC
  try {
    localStorage.setItem('narrowcasting_theme_color', themeColor)
  } catch (error) {
    // Silent fail if localStorage is not available
    console.warn('Could not cache theme color:', error)
  }
}

export function useTheme() {
  const { themeColor, loading } = useSettings()
  const [currentThemeColor, setCurrentThemeColor] = useState<string>('#FF6600')

  // Initialize theme from cache BEFORE render to prevent FOUC
  useLayoutEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return
    
    try {
      const cachedThemeColor = localStorage.getItem('narrowcasting_theme_color')
      if (cachedThemeColor) {
        // Apply cached theme immediately to prevent flash
        applyThemeColors(cachedThemeColor)
        setCurrentThemeColor(cachedThemeColor)
      }
    } catch (error) {
      // Silent fail if localStorage is not available
      console.warn('Could not load cached theme color:', error)
    }
  }, []) // Empty dependency array - only run once on mount

  // Update theme when settings are loaded
  useEffect(() => {
    if (themeColor && !loading) {
      applyThemeColors(themeColor)
      setCurrentThemeColor(themeColor)
    }
  }, [themeColor, loading])

  // Only show loading if no cached theme is available and settings are still loading
  const shouldShowLoading = loading && (typeof window === 'undefined' || !localStorage.getItem('narrowcasting_theme_color'))

  return { 
    themeColor: currentThemeColor, // Always return the current active theme color
    loading: shouldShowLoading, // Optimized loading state
    applyThemeColors // Export for manual theme application if needed
  }
}
