import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, MapPin, Users, DollarSign } from 'lucide-react'
import { apiClient } from '../services/api'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export default function CreateTrip() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    starting_location: '',
    destination: '',
    start_date: '',
    end_date: '',
    num_travelers: '',
    total_budget: '',
    currency: 'INR',
    travel_style: 'Adventure',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'num_travelers' || name === 'total_budget') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? '' : parseFloat(value)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const num_travelers = typeof formData.num_travelers === 'string'
        ? parseInt(formData.num_travelers)
        : formData.num_travelers
      const total_budget = typeof formData.total_budget === 'string'
        ? parseFloat(formData.total_budget)
        : formData.total_budget

      const response = await apiClient.createTrip({
        ...formData,
        num_travelers,
        total_budget,
        start_date: `${formData.start_date}T00:00:00`,
        end_date: `${formData.end_date}T00:00:00`
      })
      navigate(`/trip/${response.data.id}`)
    } catch (err: any) {
      const detail = err.response?.data?.detail
      if (Array.isArray(detail)) {
        setError(detail.map((d: any) => d.msg).join(', '))
      } else if (typeof detail === 'string') {
        setError(detail)
      } else {
        setError('Failed to create trip')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-dark p-8">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-cyan hover:text-cyan/80 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Dashboard</span>
      </button>

      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-text-primary mb-2">Create New Trip</h1>
          <p className="text-text-secondary">Plan your next adventure with TripGenie</p>
        </div>

        <Card>
          {error && (
            <div className="mb-6 p-4 bg-danger/20 border border-danger/30 text-danger rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-text-primary font-semibold mb-2">Trip Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Summer Paris Adventure"
                className="w-full px-4 py-2.5 bg-sidebar border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-text-primary font-semibold mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your trip..."
                rows={3}
                className="w-full px-4 py-2.5 bg-sidebar border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Locations */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-text-primary font-semibold mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Starting Location
                </label>
                <input
                  type="text"
                  name="starting_location"
                  value={formData.starting_location}
                  onChange={handleChange}
                  placeholder="e.g., Bengaluru"
                  className="w-full px-4 py-2.5 bg-sidebar border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-text-primary font-semibold mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Destination
                </label>
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder="e.g., Paris"
                  className="w-full px-4 py-2.5 bg-sidebar border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-text-primary font-semibold mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Start Date
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-sidebar border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-text-primary font-semibold mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  End Date
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-sidebar border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>
            </div>

            {/* Budget & Travelers */}
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-text-primary font-semibold mb-2">
                  <Users className="w-4 h-4 inline mr-2" />
                  Number of Travelers
                </label>
                <input
                  type="number"
                  name="num_travelers"
                  value={formData.num_travelers}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2.5 bg-sidebar border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-text-primary font-semibold mb-2">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Total Budget
                </label>
                <input
                  type="number"
                  name="total_budget"
                  value={formData.total_budget}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  className="w-full px-4 py-2.5 bg-sidebar border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-text-primary font-semibold mb-2">Currency</label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-sidebar border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary transition-colors"
                >
                  <option>INR</option>
                  <option>USD</option>
                  <option>EUR</option>
                  <option>GBP</option>
                </select>
              </div>
            </div>

            {/* Travel Style */}
            <div>
              <label className="block text-text-primary font-semibold mb-2">Travel Style</label>
              <select
                name="travel_style"
                value={formData.travel_style}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-sidebar border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary transition-colors"
              >
                <option>Adventure</option>
                <option>Relaxation</option>
                <option>Culture</option>
                <option>Food</option>
                <option>Budget</option>
                <option>Luxury</option>
              </select>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="flex-1"
              >
                {loading ? 'Creating Trip...' : 'Create Trip'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => navigate('/dashboard')}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
