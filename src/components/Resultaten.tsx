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
    // Check if match has been played and has score data
    if ((match.status?.game === 'uitgespeeld' || match.status?.status === 'FINAL') && match.stats) {
      const matchType = getMatchType(match)
      if (matchType === 'neutral') return null
      
      const homeScore = match.stats.home.score
      const awayScore = match.stats.away.score
      
      // Determine result from club's perspective
      let result = 'gelijk'
      if (matchType === 'home') {
        // Club is home team
        if (homeScore > awayScore) result = 'winst'
        else if (homeScore < awayScore) result = 'verlies'
      } else {
        // Club is away team  
        if (awayScore > homeScore) result = 'winst'
        else if (awayScore < homeScore) result = 'verlies'
      }
      
      return {
        homeScore: homeScore.toString(),
        awayScore: awayScore.toString(),
        result
      }
    }
    
    return null
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
            {clubName} - Resultaten
          </h2>
          <span className="text-xs text-gray-900 font-medium bg-white bg-opacity-20 px-2 py-1 rounded-full">
            Afgelopen week
          </span>
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
                Tijd
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Thuis
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600 uppercase tracking-wider">
                vs
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Uit
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                &nbsp;
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
                    result?.result === 'winst' 
                      ? 'bg-green-50' 
                      : matchType === 'home' 
                      ? 'bg-blue-50' 
                      : 'bg-white'
                  }`}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 w-3">
                    {formatDate(match.date)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-regular text-gray-900">
                    {formatTime(match.date)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className={`text-sm font-regular ${
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
                      <span className="text-gray-400 font-regular">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className={`text-sm font-regular ${
                      isAwayTeam 
                        ? 'text-gray-900 font-bold' 
                        : 'text-gray-900'
                    }`}>
                      {match.teams.away.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-regular text-gray-900">
                    &nbsp;
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
