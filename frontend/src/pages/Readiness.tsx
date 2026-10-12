import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, AlertCircle, Zap, Ticket, FileText } from 'lucide-react'
import { apiClient } from '../services/api'
import { Card, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Trip } from '../types'

interface ReadinessCheck {
  item: string
  status: 'Completed' | 'Pending' | 'Not Started'
  weight: number
}

interface ReadinessScore {
  overall_score: number
  checks: ReadinessCheck[]
  calculation_method: string
  recommendation: string
}

export default function Readiness() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [readiness, setReadiness] = useState<ReadinessScore | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadReadiness()
  }, [id])

  const loadReadiness = async () => {
    try {
      setLoading(true)
      const tripResponse = await apiClient.getTrip(parseInt(id!))
      setTrip(tripResponse.data)

      // Get documents status
      const docsResponse = await apiClient.get(`/trips/${id}/documents-summary`)
      const docsSummary = docsResponse.data

      // Fetch readiness and update documents status based on actual state
      const readinessResponse = await apiClient.getReadiness(parseInt(id!))
      const readinessData = readinessResponse.data

      // Update Documents ready status based on actual document state
      readinessData.checks = readinessData.checks.map((check: any) => {
        if (check.item === 'Documents ready') {
          return {
            ...check,
            status: docsSummary.all_ready ? 'Completed' : 'Pending'
          }
        }
        return check
      })

      // Recalculate overall score based on updated checks
      const completed = readinessData.checks.filter((c: any) => c.status === 'Completed').length
      const total = readinessData.checks.length
      readinessData.overall_score = (completed / total) * 100

      setReadiness(readinessData)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load readiness')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark p-8 flex items-center justify-center">
        <p className="text-text-secondary">Loading readiness assessment...</p>
      </div>
    )
  }

  if (error || !readiness) {
    return (
      <div className="min-h-screen bg-brand-dark p-8">
        <button
          onClick={() => navigate(`/trip/${id}`)}
          className="flex items-center gap-2 text-cyan hover:text-cyan/80 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Trip</span>
        </button>
        <Card>
          <div className="p-6 bg-danger/20 border border-danger/30 text-danger rounded-lg">
            {error || 'Readiness assessment not available'}
          </div>
        </Card>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    if (status === 'Completed') return <CheckCircle2 className="w-5 h-5 text-success" />
    if (status === 'Pending') return <AlertCircle className="w-5 h-5 text-warning" />
    return <AlertCircle className="w-5 h-5 text-text-muted" />
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'success'
    if (score >= 60) return 'warning'
    return 'danger'
  }

  const completedCount = readiness.checks.filter(c => c.status === 'Completed').length
  const totalCount = readiness.checks.length

  return (
    <div className="min-h-screen bg-brand-dark p-8">
      <button
        onClick={() => navigate(`/trip/${id}`)}
        className="flex items-center gap-2 text-cyan hover:text-cyan/80 mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Trip</span>
      </button>

      <div className="max-w-4xl">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-text-primary mb-2">Trip Readiness: {trip?.title}</h1>
          <p className="text-text-secondary">{trip?.destination} • {trip?.num_travelers} travelers</p>
        </div>

        {/* Overall Score Card */}
        <Card className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm mb-2">Overall Readiness Score</p>
              <div className="flex items-baseline gap-2">
                <p className="text-6xl font-bold text-primary">
                  {Math.round(readiness.overall_score)}
                </p>
                <p className="text-xl text-text-secondary">/ 100</p>
              </div>
              <Badge variant={getScoreBadge(readiness.overall_score)} className="mt-4">
                {readiness.overall_score >= 80 ? 'Ready to go!' : readiness.overall_score >= 60 ? 'Getting ready' : 'In progress'}
              </Badge>
            </div>
            <Zap className="w-20 h-20 text-warning opacity-20" />
          </div>
        </Card>

        {/* Progress */}
        <Card className="mb-8">
          <CardHeader title="Completion Progress" />
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="bg-sidebar rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-primary h-3 rounded-full transition-all"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
            </div>
            <span className="font-semibold text-text-primary whitespace-nowrap">
              {completedCount} of {totalCount}
            </span>
          </div>
        </Card>

        {/* Checklist */}
        <Card className="mb-8">
          <CardHeader title="Pre-Trip Checklist" />
          <div className="space-y-3">
            {readiness.checks.map((check, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 bg-sidebar border border-border rounded-lg hover:border-primary/50 transition-colors">
                <div className="pt-1 flex-shrink-0">
                  {getStatusIcon(check.status)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-text-primary">{check.item}</p>
                  <Badge
                    variant={
                      check.status === 'Completed' ? 'success' :
                      check.status === 'Pending' ? 'warning' :
                      'secondary'
                    }
                    className="mt-2"
                  >
                    {check.status}
                  </Badge>
                </div>
                <div className="text-right text-text-muted text-sm">
                  <p>Weight: {(check.weight * 100).toFixed(0)}%</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Bookings Action */}
        {readiness.checks.some(c => (c.item === 'Flights booked' || c.item === 'Accommodation booked') && c.status === 'Pending') && (
          <Card className="mb-8 border border-cyan/50 bg-cyan/5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-text-primary mb-1">Complete Your Bookings</h3>
                <p className="text-text-secondary text-sm">Book flights and accommodations to mark these items as completed</p>
              </div>
              <Button
                variant="primary"
                onClick={() => navigate(`/trip/${id}/bookings`)}
                className="flex items-center gap-2 flex-shrink-0"
              >
                <Ticket className="w-4 h-4" />
                Go to Bookings
              </Button>
            </div>
          </Card>
        )}

        {/* Documents Action */}
        {readiness.checks.some(c => c.item === 'Documents ready' && c.status === 'Pending') && (
          <Card className="mb-8 border border-amber-500/50 bg-amber-500/5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-text-primary mb-1">Complete Your Documents</h3>
                <p className="text-text-secondary text-sm">Upload or mark your travel documents as ready</p>
              </div>
              <Button
                variant="primary"
                onClick={() => navigate(`/trip/${id}/documents`)}
                className="flex items-center gap-2 flex-shrink-0"
              >
                <FileText className="w-4 h-4" />
                Go to Documents
              </Button>
            </div>
          </Card>
        )}

        {/* Recommendation */}
        <Card>
          <div className="p-6 bg-primary/10 border border-primary/20 rounded-lg">
            <h3 className="font-semibold text-text-primary mb-2">💡 Recommendation</h3>
            <p className="text-text-secondary">{readiness.recommendation}</p>
          </div>
          <p className="text-text-muted text-xs mt-6 text-center">
            Calculated using: {readiness.calculation_method}
          </p>
        </Card>
      </div>
    </div>
  )
}
