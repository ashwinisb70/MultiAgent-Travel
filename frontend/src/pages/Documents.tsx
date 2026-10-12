import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileCheck, FileText, Book, Shield, Ticket, Home, AlertCircle, CheckCircle } from 'lucide-react'
import { apiClient } from '../services/api'
import { Card, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import type { Trip } from '../types'

interface Document {
  id: string
  trip_id: number
  document_type: string
  status: 'pending' | 'ready'
  created_at: string
  updated_at: string
}

const DOCUMENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'Passport': Book,
  'Visa': FileCheck,
  'Travel Insurance': Shield,
  'ID Proof': FileText,
  'Flight Ticket': Ticket,
  'Hotel Confirmation': Home,
}

const DOCUMENT_DESCRIPTIONS: Record<string, string> = {
  'Passport': 'Valid passport with at least 6 months validity',
  'Visa': 'Visa approval letter or sticker',
  'Travel Insurance': 'Travel insurance policy document',
  'ID Proof': 'National ID or Aadhaar card',
  'Flight Ticket': 'E-ticket or booking confirmation',
  'Hotel Confirmation': 'Hotel booking confirmation',
}

export default function Documents() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      setLoading(true)
      const tripResponse = await apiClient.getTrip(parseInt(id!))
      setTrip(tripResponse.data)

      const docsResponse = await apiClient.get(`/trips/${id}/documents`)
      setDocuments(docsResponse.data || [])
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (docType: string, currentStatus: string) => {
    try {
      setUpdating(docType)
      const newStatus = currentStatus === 'pending' ? 'ready' : 'pending'

      await apiClient.put(`/trips/${id}/documents/${docType}`, { status: newStatus })

      // Refresh documents
      const docsResponse = await apiClient.get(`/trips/${id}/documents`)
      setDocuments(docsResponse.data || [])
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update document')
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark p-8 flex items-center justify-center">
        <p className="text-text-secondary">Loading documents...</p>
      </div>
    )
  }

  const readyCount = documents.filter(d => d.status === 'ready').length
  const totalCount = documents.length
  const allReady = readyCount === totalCount && totalCount > 0

  return (
    <div className="min-h-screen bg-brand-dark p-8">
      <button
        onClick={() => navigate(`/trip/${id}`)}
        className="flex items-center gap-2 text-cyan hover:text-cyan/80 mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Trip
      </button>

      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2">Trip Documents: {trip?.title}</h1>
          <p className="text-text-secondary">{trip?.destination} • {readyCount} of {totalCount} documents ready</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700 text-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Progress */}
        <Card className="mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Document Readiness</h2>
              <Badge variant={allReady ? 'success' : 'warning'}>
                {allReady ? 'Complete' : `${readyCount}/${totalCount}`}
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="bg-sidebar rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-primary h-3 rounded-full transition-all"
                    style={{ width: `${(readyCount / totalCount) * 100}%` }}
                  />
                </div>
              </div>
              <span className="font-semibold text-text-primary whitespace-nowrap">
                {readyCount}/{totalCount}
              </span>
            </div>
          </div>
        </Card>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {documents.map((doc) => {
            const IconComponent = DOCUMENT_ICONS[doc.document_type]
            const isReady = doc.status === 'ready'

            return (
              <Card key={doc.id} className={`p-6 border transition ${isReady ? 'border-success/50 bg-success/5' : 'border-border'}`}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${isReady ? 'bg-success/20 text-success' : 'bg-sidebar text-text-secondary'}`}>
                    {IconComponent && <IconComponent className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-text-primary font-semibold text-lg">{doc.document_type}</h3>
                        <p className="text-text-secondary text-sm mt-1">
                          {DOCUMENT_DESCRIPTIONS[doc.document_type]}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-4">
                      <Badge variant={isReady ? 'success' : 'warning'}>
                        {isReady ? '✓ Ready' : 'Pending'}
                      </Badge>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button
                        variant={isReady ? 'secondary' : 'primary'}
                        size="sm"
                        onClick={() => handleToggleStatus(doc.document_type, doc.status)}
                        disabled={updating === doc.document_type}
                        className="flex-1"
                      >
                        {updating === doc.document_type ? (
                          'Updating...'
                        ) : isReady ? (
                          'Mark Pending'
                        ) : (
                          'Mark Ready'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Completion Message */}
        {allReady && (
          <Card className="p-6 bg-success/10 border border-success/50">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-success" />
              <div>
                <h3 className="text-text-primary font-semibold">All documents ready!</h3>
                <p className="text-text-secondary text-sm">Your trip is almost ready to go. Check the readiness score to see what else needs to be completed.</p>
              </div>
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="mt-8 flex gap-4">
          <Button
            variant="secondary"
            onClick={() => navigate(`/trip/${id}/readiness`)}
            className="flex-1"
          >
            View Readiness
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(`/trip/${id}`)}
            className="flex-1"
          >
            Back to Trip
          </Button>
        </div>
      </div>
    </div>
  )
}
