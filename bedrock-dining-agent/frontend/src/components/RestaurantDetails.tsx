import React from 'react';
import { Restaurant } from '../types';
import { formatRating, formatPriceRange, formatPhoneNumber } from '../utils/formatters';

interface RestaurantDetailsProps {
  restaurant: Restaurant;
  onClose: () => void;
  onReserve: (restaurant: Restaurant) => void;
}

const RestaurantDetails: React.FC<RestaurantDetailsProps> = ({ 
  restaurant, 
  onClose, 
  onReserve 
}) => {
  const handleReserve = () => {
    onReserve(restaurant);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{restaurant.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Restaurant Image */}
          {restaurant.image_url ? (
            <div className="h-64 bg-gray-200 rounded-lg overflow-hidden">
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
            <div className="h-64 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
              <span className="text-6xl text-primary-600">🍽️</span>
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Restaurant Info</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">🍽️</span>
                    <span className="text-gray-700">{restaurant.cuisine_type}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">💰</span>
                    <span className="text-gray-700">{formatPriceRange(restaurant.price_range)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-gray-700">{formatRating(restaurant.rating)}</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Features</h4>
                <div className="flex flex-wrap gap-2">
                  {restaurant.has_online_booking && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      📱 Online Booking
                    </span>
                  )}
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    📞 Phone Reservations
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact & Location</h3>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <span className="text-gray-500 mt-1">📍</span>
                    <div>
                      <p className="text-gray-700">{restaurant.location}</p>
                      {restaurant.address && (
                        <p className="text-sm text-gray-600">{restaurant.address}</p>
                      )}
                    </div>
                  </div>
                  
                  {restaurant.phone && (
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">📞</span>
                      <a 
                        href={`tel:${restaurant.phone}`}
                        className="text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        {formatPhoneNumber(restaurant.phone)}
                      </a>
                    </div>
                  )}

                  {restaurant.hours && (
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">🕒</span>
                      <span className="text-gray-700">{restaurant.hours}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {restaurant.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
              <p className="text-gray-700 leading-relaxed">{restaurant.description}</p>
            </div>
          )}

          {/* Popular Items */}
          {restaurant.popular_items && restaurant.popular_items.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Popular Items</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {restaurant.popular_items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-orange-500">🔥</span>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleReserve}
              className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-md font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
            >
              {restaurant.has_online_booking ? 'Book Online' : 'Call to Reserve'}
            </button>
            
            {restaurant.phone && (
              <a
                href={`tel:${restaurant.phone}`}
                className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-md font-medium text-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Call Now
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetails;