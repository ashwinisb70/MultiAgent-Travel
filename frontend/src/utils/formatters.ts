/**
 * Format currency with Indian Rupee
 */
export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  if (currency === 'INR') {
    return `₹${amount.toLocaleString('en-IN')}`
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount)
}

/**
 * Format date to readable string
 */
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Format time to HH:MM format
 */
export const formatTime = (timeString: string): string => {
  if (!timeString) return '--:--'
  return timeString.slice(0, 5)
}

/**
 * Get days between two dates
 */
export const getDaysBetween = (startDate: string | Date, endDate: string | Date): number => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Get status badge color
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'generated':
      return 'bg-green-100 text-green-800'
    case 'draft':
      return 'bg-yellow-100 text-yellow-800'
    case 'confirmed':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

/**
 * Get severity color for risks
 */
export const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-800'
    case 'high':
      return 'bg-orange-100 text-orange-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'low':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

/**
 * Truncate text to specified length
 */
export const truncateText = (text: string, length: number = 50): string => {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

/**
 * Get category icon name
 */
export const getCategoryIcon = (category: string): string => {
  const categoryMap: Record<string, string> = {
    'Flights': '✈️',
    'Accommodation': '🏨',
    'Food': '🍽️',
    'Activities': '🎭',
    'Transport': '🚗',
    'Transfer': '🚕',
    'Miscellaneous': '💰',
    'Attraction': '🏛️',
    'Museum': '🎨',
    'Restaurant': '🍴',
    'Shopping': '🛍️',
    'Tour': '🗺️'
  }
  return categoryMap[category] || '📍'
}

/**
 * Calculate percentage
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

/**
 * Get readiness color based on score
 */
export const getReadinessColor = (score: number): string => {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  if (score >= 40) return 'text-orange-600'
  return 'text-red-600'
}

/**
 * Format distance in km
 */
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`
  }
  return `${distanceKm.toFixed(1)}km`
}

/**
 * Format duration in minutes to human readable
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) {
    return `${hours}h`
  }
  return `${hours}h ${mins}m`
}
