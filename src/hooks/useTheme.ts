import { useEffect } from 'react'
import { useSettings } from './useSettings'

export function useTheme() {
  const { themeColor } = useSettings()

  useEffect(() => {
    // Update CSS custom properties when theme color changes
    const root = document.documentElement
    
    if (themeColor) {
      // Parse the hex color and create variations
      const hex = themeColor.replace('#', '')
      const r = parseInt(hex.substr(0, 2), 16)
      const g = parseInt(hex.substr(2, 2), 16)
      const b = parseInt(hex.substr(4, 2), 16)
      
      // Create lighter and darker variations
      const lighterColor = `rgb(${Math.min(255, r + 30)}, ${Math.min(255, g + 30)}, ${Math.min(255, b + 30)})`
      const darkerColor = `rgb(${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 30)})`
      
      // Update CSS custom properties
      root.style.setProperty('--teamnl-orange', themeColor)
      root.style.setProperty('--teamnl-orange-light', lighterColor)
      root.style.setProperty('--teamnl-orange-dark', darkerColor)
      root.style.setProperty('--color-teamnl-orange', themeColor)
      root.style.setProperty('--color-teamnl-orange-light', lighterColor)
      root.style.setProperty('--color-teamnl-orange-dark', darkerColor)
    }
  }, [themeColor])

  return { themeColor }
}
