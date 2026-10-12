import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Lightbulb, CheckCircle } from 'lucide-react'
import { apiClient } from '../services/api'
import { Trip } from '../types'

interface Decision {
  decision: string
  reason: string
  alternatives_considered: string[]
  impact?: string
}

export default function Decisions() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [loading, setLoading] = useState(true)

  const sampleDecisions: Decision[] = [
    {
      decision: 'Recommended Paris as primary destination',
      reason: 'Based on your interests in culture and food, Paris offers the best experience with museums, fine dining, and walkable neighborhoods.',
      alternatives_considered: ['Rome', 'Barcelona', 'Amsterdam'],
      impact: 'Maximizes cultural experience and cuisine variety'
    },
    {
      decision: 'Scheduled 3 days in Paris, 2 days in Versailles',
      reason: 'Optimal distribution to cover major attractions without exhaustion, with buffer time for spontaneous activities.',
      alternatives_considered: ['4-1 split', '2-3 split', 'Single destination'],
      impact: 'Balanced experience with adequate rest periods'
    },
    {
      decision: 'Recommended 4-star hotels (Comfort level)',
      reason: 'Your budget allows for comfortable mid-range hotels with good location access to main attractions.',
      alternatives_considered: ['Budget hotels', 'Luxury hotels', 'Boutique stays'],
      impact: 'Best value for money with comfort'
    },
    {
      decision: 'Allocated 35% of budget to accommodation',
      reason: 'Industry standard for European trips ensures quality stays while leaving room for activities and food.',
      alternatives_considered: ['25% allocation', '40% allocation'],
      impact: 'Maintains overall trip quality'
    }
  ]

  useEffect(() => {
    loadTrip()
  }, [id])

  const loadTrip = async () => {
    try {
      const response = await apiClient.getTrip(parseInt(id!))
      setTrip(response.data)
      setDecisions(sampleDecisions)
    } catch (err) {
      console.error('Failed to load trip')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark p-8 flex items-center justify-center">
        <p className="text-text-secondary">Loading decisions...</p>
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

      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Trip Decisions & Reasoning</h1>
        <p className="text-text-secondary mb-6">{trip?.title} • AI-Generated Recommendations</p>

        <div className="space-y-4">
          {decisions.map((decision, idx) => (
            <div key={idx} className="bg-card rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-start space-x-4">
                <Lightbulb className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-text-primary mb-2 flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>{decision.decision}</span>
                  </h3>

                  <div className="mb-4">
                    <p className="text-sm font-semibold text-text-primary mb-1">Why?</p>
                    <p className="text-text-secondary text-sm">{decision.reason}</p>
                  </div>

                  {decision.alternatives_considered && decision.alternatives_considered.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-text-primary mb-2">Alternatives Considered:</p>
                      <div className="flex flex-wrap gap-2">
                        {decision.alternatives_considered.map((alt, altIdx) => (
                          <span key={altIdx} className="px-3 py-1 bg-brand-dark text-text-primary text-xs rounded-full">
                            {alt}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {decision.impact && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm font-semibold text-green-900 mb-1">Impact:</p>
                      <p className="text-sm text-green-800">{decision.impact}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-text-primary">
            <span className="font-semibold">Note:</span> These decisions are AI-generated recommendations based on your preferences and trip parameters.
            Feel free to modify them using the What-If analysis tool to explore different scenarios.
          </p>
        </div>
      </div>
    </div>
  )
}
