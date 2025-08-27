import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Settings {
  id: number
  club_code: string
  club_name: string
  logo_url?: string
  theme_color: string
  slideshow_enabled?: boolean
  slide_duration?: number
  created_at: string
  updated_at: string
}

export interface NewsItem {
  id: number
  title: string
  content: string
  created_at: string
  updated_at: string
}
