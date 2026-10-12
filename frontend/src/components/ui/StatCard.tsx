import React from 'react'
import { Card } from './Card'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  trend?: {
    direction: 'up' | 'down'
    percentage: number
    period: string
  }
  color?: 'blue' | 'cyan' | 'purple' | 'orange'
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  trend,
  color = 'blue'
}) => {
  const colorClasses = {
    blue: 'bg-primary/20 text-primary',
    cyan: 'bg-cyan/20 text-cyan',
    purple: 'bg-purple-500/20 text-purple-400',
    orange: 'bg-orange-500/20 text-orange-400',
  }

  return (
    <Card hover>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-text-secondary text-sm mb-2">{label}</p>
          <p className="text-3xl font-bold text-text-primary">{value}</p>
          {trend && (
            <div className="mt-3 flex items-center gap-1">
              <span className={trend.direction === 'up' ? 'text-success' : 'text-danger'}>
                {trend.direction === 'up' ? '↑' : '↓'} {trend.percentage}%
              </span>
              <span className="text-text-muted text-xs">{trend.period}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <div className="text-2xl">{icon}</div>
        </div>
      </div>
    </Card>
  )
}
