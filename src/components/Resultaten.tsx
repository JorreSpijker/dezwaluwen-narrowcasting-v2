'use client'

import { type Match } from '@/lib/korfbal-api'
import { useSettings } from '@/hooks/useSettings'
import { useTheme } from '@/hooks/useTheme'

interface ResultatenProps {
  matches: Match[]
}

export default function Resultaten({ matches }: ResultatenProps) {
  const { clubCode, clubName } = useSettings()
  const { themeColor } = useTheme() // Use cached theme color for instant updates

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isHomeMatch = (match: Match) => {
    return match.teams.home.clubRefId === clubCode
  }
  
  const isClubTeam = (teamName: string) => {
    return teamName.toLowerCase().includes(clubName.toLowerCase())
  }

  const getMatchType = (match: Match) => {
    const isClubInMatch = isClubTeam(match.teams.home.name) || isClubTeam(match.teams.away.name)
    
    if (!isClubInMatch) {
      return 'neutral'
    }
    
    if (isHomeMatch(match)) {
      return 'home' // Club team speelt thuis
    } else {
      return 'away' // Club team speelt uit
    }
  }

  const getMatchResult = (match: Match) => {
    // Check if match has been played (has score data)
    if (match.status?.game === 'finished' || match.status?.status === 'finished') {
      const matchType = getMatchType(match)
      if (matchType === 'neutral') return null
      
      // For demonstration, we'll assume score data might be in a scores field
      // In real API this might be different - we'll show placeholder for now
      return {
        homeScore: '0', // This would come from actual API data
        awayScore: '0', // This would come from actual API data
        result: 'gelijk' // 'winst', 'verlies', or 'gelijk'
      }
    }
    return null
  }

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'winst':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
            ✓ Winst
          </span>
        )
      case 'verlies':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
            ✗ Verlies
          </span>
        )
      case 'gelijk':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
            = Gelijk
          </span>
        )
      default:
        return null
    }
  }

  if (matches.length === 0) {
    return (
      <div className="teamnl-card text-center py-16">
        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Geen resultaten beschikbaar</h3>
        <p className="mt-1 text-sm text-gray-500">Er zijn nog geen wedstrijden gespeeld</p>
      </div>
    )
  }

  return (
    <div className="teamnl-card overflow-hidden">
      <div 
        className="px-4 py-3"
        style={{ backgroundColor: themeColor || '#f97316' }}
      >
        <div className="flex justify-between items-center text-white">
          <h2 className="text-base font-bold">
          Resultaten
          </h2>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Datum
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Thuis
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Uitslag
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Uit
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Resultaat
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {matches.map((match) => {
              const matchType = getMatchType(match)
              const isHomeTeam = isClubTeam(match.teams.home.name)
              const isAwayTeam = isClubTeam(match.teams.away.name)
              const result = getMatchResult(match)
              
              return (
                <tr 
                  key={match.ref_id}
                  className={`${
                    matchType === 'home' 
                      ? 'bg-blue-50' 
                      : matchType === 'away'
                      ? 'bg-gray-50'
                      : 'bg-white'
                  }`}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(match.date)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      isHomeTeam 
                        ? 'text-gray-900 font-bold' 
                        : 'text-gray-900'
                    }`}>
                      {match.teams.home.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    {result ? (
                      <span className="text-gray-900 font-bold text-lg">
                        {result.homeScore} - {result.awayScore}
                      </span>
                    ) : (
                      <span className="text-gray-400 font-medium">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      isAwayTeam 
                        ? 'text-gray-900 font-bold' 
                        : 'text-gray-900'
                    }`}>
                      {match.teams.away.name}
                    </div>
                    {matchType === 'away' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                        🚗 Uit
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    {result && matchType !== 'neutral' && getResultBadge(result.result)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
