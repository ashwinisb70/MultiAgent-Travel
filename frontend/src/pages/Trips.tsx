import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Calendar, MapPin, Users, DollarSign, Trash2 } from 'lucide-react'
import { apiClient } from '../services/api'
import { getDestinationImage } from '../utils/imageUtils'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Trip } from '../types'

export default function Trips() {
  const navigate = useNavigate()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadTrips()
  }, [])

  const loadTrips = async () => {
    try {
      const response = await apiClient.getTrips(0, 100)
      setTrips(response.data)
    } catch (err) {
      console.error('Failed to load trips', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getDurationDays = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  }

  const filteredTrips = trips.filter(trip =>
    trip.title.toLowerCase().includes(search.toLowerCase()) ||
    trip.destination.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-brand-dark p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Your Trips</h1>
          <p className="text-text-secondary">Manage and explore all your travel plans</p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/create-trip')}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create New Trip
        </Button>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trips..."
            className="w-full bg-card border border-border rounded-lg pl-12 pr-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-cyan"
          />
        </div>
      </div>

      {/* Trips Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-text-secondary">Loading trips...</p>
        </div>
      ) : filteredTrips.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-text-secondary mb-4">No trips yet</p>
          <Button
            variant="primary"
            onClick={() => navigate('/create-trip')}
            className="inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Your First Trip
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => (
            <Card key={trip.id} hover className="overflow-hidden cursor-pointer group" onClick={() => navigate(`/trip/${trip.id}`)}>
              {/* Destination Image */}
              <div className="w-full h-40 rounded-lg mb-4 overflow-hidden bg-sidebar">
                <img
                  src={getDestinationImage(trip.destination)}
                  alt={trip.destination}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-text-primary font-semibold mb-1 group-hover:text-cyan transition-colors">{trip.title}</h3>
                  <p className="text-text-secondary text-sm">{trip.destination}</p>
                </div>

                <div className="space-y-2 py-3 border-t border-b border-border">
                  <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <Users className="w-4 h-4" />
                    <span>{trip.num_travelers} traveler{trip.num_travelers !== 1 ? 's' : ''} • {getDurationDays(trip.start_date, trip.end_date)} days</span>
                  </div>
                  <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <DollarSign className="w-4 h-4" />
                    <span>₹{trip.total_budget.toLocaleString()} {trip.currency}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="info">{trip.status}</Badge>
                  <span className="text-cyan text-sm font-medium">{Math.round(trip.readiness_score)}% ready</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
