'use client'

import { type Match } from '@/lib/korfbal-api'
import { useSettings } from '@/hooks/useSettings'

interface ProgrammaProps {
  matches: Match[]
}

export default function Programma({ matches }: ProgrammaProps) {
  const { clubCode, clubName, themeColor } = useSettings()

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

  const getOfficialName = (match: Match) => {
    if (!match.official || match.official.length === 0) {
      return 'Niet toegewezen'
    }
    
    const official = match.official[0]
    const nameParts = []
    
    if (official.firstname) nameParts.push(official.firstname)
    if (official.infix) nameParts.push(official.infix)
    if (official.name) nameParts.push(official.name)
    
    return nameParts.length > 0 ? nameParts.join(' ') : 'Niet toegewezen'
  }

  // Smart week selection: show current week, or next week with matches
  const getSmartWeekMatches = (matches: Match[]) => {
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0) // Start of today
    
    // First try: current week (next 7 days)
    const nextWeekDate = new Date(currentDate)
    nextWeekDate.setDate(nextWeekDate.getDate() + 7)
    
    const currentWeekMatches = matches.filter(match => {
      const matchDate = new Date(match.date)
      matchDate.setHours(0, 0, 0, 0)
      return matchDate >= currentDate && matchDate < nextWeekDate
    })
    
    // If we have matches this week, return them with week info
    if (currentWeekMatches.length > 0) {
      return {
        matches: currentWeekMatches,
        weekLabel: 'Deze week',
        isCurrentWeek: true
      }
    }
    
    // If no matches this week, find the next week with matches
    // Look ahead up to 8 weeks (2 months)
    for (let weekOffset = 1; weekOffset <= 8; weekOffset++) {
      const weekStartDate = new Date(currentDate)
      weekStartDate.setDate(weekStartDate.getDate() + (weekOffset * 7))
      
      const weekEndDate = new Date(weekStartDate)
      weekEndDate.setDate(weekEndDate.getDate() + 7)
      
      const weekMatches = matches.filter(match => {
        const matchDate = new Date(match.date)
        matchDate.setHours(0, 0, 0, 0)
        return matchDate >= weekStartDate && matchDate < weekEndDate
      })
      
      if (weekMatches.length > 0) {
        // Format the week dates for display
        const weekStart = weekStartDate.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
        const weekEnd = new Date(weekEndDate.getTime() - 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
        
        return {
          matches: weekMatches,
          weekLabel: `${weekStart} - ${weekEnd}`,
          isCurrentWeek: false
        }
      }
    }
    
    // No matches found in next 8 weeks
    return {
      matches: [],
      weekLabel: 'Deze week',
      isCurrentWeek: true
    }
  }

  const weekData = getSmartWeekMatches(matches)

  if (weekData.matches.length === 0) {
    return (
      <div className="teamnl-card text-center py-16">
        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Geen wedstrijden gevonden</h3>
        <p className="mt-1 text-sm text-gray-500">Geen wedstrijden gepland voor de komende 8 weken</p>
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
            {clubName}
          </h2>
          <span className="text-xs text-gray-900 font-medium bg-white bg-opacity-20 px-2 py-1 rounded-full">
            {weekData.weekLabel}
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
                Scheidsrechter
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {weekData.matches.map((match) => {
              const matchType = getMatchType(match)
              const isHomeTeam = isClubTeam(match.teams.home.name)
              const isAwayTeam = isClubTeam(match.teams.away.name)
              
              return (
                <tr 
                  key={match.ref_id}
                  className={`${
                    matchType === 'home' 
                      ? 'bg-blue-50' 
                      : 'bg-white'
                  }`}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
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
                    <span className="text-gray-400 font-regular">-</span>
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
                    {getOfficialName(match)}
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
