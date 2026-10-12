import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, MapPin, Users, DollarSign, CheckCircle, Edit2, Trash2, Plane, Ticket, FileText } from 'lucide-react'
import { apiClient } from '../services/api'
import { Card, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Trip, ItineraryDay, BudgetItem } from '../types'

interface TripDetailData extends Trip {
  itinerary_days: ItineraryDay[]
  budget_items: BudgetItem[]
  travelers: any[]
  risk_items: any[]
}

export default function TripDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [trip, setTrip] = useState<TripDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadTrip()
  }, [id])

  const loadTrip = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getTrip(parseInt(id!))
      setTrip(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load trip')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this trip? This action cannot be undone.')) return

    try {
      setDeleting(true)
      await apiClient.deleteTrip(parseInt(id!))
      navigate('/trips')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete trip')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark p-8 flex items-center justify-center">
        <p className="text-text-secondary">Loading trip details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-brand-dark p-8">
        <button
          onClick={() => navigate('/trips')}
          className="flex items-center gap-2 text-cyan hover:text-cyan/80 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Trips</span>
        </button>
        <Card>
          <div className="p-6 bg-danger/20 border border-danger/30 text-danger rounded-lg">
            {error}
          </div>
        </Card>
      </div>
    )
  }

  if (!trip) return null

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  const getDurationDays = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="min-h-screen bg-brand-dark p-8">
      <button
        onClick={() => navigate('/trips')}
        className="flex items-center gap-2 text-cyan hover:text-cyan/80 mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Trips</span>
      </button>

      <div className="max-w-5xl">
        {/* Hero Card */}
        <Card className="mb-8 overflow-hidden">
          <div className="h-48 bg-gradient-primary rounded-lg mb-8 relative">
            <div className="absolute inset-0 bg-black/20"></div>
          </div>

          <div>
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-text-primary mb-2">{trip.title}</h1>
                {trip.description && <p className="text-text-secondary mb-4">{trip.description}</p>}
              </div>
              <div className="flex gap-2 ml-4">
                <Button variant="secondary" size="md" className="flex items-center gap-2">
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  loading={deleting}
                  onClick={handleDelete}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </div>

            {/* Trip Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t border-border">
              <div>
                <p className="text-text-muted text-sm mb-1">Route</p>
                <p className="text-text-primary font-semibold flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-primary" />
                  {trip.starting_location} → {trip.destination}
                </p>
              </div>
              <div>
                <p className="text-text-muted text-sm mb-1">Duration</p>
                <p className="text-text-primary font-semibold">
                  {getDurationDays(trip.start_date, trip.end_date)} days
                </p>
              </div>
              <div>
                <p className="text-text-muted text-sm mb-1">Dates</p>
                <p className="text-text-primary font-semibold text-sm">
                  {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                </p>
              </div>
              <div>
                <p className="text-text-muted text-sm mb-1">Travelers</p>
                <p className="text-text-primary font-semibold flex items-center gap-1">
                  <Users className="w-4 h-4 text-primary" />
                  {trip.num_travelers}
                </p>
              </div>
            </div>

            {/* Status & Readiness */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border">
              <div>
                <p className="text-text-muted text-sm mb-2">Status</p>
                <Badge variant="info">{trip.status}</Badge>
              </div>
              <div>
                <p className="text-text-muted text-sm mb-2">Trip Readiness</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-sidebar rounded-full h-2">
                    <div
                      className="bg-gradient-primary h-2 rounded-full transition-all"
                      style={{ width: `${trip.readiness_score}%` }}
                    />
                  </div>
                  <span className="text-text-primary font-semibold text-sm min-w-fit">
                    {Math.round(trip.readiness_score)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          <Button
            variant="primary"
            className="justify-center gap-2"
            onClick={() => navigate(`/trip/${trip.id}/bookings`)}
          >
            <Ticket className="w-4 h-4" />
            Bookings
          </Button>
          <Button
            variant="secondary"
            className="justify-center gap-2"
            onClick={() => navigate(`/trip/${trip.id}/documents`)}
          >
            <FileText className="w-4 h-4" />
            Documents
          </Button>
          <Button
            variant="secondary"
            className="justify-center gap-2"
            onClick={() => navigate(`/trip/${trip.id}/budget`)}
          >
            <DollarSign className="w-4 h-4" />
            Budget
          </Button>
          <Button
            variant="secondary"
            className="justify-center gap-2"
            onClick={() => navigate(`/trip/${trip.id}/readiness`)}
          >
            <CheckCircle className="w-4 h-4" />
            Readiness
          </Button>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Budget Card */}
          <Card>
            <CardHeader title="Budget Summary" action={<DollarSign className="w-5 h-5 text-primary" />} />
            <div className="space-y-4">
              <div className="bg-sidebar rounded-lg p-4">
                <p className="text-text-muted text-sm mb-1">Total Budget</p>
                <p className="text-3xl font-bold text-text-primary">
                  {trip.currency} {trip.total_budget.toLocaleString()}
                </p>
              </div>

              {trip.budget_items && trip.budget_items.length > 0 ? (
                <div>
                  <p className="text-text-secondary text-sm font-semibold mb-3">Budget Items</p>
                  <div className="space-y-2">
                    {trip.budget_items.map(item => (
                      <div key={item.id} className="flex justify-between py-2 border-b border-border">
                        <span className="text-text-secondary">{item.category}</span>
                        <span className="text-text-primary font-semibold">
                          {item.currency} {item.estimated_cost.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-text-muted text-sm py-4">No budget items added</p>
              )}

              <Button
                variant="secondary"
                className="w-full"
                onClick={() => navigate(`/trip/${trip.id}/budget`)}
              >
                View Full Budget
              </Button>
            </div>
          </Card>

          {/* Readiness Card */}
          <Card>
            <CardHeader title="Trip Readiness" action={<CheckCircle className="w-5 h-5 text-success" />} />
            <div className="space-y-4">
              <div className="bg-sidebar rounded-lg p-6 text-center">
                <p className="text-text-muted text-sm mb-2">Overall Readiness Score</p>
                <p className="text-4xl font-bold text-primary mb-1">{Math.round(trip.readiness_score)}%</p>
                <p className="text-text-secondary text-xs">
                  {trip.readiness_score >= 80 ? 'Ready to go!' : trip.readiness_score >= 60 ? 'Getting ready' : 'In progress'}
                </p>
              </div>

              <Button
                variant="secondary"
                className="w-full"
                onClick={() => navigate(`/trip/${trip.id}/readiness`)}
              >
                View Readiness Checklist
              </Button>
            </div>
          </Card>
        </div>

        {/* Itinerary */}
        {trip.itinerary_days && trip.itinerary_days.length > 0 && (
          <Card className="mb-8">
            <CardHeader title="Itinerary" action={<Plane className="w-5 h-5 text-cyan" />} />
            <div className="space-y-3">
              {trip.itinerary_days.map((day, idx) => (
                <div key={day.id} className="bg-sidebar rounded-lg p-4 border border-border hover:border-primary/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/20 text-primary font-semibold flex-shrink-0">
                      Day {day.day_number}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-text-primary font-semibold mb-1">
                        {formatDate(day.date)}
                        {day.theme && <span className="text-text-secondary text-sm ml-2">• {day.theme}</span>}
                      </h4>
                      {day.activities && day.activities.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {day.activities.map(activity => (
                            <div key={activity.id} className="text-text-secondary text-sm ml-4">
                              • <span className="text-text-primary">{activity.name}</span>
                              <span className="text-text-muted ml-2">({activity.category})</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        {trip.status === 'draft' && (
          <div className="space-y-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate(`/trip/${trip.id}/processing`)}
              className="w-full justify-center"
            >
              Generate Trip Plan with AI
            </Button>
          </div>
        )}

        {trip.status === 'generated' && (
          <div className="grid grid-cols-3 gap-4">
            <Button variant="secondary" onClick={() => navigate(`/trip/${trip.id}/map`)}>
              View Map
            </Button>
            <Button variant="secondary" onClick={() => navigate(`/trip/${trip.id}/what-if`)}>
              What-If Analysis
            </Button>
            <Button variant="secondary" onClick={() => navigate(`/trip/${trip.id}/replan`)}>
              Replan
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
