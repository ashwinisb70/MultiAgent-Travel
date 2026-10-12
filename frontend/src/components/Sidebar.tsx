import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { Button } from './ui/Button'
import {
  LayoutDashboard,
  Plane,
  Sparkles,
  Calendar,
  MapPin,
  Settings,
  User,
  LogOut,
  Ticket,
} from 'lucide-react'

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuthStore()

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Plane, label: 'Trips', path: '/trips' },
    { icon: Sparkles, label: 'AI Travel Planner', path: '/ai-planner' },
    { icon: Calendar, label: 'Itinerary', path: '/itinerary' },
    { icon: MapPin, label: 'Destinations', path: '/destinations' },
    { icon: Settings, label: 'Travel Preferences', path: '/preferences' },
    { icon: User, label: 'Profile', path: '/profile' },
  ]

  const isActive = (path: string) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="w-64 bg-sidebar border-r border-border min-h-screen flex flex-col fixed left-0 top-0">
      {/* Logo Section */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3 mb-2">
          <Plane className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-text-primary">TripGenie</h1>
        </div>
        <p className="text-text-secondary text-xs">AI Travel Planner</p>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-250 ${
                active
                  ? 'bg-gradient-primary text-white shadow-card'
                  : 'text-text-secondary hover:text-text-primary hover:bg-card'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* AI Assistant Promo Card */}
      <div className="p-4 border-t border-border">
        <div className="bg-gradient-card border border-primary/20 rounded-lg p-4 text-center">
          <div className="text-3xl mb-2">🤖</div>
          <h3 className="text-sm font-semibold text-text-primary mb-1">
            Let AI Plan Your Next Adventure
          </h3>
          <p className="text-xs text-text-secondary mb-3">
            Get personalized itineraries with AI
          </p>
          <Button
            size="sm"
            variant="primary"
            className="w-full"
            onClick={() => navigate('/ai-planner')}
          >
            Start Planning
          </Button>
        </div>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm">Logout</span>
        </Button>
      </div>
    </div>
  )
}
