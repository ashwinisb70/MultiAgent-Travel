import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  gradient?: boolean
  onClick?: () => void
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  gradient = false,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-card border border-border rounded-lg p-6 shadow-card transition-all duration-250 ${
        hover ? 'hover:shadow-card-hover hover:border-cyan/30 cursor-pointer' : ''
      } ${gradient ? 'bg-gradient-card' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

export const CardHeader: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode }> = ({
  title,
  subtitle,
  action
}) => (
  <div className="flex items-center justify-between mb-4">
    <div>
      <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
      {subtitle && <p className="text-sm text-text-secondary mt-1">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
)
