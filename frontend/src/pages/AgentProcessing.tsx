import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader, CheckCircle, AlertCircle } from 'lucide-react'
import { apiClient } from '../services/api'
import { Trip } from '../types'

export default function AgentProcessing() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    loadTrip()
  }, [id])

  const loadTrip = async () => {
    try {
      const response = await apiClient.getTrip(parseInt(id!))
      setTrip(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load trip')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateTrip = async () => {
    try {
      setProcessing(true)
      setStatus('processing')

      const generationData = {
        travelers: [],
        interests: ['Culture', 'Food', 'Adventure'],
        food_preferences: ['Local Cuisine'],
        hotel_preference: 'Comfort',
        transportation_preference: 'Flight',
        special_requirements: ''
      }

      const response = await apiClient.generateTrip(parseInt(id!), generationData)
      setStatus('completed')

      setTimeout(() => {
        navigate(`/trip/${id}`)
      }, 2000)
    } catch (err: any) {
      setStatus('error')
      setError(err.response?.data?.detail || 'Failed to generate trip')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark p-8 flex items-center justify-center">
        <p className="text-text-secondary">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-dark p-8">
      <button
        onClick={() => navigate(`/trip/${id}`)}
        className="flex items-center space-x-2 text-cyan hover:text-cyan/80 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Trip</span>
      </button>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-6">Trip Generation</h1>
        <p className="text-text-secondary mb-6">{trip?.title}</p>

        <div className="bg-card rounded-lg shadow-md p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {status === 'idle' && (
            <div className="text-center">
              <div className="mb-6 p-8 bg-blue-50 rounded-lg border border-blue-200">
                <h2 className="text-xl font-semibold text-text-primary mb-2">Ready to Generate Your Trip Plan</h2>
                <p className="text-text-secondary">
                  Our AI agents will analyze your preferences and create an optimized travel itinerary including:
                </p>
                <ul className="mt-4 text-left max-w-md mx-auto space-y-2 text-text-primary">
                  <li>✓ Optimized flight routes and schedules</li>
                  <li>✓ Hotel recommendations</li>
                  <li>✓ Daily itineraries with activities</li>
                  <li>✓ Budget optimization</li>
                  <li>✓ Risk assessment and mitigation</li>
                </ul>
              </div>
              <button
                onClick={handleGenerateTrip}
                disabled={processing}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-semibold"
              >
                {processing ? 'Generating...' : 'Generate Trip Plan with AI'}
              </button>
            </div>
          )}

          {status === 'processing' && (
            <div className="text-center py-12">
              <Loader className="w-12 h-12 text-cyan animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-text-primary mb-2">Generating Your Trip Plan</h2>
              <p className="text-text-secondary">Our AI agents are analyzing your preferences and creating an optimized itinerary...</p>
              <div className="mt-6 space-y-2">
                <p className="text-sm text-text-secondary">• Flight Agent analyzing routes...</p>
                <p className="text-sm text-text-secondary">• Hotel Agent finding accommodations...</p>
                <p className="text-sm text-text-secondary">• Activity Agent scheduling experiences...</p>
              </div>
            </div>
          )}

          {status === 'completed' && (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-text-primary mb-2">Trip Plan Generated!</h2>
              <p className="text-text-secondary mb-6">Your optimized trip plan has been created successfully.</p>
              <p className="text-sm text-text-secondary">Redirecting to trip details...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-text-primary mb-2">Generation Failed</h2>
              <p className="text-text-secondary mb-6">{error}</p>
              <button
                onClick={handleGenerateTrip}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
