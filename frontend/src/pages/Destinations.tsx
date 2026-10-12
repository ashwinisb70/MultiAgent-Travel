import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Users, Calendar } from 'lucide-react'
import { apiClient } from '../services/api'
import { getDestinationImage } from '../utils/imageUtils'
import { Card, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Trip } from '../types'

export default function Destinations() {
  const navigate = useNavigate()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [uniqueDestinations, setUniqueDestinations] = useState<Map<string, Trip[]>>(new Map())

  useEffect(() => {
    loadTrips()
  }, [])

  const loadTrips = async () => {
    try {
      const response = await apiClient.getTrips(0, 100)
      setTrips(response.data)

      // Group trips by destination
      const destMap = new Map<string, Trip[]>()
      response.data.forEach((trip: Trip) => {
        const dest = trip.destination || 'Unknown'
        if (!destMap.has(dest)) {
          destMap.set(dest, [])
        }
        destMap.get(dest)!.push(trip)
      })
      setUniqueDestinations(destMap)
    } catch (err) {
      console.error('Failed to load trips', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark p-8 flex items-center justify-center">
        <p className="text-text-secondary">Loading destinations...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-dark p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-text-primary mb-2">Your Destinations</h1>
        <p className="text-text-secondary">{uniqueDestinations.size} destinations across {trips.length} trips</p>
      </div>

      <div className="max-w-5xl">
        {uniqueDestinations.size === 0 ? (
          <Card>
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-50" />
              <p className="text-text-secondary mb-4">No destinations yet</p>
              <button
                onClick={() => navigate('/create-trip')}
                className="text-cyan hover:text-cyan/80 font-semibold transition-colors"
              >
                Create your first trip
              </button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from(uniqueDestinations.entries()).map(([destination, destinationTrips]) => (
              <Card key={destination} hover>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-lg flex-shrink-0 overflow-hidden bg-sidebar">
                    <img
                      src={getDestinationImage(destination)}
                      alt={destination}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-text-primary font-semibold text-lg mb-2">{destination}</h3>
                    <p className="text-text-secondary text-sm mb-3">
                      {destinationTrips.length} trip{destinationTrips.length !== 1 ? 's' : ''}
                    </p>
                    <div className="space-y-2">
                      {destinationTrips.slice(0, 3).map((trip) => (
                        <button
                          key={trip.id}
                          onClick={() => navigate(`/trip/${trip.id}`)}
                          className="block w-full text-left text-sm p-2 rounded bg-sidebar hover:bg-card transition-colors group"
                        >
                          <p className="text-text-primary font-medium group-hover:text-cyan transition-colors">
                            {trip.title}
                          </p>
                          <p className="text-text-secondary text-xs">
                            {trip.num_travelers} travelers
                          </p>
                        </button>
                      ))}
                      {destinationTrips.length > 3 && (
                        <p className="text-text-secondary text-xs text-center pt-2">
                          +{destinationTrips.length - 3} more
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
