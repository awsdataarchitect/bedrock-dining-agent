import React from 'react';
import { Restaurant } from '../types';

interface RestaurantMapProps {
  restaurants: Restaurant[];
  selectedRestaurant?: Restaurant | null;
  onRestaurantSelect?: (restaurant: Restaurant) => void;
  className?: string;
}

const RestaurantMap: React.FC<RestaurantMapProps> = ({
  restaurants,
  selectedRestaurant,
  onRestaurantSelect,
  className = '',
}) => {
  // This is a placeholder map component
  // In a real implementation, you would integrate with Google Maps, Mapbox, or similar
  
  return (
    <div className={`bg-gray-100 rounded-lg border border-gray-200 ${className}`}>
      <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="text-4xl">🗺️</div>
        <h3 className="text-lg font-medium text-gray-900">Interactive Map</h3>
        <p className="text-gray-600 max-w-sm">
          Map integration would show {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''} 
          {selectedRestaurant && ` with ${selectedRestaurant.name} highlighted`}
        </p>
        
        {/* Mock Map Pins */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {restaurants.slice(0, 6).map((restaurant, index) => (
            <button
              key={restaurant.id}
              onClick={() => onRestaurantSelect?.(restaurant)}
              className={`p-2 rounded-md text-xs transition-colors ${
                selectedRestaurant?.id === restaurant.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              title={restaurant.name}
            >
              📍 {restaurant.name.substring(0, 10)}
              {restaurant.name.length > 10 && '...'}
            </button>
          ))}
          {restaurants.length > 6 && (
            <div className="p-2 rounded-md bg-gray-200 text-gray-600 text-xs">
              +{restaurants.length - 6} more
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 mt-4">
          💡 In production, this would be an interactive map with Google Maps or Mapbox
        </div>
      </div>
    </div>
  );
};

export default RestaurantMap;