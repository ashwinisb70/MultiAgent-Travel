import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import {
  Plus, MapPin, Calendar, Users, Plane, DollarSign,
  Search, ChevronRight, Map as MapIcon, MessageCircle
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { apiClient } from '../services/api'
import { getDestinationImage } from '../utils/imageUtils'
import { Card, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { StatCard } from '../components/ui/StatCard'
import { Badge } from '../components/ui/Badge'
import { Trip } from '../types'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [trips, setTrips] = useState<Trip[]>([])
  const [destination, setDestination] = useState('')

  useEffect(() => {
    loadTrips()
  }, [])

  const loadTrips = async () => {
    try {
      const response = await apiClient.getTrips(0, 50)
      setTrips(response.data)
    } catch (err) {
      console.error('Failed to load trips', err)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getDurationDays = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  }

  const upcomingTrips = trips.slice(0, 3)
  const totalBudget = trips.reduce((sum, t) => sum + t.total_budget, 0)

  const chartData = [
    { name: 'Jan', trips: trips.filter(t => new Date(t.start_date).getMonth() === 0).length },
    { name: 'Feb', trips: trips.filter(t => new Date(t.start_date).getMonth() === 1).length },
    { name: 'Mar', trips: trips.filter(t => new Date(t.start_date).getMonth() === 2).length },
    { name: 'Apr', trips: trips.filter(t => new Date(t.start_date).getMonth() === 3).length },
    { name: 'May', trips: trips.filter(t => new Date(t.start_date).getMonth() === 4).length },
    { name: 'Jun', trips: trips.filter(t => new Date(t.start_date).getMonth() === 5).length },
  ]

  const colors = ['#3564FF', '#22D3EE', '#7C3AED', '#F97316', '#10B981']

  const recommendations = [
    { id: 1, name: 'Singapore Getaway', duration: '4 Days', rating: '4.8', budget: '₹45,000' },
    { id: 2, name: 'Maldives Luxury', duration: '5 Days', rating: '4.9', budget: '₹80,000' },
    { id: 3, name: 'Tokyo Discovery', duration: '7 Days', rating: '4.7', budget: '₹85,000' }
  ]

  return (
    <div className="min-h-screen bg-brand-dark p-8">
      {/* Hero Section */}
      <div className="mb-12 rounded-xl overflow-hidden relative h-80 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center shadow-card">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600')] bg-cover bg-center opacity-40"></div>
        <div className="relative z-10 px-12 w-full">
          <h1 className="text-5xl font-bold text-white mb-2">Good morning, {user?.username || 'Traveler'}! ✈️</h1>
          <p className="text-xl text-blue-100 mb-8">Where would you like to go next?</p>

          <div className="flex gap-4 max-w-2xl">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Search for destinations..."
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-lg pl-12 pr-4 py-3 text-white placeholder:text-white/60 focus:outline-none focus:border-white/40"
              />
            </div>
            <Button variant="primary" onClick={() => navigate('/trips')}>
              Explore
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <StatCard
          icon={<Plane className="w-6 h-6" />}
          label="Total Trips"
          value={trips.length}
          trend={{ direction: 'up', percentage: 2, period: 'this month' }}
          color="blue"
        />
        <StatCard
          icon={<MapPin className="w-6 h-6" />}
          label="Destinations Visited"
          value={new Set(trips.map(t => t.destination)).size}
          color="cyan"
        />
        <StatCard
          icon={<DollarSign className="w-6 h-6" />}
          label="Total Budget Spent"
          value={`₹${(totalBudget / 100000).toFixed(1)}L`}
          trend={{ direction: 'down', percentage: 12, period: 'vs last month' }}
          color="purple"
        />
        <StatCard
          icon={<Calendar className="w-6 h-6" />}
          label="Upcoming Trips"
          value={upcomingTrips.length}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="col-span-2 space-y-8">
          {/* Upcoming Trips */}
          <Card>
            <CardHeader
              title="Your Upcoming Trips"
              action={<button className="text-cyan text-sm hover:opacity-80">View All</button>}
            />
            <div className="space-y-4">
              {upcomingTrips.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-text-secondary mb-4">No upcoming trips</p>
                  <Button variant="primary" onClick={() => navigate('/create-trip')}>
                    <Plus className="w-4 h-4" /> Plan Your First Trip
                  </Button>
                </div>
              ) : (
                upcomingTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="bg-sidebar border border-border rounded-lg p-4 hover:border-cyan/50 transition-all cursor-pointer"
                    onClick={() => navigate(`/trip/${trip.id}`)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-24 h-24 rounded-lg flex-shrink-0 overflow-hidden bg-sidebar">
                        <img
                          src={getDestinationImage(trip.destination)}
                          alt={trip.destination}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-text-primary font-semibold mb-1">{trip.title}</h4>
                        <p className="text-text-secondary text-sm mb-2">
                          {trip.starting_location} → {trip.destination}
                        </p>
                        <div className="flex items-center gap-4 text-text-muted text-sm">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {trip.num_travelers} traveler{trip.num_travelers !== 1 ? 's' : ''}
                          </span>
                          <span>{getDurationDays(trip.start_date, trip.end_date)} days</span>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <Badge variant="info">{trip.status}</Badge>
                          <span className="text-cyan text-sm">
                            Readiness: {Math.round(trip.readiness_score)}%
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-text-muted" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Trip Analytics */}
          <Card>
            <CardHeader title="Trip Analytics" action={<span className="text-text-secondary text-sm">Last 6 months</span>} />
            <div className="flex gap-8">
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1D3B67" />
                    <XAxis dataKey="name" stroke="#9BB1D1" />
                    <YAxis stroke="#9BB1D1" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0D2243', border: '1px solid #1D3B67' }}
                      labelStyle={{ color: '#F4F7FF' }}
                    />
                    <Bar dataKey="trips" fill="#3564FF" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="w-40">
                <h4 className="text-text-primary font-semibold mb-4 text-center text-sm">Trip Types</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={trips.reduce((acc: any[], t) => {
                        const existing = acc.find(x => x.name === t.travel_style)
                        if (existing) existing.value += 1
                        else acc.push({ name: t.travel_style, value: 1 })
                        return acc
                      }, [])}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {trips.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0D2243', border: '1px solid #1D3B67', color: '#F4F7FF' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>

          {/* Interactive Map */}
          <Card>
            <CardHeader title="Interactive Travel Map" />
            <div className="bg-sidebar rounded-lg h-64 flex items-center justify-center">
              <div className="text-center">
                <MapIcon className="w-12 h-12 text-text-muted mx-auto mb-3" />
                <p className="text-text-secondary">Interactive map integration coming soon</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* AI Assistant */}
          <Card gradient>
            <div className="text-center">
              <div className="text-4xl mb-3">🤖</div>
              <h3 className="text-text-primary font-semibold mb-2">AI Travel Assistant</h3>
              <p className="text-text-secondary text-sm mb-1">Online</p>
              <p className="text-text-secondary text-xs mb-4">Hi! I'm your AI travel assistant. I can help you plan trips, find deals, create itineraries, and answer travel questions.</p>

              <Button variant="primary" size="sm" className="w-full justify-center gap-2" onClick={() => navigate('/ai-planner')}>
                <Plane className="w-4 h-4" />
                ✨ Create Trip with AI
              </Button>
            </div>
          </Card>

          {/* AI Recommended Trips */}
          <Card>
            <CardHeader
              title="AI Recommended Trips"
              action={<button className="text-cyan text-sm hover:opacity-80">View All</button>}
            />
            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-sidebar rounded-lg p-3 hover:bg-card transition-colors cursor-pointer"
                >
                  <h4 className="text-text-primary text-sm font-semibold mb-1">{rec.name}</h4>
                  <div className="flex justify-between text-xs text-text-secondary">
                    <span>{rec.duration}</span>
                    <span>⭐ {rec.rating}</span>
                    <span className="text-cyan font-semibold">{rec.budget}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader title="Recent Activity" action={<button className="text-cyan text-sm hover:opacity-80">View All</button>} />
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 text-xs">✓</div>
                <div>
                  <p className="text-text-primary text-sm font-medium">Trip created</p>
                  <p className="text-text-secondary text-xs">Goa Beach Getaway</p>
                  <p className="text-text-muted text-xs mt-1">2 hours ago</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-xs">📝</div>
                <div>
                  <p className="text-text-primary text-sm font-medium">Itinerary updated</p>
                  <p className="text-text-secondary text-xs">Switzerland Adventure</p>
                  <p className="text-text-muted text-xs mt-1">5 hours ago</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan/20 flex items-center justify-center flex-shrink-0 text-xs">👤</div>
                <div>
                  <p className="text-text-primary text-sm font-medium">Profile updated</p>
                  <p className="text-text-secondary text-xs">Your profile information</p>
                  <p className="text-text-muted text-xs mt-1">1 day ago</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0 text-xs">⭐</div>
                <div>
                  <p className="text-text-primary text-sm font-medium">New recommendation</p>
                  <p className="text-text-secondary text-xs">Bali Explorer</p>
                  <p className="text-text-muted text-xs mt-1">1 day ago</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
