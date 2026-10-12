import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, Utensils, Home, Zap } from 'lucide-react'
import { apiClient } from '../services/api'

interface Preferences {
  id?: number
  user_id?: number
  favorite_activities: string[]
  food_preferences: string[]
  hotel_preference?: string
  transportation_preference?: string
  typical_budget_range?: string
  preferred_activity_times?: Record<string, string>
  created_at?: string
}

export default function GroupPreferences() {
  const navigate = useNavigate()
  const [preferences, setPreferences] = useState<Preferences>({
    favorite_activities: [],
    food_preferences: [],
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const activityOptions = ['Museums', 'Hiking', 'Beaches', 'Shopping', 'Nightlife', 'Food Tours', 'Adventure Sports', 'Cultural Sites']
  const foodOptions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Non-Vegetarian', 'Seafood', 'Street Food', 'Fine Dining']
  const hotelOptions = ['Budget', 'Comfort', 'Luxury', 'Eco-Lodge', 'Resort']
  const transportOptions = ['Flight', 'Train', 'Bus', 'Car', 'Eco-Friendly']

  useEffect(() => {
    loadPreferences()
  }, [])

  const loadPreferences = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getPreferences()
      setPreferences(response.data)
    } catch (err) {
      console.error('Failed to load preferences, using defaults')
    } finally {
      setLoading(false)
    }
  }

  const handleActivityToggle = (activity: string) => {
    setPreferences(prev => ({
      ...prev,
      favorite_activities: prev.favorite_activities.includes(activity)
        ? prev.favorite_activities.filter(a => a !== activity)
        : [...prev.favorite_activities, activity]
    }))
  }

  const handleFoodToggle = (food: string) => {
    setPreferences(prev => ({
      ...prev,
      food_preferences: prev.food_preferences.includes(food)
        ? prev.food_preferences.filter(f => f !== food)
        : [...prev.food_preferences, food]
    }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')
      await apiClient.updatePreferences(preferences)
      setSuccess('Preferences saved successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark p-8 flex items-center justify-center">
        <p className="text-text-secondary">Loading preferences...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-dark p-8">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center space-x-2 text-cyan hover:text-cyan/80 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Dashboard</span>
      </button>

      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Travel Preferences</h1>
        <p className="text-text-secondary mb-6">Customize your travel preferences for better trip planning</p>

        {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
        {success && <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">{success}</div>}

        <div className="space-y-6">
          {/* Favorite Activities */}
          <div className="bg-card rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Favorite Activities</span>
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {activityOptions.map(activity => (
                <label key={activity} className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.favorite_activities.includes(activity)}
                    onChange={() => handleActivityToggle(activity)}
                    className="w-4 h-4 text-cyan rounded"
                  />
                  <span className="text-text-primary">{activity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Food Preferences */}
          <div className="bg-card rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center space-x-2">
              <Utensils className="w-5 h-5" />
              <span>Food Preferences</span>
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {foodOptions.map(food => (
                <label key={food} className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.food_preferences.includes(food)}
                    onChange={() => handleFoodToggle(food)}
                    className="w-4 h-4 text-cyan rounded"
                  />
                  <span className="text-text-primary">{food}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Hotel Preference */}
          <div className="bg-card rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center space-x-2">
              <Home className="w-5 h-5" />
              <span>Hotel Preference</span>
            </h2>
            <select
              value={preferences.hotel_preference || ''}
              onChange={(e) => handleSelectChange('hotel_preference', e.target.value)}
              className="w-full px-4 py-2 bg-sidebar border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select preference</option>
              {hotelOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Transportation Preference */}
          <div className="bg-card rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center space-x-2">
              <Heart className="w-5 h-5" />
              <span>Transportation Preference</span>
            </h2>
            <select
              value={preferences.transportation_preference || ''}
              onChange={(e) => handleSelectChange('transportation_preference', e.target.value)}
              className="w-full px-4 py-2 bg-sidebar border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select preference</option>
              {transportOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Budget Range */}
          <div className="bg-card rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">Typical Budget Range</h2>
            <select
              value={preferences.typical_budget_range || ''}
              onChange={(e) => handleSelectChange('typical_budget_range', e.target.value)}
              className="w-full px-4 py-2 bg-sidebar border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select range</option>
              <option value="Low">Low (Budget Travel)</option>
              <option value="Medium">Medium (Mid-Range)</option>
              <option value="High">High (Luxury Travel)</option>
            </select>
          </div>

          {/* Save Button */}
          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-primary/80 transition disabled:opacity-50 font-semibold"
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
            <button
              onClick={() => loadPreferences()}
              className="flex-1 bg-sidebar text-slate-800 py-3 rounded-lg hover:bg-slate-300 transition font-semibold"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
