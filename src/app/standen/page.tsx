'use client'

import { useState, useEffect } from 'react'
import { fetchPools, fetchStanding, TeamWithPools, PoolStanding } from '@/lib/korfbal-api'
import { useSettings } from '@/hooks/useSettings'

export default function StandenPage() {
  const [teamsWithPools, setTeamsWithPools] = useState<TeamWithPools[]>([])
  const [poolStandings, setPoolStandings] = useState<Map<number, PoolStanding[]>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { clubCode, clubName, themeColor, loading: settingsLoading } = useSettings()

  // Generate lighter version of theme color for backgrounds
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

  useEffect(() => {
    const loadPoolsAndStandings = async () => {
      if (settingsLoading || !clubCode) return
      
      try {
        setLoading(true)
        setError(null)
        
        // First load pools
        const poolData = await fetchPools(clubCode)
        setTeamsWithPools(poolData)

        // Then load standings for each pool
        const standingsMap = new Map<number, PoolStanding[]>()
        
        // Get unique pool IDs
        const poolIds = new Set<number>()
        poolData.forEach(teamData => {
          teamData.pools.forEach(pool => {
            poolIds.add(pool.ref_id)
          })
        })

        // Fetch standings for each pool
        await Promise.all(
          Array.from(poolIds).map(async (poolId) => {
            try {
              const standings = await fetchStanding(poolId)
              standingsMap.set(poolId, standings)
            } catch (err) {
              console.error(`Error loading standings for pool ${poolId}:`, err)
            }
          })
        )

        setPoolStandings(standingsMap)
      } catch (err) {
        setError('Fout bij het ophalen van poule gegevens')
        console.error('Error loading pools:', err)
      } finally {
        setLoading(false)
      }
    }

    loadPoolsAndStandings()
  }, [clubCode, clubName, settingsLoading])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
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

  return (
    <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] px-8">


      {teamsWithPools.length === 0 ? (
        <div className="teamnl-card text-center py-8">
          <svg className="mx-auto h-8 w-8 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-xs font-medium text-gray-900">Geen team gegevens gevonden</h3>
          <p className="mt-1 text-xs text-gray-500">Controleer de club code in de instellingen</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {teamsWithPools.flatMap((teamData) =>
            teamData.pools.map((pool) => {
                const standings = poolStandings.get(pool.ref_id)?.[0]
                
                return (
                  <div key={`${teamData.team.ref_id}-${pool.ref_id}`} className="teamnl-card overflow-hidden">
                    <div 
                      className="px-4 py-3"
                      style={{ backgroundColor: themeColor }}
                    >
                      <div className="flex justify-between items-center text-white">
                        <h2 className="text-base font-bold">
                          {teamData.team.name}
                        </h2>
                        <span className="text-xs text-gray-900 font-medium bg-white bg-opacity-20 px-2 py-1 rounded-full">
                          Poule {pool.name}
                        </span>
                      </div>
                    </div>
                    
                    {!standings || standings.standings.length === 0 ? (
                      <div className="p-4 text-center">
                        <svg className="mx-auto h-6 w-6 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <p className="text-gray-500 text-xs">Geen standen beschikbaar</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                              <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                #
                              </th>
                              <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Team
                              </th>
                              <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                G
                              </th>
                              <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                W
                              </th>
                              <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                GL
                              </th>
                              <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                V
                              </th>
                              <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                +/-
                              </th>
                              <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Pnt
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {standings.standings.map((standing) => {
                              const isHomeTeam = standing.team.name.toLowerCase().includes(clubName.toLowerCase())
                              return (
                                <tr 
                                  key={standing.team.name} 
                                  className="transition-colors duration-150"
                                  style={{
                                    backgroundColor: isHomeTeam ? getLightThemeColor() : 'transparent'
                                  }}
                                >
                                  <td className="px-2 py-2 whitespace-nowrap">
                                    <div 
                                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                        isHomeTeam ? 'text-white' : 'text-gray-600'
                                      }`}
                                      style={{
                                        backgroundColor: isHomeTeam ? themeColor : 'transparent'
                                      }}
                                    >
                                      {standing.stats.position}
                                    </div>
                                  </td>
                                                                    <td className="px-2 py-2 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div 
                                        className={`text-xs font-medium ${
                                          isHomeTeam ? 'font-bold' : 'text-gray-900'
                                        }`}
                                        style={{
                                          color: isHomeTeam ? themeColor : 'inherit'
                                        }}
                                      >
                                        {standing.team.name.length > 18 
                                          ? standing.team.name.substring(0, 18) + '...' 
                                          : standing.team.name}
                                      </div>
                                      </div>
                                    </td>
                                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-700 text-center font-medium">
                                    {standing.stats.played}
                                  </td>
                                  <td className="px-2 py-2 whitespace-nowrap text-xs text-green-600 text-center font-medium">
                                    {standing.stats.won}
                                  </td>
                                  <td className="px-2 py-2 whitespace-nowrap text-xs text-yellow-600 text-center font-medium">
                                    {standing.stats.draw}
                                  </td>
                                  <td className="px-2 py-2 whitespace-nowrap text-xs text-red-600 text-center font-medium">
                                    {standing.stats.lost}
                                  </td>
                                  <td className="px-2 py-2 whitespace-nowrap text-xs text-center font-medium">
                                    <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                                      standing.stats.goals.difference >= 0 
                                        ? 'text-green-700 bg-green-100' 
                                        : 'text-red-700 bg-red-100'
                                    }`}>
                                      {standing.stats.goals.difference > 0 ? '+' : ''}{standing.stats.goals.difference}
                                    </span>
                                  </td>
                                  <td className="px-2 py-2 whitespace-nowrap text-center">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                                      {standing.stats.points}
                                    </span>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )
            })
          )}
        </div>
      )}

    </div>
  )
}
