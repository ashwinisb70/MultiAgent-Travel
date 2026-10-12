import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react'
import { apiClient } from '../services/api'
import { Trip } from '../types'

export default function Replanning() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [replanReason, setReplanReason] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadTrip()
  }, [id])

  const loadTrip = async () => {
    try {
      const response = await apiClient.getTrip(parseInt(id!))
      setTrip(response.data)
    } catch (err) {
      console.error('Failed to load trip')
    } finally {
      setLoading(false)
    }
  }

  const handleReplan = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setProcessing(true)
      const generationData = {
        travelers: [],
        interests: [],
        food_preferences: [],
        special_requirements: replanReason
      }
      await apiClient.generateTrip(parseInt(id!), generationData)
      alert('Replanning completed! Your trip has been updated.')
      navigate(`/trip/${id}`)
    } catch (err: any) {
      alert('Replanning failed: ' + (err.response?.data?.detail || 'Unknown error'))
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-brand-dark p-8 flex items-center justify-center"><p>Loading...</p></div>

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
        <h1 className="text-3xl font-bold text-text-primary mb-2">Replan Trip</h1>
        <p className="text-text-secondary mb-6">{trip?.title}</p>

        <div className="bg-card rounded-lg shadow-md p-8">
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-cyan mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-text-primary">Replan Your Trip</p>
              <p className="text-sm text-text-secondary mt-1">
                Something changed? Weather, schedule, or budget? Let AI replan your trip optimally.
              </p>
            </div>
          </div>

          <form onSubmit={handleReplan} className="space-y-6">
            <div>
              <label className="block text-text-primary font-semibold mb-2">What Changed?</label>
              <textarea
                value={replanReason}
                onChange={(e) => setReplanReason(e.target.value)}
                placeholder="e.g., Bad weather expected, or I have extra 2 days, or need to reduce budget by 30%"
                rows={4}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={processing || !replanReason.trim()}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-semibold flex items-center justify-center space-x-2"
            >
              <RefreshCw className={`w-5 h-5 ${processing ? 'animate-spin' : ''}`} />
              <span>{processing ? 'Replanning...' : 'Replan Trip'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
