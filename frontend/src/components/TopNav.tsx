import { useState } from 'react'
import { useAuthStore } from '../store/auth'
import { Search, Bell, Globe, ChevronDown, LogOut } from 'lucide-react'
import { Button } from './ui/Button'

export default function TopNav() {
  const { user, logout } = useAuthStore()
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <div className="h-16 bg-card border-b border-border flex items-center justify-between px-8 fixed top-0 right-0 left-64 z-40">
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search destinations, trips or activities..."
            className="w-full bg-sidebar border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 ml-8">
        {/* Language Selector */}
        <button className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors">
          <Globe className="w-4 h-4" />
          <span className="text-sm">English</span>
          <ChevronDown className="w-3 h-3" />
        </button>

        {/* Notification Bell */}
        <button className="relative text-text-secondary hover:text-text-primary transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-danger rounded-full"></span>
        </button>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-sidebar transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-text-primary">{user?.username || 'User'}</p>
              <p className="text-xs text-text-secondary">Traveler</p>
            </div>
            <ChevronDown className="w-4 h-4 text-text-secondary" />
          </button>

          {/* Dropdown Menu */}
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-card overflow-hidden z-50">
              <button
                onClick={() => {
                  logout()
                  setProfileOpen(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-text-secondary hover:text-text-primary hover:bg-sidebar transition-colors text-left text-sm border-t border-border"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
