import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Loader, CheckCircle, AlertCircle } from 'lucide-react'
import { apiClient } from '../services/api'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

const INTERESTS = ['Food', 'Culture', 'Shopping', 'Nature', 'Adventure', 'History', 'Relaxation', 'Sports']

export default function AIPlanner() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tripId, setTripId] = useState<number | null>(null)
  const [generatingId, setGeneratingId] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    starting_location: 'Bengaluru',
    num_travelers: 2,
    total_budget: 150000,
    currency: 'INR',
    travel_style: 'Adventure',
    start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    hotel_preference: 'Comfort',
    transportation_preference: 'Flight',
    interests: ['Food', 'Culture'],
    food_preferences: []
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('budget') || name.includes('travelers') ? parseFloat(value) : value
    }))
  }

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.destination || !formData.title) {
      setError('Destination and trip title are required')
      return
    }

    try {
      setLoading(true)
      setError('')

      // Step 1: Create the trip
      const tripResponse = await apiClient.createTrip({
        title: formData.title,
        destination: formData.destination,
        starting_location: formData.starting_location,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        num_travelers: formData.num_travelers,
        total_budget: formData.total_budget,
        currency: formData.currency,
        travel_style: formData.travel_style
      })

      const newTripId = tripResponse.data.id
      setTripId(newTripId)
      setGeneratingId(newTripId)

      // Step 2: Generate itinerary
      const generationData = {
        travelers: Array.from({ length: formData.num_travelers }, (_, i) => ({
          name: `Traveler ${i + 1}`,
          interests: formData.interests
        })),
        interests: formData.interests,
        food_preferences: formData.food_preferences,
        hotel_preference: formData.hotel_preference,
        transportation_preference: formData.transportation_preference
      }

      await apiClient.generateTrip(newTripId, generationData)

      // Step 3: Redirect to trip detail
      setTimeout(() => {
        navigate(`/trip/${newTripId}`)
      }, 1500)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create trip')
      setLoading(false)
      setGeneratingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-brand-dark p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-cyan" />
            <h1 className="text-4xl font-bold text-text-primary">AI Trip Planner</h1>
          </div>
          <p className="text-text-secondary">Let our AI create your perfect travel itinerary based on your preferences</p>
        </div>

        {generatingId ? (
          <Card className="text-center py-12">
            <Loader className="w-12 h-12 text-cyan animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-text-primary mb-2">Creating Your Itinerary</h2>
            <p className="text-text-secondary mb-6">Our AI is analyzing your preferences and creating a perfect trip plan for {formData.destination}...</p>
            <div className="space-y-2 text-sm text-text-secondary">
              <p>✓ Understanding your preferences</p>
              <p>✓ Planning destinations</p>
              <p>✓ Creating day-by-day itinerary</p>
              <p>✓ Calculating budget</p>
            </div>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Card className="p-4 bg-red-900/30 border border-red-700 text-red-200">
                {error}
              </Card>
            )}

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Trip Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-text-primary mb-2 font-semibold text-sm">Trip Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Japan Adventure"
                    className="w-full px-4 py-2 bg-sidebar border border-border rounded-lg text-text-primary placeholder:text-text-muted"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-text-primary mb-2 font-semibold text-sm">Destination</label>
                    <input
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleChange}
                      placeholder="e.g., Japan"
                      className="w-full px-4 py-2 bg-sidebar border border-border rounded-lg text-text-primary placeholder:text-text-muted"
                    />
                  </div>
                  <div>
                    <label className="block text-text-primary mb-2 font-semibold text-sm">Origin</label>
                    <input
                      type="text"
                      name="starting_location"
                      value={formData.starting_location}
                      onChange={handleChange}
                      placeholder="e.g., Bengaluru"
                      className="w-full px-4 py-2 bg-sidebar border border-border rounded-lg text-text-primary placeholder:text-text-muted"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-text-primary mb-2 font-semibold text-sm">Start Date</label>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-sidebar border border-border rounded-lg text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-text-primary mb-2 font-semibold text-sm">End Date</label>
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-sidebar border border-border rounded-lg text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-text-primary mb-2 font-semibold text-sm">Travelers</label>
                    <input
                      type="number"
                      name="num_travelers"
                      value={formData.num_travelers}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-4 py-2 bg-sidebar border border-border rounded-lg text-text-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-text-primary mb-2 font-semibold text-sm">Budget (INR)</label>
                    <input
                      type="number"
                      name="total_budget"
                      value={formData.total_budget}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-sidebar border border-border rounded-lg text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-text-primary mb-2 font-semibold text-sm">Travel Style</label>
                    <select
                      name="travel_style"
                      value={formData.travel_style}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-sidebar border border-border rounded-lg text-text-primary"
                    >
                      <option value="Budget">Budget</option>
                      <option value="Comfort">Comfort</option>
                      <option value="Luxury">Luxury</option>
                      <option value="Adventure">Adventure</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Preferences</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-text-primary mb-2 font-semibold text-sm">Hotel Preference</label>
                  <select
                    name="hotel_preference"
                    value={formData.hotel_preference}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-sidebar border border-border rounded-lg text-text-primary"
                  >
                    <option value="Budget">Budget</option>
                    <option value="Comfort">Comfort</option>
                    <option value="Luxury">Luxury</option>
                  </select>
                </div>

                <div>
                  <label className="block text-text-primary mb-2 font-semibold text-sm">Transportation</label>
                  <select
                    name="transportation_preference"
                    value={formData.transportation_preference}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-sidebar border border-border rounded-lg text-text-primary"
                  >
                    <option value="Flight">Flight</option>
                    <option value="Train">Train</option>
                    <option value="Bus">Bus</option>
                    <option value="Car">Car</option>
                  </select>
                </div>

                <div>
                  <label className="block text-text-primary mb-3 font-semibold text-sm">Interests</label>
                  <div className="grid grid-cols-2 gap-3">
                    {INTERESTS.map(interest => (
                      <label key={interest} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.interests.includes(interest)}
                          onChange={() => toggleInterest(interest)}
                          className="w-4 h-4 text-cyan rounded"
                        />
                        <span className="text-text-primary">{interest}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex gap-4">
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                {loading ? 'Creating Trip...' : '✨ Generate My Trip'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
