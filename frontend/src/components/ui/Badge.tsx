import React from 'react'

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'secondary'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'secondary',
  className = ''
}) => {
  const variants = {
    success: 'bg-success/20 text-success border border-success/30',
    warning: 'bg-warning/20 text-warning border border-warning/30',
    danger: 'bg-danger/20 text-danger border border-danger/30',
    info: 'bg-primary/20 text-cyan border border-primary/30',
    secondary: 'bg-border/20 text-text-secondary border border-border',
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
