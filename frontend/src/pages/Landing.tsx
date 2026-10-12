import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Plane, Brain, MapPin, Wallet, Users, TrendingUp } from 'lucide-react'

export default function Landing() {
  const navigate = useNavigate()

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Planning',
      description: 'Multi-agent AI system that plans every detail of your trip'
    },
    {
      icon: Wallet,
      title: 'Smart Budgeting',
      description: 'Intelligent budget allocation across flights, hotels, and activities'
    },
    {
      icon: MapPin,
      title: 'Interactive Maps',
      description: 'View all your destinations and activities on interactive maps'
    },
    {
      icon: Users,
      title: 'Group Travel',
      description: 'Manage preferences for multiple travelers in one trip'
    },
    {
      icon: TrendingUp,
      title: 'What-If Analysis',
      description: 'Simulate changes and see impact on your trip'
    },
    {
      icon: Plane,
      title: 'Dynamic Replanning',
      description: 'Automatically replan based on weather and changes'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-dark to-sidebar">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 bg-brand-dark bg-opacity-80 backdrop-blur">
        <div className="flex items-center space-x-2">
          <Plane className="w-8 h-8 text-primary" />
          <span className="text-2xl font-bold text-text-primary">TripGenie</span>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 text-text-primary hover:bg-slate-700 rounded-lg transition"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-6 py-2 bg-blue-600 text-text-primary rounded-lg hover:bg-blue-700 transition"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
          <img
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=600&fit=crop"
            alt="Paris"
            className="w-full h-full object-cover opacity-20"
          />
        </div>

        <div className="relative z-10 text-center px-8 max-w-4xl">
          <h1 className="text-6xl font-bold text-text-primary mb-6">
            Your Dream Trip Planned by AI Agents
          </h1>
          <p className="text-xl text-text-secondary mb-8">
            Multi-agent AI creates personalized, stress-free itineraries tailored to your preferences, budget, and style
          </p>
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-4 bg-blue-600 text-text-primary text-lg font-semibold rounded-lg hover:bg-blue-700 transition shadow-lg"
          >
            Plan Your Next Trip
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-8 bg-slate-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-text-primary mb-16 text-center">
            Powerful Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <div
                  key={idx}
                  className="bg-slate-700 rounded-lg p-6 hover:bg-slate-600 transition"
                >
                  <Icon className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold text-text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-text-primary mb-6">
            Ready to Start Planning?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Create an account and let our AI agents plan your perfect trip
          </p>
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-4 bg-card text-blue-600 font-semibold rounded-lg hover:bg-slate-100 transition"
          >
            Get Started Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-dark text-slate-400 py-8 px-8 text-center">
        <p>© 2024 TripGenie. AI Travel Planning Made Simple.</p>
      </footer>
    </div>
  )
}
