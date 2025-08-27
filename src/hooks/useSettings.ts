import { useState, useEffect } from 'react'
import { supabase, Settings } from '@/lib/supabase'

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: supabaseError } = await supabase
        .from('settings')
        .select('*')
        .single()

      if (supabaseError && supabaseError.code !== 'PGRST116') {
        throw supabaseError
      }

      setSettings(data)
    } catch (err) {
      setError('Fout bij het ophalen van instellingen')
      console.error('Error loading settings:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()

    // Subscribe to settings changes
    const subscription = supabase
      .channel('settings-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'settings'
      }, (payload) => {
        console.log('Settings changed:', payload)
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          setSettings(payload.new as Settings)
        }
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const getClubCode = () => {
    return settings?.club_code || 'NCX35M2' // Default fallback
  }

  const getClubName = () => {
    return settings?.club_name || 'Zwaluwen' // Default fallback
  }

  const getLogoUrl = () => {
    return settings?.logo_url || null
  }

  const getThemeColor = () => {
    return settings?.theme_color || '#FF6600' // Default orange
  }

  const getSlideshowEnabled = () => {
    return settings?.slideshow_enabled || false
  }

  const getSlideDuration = () => {
    return settings?.slide_duration || 10
  }

  return {
    settings,
    loading,
    error,
    clubCode: getClubCode(),
    clubName: getClubName(),
    logoUrl: getLogoUrl(),
    themeColor: getThemeColor(),
    slideshowEnabled: getSlideshowEnabled(),
    slideDuration: getSlideDuration(),
    refreshSettings: loadSettings
  }
}
