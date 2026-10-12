import React from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: React.ReactNode
  loading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    icon,
    loading,
    children,
    disabled,
    className = '',
    ...props
  }, ref) => {
    const variantClasses = {
      primary: 'bg-gradient-primary text-white hover:opacity-90',
      secondary: 'bg-card border border-border text-text-primary hover:border-cyan/50',
      ghost: 'text-text-secondary hover:text-text-primary',
      danger: 'bg-danger/20 text-danger border border-danger/30 hover:bg-danger/30',
    }

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-6 py-3 text-lg',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center gap-2 rounded-lg font-medium
          transition-all duration-250 disabled:opacity-50 disabled:cursor-not-allowed
          ${variantClasses[variant]} ${sizeClasses[size]} ${className}
        `}
        {...props}
      >
        {icon && !loading && <span>{icon}</span>}
        {loading && <span className="animate-spin">⏳</span>}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
