import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Restaurant } from '../types';
import { formatRating, formatPriceRange, formatPhoneNumber } from '../utils/formatters';
import { apiService } from '../services/api';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onReserve?: (restaurant: Restaurant) => void;
  onViewDetails?: (restaurant: Restaurant) => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ 
  restaurant, 
  onReserve, 
  onViewDetails 
}) => {
  const [isOpeningWebsite, setIsOpeningWebsite] = useState(false);

  const handleReserve = () => {
    if (onReserve) {
      onReserve(restaurant);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(restaurant);
    }
  };

  const handleVisitWebsite = async () => {
    setIsOpeningWebsite(true);
    try {
      const response = await apiService.openRestaurantWebsite(restaurant.name, restaurant.location);
      if (response.status === 'success') {
        // The browser tool will handle opening the website
        console.log('Website opened via browser tool');
      }
    } catch (error) {
      console.error('Failed to open website:', error);
    } finally {
      setIsOpeningWebsite(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Restaurant Image */}
      {restaurant.image_url ? (
        <div className="h-48 bg-gray-200 overflow-hidden">
          <img
            src={restaurant.image_url}
            alt={restaurant.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
          <span className="text-4xl text-primary-600">🍽️</span>
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {restaurant.name}
            </h3>
            <p className="text-sm text-gray-600">{restaurant.cuisine_type}</p>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <span className="text-sm font-medium text-gray-700">
              {formatPriceRange(restaurant.price_range)}
            </span>
            <div className="flex items-center space-x-1">
              <span className="text-yellow-400">⭐</span>
              <span className="text-sm font-medium">{restaurant.rating}</span>
            </div>
          </div>
        </div>

        {/* Location and Contact */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>📍</span>
            <span>{restaurant.location}</span>
          </div>
          
          {restaurant.phone && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>📞</span>
              <span>{formatPhoneNumber(restaurant.phone)}</span>
            </div>
          )}

          {restaurant.hours && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>🕒</span>
              <span>{restaurant.hours}</span>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-4">
          {restaurant.has_online_booking && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              📱 Online Booking
            </span>
          )}
        </div>

        {/* Description */}
        {restaurant.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {restaurant.description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleViewDetails}
            className="bg-primary-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
          >
            Details
          </button>
          
          <button
            onClick={handleVisitWebsite}
            disabled={isOpeningWebsite}
            className="bg-blue-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
          >
            {isOpeningWebsite ? '🌐...' : '🌐 Website'}
          </button>
          
          <button
            onClick={handleReserve}
            className="border border-gray-300 text-gray-700 py-2 px-3 rounded text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            {restaurant.has_online_booking ? '📅 Book' : '📞 Call'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;