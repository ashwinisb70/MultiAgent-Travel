import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, MapPin, Users, Clock } from 'lucide-react'
import { apiClient } from '../services/api'
import { Card, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Trip } from '../types'

export default function Itinerary() {
  const navigate = useNavigate()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTrips()
  }, [])

  const loadTrips = async () => {
    try {
      const response = await apiClient.getTrips(0, 100)
      setTrips(response.data.filter((t: Trip) => t.itinerary_days && t.itinerary_days.length > 0))
    } catch (err) {
      console.error('Failed to load trips', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark p-8 flex items-center justify-center">
        <p className="text-text-secondary">Loading itineraries...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-dark p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-text-primary mb-2">Trip Itineraries</h1>
        <p className="text-text-secondary">View day-by-day plans for all your trips</p>
      </div>

      <div className="max-w-5xl space-y-6">
        {trips.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-50" />
              <p className="text-text-secondary mb-4">No trips with itineraries yet</p>
              <button
                onClick={() => navigate('/create-trip')}
                className="text-cyan hover:text-cyan/80 font-semibold transition-colors"
              >
                Create your first trip
              </button>
            </div>
          </Card>
        ) : (
          trips.map((trip) => (
            <Card key={trip.id} hover onClick={() => navigate(`/trip/${trip.id}`)}>
              <CardHeader title={trip.title} subtitle={trip.destination} />
              <div className="space-y-4">
                <div className="flex gap-4 text-sm text-text-secondary">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {trip.starting_location} → {trip.destination}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {trip.num_travelers} travelers
                  </span>
                </div>

                {trip.itinerary_days && trip.itinerary_days.length > 0 && (
                  <div className="space-y-3 mt-4 pt-4 border-t border-border">
                    {trip.itinerary_days.slice(0, 3).map((day) => (
                      <div key={day.id} className="bg-sidebar rounded-lg p-3">
                        <div className="flex items-start gap-3">
                          <div className="bg-primary/20 text-primary rounded px-2 py-1 text-xs font-semibold flex-shrink-0">
                            Day {day.day_number}
                          </div>
                          <div className="flex-1">
                            <p className="text-text-primary font-semibold text-sm">
                              {formatDate(day.date)}
                              {day.theme && <span className="text-text-secondary text-xs ml-2">• {day.theme}</span>}
                            </p>
                            {day.activities && day.activities.length > 0 && (
                              <p className="text-text-secondary text-xs mt-1">
                                {day.activities.length} activity{day.activities.length !== 1 ? 'ies' : ''}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {trip.itinerary_days.length > 3 && (
                      <p className="text-text-secondary text-xs text-center">
                        +{trip.itinerary_days.length - 3} more days
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
