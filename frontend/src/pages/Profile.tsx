import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/auth'
import { User, Mail, LogOut, Save } from 'lucide-react'
import { apiClient } from '../services/api'
import { Card, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [preferences, setPreferences] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadPreferences()
  }, [])

  const loadPreferences = async () => {
    try {
      const response = await apiClient.getPreferences()
      setPreferences(response.data)
    } catch (err) {
      console.error('Failed to load preferences', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleSavePreferences = async () => {
    try {
      setSaving(true)
      setError('')
      await apiClient.updatePreferences(preferences)
      alert('Preferences saved successfully!')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark p-8 flex items-center justify-center">
        <p className="text-text-secondary">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-dark p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-text-primary mb-2">Your Profile</h1>
          <p className="text-text-secondary">Manage your account and travel preferences</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-danger/20 border border-danger/30 text-danger rounded-lg">
            {error}
          </div>
        )}

        {/* User Info Card */}
        <Card className="mb-8">
          <CardHeader
            title="Account Information"
            action={<User className="w-5 h-5 text-primary" />}
          />
          <div className="space-y-4">
            <div className="bg-sidebar rounded-lg p-4">
              <p className="text-text-muted text-sm mb-1">Username</p>
              <p className="text-text-primary font-semibold text-lg">{user?.username || 'N/A'}</p>
            </div>
            <div className="bg-sidebar rounded-lg p-4">
              <p className="text-text-muted text-sm mb-1">Email Address</p>
              <p className="text-text-primary font-semibold text-lg">{user?.email || 'N/A'}</p>
            </div>
            {user?.full_name && (
              <div className="bg-sidebar rounded-lg p-4">
                <p className="text-text-muted text-sm mb-1">Full Name</p>
                <p className="text-text-primary font-semibold text-lg">{user.full_name}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Preferences Card */}
        {preferences && (
          <Card className="mb-8">
            <CardHeader title="Travel Preferences" />
            <div className="space-y-4">
              {preferences.favorite_activities && preferences.favorite_activities.length > 0 && (
                <div>
                  <p className="text-text-primary font-semibold mb-2 text-sm">Favorite Activities</p>
                  <div className="flex flex-wrap gap-2">
                    {preferences.favorite_activities.map((activity: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-primary/20 text-cyan rounded-full text-xs">
                        {activity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {preferences.food_preferences && preferences.food_preferences.length > 0 && (
                <div className="border-t border-border pt-4">
                  <p className="text-text-primary font-semibold mb-2 text-sm">Food Preferences</p>
                  <div className="flex flex-wrap gap-2">
                    {preferences.food_preferences.map((food: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-primary/20 text-cyan rounded-full text-xs">
                        {food}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {preferences.hotel_preference && (
                <div className="border-t border-border pt-4">
                  <p className="text-text-primary font-semibold mb-2 text-sm">Hotel Preference</p>
                  <p className="text-text-secondary">{preferences.hotel_preference}</p>
                </div>
              )}

              {preferences.transportation_preference && (
                <div className="border-t border-border pt-4">
                  <p className="text-text-primary font-semibold mb-2 text-sm">Transportation Preference</p>
                  <p className="text-text-secondary">{preferences.transportation_preference}</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            variant="primary"
            className="flex-1 justify-center gap-2"
            loading={saving}
            onClick={handleSavePreferences}
          >
            <Save className="w-4 h-4" />
            Save Preferences
          </Button>
          <Button
            variant="danger"
            className="flex-1 justify-center gap-2"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}
