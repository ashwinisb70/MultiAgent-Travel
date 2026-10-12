import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, DollarSign } from 'lucide-react'
import { apiClient } from '../services/api'
import { Trip } from '../types'

export default function WhatIf() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [simulationData, setSimulationData] = useState({
    budget: '',
    num_travelers: '',
    trip_duration: '',
    hotel_quality: '',
    activity_intensity: ''
  })

  useEffect(() => {
    loadTrip()
  }, [id])

  const loadTrip = async () => {
    try {
      const response = await apiClient.getTrip(parseInt(id!))
      setTrip(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load trip')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setSimulationData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const simulation = {
        budget: simulationData.budget ? parseFloat(simulationData.budget) : undefined,
        num_travelers: simulationData.num_travelers ? parseInt(simulationData.num_travelers) : undefined,
        trip_duration: simulationData.trip_duration ? parseInt(simulationData.trip_duration) : undefined,
        hotel_quality: simulationData.hotel_quality || undefined,
        activity_intensity: simulationData.activity_intensity || undefined
      }

      const response = await apiClient.simulateTrip(parseInt(id!), simulation)
      alert('Simulation completed! Cost difference: ' + response.data.cost_difference)
    } catch (err: any) {
      alert('Simulation failed: ' + (err.response?.data?.detail || 'Unknown error'))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark p-8 flex items-center justify-center">
        <p className="text-text-secondary">Loading...</p>
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

      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-2">What-If Analysis</h1>
        <p className="text-text-secondary mb-6">{trip?.title}</p>

        {error && <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

        <div className="bg-card rounded-lg shadow-md p-8">
          <p className="text-text-secondary mb-6">
            Simulate different scenarios to see how changes impact your trip budget and itinerary.
          </p>

          <form onSubmit={handleSimulate} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-text-primary font-semibold mb-2 flex items-center space-x-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Budget</span>
                </label>
                <input
                  type="number"
                  name="budget"
                  value={simulationData.budget}
                  onChange={handleChange}
                  placeholder={`Current: ${trip?.total_budget}`}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-text-primary font-semibold mb-2">Number of Travelers</label>
                <input
                  type="number"
                  name="num_travelers"
                  value={simulationData.num_travelers}
                  onChange={handleChange}
                  placeholder={`Current: ${trip?.num_travelers}`}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-text-primary font-semibold mb-2">Hotel Quality</label>
              <select
                name="hotel_quality"
                value={simulationData.hotel_quality}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Keep current</option>
                <option value="budget">Budget</option>
                <option value="comfort">Comfort</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>

            <div>
              <label className="block text-text-primary font-semibold mb-2 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Activity Intensity</span>
              </label>
              <select
                name="activity_intensity"
                value={simulationData.activity_intensity}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Keep current</option>
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="intense">Intense</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Run Simulation
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
