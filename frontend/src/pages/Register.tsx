import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { Mail, Lock, User, Plane, ArrowRight } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuthStore()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await register(email, username, password, fullName)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Plane className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold text-text-primary">TripGenie</h1>
          </div>
          <p className="text-text-secondary">AI-Powered Travel Planning</p>
        </div>

        <Card>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-2">Create Account</h2>
            <p className="text-text-secondary text-sm">Join TripGenie and start planning amazing trips</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-danger/20 border border-danger/30 text-danger rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-text-primary font-semibold mb-2 text-sm">Full Name</label>
              <div className="flex items-center gap-3 bg-sidebar border border-border rounded-lg px-4 py-3 focus-within:border-primary transition-colors">
                <User className="w-5 h-5 text-text-muted flex-shrink-0" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-text-primary placeholder:text-text-muted"
                  placeholder="Your name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-text-primary font-semibold mb-2 text-sm">Email Address</label>
              <div className="flex items-center gap-3 bg-sidebar border border-border rounded-lg px-4 py-3 focus-within:border-primary transition-colors">
                <Mail className="w-5 h-5 text-text-muted flex-shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-text-primary placeholder:text-text-muted"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-text-primary font-semibold mb-2 text-sm">Username</label>
              <div className="flex items-center gap-3 bg-sidebar border border-border rounded-lg px-4 py-3 focus-within:border-primary transition-colors">
                <User className="w-5 h-5 text-text-muted flex-shrink-0" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-text-primary placeholder:text-text-muted"
                  placeholder="username"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-text-primary font-semibold mb-2 text-sm">Password</label>
              <div className="flex items-center gap-3 bg-sidebar border border-border rounded-lg px-4 py-3 focus-within:border-primary transition-colors">
                <Lock className="w-5 h-5 text-text-muted flex-shrink-0" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-text-primary placeholder:text-text-muted"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Sign Up Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full justify-center gap-2 mt-6"
            >
              <span>{loading ? 'Creating Account...' : 'Sign Up'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-text-secondary text-sm">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-cyan hover:text-cyan/80 font-semibold transition-colors"
              >
                Sign in here
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
