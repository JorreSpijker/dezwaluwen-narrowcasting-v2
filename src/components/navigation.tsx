'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  ChartBarIcon, 
  CalendarIcon, 
  NewspaperIcon, 
  CogIcon 
} from '@heroicons/react/24/outline'
import { useSettings } from '@/hooks/useSettings'
import Image from 'next/image'

const navigation = [
  { name: 'Standen', href: '/standen', icon: ChartBarIcon },
  { name: 'Wedstrijden', href: '/wedstrijden', icon: CalendarIcon },
  { name: 'Nieuws', href: '/nieuws', icon: NewspaperIcon },
]

const settingsItem = { name: 'Instellingen', href: '/instellingen', icon: CogIcon }

export default function Navigation() {
  const pathname = usePathname()
  const { logoUrl, clubName, themeColor } = useSettings()

  // Generate lighter version of theme color for hover states
  const getLightThemeColor = () => {
    if (!themeColor) return 'rgb(255, 243, 230)' // Default light orange
    
    const hex = themeColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    
    // Make it very light (blend with white)
    const lightR = Math.round(r + (255 - r) * 0.9)
    const lightG = Math.round(g + (255 - g) * 0.9)
    const lightB = Math.round(b + (255 - b) * 0.9)
    
    return `rgb(${lightR}, ${lightG}, ${lightB})`
  }

    return (
    <nav 
      className="bg-white shadow-lg border-b-4"
      style={{ borderBottomColor: themeColor || '#f97316' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              {logoUrl ? (
                <div className="flex items-center">
                  <Image
                    src={logoUrl}
                    alt={`${clubName} logo`}
                    width={56}
                    height={56}
                    className="h-14 w-auto object-contain"
                  />
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="w-14 h-14 rounded-full teamnl-gradient flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-xl">{clubName.charAt(0)}</span>
                  </div>
                  <div className="flex flex-col">
                    <h1 className="text-gray-900 text-xl font-bold leading-tight">{clubName}</h1>
                    <span 
                      className="text-sm font-semibold"
                      style={{ color: themeColor || '#f97316' }}
                    >
                      Narrowcasting
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="hidden md:block ml-12">
              <div className="flex items-center space-x-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? 'text-white'
                          : 'text-gray-600'
                      }`}
                      style={{
                        backgroundColor: isActive 
                          ? (themeColor || '#f97316')
                          : 'transparent',
                        color: isActive ? 'white' : undefined
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = getLightThemeColor()
                          e.currentTarget.style.color = themeColor || '#f97316'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent'
                          e.currentTarget.style.color = '#4b5563' // text-gray-600
                        }
                      }}
                    >
                      <item.icon className={`mr-2 h-5 w-5 ${isActive ? 'text-white' : 'text-current'}`} />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            {/* Settings button - desktop */}
            <div className="hidden md:block">
              {(() => {
                const isActive = pathname === settingsItem.href
                return (
                  <Link
                    href={settingsItem.href}
                    className={`flex items-center px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-600'
                    }`}
                    style={{
                      backgroundColor: isActive 
                        ? (themeColor || '#f97316')
                        : 'transparent',
                      color: isActive ? 'white' : undefined
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = getLightThemeColor()
                        e.currentTarget.style.color = themeColor || '#f97316'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.color = '#4b5563' // text-gray-600
                      }
                    }}
                  >
                    <settingsItem.icon className={`mr-2 h-5 w-5 ${isActive ? 'text-white' : 'text-current'}`} />
                    {settingsItem.name}
                  </Link>
                )
              })()}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden ml-4">
              <button 
                className="text-gray-600 p-2 transition-colors duration-200"
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = themeColor || '#f97316'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#4b5563' // text-gray-600
                }}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
