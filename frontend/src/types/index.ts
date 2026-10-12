export interface Trip {
  id: number
  user_id: number
  title: string
  description?: string
  starting_location: string
  destination: string
  start_date: string
  end_date: string
  num_travelers: number
  total_budget: number
  currency: string
  travel_style?: string
  status: string
  readiness_score: number
  is_demo: boolean
  generated_at?: string
  created_at: string
  updated_at: string
  itinerary_days?: ItineraryDay[]
  budget_items?: BudgetItem[]
  travelers?: Traveler[]
  risk_items?: RiskItem[]
}

export interface Traveler {
  id: number
  trip_id: number
  name: string
  age?: number
  interests: string[]
  budget_preference?: string
  activity_intensity?: string
  dietary_restrictions: string[]
  accessibility_needs?: string
}

export interface Activity {
  id: number
  itinerary_day_id: number
  name: string
  category: string
  time_start?: string
  time_end?: string
  duration_minutes?: number
  location: string
  latitude?: number
  longitude?: number
  estimated_cost?: number
  currency: string
  recommendation_reason?: string
  booking_url?: string
  priority: number
}

export interface ItineraryDay {
  id: number
  trip_id: number
  day_number: number
  date: string
  theme?: string
  activities: Activity[]
}

export interface BudgetItem {
  id: number
  trip_id: number
  category: string
  description?: string
  estimated_cost: number
  actual_cost?: number
  currency: string
  per_person: boolean
  quantity: number
}

export interface BudgetSummary {
  total_budget: number
  estimated_cost: number
  remaining_budget: number
  utilization_percentage: number
  cost_per_traveler: number
  breakdown: Record<string, number>
  currency: string
}

export interface RiskItem {
  id: number
  trip_id: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: string
  description: string
  affected_date?: string
  affected_activity?: string
  mitigation_suggestion?: string
  is_resolved: boolean
}

export interface AgentResult {
  id: number
  run_id: number
  agent_name: string
  status: string
  input_data?: Record<string, any>
  output_data?: Record<string, any>
  error_message?: string
  started_at?: string
  completed_at?: string
}

export interface AgentRun {
  id: number
  trip_id: number
  run_type: string
  status: string
  started_at?: string
  completed_at?: string
  created_at: string
  agent_results: AgentResult[]
}

export interface Decision {
  decision: string
  reason: string
  alternatives_considered: string[]
  impact?: string
}

export interface PreferenceAnalysis {
  travelers: number
  interests: Record<string, number>
  budget_preferences: Record<string, number>
  activity_preferences: Record<string, number>
}
