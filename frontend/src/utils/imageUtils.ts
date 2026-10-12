/**
 * Destination image mapping utility - Scalable hierarchical system
 * Supports: city, state/region, country
 * Uses Unsplash's free API (no API key required)
 */

// Hierarchical image database: city + state + country -> URL
const DESTINATION_IMAGES: Record<string, string> = {
  // Cities with specific images
  'Paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
  'Tokyo': 'https://images.unsplash.com/photo-1540959375944-7049f642e9a5?w=800&q=80',
  'Osaka': 'https://images.unsplash.com/photo-1589519160732-57fc498494f8?w=800&q=80',
  'New York': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
  'London': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
  'Barcelona': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80',
  'Rome': 'https://images.unsplash.com/photo-1552832860-cfb67165eaf0?w=800&q=80',
  'Amsterdam': 'https://images.unsplash.com/photo-1467269865100-280e8e920e28?w=800&q=80',
  'Berlin': 'https://images.unsplash.com/photo-1524315409364-7dcf51218900?w=800&q=80',
  'Vienna': 'https://images.unsplash.com/photo-1516550893675-4faaa6f32e91?w=800&q=80',
  'Prague': 'https://images.unsplash.com/photo-1508757117341-f8e29778b166?w=800&q=80',
  'Madrid': 'https://images.unsplash.com/photo-1539922631099-ddfac04d999d?w=800&q=80',
  'Dubai': 'https://images.unsplash.com/photo-1512453475868-baf563ff1642?w=800&q=80',
  'Singapore': 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80',
  'Bangkok': 'https://images.unsplash.com/photo-1507159591435-c87b042314f1?w=800&q=80',
  'Maldives': 'https://images.unsplash.com/photo-1537926314294-c8f45f1b1dff?w=800&q=80',
  'Bali': 'https://images.unsplash.com/photo-1548013146-72847e1e8e60?w=800&q=80',
  'Goa': 'https://images.unsplash.com/photo-1529148091759-5a12e68b049b?w=800&q=80',
  'Delhi': 'https://images.unsplash.com/photo-1605776481351-76c3e32d896e?w=800&q=80',
  'New Delhi': 'https://images.unsplash.com/photo-1605776481351-76c3e32d896e?w=800&q=80',
  'Mumbai': 'https://images.unsplash.com/photo-1570541838007-6b551b1517eb?w=800&q=80',
  'Bengaluru': 'https://images.unsplash.com/photo-1580541831067-3fc02ca28ccc?w=800&q=80',
  'Kochi': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'Kyoto': 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&q=80',
  'Hiroshima': 'https://images.unsplash.com/photo-1522383150241-9cfb2dba2200?w=800&q=80',

  // State/Region mappings
  'Karnataka': 'https://images.unsplash.com/photo-1580541831067-3fc02ca28ccc?w=800&q=80',
  'Kerala': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'Maharashtra': 'https://images.unsplash.com/photo-1570541838007-6b551b1517eb?w=800&q=80',
  'Tamil Nadu': 'https://images.unsplash.com/photo-1599661046289-e31897846ca7?w=800&q=80',
  'Rajasthan': 'https://images.unsplash.com/photo-1606986628125-05b59e3a6e09?w=800&q=80',
  'Uttar Pradesh': 'https://images.unsplash.com/photo-1608596481282-385acec5dcc0?w=800&q=80',
  'West Bengal': 'https://images.unsplash.com/photo-1599661046289-e31897846ca7?w=800&q=80',
  'Kanto': 'https://images.unsplash.com/photo-1540959375944-7049f642e9a5?w=800&q=80',
  'Kansai': 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&q=80',

  // Countries
  'France': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
  'Japan': 'https://images.unsplash.com/photo-1540959375944-7049f642e9a5?w=800&q=80',
  'USA': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
  'UK': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
  'Spain': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80',
  'Italy': 'https://images.unsplash.com/photo-1552832860-cfb67165eaf0?w=800&q=80',
  'Netherlands': 'https://images.unsplash.com/photo-1467269865100-280e8e920e28?w=800&q=80',
  'Germany': 'https://images.unsplash.com/photo-1524315409364-7dcf51218900?w=800&q=80',
  'Austria': 'https://images.unsplash.com/photo-1516550893675-4faaa6f32e91?w=800&q=80',
  'Czech Republic': 'https://images.unsplash.com/photo-1508757117341-f8e29778b166?w=800&q=80',
  'India': 'https://images.unsplash.com/photo-1605776481351-76c3e32d896e?w=800&q=80',
  'Thailand': 'https://images.unsplash.com/photo-1507159591435-c87b042314f1?w=800&q=80',
  'Indonesia': 'https://images.unsplash.com/photo-1548013146-72847e1e8e60?w=800&q=80',
  'UAE': 'https://images.unsplash.com/photo-1512453475868-baf563ff1642?w=800&q=80',
  'Australia': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'Vietnam': 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&q=80',
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80';

/**
 * Get a destination-specific image URL with hierarchical resolution
 * Priority: city > destination > state > country > default
 */
export interface DestinationParams {
  city?: string
  destination?: string
  state?: string
  country?: string
}

export function getDestinationImage(params: string | DestinationParams): string {
  // Handle backward compatibility: if string is passed, treat as destination
  const {
    city,
    destination = typeof params === 'string' ? params : undefined,
    state,
    country
  } = typeof params === 'string' ? { destination: params } : params

  // Priority 1: Exact city match
  if (city) {
    const cityKey = Object.keys(DESTINATION_IMAGES).find(
      k => k.toLowerCase() === city.toLowerCase()
    )
    if (cityKey) return DESTINATION_IMAGES[cityKey]
  }

  // Priority 2: Exact destination match
  if (destination) {
    const destKey = Object.keys(DESTINATION_IMAGES).find(
      k => k.toLowerCase() === destination.toLowerCase()
    )
    if (destKey) return DESTINATION_IMAGES[destKey]
  }

  // Priority 3: State match
  if (state) {
    const stateKey = Object.keys(DESTINATION_IMAGES).find(
      k => k.toLowerCase() === state.toLowerCase()
    )
    if (stateKey) return DESTINATION_IMAGES[stateKey]
  }

  // Priority 4: Country match
  if (country) {
    const countryKey = Object.keys(DESTINATION_IMAGES).find(
      k => k.toLowerCase() === country.toLowerCase()
    )
    if (countryKey) return DESTINATION_IMAGES[countryKey]
  }

  // Priority 5: Default fallback
  return DEFAULT_IMAGE
}

export function getDestinationImageWithFallback(
  params: string | DestinationParams,
  onError?: () => void
): { src: string; onError?: () => void } {
  return {
    src: getDestinationImage(params),
    onError,
  }
}
