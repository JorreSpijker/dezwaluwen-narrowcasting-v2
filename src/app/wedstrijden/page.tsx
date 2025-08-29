'use client'

import { useState, useEffect } from 'react'
import { fetchWedstrijden, ProgramResponse, type Match } from '@/lib/korfbal-api'
import { useSettings } from '@/hooks/useSettings'
import { useTheme } from '@/hooks/useTheme'
import Programma from '@/components/Programma'
import Resultaten from '@/components/Resultaten'

export default function WedstrijdenPage() {
  const [wedstrijdenData, setWedstrijdenData] = useState<ProgramResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { clubCode, clubName, loading: settingsLoading } = useSettings()
  const { themeColor } = useTheme() // Use cached theme color for instant updates

  useEffect(() => {
    const loadWedstrijden = async () => {
      if (settingsLoading || !clubCode) return
      
      try {
        setLoading(true)
        setError(null)
        const data = await fetchWedstrijden(
          clubCode,
          '2025-08-27',
          '2026-09-10'
        )
        setWedstrijdenData(data)
      } catch (err) {
        setError('Fout bij het ophalen van wedstrijd gegevens')
        console.error('Error loading wedstrijden:', err)
      } finally {
        setLoading(false)
      }
    }

    loadWedstrijden()
  }, [clubCode, settingsLoading])

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

  const splitMatchesByDate = (allMatches: Match[]) => {
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0) // Set to start of day for accurate comparison
    
    const futureMatches: Match[] = []
    const pastMatches: Match[] = []
    
    allMatches.forEach(match => {
      const matchDate = new Date(match.date)
      matchDate.setHours(0, 0, 0, 0) // Set to start of day for accurate comparison
      
      if (matchDate >= currentDate) {
        futureMatches.push(match)
      } else {
        pastMatches.push(match)
      }
    })
    
    // Sort future matches ascending (earliest first)
    futureMatches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    // Sort past matches descending (most recent first)
    pastMatches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    return { futureMatches, pastMatches }
  }



  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="teamnl-card bg-red-50 border-l-4 border-red-400 p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Fout bij het laden van gegevens
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Get all matches from all weeks
  const allMatches = wedstrijdenData.flatMap(week => week.matches)
  
  // Split matches into future and past
  const { futureMatches, pastMatches } = splitMatchesByDate(allMatches)

  return (
    <div className="space-y-6">
      {allMatches.length === 0 ? (
        <div className="teamnl-card text-center py-16">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Geen wedstrijden gevonden</h3>
          <p className="mt-1 text-sm text-gray-500">Controleer de club code in de instellingen of probeer het later opnieuw</p>
        </div>
      ) : (
        <>
          {/* Programma Component - Toekomstige wedstrijden */}
          <Programma matches={futureMatches} />
          
          {/* Resultaten Component - Gespeelde wedstrijden */}
          <Resultaten matches={pastMatches} />
        </>
      )}
    </div>
  )
}
