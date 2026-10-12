import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from './store/auth'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Trips from './pages/Trips'
import CreateTrip from './pages/CreateTrip'
import TripDetail from './pages/TripDetail'
import TripMap from './pages/TripMap'
import Budget from './pages/Budget'
import AgentProcessing from './pages/AgentProcessing'
import WhatIf from './pages/WhatIf'
import Replanning from './pages/Replanning'
import GroupPreferences from './pages/GroupPreferences'
import Readiness from './pages/Readiness'
import Decisions from './pages/Decisions'
import Itinerary from './pages/Itinerary'
import Destinations from './pages/Destinations'
import Profile from './pages/Profile'
import Bookings from './pages/Bookings'
import AIPlanner from './pages/AIPlanner'
import Documents from './pages/Documents'

// Layouts
import AppLayout from './layouts/AppLayout'

// Protected Route Check Component
const ProtectedCheck = () => {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />

        {/* Protected Routes */}
        <Route element={<ProtectedCheck />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/create-trip" element={<CreateTrip />} />
            <Route path="/trip/:id" element={<TripDetail />} />
            <Route path="/trip/:id/map" element={<TripMap />} />
            <Route path="/trip/:id/budget" element={<Budget />} />
            <Route path="/trip/:id/bookings" element={<Bookings />} />
            <Route path="/trip/:id/documents" element={<Documents />} />
            <Route path="/trip/:id/processing" element={<AgentProcessing />} />
            <Route path="/trip/:id/what-if" element={<WhatIf />} />
            <Route path="/trip/:id/replan" element={<Replanning />} />
            <Route path="/trip/:id/preferences" element={<GroupPreferences />} />
            <Route path="/trip/:id/readiness" element={<Readiness />} />
            <Route path="/trip/:id/decisions" element={<Decisions />} />

            {/* Additional pages */}
            <Route path="/ai-planner" element={<AIPlanner />} />
            <Route path="/itinerary" element={<Itinerary />} />
            <Route path="/destinations" element={<Destinations />} />
            <Route path="/preferences" element={<GroupPreferences />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Fallback - catch all unmatched routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}
