// Restaurant types
export interface Restaurant {
  id: string;
  name: string;
  cuisine_type: string;
  location: string;
  rating: number;
  price_range: string;
  has_online_booking: boolean;
  phone?: string;
  address?: string;
  image_url?: string;
  description?: string;
  hours?: string;
  popular_items?: string[];
}

// Menu item types
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  image_url?: string;
  dietary_info?: string[];
}

// Reservation types
export interface ReservationRequest {
  restaurant_id: string;
  date: string;
  time: string;
  party_size: number;
  contact_name: string;
  contact_phone: string;
  special_requests?: string;
}

export interface ReservationResponse {
  status: 'confirmed' | 'initiated' | 'failed';
  confirmation_number?: string;
  call_id?: string;
  restaurant_name: string;
  details: ReservationRequest;
  method: 'online' | 'voice_call';
  message?: string;
  error?: string;
}

// Bill estimation types
export interface BillEstimation {
  subtotal: number;
  tax: number;
  tip_suggestion: number;
  total: number;
  per_person: number;
  party_size: number;
  items: MenuItem[];
  breakdown: {
    subtotal: number;
    tax: string;
    tip: string;
  };
}

// Insights types
export interface DiningInsights {
  summary: {
    total_restaurants: number;
    average_rating: number;
    cuisine_variety: number;
    available_cuisines: string[];
  };
  recommendations: {
    top_rated: Array<{
      name: string;
      rating: number;
      cuisine: string;
    }>;
    best_value: Restaurant[];
    online_booking_available: Restaurant[];
  };
  insights: string[];
}

// API Response types
export interface ApiResponse<T> {
  content?: string;
  status: 'success' | 'failed' | 'error';
  data?: T;
  error?: string;
}

// Search filters
export interface SearchFilters {
  location: string;
  cuisine_preferences?: string[];
  price_range?: string[];
  rating_min?: number;
  has_online_booking?: boolean;
}

// User preferences
export interface UserPreferences {
  dietary_restrictions?: string[];
  favorite_cuisines?: string[];
  price_preference?: string;
  location?: string;
}