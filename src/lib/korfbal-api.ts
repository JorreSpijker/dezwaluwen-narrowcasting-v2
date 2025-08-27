const API_BASE = process.env.NEXT_PUBLIC_KORFBAL_API_BASE_URL || 'https://api-mijn.korfbal.nl/api/v2'

export interface Pool {
  ref_id: number
  name: string
  sport: {
    name: string
    ref_id: string
  }
}

export interface TeamWithPools {
  team: {
    name: string
    ref_id: string
    sportOrder: number
  }
  pools: Pool[]
}

export interface Standing {
  stats: {
    teamLack: number
    extraPoints: number
    penalties: {
      points: number
    }
    goals: {
      homeAway: number
      difference: number
      against: number
      for: number
    }
    lost: number
    draw: number
    won: number
    points: number
    played: number
    position: number
  }
  team: {
    name: string
  }
}

export interface PoolStanding {
  pool: {
    name: string
    ref_id: number
  }
  standings: Standing[]
}

export interface Match {
  date: string
  teams: {
    home: {
      name: string
      ref_id: string
      clubRefId: string
    }
    away: {
      name: string
      ref_id: string
      clubRefId: string
    }
  }
  sport: {
    name: string
    description: string
  }
  ref_id: number
  pool: {
    name: string
    ref_id: number
  }
  facility: {
    name: string
    ref_id: string
    address: {
      city: string
      street: string
      number: number
      zipcode: string
    }
  }
  status: {
    game: string
    status: string
  }
  field: {
    name: string
  }
  official?: Array<{
    ref_id: string | null
    name: string
    status: string
    initials: string
    infix: string | null
    firstname: string
    roleDescription: string
  }>
}

export interface ProgramResponse {
  year: number
  week: number
  matches: Match[]
}

export async function fetchPools(clubCode: string): Promise<TeamWithPools[]> {
  try {
    // Removed client-side caching config as it has no effect on browser fetch  
    // The API route handles caching with proper headers
    const response = await fetch(`/api/pools/${clubCode}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch pools: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching pools:', error)
    return []
  }
}

export async function fetchWedstrijden(
  clubCode: string, 
  dateFrom?: string, 
  dateTo?: string
): Promise<ProgramResponse[]> {
  try {
    const params = new URLSearchParams()
    if (dateFrom) params.append('dateFrom', dateFrom)
    if (dateTo) params.append('dateTo', dateTo)
    
    const url = `/api/wedstrijden/${clubCode}?${params.toString()}`
    
    // Removed client-side caching config as it has no effect on browser fetch
    // The API route handles caching with proper headers
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch wedstrijden: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching wedstrijden:', error)
    return []
  }
}

export async function fetchStanding(poolId: number): Promise<PoolStanding[]> {
  try {
    // Removed client-side caching config as it has no effect on browser fetch
    // The API route handles caching with proper headers
    const response = await fetch(`/api/standings/${poolId}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch standing: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching standing:', error)
    return []
  }
}
