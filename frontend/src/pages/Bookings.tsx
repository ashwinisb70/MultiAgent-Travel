import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plane, Hotel, Utensils, MapPin, Calendar, DollarSign, Plus, X, Search, AlertCircle, CheckCircle, ChevronLeft } from 'lucide-react'
import { apiClient } from '../services/api'
import { Card, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import type { Trip } from '../types'

interface Booking {
  id: number
  trip_id: number
  booking_type: string
  item_name: string
  estimated_cost: number
  status: string
  reference_number?: string
  confirmation_date?: string
  currency: string
  created_at: string
}

interface SearchResult {
  id: string
  name: string
  details: Record<string, any>
  price: number
  description?: string
  rating?: number
}

const BOOKING_TYPES = [
  { value: 'flight', label: '✈️ Flight', icon: Plane },
  { value: 'hotel', label: '🏨 Hotel', icon: Hotel },
  { value: 'train', label: '🚆 Train', icon: Plane },
  { value: 'bus', label: '🚌 Bus', icon: Plane },
  { value: 'cab', label: '🚕 Cab/Taxi', icon: Plane },
  { value: 'activity', label: '🎟️ Activity', icon: Plane },
  { value: 'restaurant', label: '🍽️ Restaurant', icon: Utensils },
]

// Demo data generators
const DEMO_FLIGHTS = (from: string, to: string, date: string, passengers: number, travelClass: string) => [
  {
    id: 'AI101',
    name: 'Air India AI 101',
    details: { airline: 'Air India', flightNumber: 'AI 101', from, to, departure: '08:00', arrival: '14:30', duration: '6h 30m', stops: 0, class: travelClass, seats: 45 },
    price: 4500 * passengers,
    description: 'Non-stop flight',
    rating: 4.5
  },
  {
    id: 'QR205',
    name: 'Qatar Airways QR 205',
    details: { airline: 'Qatar Airways', flightNumber: 'QR 205', from, to, departure: '14:00', arrival: '08:00 (+1)', duration: '14h 00m', stops: 1, class: travelClass, seats: 120 },
    price: 5200 * passengers,
    description: '1 stop in Doha',
    rating: 4.8
  },
  {
    id: 'SG108',
    name: 'Singapore Airlines SG 108',
    details: { airline: 'Singapore Airlines', flightNumber: 'SG 108', from, to, departure: '22:00', arrival: '09:30 (+1)', duration: '13h 30m', stops: 1, class: travelClass, seats: 89 },
    price: 5500 * passengers,
    description: '1 stop in Singapore',
    rating: 4.7
  },
  {
    id: 'AA505',
    name: 'AirAsia AA 505',
    details: { airline: 'AirAsia', flightNumber: 'AA 505', from, to, departure: '16:00', arrival: '22:30', duration: '8h 30m', stops: 1, class: travelClass, seats: 156 },
    price: 3200 * passengers,
    description: 'Budget option with 1 stop',
    rating: 4.0
  },
]

const DEMO_HOTELS = (destination: string, checkIn: string, checkOut: string, guests: number) => [
  {
    id: 'H001',
    name: `Luxury ${destination} Palace`,
    details: { destination, checkIn, checkOut, guests, roomType: 'Deluxe', amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant'] },
    price: 12000,
    description: '5-star luxury resort',
    rating: 4.9
  },
  {
    id: 'H002',
    name: `Comfort ${destination} Hotel`,
    details: { destination, checkIn, checkOut, guests, roomType: 'Standard', amenities: ['WiFi', 'AC', 'Breakfast', 'Gym'] },
    price: 6500,
    description: '4-star comfort',
    rating: 4.6
  },
  {
    id: 'H003',
    name: `Budget ${destination} Inn`,
    details: { destination, checkIn, checkOut, guests, roomType: 'Basic', amenities: ['WiFi', 'AC', 'Breakfast'] },
    price: 3500,
    description: '3-star budget',
    rating: 4.1
  },
  {
    id: 'H004',
    name: `${destination} Boutique Hotel`,
    details: { destination, checkIn, checkOut, guests, roomType: 'Suite', amenities: ['WiFi', 'Pool', 'Concierge', 'Restaurant', 'Spa'] },
    price: 9500,
    description: 'Boutique experience',
    rating: 4.8
  },
]

const DEMO_TRAINS = (from: string, to: string, date: string) => [
  {
    id: 'T001',
    name: 'Vande Bharat Express 20601',
    details: { trainNumber: '20601', from, to, departure: '06:30', arrival: '02:45 PM', duration: '8h 15m', class: 'AC Chair Car', seats: 450 },
    price: 1250,
    description: 'Premium semi-high speed',
    rating: 4.7
  },
  {
    id: 'T002',
    name: 'Express Train 12345',
    details: { trainNumber: '12345', from, to, departure: '08:00', arrival: '16:00', duration: '8h', class: 'AC First Class', seats: 150 },
    price: 3500,
    description: 'Comfortable express',
    rating: 4.4
  },
  {
    id: 'T003',
    name: 'Rajdhani Express 54321',
    details: { trainNumber: '54321', from, to, departure: '22:00', arrival: '07:00 (+1)', duration: '9h', class: 'AC Second Class', seats: 280 },
    price: 2200,
    description: 'Premium overnight',
    rating: 4.6
  },
]

const DEMO_BUSES = (from: string, to: string, date: string) => [
  {
    id: 'B001',
    name: 'Luxury Coach',
    details: { operator: 'Travels Co', from, to, departure: '06:00', arrival: '14:00', duration: '8h', type: 'AC Sleeper', seats: 35 },
    price: 1500,
    description: 'Premium sleeper bus',
    rating: 4.3
  },
  {
    id: 'B002',
    name: 'Express Bus',
    details: { operator: 'Fast Travels', from, to, departure: '15:00', arrival: '23:00', duration: '8h', type: 'AC Semi-Sleeper', seats: 48 },
    price: 900,
    description: 'Budget option',
    rating: 3.9
  },
  {
    id: 'B003',
    name: 'Deluxe Coach',
    details: { operator: 'Premier Travel', from, to, departure: '18:00', arrival: '02:00 (+1)', duration: '8h', type: 'Sleeper', seats: 32 },
    price: 1800,
    description: 'Maximum comfort',
    rating: 4.5
  },
]

const DEMO_ACTIVITIES = (destination: string) => [
  {
    id: 'ACT001',
    name: `${destination} City Tour`,
    details: { destination, date: 'Flexible', duration: '4 hours', category: 'Sightseeing' },
    price: 2500,
    description: 'Guided city tour with local guide',
    rating: 4.7
  },
  {
    id: 'ACT002',
    name: `${destination} Adventure Trail`,
    details: { destination, date: 'Flexible', duration: '6 hours', category: 'Adventure' },
    price: 4500,
    description: 'Hiking and nature experience',
    rating: 4.8
  },
  {
    id: 'ACT003',
    name: `Local ${destination} Cooking Class`,
    details: { destination, date: 'Flexible', duration: '3 hours', category: 'Cultural' },
    price: 3500,
    description: 'Learn authentic local cuisine',
    rating: 4.9
  },
]

const DEMO_RESTAURANTS = (destination: string) => [
  {
    id: 'R001',
    name: `The ${destination} Table`,
    details: { destination, cuisine: 'Local', rating: 4.8, priceRange: '$$$' },
    price: 1800,
    description: 'Michelin recommended local',
    rating: 4.8
  },
  {
    id: 'R002',
    name: `${destination} Street Kitchen`,
    details: { destination, cuisine: 'Street Food', rating: 4.5, priceRange: '$' },
    price: 500,
    description: 'Authentic street food',
    rating: 4.5
  },
  {
    id: 'R003',
    name: `International ${destination}`,
    details: { destination, cuisine: 'Fusion', rating: 4.6, priceRange: '$$' },
    price: 1200,
    description: 'Modern fusion cuisine',
    rating: 4.6
  },
]

const DEMO_CABS = (from: string, to: string) => [
  {
    id: 'CAB001',
    name: 'Premium Sedan',
    details: { from, to, vehicle: 'Premium Sedan', duration: '25 mins', capacity: 4 },
    price: 850,
    description: '4-seater sedan',
    rating: 4.6
  },
  {
    id: 'CAB002',
    name: 'Economy Hatchback',
    details: { from, to, vehicle: 'Economy Hatchback', duration: '25 mins', capacity: 4 },
    price: 450,
    description: 'Budget 4-seater',
    rating: 4.2
  },
  {
    id: 'CAB003',
    name: 'SUV Premium',
    details: { from, to, vehicle: 'SUV Premium', duration: '25 mins', capacity: 6 },
    price: 1200,
    description: 'Spacious 6-seater',
    rating: 4.8
  },
]

export default function Bookings() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Booking flow state
  const [activeTab, setActiveTab] = useState<'bookings' | 'search'>('bookings')
  const [selectedType, setSelectedType] = useState<string>('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null)
  const [searching, setSearching] = useState(false)

  // Form state for each type
  const [flightForm, setFlightForm] = useState({ from: '', to: '', departure: '', return: '', passengers: 1, class: 'Economy' })
  const [hotelForm, setHotelForm] = useState({ destination: '', checkIn: '', checkOut: '', guests: 1, rooms: 1 })
  const [trainForm, setTrainForm] = useState({ from: '', to: '', date: '', passengers: 1 })
  const [busForm, setBusForm] = useState({ from: '', to: '', date: '', passengers: 1 })
  const [cabForm, setCabForm] = useState({ pickup: '', drop: '', date: '', time: '', vehicle: 'Sedan', passengers: 1 })
  const [activityForm, setActivityForm] = useState({ destination: '', date: '', people: 1, category: 'All' })
  const [restaurantForm, setRestaurantForm] = useState({ destination: '', date: '', time: '', people: 1, cuisine: 'All' })

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      setLoading(true)
      const tripResponse = await apiClient.getTrip(parseInt(id!))
      setTrip(tripResponse.data)
      const bookingsResponse = await apiClient.get(`/trips/${id}/bookings`)
      setBookings(bookingsResponse.data || [])
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    setSearching(true)
    setError('')
    try {
      let results: SearchResult[] = []

      if (selectedType === 'flight' && flightForm.from && flightForm.to) {
        results = DEMO_FLIGHTS(flightForm.from, flightForm.to, flightForm.departure, flightForm.passengers, flightForm.class)
      } else if (selectedType === 'hotel' && hotelForm.destination) {
        results = DEMO_HOTELS(hotelForm.destination, hotelForm.checkIn, hotelForm.checkOut, hotelForm.guests)
      } else if (selectedType === 'train' && trainForm.from && trainForm.to) {
        results = DEMO_TRAINS(trainForm.from, trainForm.to, trainForm.date)
      } else if (selectedType === 'bus' && busForm.from && busForm.to) {
        results = DEMO_BUSES(busForm.from, busForm.to, busForm.date)
      } else if (selectedType === 'cab' && cabForm.pickup && cabForm.drop) {
        results = DEMO_CABS(cabForm.pickup, cabForm.drop)
      } else if (selectedType === 'activity' && activityForm.destination) {
        results = DEMO_ACTIVITIES(activityForm.destination)
      } else if (selectedType === 'restaurant' && restaurantForm.destination) {
        results = DEMO_RESTAURANTS(restaurantForm.destination)
      }

      if (results.length === 0) {
        setError('No results found. Please check your search criteria.')
      }

      setSearchResults(results)
    } catch (err: any) {
      setError('Search failed. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  const handleSelectResult = (result: SearchResult) => {
    setSelectedResult(result)
  }

  const handleBookSelection = async () => {
    if (!selectedResult) return

    try {
      let itemName = selectedResult.name

      if (selectedType === 'flight') {
        itemName = `${selectedResult.details.airline} ${selectedResult.details.flightNumber} - ${selectedResult.details.from} to ${selectedResult.details.to}`
      } else if (selectedType === 'hotel') {
        itemName = `${selectedResult.name} (${selectedResult.details.checkIn} - ${selectedResult.details.checkOut})`
      } else if (selectedType === 'train') {
        itemName = `Train ${selectedResult.details.trainNumber} - ${selectedResult.name}`
      } else if (selectedType === 'bus') {
        itemName = `${selectedResult.details.operator} - ${selectedResult.name}`
      } else if (selectedType === 'cab') {
        itemName = `${selectedResult.name} - ${selectedResult.details.from} to ${selectedResult.details.to}`
      }

      const booking = {
        booking_type: selectedType,
        item_name: itemName,
        estimated_cost: selectedResult.price
      }

      const response = await apiClient.post(`/trips/${id}/bookings`, booking)

      // Confirm immediately
      await apiClient.post(`/trips/${id}/bookings/${response.data.id}/confirm`)

      // Reload bookings
      await loadData()

      // Reset form
      setSelectedResult(null)
      setSelectedType('')
      setSearchResults([])
      setActiveTab('bookings')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create booking')
    }
  }

  const cancelBooking = async (bookingId: number) => {
    try {
      await apiClient.post(`/trips/${id}/bookings/${bookingId}/cancel`)
      setBookings(bookings.filter(b => b.id !== bookingId))
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to cancel booking')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark p-8 flex items-center justify-center">
        <p className="text-text-secondary">Loading bookings...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-dark p-8">
      <button
        onClick={() => navigate(`/trip/${id}`)}
        className="flex items-center gap-2 text-cyan hover:text-cyan/80 mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Trip
      </button>

      <div className="max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2">Trip Bookings: {trip?.title}</h1>
          <p className="text-text-secondary">{trip?.destination} • {trip?.currency} {trip?.total_budget.toLocaleString()}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700 text-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-4 px-2 font-semibold ${activeTab === 'bookings' ? 'text-cyan border-b-2 border-cyan' : 'text-text-secondary'}`}
          >
            Your Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`pb-4 px-2 font-semibold ${activeTab === 'search' ? 'text-cyan border-b-2 border-cyan' : 'text-text-secondary'}`}
          >
            New Booking
          </button>
        </div>

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <>
            {bookings.length === 0 ? (
              <Card className="text-center py-12">
                <p className="text-text-secondary mb-4">No bookings yet. Start planning your trip!</p>
                <Button variant="primary" onClick={() => setActiveTab('search')}>
                  Create First Booking
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-text-primary font-semibold text-lg">{booking.item_name}</h3>
                          <Badge variant={booking.status === 'confirmed' ? 'success' : 'warning'}>
                            {booking.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-text-secondary text-sm mb-2">
                          {booking.booking_type.toUpperCase()} • {booking.currency} {booking.estimated_cost.toLocaleString()}
                        </p>
                        {booking.reference_number && (
                          <p className="text-text-muted text-sm">
                            Reference: {booking.reference_number}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => cancelBooking(booking.id)}
                        className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition"
                        title="Cancel booking"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Search Tab - Single unified flow */}
        {activeTab === 'search' && (
          <>
            {!selectedType ? (
              // Type selector
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {BOOKING_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className="p-6 bg-sidebar border border-border rounded-lg hover:border-cyan hover:bg-sidebar/50 transition text-center"
                  >
                    <div className="text-3xl mb-2">{type.label.split(' ')[0]}</div>
                    <p className="text-text-primary font-semibold text-sm">{type.label.split(' ').slice(1).join(' ')}</p>
                  </button>
                ))}
              </div>
            ) : !selectedResult || searchResults.length === 0 ? (
              // Form and results
              <Card className="p-8">
                <div className="flex items-center gap-2 mb-6">
                  <button
                    onClick={() => {
                      setSelectedType('')
                      setSearchResults([])
                      setError('')
                    }}
                    className="text-cyan hover:text-cyan/80"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-2xl font-bold text-text-primary">
                    {BOOKING_TYPES.find(t => t.value === selectedType)?.label}
                  </h2>
                </div>

                {/* Forms */}
                {searchResults.length === 0 ? (
                  <div className="space-y-4 max-w-2xl">
                    {selectedType === 'flight' && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" placeholder="From" value={flightForm.from} onChange={(e) => setFlightForm({...flightForm, from: e.target.value})} className="px-4 py-2 bg-sidebar border border-border rounded-lg text-text-primary placeholder:text-text-muted" />
                          <input type="text" placeholder="To" value={flightForm.to} onChange={(e) => setFlightForm({...flightForm, to: e.target.value})} className="px-4 py-2 bg-sidebar border border-border rounded-lg text-text-primary placeholder:text-text-muted" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <input type="date" value={flightForm.departure} onChange={(e) => setFlightForm({...flightForm, departure: e.target.value})} className="px-4 py-2 bg-sidebar border border-border rounded-lg text-text-primary" />
                          <input type="number" placeholder="Passengers" value={flightForm.passengers} min="1" onChange={(e) => setFlightForm({...flightForm, passengers: parseInt(e.target.value) || 1})} className="px-4 py-2 bg-sidebar border border-border rounded-lg text-text-primary placeholder:text-text-muted" />
                        </div>
                        <select value={flightForm.class} onChange={(e) => setFlightForm({...flightForm, class: e.target.value})} className="w-full px-4 py-2 bg-sidebar border border-border rounded-lg text-text-primary">
                          <option>Economy</option>
                          <option>Premium Economy</option>
                          <option>Business</option>
                          <option>First Class</option>
                        </select>
                      </>
                    )}

                    {selectedType === 'hotel' && (
                      <>
                        <input type="text" placeholder="Destination" value={hotelForm.destination} onChange={(e) => setHotelForm({...hotelForm, destination: e.target.value})} className="w-full px-4 py-2 bg-sidebar border border-border rounded-lg text-text-primary placeholder:text-text-muted" />
                        <div className="grid grid-cols-2 gap-4">
                          <input type="date" placeholder="Check-in" value={hotelForm.checkIn} onChange={(e) => setHotelForm({...hotelForm, checkIn: e.target.value})} className="px-4 py-2 bg-sidebar border border-border rounded-lg text-text-primary" />
                          <input type="date" placeholder="Check-out" value={hotelForm.checkOut} onChange={(e) => setHotelForm({...hotelForm, checkOut: e.target.value})} className="px-4 py-2 bg-sidebar border border-border rounded-lg text-text-primary" />
                        </div>
                        <input type="number" placeholder="Guests" value={hotelForm.guests} min="1" onChange={(e) => setHotelForm({...hotelForm, guests: parseInt(e.target.value) || 1})} className="w-full px-4 py-2 bg-sidebar border border-border rounded-lg text-text-primary placeholder:text-text-muted" />
                      </>
                    )}

                    {selectedType === 'train' && (
                      <>
                        <input type="text" placeholder="From" value={trainForm.from} onChange={(e) => setTrainForm({...trainForm, from: e.target.value})} className="w-full px-4 py-2 bg-sidebar border border-border rounded-lg text-text-primary placeholder:text-text-muted" />
                        <input type="text" placeholder="To" value={trainForm.to} onChange={(e) => setTrainForm({...trainForm, to: e.target.value})} className="w-full px-4 py-2 bg-sidebar border border-border rounded-lg text-text-primary placeholder:text-text-muted" />
                        <input type="date" value={trainForm.date} onChange={(e) => setTrainForm({...trainForm, date: e.target.value})} className="w-full px-4 py-2 bg-sidebar border border-border rounded-lg text-text-primary" />
                        <input type="number" placeholder="Passengers" value={trainForm.passengers} min="1" onChange={(e) => setTrainForm({...trainForm, passengers: parseInt(e.target.value) || 1})} className="w-full px-4 py-2 bg-sidebar border border-border rounded-lg text-text-primary placeholder:text-text-muted" />
                      </>
                    )}

                    {selectedType === 'bus' && (
                      <>
                        <input type="text" placeholder="From" value={busForm.from} onChange={(e) => setBusForm({...busForm, from: e.target.value})} className="w-full px-4 py-2 bg-sidebar border border-border rounded-lg text-text-primary placeholder:text-text-muted" />
                        <input type="text" placeholder="To" value={busForm.to} onChange={(e) => setBusForm({...busForm, to: e.target.value})} className="w-full px-4 py-2 bg-sidebar border border-border rounded-lg text-text-primary placeholder:text-text-muted" />
                        <input type="date" value={busForm.date} onChange={(e) => setBusForm({...busForm, date: e.target.value})} className="w-full px-4 py-2 bg-sidebar border border-border rounded-lg text-text-primary" />
                        <input type="number" placeholder="Passengers" value={busForm.passengers} min="1" onChange={(e) => setBusForm({...busForm, passengers: parseInt(e.target.value) || 1})} className="w-full px-4 py-2 bg-sidebar border border-border rounded-lg text-text-primary placeholder:text-text-muted" />
                      </>
                    )}

                    {selectedType === 'cab' && (
                      <>
                        <input type="text" placeholder="Pickup location" value={cabForm.pickup} onChange={(e) => setCabForm({...cabForm, pickup: e.target.value})} className="w-full px-4 py-2 bg-sidebar border border-border rounded-lg text-text-primary placeholder:text-text-muted" />
                        <input type="text" placeholder="Drop location" value={cabForm.drop} onChange={(e) => setCabForm({...cabForm, drop: e.target.value})} className="w-full px-4 py-2 bg-sidebar border border-border rounded-lg text-text-primary placeholder:text-text-muted" />
                        <div className="grid grid-cols-2 gap-4">
                          <input type="date" value={cabForm.date} onChange={(e) => setCabForm({...cabForm, date: e.target.value})} className="px-4 py-2 bg-sidebar border border-border rounded-lg text-text-primary" />
                          <input type="time" value={cabForm.time} onChange={(e) => setCabForm({...cabForm, time: e.target.value})} className="px-4 py-2 bg-sidebar border border-border rounded-lg text-text-primary" />
                        </div>
                        <input type="number" placeholder="Passengers" value={cabForm.passengers} min="1" onChange={(e) => setCabForm({...cabForm, passengers: parseInt(e.target.value) || 1})} className="w-full px-4 py-2 bg-sidebar border border-border rounded-lg text-text-primary placeholder:text-text-muted" />
                      </>
                    )}

                    {selectedType === 'activity' && (
                      <>
                        <input type="text" placeholder="Destination" value={activityForm.destination} onChange={(e) => setActivityForm({...activityForm, destination: e.target.value})} className="w-full px-4 py-2 bg-sidebar border border-border rounded-lg text-text-primary placeholder:text-text-muted" />
                        <input type="number" placeholder="Number of people" value={activityForm.people} min="1" onChange={(e) => setActivityForm({...activityForm, people: parseInt(e.target.value) || 1})} className="w-full px-4 py-2 bg-sidebar border border-border rounded-lg text-text-primary placeholder:text-text-muted" />
                        <select value={activityForm.category} onChange={(e) => setActivityForm({...activityForm, category: e.target.value})} className="w-full px-4 py-2 bg-sidebar border border-border rounded-lg text-text-primary">
                          <option>All</option>
                          <option>Sightseeing</option>
                          <option>Adventure</option>
                          <option>Cultural</option>
                        </select>
                      </>
                    )}

                    {selectedType === 'restaurant' && (
                      <>
                        <input type="text" placeholder="Destination" value={restaurantForm.destination} onChange={(e) => setRestaurantForm({...restaurantForm, destination: e.target.value})} className="w-full px-4 py-2 bg-sidebar border border-border rounded-lg text-text-primary placeholder:text-text-muted" />
                        <div className="grid grid-cols-2 gap-4">
                          <input type="date" value={restaurantForm.date} onChange={(e) => setRestaurantForm({...restaurantForm, date: e.target.value})} className="px-4 py-2 bg-sidebar border border-border rounded-lg text-text-primary" />
                          <input type="time" value={restaurantForm.time} onChange={(e) => setRestaurantForm({...restaurantForm, time: e.target.value})} className="px-4 py-2 bg-sidebar border border-border rounded-lg text-text-primary" />
                        </div>
                        <input type="number" placeholder="Number of people" value={restaurantForm.people} min="1" onChange={(e) => setRestaurantForm({...restaurantForm, people: parseInt(e.target.value) || 1})} className="w-full px-4 py-2 bg-sidebar border border-border rounded-lg text-text-primary placeholder:text-text-muted" />
                      </>
                    )}

                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={handleSearch}
                      disabled={searching}
                    >
                      <Search className="w-4 h-4 mr-2" />
                      {searching ? 'Searching...' : `Search ${BOOKING_TYPES.find(t => t.value === selectedType)?.label.split(' ')[1] || 'Results'}`}
                    </Button>
                  </div>
                ) : (
                  // Results list
                  <div className="space-y-4">
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        onClick={() => handleSelectResult(result)}
                        className={`p-4 border rounded-lg cursor-pointer transition ${selectedResult?.id === result.id ? 'border-cyan bg-cyan/10' : 'border-border hover:border-cyan/50'}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-text-primary font-semibold text-lg">{result.name}</h3>
                            <p className="text-text-secondary text-sm mt-1">{result.description}</p>
                            {selectedType === 'flight' && (
                              <div className="text-text-muted text-xs mt-2 space-y-1">
                                <div>{result.details.departure} → {result.details.arrival} ({result.details.duration})</div>
                                <div>{result.details.from} to {result.details.to} • {result.details.class} • {result.details.stops} stops</div>
                              </div>
                            )}
                            {selectedType === 'train' && (
                              <div className="text-text-muted text-xs mt-2 space-y-1">
                                <div>No. {result.details.trainNumber}</div>
                                <div>{result.details.departure} → {result.details.arrival} ({result.details.duration})</div>
                                <div>{result.details.from} to {result.details.to} • {result.details.class}</div>
                              </div>
                            )}
                            {selectedType === 'hotel' && (
                              <div className="text-text-muted text-xs mt-2">
                                {result.details.checkIn} to {result.details.checkOut} • {result.details.roomType}
                              </div>
                            )}
                            {selectedType === 'bus' && (
                              <div className="text-text-muted text-xs mt-2 space-y-1">
                                <div>{result.details.departure} → {result.details.arrival} ({result.details.duration})</div>
                                <div>{result.details.type} • {result.details.operator}</div>
                              </div>
                            )}
                            {result.rating && <p className="text-yellow-500 text-sm mt-2">★ {result.rating}/5</p>}
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-2xl font-bold text-cyan">₹{result.price.toLocaleString()}</p>
                            <p className="text-text-muted text-xs mt-1">per person</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ) : (
              // Selected result - confirmation
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-text-primary mb-6">Confirm Booking</h2>
                <div className="bg-sidebar p-6 rounded-lg mb-6">
                  <h3 className="text-text-primary font-semibold text-lg mb-4">{selectedResult.name}</h3>
                  <p className="text-text-secondary mb-3">{selectedResult.description}</p>
                  <div className="text-text-primary space-y-2 text-sm">
                    {Object.entries(selectedResult.details).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-text-secondary">{key.replace(/_/g, ' ').charAt(0).toUpperCase() + key.replace(/_/g, ' ').slice(1)}:</span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-cyan/10 border border-cyan p-4 rounded-lg mb-6">
                  <p className="text-text-primary font-semibold text-2xl">₹{selectedResult.price.toLocaleString()}</p>
                  <p className="text-text-secondary text-sm">Total cost</p>
                </div>
                <div className="flex gap-4">
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={handleBookSelection}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Booking
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setSelectedResult(null)}
                  >
                    Back to Results
                  </Button>
                </div>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Demo Label */}
      <div className="mt-8 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg text-yellow-200 text-center text-sm">
        ℹ️ DEMO INVENTORY - Search results are demo data. Not connected to real booking providers.
      </div>
    </div>
  )
}
