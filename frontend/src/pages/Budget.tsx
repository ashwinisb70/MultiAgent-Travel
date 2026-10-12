import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, DollarSign, TrendingDown, TrendingUp, PieChart } from 'lucide-react'
import { apiClient } from '../services/api'
import { BudgetSummary, Trip } from '../types'
import { Card, CardHeader } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'

export default function Budget() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [budget, setBudget] = useState<BudgetSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadBudget()
  }, [id])

  const loadBudget = async () => {
    try {
      setLoading(true)
      const tripResponse = await apiClient.getTrip(parseInt(id!))
      setTrip(tripResponse.data)

      const budgetResponse = await apiClient.getBudget(parseInt(id!))
      setBudget(budgetResponse.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load budget')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-8 flex items-center justify-center">
        <p className="text-slate-600">Loading budget...</p>
      </div>
    )
  }

  if (error || !budget) {
    return (
      <div className="min-h-screen bg-slate-100 p-8">
        <button
          onClick={() => navigate(`/trip/${id}`)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Trip</span>
        </button>
        <div className="p-6 bg-red-100 text-red-700 rounded-lg">
          {error || 'Budget information not available'}
        </div>
      </div>
    )
  }

  const budgetCategories = Object.entries(budget.breakdown).map(([category, amount]) => ({
    name: category,
    amount,
    percentage: (amount / budget.total_budget) * 100
  })).sort((a, b) => b.amount - a.amount)

  const getStatusColor = (used: number, total: number) => {
    const percentage = (used / total) * 100
    if (percentage <= 75) return 'text-green-600'
    if (percentage <= 90) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-brand-dark p-8">
      <button
        onClick={() => navigate(`/trip/${id}`)}
        className="flex items-center gap-2 text-cyan hover:text-cyan/80 mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Trip</span>
      </button>

      <div className="max-w-5xl">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-text-primary mb-2">Budget: {trip?.title}</h1>
          <p className="text-text-secondary">{trip?.destination} • {trip?.num_travelers} travelers</p>
        </div>

        {/* Summary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <StatCard
            icon={<DollarSign className="w-6 h-6" />}
            label="Total Budget"
            value={`${budget.currency} ${(budget.total_budget / 100000).toFixed(1)}L`}
            color="blue"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Estimated Cost"
            value={`${budget.currency} ${(budget.estimated_cost / 100000).toFixed(1)}L`}
            color="orange"
          />
          <StatCard
            icon={<TrendingDown className="w-6 h-6" />}
            label="Remaining"
            value={`${budget.currency} ${(budget.remaining_budget / 100000).toFixed(1)}L`}
            color="cyan"
          />
          <StatCard
            icon={<DollarSign className="w-6 h-6" />}
            label="Per Traveler"
            value={`${budget.currency} ${(budget.cost_per_traveler / 1000).toFixed(0)}K`}
            color="purple"
          />
        </div>

        {/* Budget Utilization */}
        <Card className="mb-8">
          <CardHeader title="Budget Utilization" />
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="bg-sidebar rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 bg-gradient-primary rounded-full transition-all"
                  style={{ width: `${Math.min(budget.utilization_percentage, 100)}%` }}
                />
              </div>
            </div>
            <span className="text-2xl font-bold text-text-primary whitespace-nowrap">
              {budget.utilization_percentage.toFixed(1)}%
            </span>
          </div>
          <p className="text-text-secondary text-sm mt-4">
            {budget.estimated_cost > budget.total_budget
              ? `⚠️ Budget exceeded by ${budget.currency} ${(budget.estimated_cost - budget.total_budget).toLocaleString()}`
              : `✓ ${budget.currency} ${budget.remaining_budget.toLocaleString()} remaining`
            }
          </p>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader title="Budget Breakdown by Category" />
          <div className="space-y-4">
            {budgetCategories.map(cat => (
              <div key={cat.name}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-text-primary font-semibold capitalize">{cat.name}</span>
                  <div className="text-right">
                    <p className="text-text-primary font-semibold">{budget.currency} {cat.amount.toLocaleString()}</p>
                    <p className="text-text-muted text-xs">{cat.percentage.toFixed(1)}%</p>
                  </div>
                </div>
                <div className="bg-sidebar rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-primary h-2 rounded-full transition-all"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
