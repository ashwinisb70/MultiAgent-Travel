import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { apiClient } from '../services/api'
import { Card, CardHeader } from '../components/ui/Card'
import { Trip, Activity } from '../types'

// Fix Leaflet marker icons
const defaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const startIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const destIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

export default function TripMap() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [destinations, setDestinations] = useState<any[]>([])

  useEffect(() => {
    loadTrip()
  }, [id])

  const loadTrip = async () => {
    try {
      const response = await apiClient.getTrip(parseInt(id!))
      const tripData = response.data
      setTrip(tripData)

      if (tripData.itinerary_days) {
        const allActivities = tripData.itinerary_days.flatMap((day: any) => day.activities || [])
        setActivities(allActivities)
      }

      // Create destination markers with coordinate mapping for common locations
      const locs: any[] = []
      const coordinateMap: Record<string, [number, number]> = {
        'Bengaluru': [12.9716, 77.5946],
        'Paris': [48.8566, 2.3522],
        'New York': [40.7128, -74.0060],
        'Tokyo': [35.6762, 139.6503],
        'London': [51.5074, -0.1278],
        'Dubai': [25.2048, 55.2708],
        'Singapore': [1.3521, 103.8198],
        'Goa': [15.2993, 73.8243],
        'Delhi': [28.7041, 77.1025],
        'Mumbai': [19.0760, 72.8777],
        'Maldives': [4.1694, 73.5093],
        'Bali': [-8.6705, 115.2126],
        'Bangkok': [13.7563, 100.5018],
        'Barcelona': [41.3874, 2.1686],
        'Rome': [41.9028, 12.4964],
        'Amsterdam': [52.3676, 4.9041],
        'Berlin': [52.5200, 13.4050],
        'Vienna': [48.2082, 16.3738],
        'Prague': [50.0755, 14.4378],
        'Madrid': [40.4168, -3.7038],
      }

      if (tripData.starting_location) {
        const coords = coordinateMap[tripData.starting_location] || [20, 0]
        locs.push({ lat: coords[0], lng: coords[1], name: tripData.starting_location, type: 'start' })
      }

      if (tripData.destination && tripData.destination !== tripData.starting_location) {
        const coords = coordinateMap[tripData.destination] || [20, 0]
        locs.push({ lat: coords[0], lng: coords[1], name: tripData.destination, type: 'destination' })
      }

      setDestinations(locs)
    } catch (err) {
      console.error('Failed to load trip', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark p-8 flex items-center justify-center">
        <p className="text-text-secondary">Loading map...</p>
      </div>
    )
  }

  const activitiesWithLocation = activities.filter(a => a.latitude && a.longitude)

  return (
    <div className="min-h-screen bg-brand-dark p-8">
      <button
        onClick={() => navigate(`/trip/${id}`)}
        className="flex items-center gap-2 text-cyan hover:text-cyan/80 mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Trip</span>
      </button>

      <div className="max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2">Trip Map</h1>
          <p className="text-text-secondary">{trip?.title} • {trip?.destination}</p>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Interactive Map */}
          <div className="col-span-2">
            <Card>
              <div className="rounded-lg overflow-hidden h-96 border border-border">
                {destinations.length > 0 ? (
                  <MapContainer
                    center={[destinations[0].lat, destinations[0].lng]}
                    zoom={6}
                    style={{ height: '100%', width: '100%' }}
                    className="rounded-lg"
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {destinations.map((dest, idx) => (
                      <Marker
                        key={idx}
                        position={[dest.lat, dest.lng]}
                        icon={dest.type === 'start' ? startIcon : destIcon}
                      >
                        <Popup>
                          <div className="text-sm">
                            <p className="font-semibold">{dest.name}</p>
                            <p className="text-xs text-gray-600">
                              {dest.type === 'start' ? 'Starting Point' : 'Destination'}
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                ) : (
                  <div className="h-full bg-gradient-to-br from-blue-900/20 to-cyan-900/20 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-text-secondary mb-2">No location data available</p>
                      <p className="text-text-muted text-sm">Add destinations to your trip to see them on the map</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <Card>
            <CardHeader title="Locations" />
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <div>
                <p className="font-semibold text-text-primary text-sm mb-1">Starting Point</p>
                <p className="text-text-secondary text-sm">{trip?.starting_location}</p>
              </div>
              <div className="border-t border-border pt-3">
                <p className="font-semibold text-text-primary text-sm mb-1">Destination</p>
                <p className="text-text-secondary text-sm">{trip?.destination}</p>
              </div>

              {activitiesWithLocation.length > 0 && (
                <div className="border-t border-border pt-3">
                  <p className="font-semibold text-text-primary text-sm mb-2">Activities ({activitiesWithLocation.length})</p>
                  {activitiesWithLocation.slice(0, 5).map((activity, idx) => (
                    <div key={idx} className="mb-2 text-xs">
                      <p className="font-medium text-text-primary">{activity.name}</p>
                      <p className="text-text-secondary">{activity.location}</p>
                    </div>
                  ))}
                  {activitiesWithLocation.length > 5 && (
                    <p className="text-xs text-text-muted mt-2">
                      +{activitiesWithLocation.length - 5} more
                    </p>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
