'use client'

import { useState, useEffect } from 'react'
import { supabase, NewsItem } from '@/lib/supabase'
import { NewspaperIcon, ClockIcon } from '@heroicons/react/24/outline'

export default function NieuwsPage() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const { data, error: supabaseError } = await supabase
          .from('news')
          .select('*')
          .order('created_at', { ascending: false })

        if (supabaseError) {
          throw supabaseError
        }

        setNewsItems(data || [])
      } catch (err) {
        setError('Fout bij het ophalen van nieuwsitems')
        console.error('Error loading news:', err)
      } finally {
        setLoading(false)
      }
    }

    loadNews()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
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
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nieuws</h1>
        <p className="mt-2 text-gray-600">
          Laatste nieuws en mededelingen
        </p>
      </div>

      {newsItems.length === 0 ? (
        <div className="text-center py-12">
          <NewspaperIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Geen nieuws</h3>
          <p className="mt-1 text-sm text-gray-500">
            Er zijn nog geen nieuwsitems toegevoegd.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {newsItems.map((item) => (
            <article 
              key={item.id}
              className="bg-white shadow rounded-lg overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {item.title}
                  </h2>
                  <div className="flex items-center text-sm text-gray-500">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {formatDate(item.created_at)}
                  </div>
                </div>
                
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {item.content}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
