'use client'

import { useState, useEffect } from 'react'
import { supabase, Settings } from '@/lib/supabase'
import { CogIcon, CheckIcon, ExclamationTriangleIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { useSettings } from '@/hooks/useSettings'
import Image from 'next/image'
import ProtectedRoute from '@/components/ProtectedRoute'

function InstellingenPageContent() {
  const { settings: currentSettings, clubCode: currentClubCode, clubName: currentClubName, logoUrl: currentLogoUrl, themeColor: currentThemeColor, loading, refreshSettings } = useSettings()
  const [settings, setSettings] = useState<Settings | null>(null)
  const [clubCode, setClubCode] = useState('')
  const [clubName, setClubName] = useState('')
  const [themeColor, setThemeColor] = useState('#FF6600')
  const [slideshowEnabled, setSlideshowEnabled] = useState(false)
  const [slideDuration, setSlideDuration] = useState(10)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (currentSettings) {
      setSettings(currentSettings)
      setClubCode(currentSettings.club_code)
      setClubName(currentSettings.club_name)
      setThemeColor(currentSettings.theme_color || '#FF6600')
      setSlideshowEnabled(currentSettings.slideshow_enabled || false)
      setSlideDuration(currentSettings.slide_duration || 10)
      setLogoPreview(currentSettings.logo_url || null)
    } else if (!loading && currentClubCode) {
      setClubCode(currentClubCode)
      setClubName(currentClubName)
      setThemeColor(currentThemeColor)
      setLogoPreview(currentLogoUrl)
    }
  }, [currentSettings, currentClubCode, currentClubName, currentThemeColor, currentLogoUrl, loading])

  // Initialize with cached theme color to prevent flash in the form
  useEffect(() => {
    if (typeof window !== 'undefined' && !currentSettings && loading) {
      try {
        const cachedThemeColor = localStorage.getItem('narrowcasting_theme_color')
        if (cachedThemeColor) {
          setThemeColor(cachedThemeColor)
        }
      } catch (error) {
        // Silent fail
      }
    }
  }, [currentSettings, loading])

  const revalidateCache = async (oldClubCode?: string) => {
    try {
      await fetch('/api/revalidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tags: ['pools', 'program', 'standings'],
          clubCode: clubCode
        }),
      })

      // Also revalidate old club code if it changed
      if (oldClubCode && oldClubCode !== clubCode) {
        await fetch('/api/revalidate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tags: ['pools', 'program'],
            clubCode: oldClubCode
          }),
        })
      }
    } catch (err) {
      console.error('Error revalidating cache:', err)
    }
  }

  const handleLogoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('Alleen JPEG, PNG, SVG en WebP bestanden zijn toegestaan')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Bestand moet kleiner zijn dan 5MB')
      return
    }

    setLogoFile(file)
    setError(null)

    // Create preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile) return null

    try {
      setUploading(true)
      
      // Generate unique filename
      const fileExt = logoFile.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('club-logos')
        .upload(filePath, logoFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('club-logos')
        .getPublicUrl(uploadData.path)

      return urlData.publicUrl
    } catch (err) {
      console.error('Error uploading logo:', err)
      throw err
    } finally {
      setUploading(false)
    }
  }

  const removeLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccessMessage(null)

      const oldClubCode = settings?.club_code

      // Upload logo if a new file was selected
      let logoUrl = settings?.logo_url || null
      if (logoFile) {
        logoUrl = await uploadLogo()
      }

      if (settings) {
        // Update existing settings
        const { error: updateError } = await supabase
          .from('settings')
          .update({ 
            club_code: clubCode,
            club_name: clubName,
            logo_url: logoUrl,
            theme_color: themeColor,
            slideshow_enabled: slideshowEnabled,
            slide_duration: slideDuration,
            updated_at: new Date().toISOString()
          })
          .eq('id', settings.id)

        if (updateError) throw updateError
      } else {
        // Create new settings
        const { data: newSettings, error: insertError } = await supabase
          .from('settings')
          .insert([{ 
            club_code: clubCode,
            club_name: clubName,
            logo_url: logoUrl,
            theme_color: themeColor,
            slideshow_enabled: slideshowEnabled,
            slide_duration: slideDuration,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single()

        if (insertError) throw insertError
        setSettings(newSettings)
      }

      // Revalidate cache after saving settings
      await revalidateCache(oldClubCode)
      
      // Refresh settings to trigger updates in other components
      await refreshSettings()

      // Clear the logo file after successful upload
      setLogoFile(null)

      setSuccessMessage('Instellingen succesvol opgeslagen en cache vernieuwd')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError('Fout bij het opslaan van instellingen')
      console.error('Error saving settings:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Hero Header */}
      <div className="mb-12">
        <div className="teamnl-gradient rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Systeem Instellingen</h1>
              <p className="text-xl opacity-90">
                Configureer je narrowcasting systeem
              </p>
              <p className="text-sm opacity-75 mt-1">
                Club configuratie • Logo beheer • API instellingen
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="teamnl-card">
        <div className="p-8">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-400 to-blue-500 flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Club Configuratie
              </h2>
              <p className="text-gray-600">Stel je korfbal club gegevens in</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="club-code" className="block text-sm font-medium text-gray-700">
                Club Code
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="club-code"
                  value={clubCode}
                  onChange={(e) => setClubCode(e.target.value)}
                  className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full text-sm border-gray-300 rounded-lg px-4 py-3 transition-colors duration-200"
                  placeholder="NCX35M2"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                De officiële korfbal club code die gebruikt wordt voor API calls
              </p>
            </div>

            <div>
              <label htmlFor="club-name" className="block text-sm font-medium text-gray-700">
                Club Naam
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="club-name"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full text-sm border-gray-300 rounded-lg px-4 py-3 transition-colors duration-200"
                  placeholder="Zwaluwen"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                De naam van je club zoals deze in teamnamen voorkomt. Dit wordt gebruikt om thuisteams te herkennen in de standen.
              </p>
            </div>

            <div>
              <label htmlFor="logo-upload" className="block text-sm font-medium text-gray-700">
                Club Logo
              </label>
              <div className="mt-1">
                {logoPreview ? (
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <Image
                        src={logoPreview}
                        alt="Logo preview"
                        width={80}
                        height={80}
                        className="h-20 w-20 object-contain rounded-md border border-gray-300"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex space-x-2">
                        <label
                          htmlFor="logo-upload"
                          className="inline-flex items-center px-4 py-2 border border-orange-300 shadow-sm text-sm font-semibold rounded-lg text-orange-700 bg-orange-50 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 cursor-pointer transition-all duration-200"
                        >
                          <PhotoIcon className="h-4 w-4 mr-2" />
                          Vervangen
                        </label>
                        <button
                          type="button"
                          onClick={removeLogo}
                          className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-semibold rounded-lg text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                        >
                          Verwijderen
                        </button>
                      </div>
                      {logoFile && (
                        <p className="mt-2 text-sm text-green-600">
                          Nieuw logo geselecteerd: {logoFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="logo-upload"
                    className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 cursor-pointer"
                  >
                    <div className="space-y-1 text-center">
                      <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <span className="relative bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                          Upload een logo
                        </span>
                        <p className="pl-1">of sleep het hier naartoe</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, SVG, WebP tot 5MB
                      </p>
                    </div>
                  </label>
                )}
                <input
                  id="logo-upload"
                  name="logo-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/svg+xml,image/webp"
                  onChange={handleLogoSelect}
                  className="sr-only"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Upload een logo dat wordt getoond in de topbalk van het narrowcasting systeem.
              </p>
            </div>

            <div>
              <label htmlFor="theme-color" className="block text-sm font-medium text-gray-700 mb-3">
                Thema Kleur
              </label>
              <div className="flex items-center space-x-4">
                {/* Color picker */}
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    id="theme-color"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="h-12 w-12 rounded-lg border-2 border-gray-300 cursor-pointer shadow-sm hover:border-gray-400 transition-colors duration-200"
                  />
                  <div>
                    <input
                      type="text"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-32 text-sm border-gray-300 rounded-lg px-3 py-2 font-mono"
                      placeholder="#FF6600"
                    />
                  </div>
                </div>
                
                {/* Color preview */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm"
                      style={{ backgroundColor: themeColor }}
                    ></div>
                    <div className="text-sm text-gray-600">
                      Preview van de nieuwe thema kleur
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Preset colors */}
              <div className="mt-4">
                <p className="text-xs font-medium text-gray-600 mb-2">Populaire kleuren:</p>
                <div className="flex space-x-2">
                  {[
                    { name: 'TeamNL Oranje', color: '#FF6600' },
                    { name: 'Korfbal Blauw', color: '#0066CC' },
                    { name: 'Sporty Rood', color: '#E53E3E' },
                    { name: 'Victory Groen', color: '#38A169' },
                    { name: 'Royal Paars', color: '#805AD5' },
                    { name: 'Energie Geel', color: '#D69E2E' },
                  ].map((preset) => (
                    <button
                      key={preset.color}
                      type="button"
                      onClick={() => setThemeColor(preset.color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                        themeColor === preset.color 
                          ? 'border-gray-800 ring-2 ring-gray-300' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: preset.color }}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>
              
              <p className="mt-3 text-sm text-gray-500">
                Kies een kleur die past bij je club. Deze kleur wordt gebruikt voor knoppen, accenten en branding door het hele systeem.
              </p>
            </div>

            {/* Slideshow Settings */}
            <div className="pt-8 border-t border-gray-200">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Slideshow Instellingen
                  </h3>
                  <p className="text-gray-600">Automatische doorloop van pagina&apos;s configureren</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label htmlFor="slideshow-enabled" className="block text-sm font-medium text-gray-700">
                        Slideshow Mode
                      </label>
                      <p className="mt-1 text-sm text-gray-500">
                        Schakel automatische doorloop tussen pagina&apos;s in voor narrowcasting gebruik
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSlideshowEnabled(!slideshowEnabled)}
                      className={`${
                        slideshowEnabled ? 'bg-blue-600' : 'bg-gray-200'
                      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2`}
                      role="switch"
                      aria-checked={slideshowEnabled}
                      id="slideshow-enabled"
                    >
                      <span className="sr-only">Slideshow mode inschakelen</span>
                      <span
                        className={`${
                          slideshowEnabled ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      />
                    </button>
                  </div>
                </div>

                <div className={`transition-opacity duration-200 ${slideshowEnabled ? 'opacity-100' : 'opacity-50'}`}>
                  <label htmlFor="slide-duration" className="block text-sm font-medium text-gray-700">
                    Slide Duur (seconden)
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      id="slide-duration"
                      min="5"
                      max="300"
                      value={slideDuration}
                      onChange={(e) => setSlideDuration(parseInt(e.target.value) || 10)}
                      disabled={!slideshowEnabled}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-sm border-gray-300 rounded-lg px-4 py-3 transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="10"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Hoelang elke pagina zichtbaar blijft voordat er wordt overgeschakeld (minimum 5 seconden, maximum 300 seconden)
                  </p>
                </div>

                {slideshowEnabled && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-blue-800">
                          📺 Narrowcasting Mode Actief
                        </h4>
                        <div className="mt-2 text-sm text-blue-700">
                          <p>De website zal automatisch doorlopen tussen: Standen → Programma → Nieuws</p>
                          <p className="mt-1">Elke pagina wordt {slideDuration} seconden getoond voordat er wordt doorgeschakeld.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || uploading || !clubCode.trim() || !clubName.trim() || !themeColor.trim()}
                className="teamnl-button-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none inline-flex items-center"
              >
                <CogIcon className="h-5 w-5 mr-2" />
                {uploading ? 'Logo uploaden...' : saving ? 'Opslaan...' : 'Instellingen Opslaan'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mt-8">
          <div className="teamnl-card bg-green-50 border-l-4 border-green-400 p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckIcon className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-green-800 mb-1">
                  ✅ Succesvol opgeslagen!
                </h3>
                <p className="text-sm text-green-700">
                  {successMessage}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-8">
          <div className="teamnl-card bg-red-50 border-l-4 border-red-400 p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-red-800 mb-1">
                  ❌ Fout bij het opslaan
                </h3>
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default function InstellingenPage() {
  return (
    <ProtectedRoute>
      <InstellingenPageContent />
    </ProtectedRoute>
  )
}
