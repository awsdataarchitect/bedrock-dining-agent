import React from 'react';
import { SearchFilters as SearchFiltersType } from '../types';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  onSearch: () => void;
  isLoading?: boolean;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  isLoading = false,
}) => {
  const cuisineOptions = [
    'Italian', 'Chinese', 'Japanese', 'Mexican', 'Indian', 'Thai', 'French', 
    'American', 'Mediterranean', 'Korean', 'Vietnamese', 'Greek', 'Spanish',
    'Lebanese', 'Ethiopian', 'Moroccan', 'Brazilian', 'Peruvian'
  ];

  const priceRanges = [
    { value: '$', label: 'Budget ($)' },
    { value: '$$', label: 'Moderate ($$)' },
    { value: '$$$', label: 'Upscale ($$$)' },
    { value: '$$$$', label: 'Fine Dining ($$$$)' },
  ];

  const handleCuisineChange = (cuisine: string, checked: boolean) => {
    const current = filters.cuisine_preferences || [];
    const updated = checked
      ? [...current, cuisine]
      : current.filter(c => c !== cuisine);
    
    onFiltersChange({ ...filters, cuisine_preferences: updated });
  };

  const handlePriceRangeChange = (priceRange: string, checked: boolean) => {
    const current = filters.price_range || [];
    const updated = checked
      ? [...current, priceRange]
      : current.filter(p => p !== priceRange);
    
    onFiltersChange({ ...filters, price_range: updated });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      location: filters.location, // Keep location
      cuisine_preferences: [],
      price_range: [],
      rating_min: 0,
      has_online_booking: false,
    });
  };

  const hasActiveFilters = 
    (filters.cuisine_preferences?.length || 0) > 0 ||
    (filters.price_range?.length || 0) > 0 ||
    (filters.rating_min || 0) > 0 ||
    filters.has_online_booking;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Search Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Location Input */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Location *
          </label>
          <div className="relative">
            <input
              type="text"
              id="location"
              value={filters.location}
              onChange={(e) => onFiltersChange({ ...filters, location: e.target.value })}
              placeholder="Enter city, neighborhood, or address"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">📍</span>
            </div>
          </div>
        </div>

        {/* Cuisine Preferences */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Cuisine Preferences
          </label>
          <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
            <div className="grid grid-cols-2 gap-2">
              {cuisineOptions.map((cuisine) => (
                <label key={cuisine} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.cuisine_preferences?.includes(cuisine) || false}
                    onChange={(e) => handleCuisineChange(cuisine, e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-gray-700">{cuisine}</span>
                </label>
              ))}
            </div>
          </div>
          {filters.cuisine_preferences && filters.cuisine_preferences.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {filters.cuisine_preferences.map((cuisine) => (
                <span
                  key={cuisine}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                >
                  {cuisine}
                  <button
                    onClick={() => handleCuisineChange(cuisine, false)}
                    className="ml-1 text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Price Range
          </label>
          <div className="space-y-2">
            {priceRanges.map((range) => (
              <label key={range.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.price_range?.includes(range.value) || false}
                  onChange={(e) => handlePriceRangeChange(range.value, e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{range.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Rating Filter */}
        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Rating
          </label>
          <select
            id="rating"
            value={filters.rating_min || 0}
            onChange={(e) => onFiltersChange({ ...filters, rating_min: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value={0}>Any Rating</option>
            <option value={3}>3+ Stars ⭐⭐⭐</option>
            <option value={4}>4+ Stars ⭐⭐⭐⭐</option>
            <option value={4.5}>4.5+ Stars ⭐⭐⭐⭐⭐</option>
          </select>
        </div>

        {/* Additional Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Additional Options
          </label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.has_online_booking || false}
                onChange={(e) => onFiltersChange({ ...filters, has_online_booking: e.target.checked })}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Online booking available</span>
            </label>
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={onSearch}
          disabled={!filters.location.trim() || isLoading}
          className="w-full bg-primary-600 text-white py-3 px-4 rounded-md font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Searching...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <span>🔍</span>
              <span>Search Restaurants</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default SearchFilters;