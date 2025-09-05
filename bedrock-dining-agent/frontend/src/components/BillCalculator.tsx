import React, { useState, useEffect } from 'react';
import { MenuItem, BillEstimation } from '../types';
import { formatCurrency } from '../utils/formatters';

interface BillCalculatorProps {
  items: MenuItem[];
  partySize: number;
  onEstimationChange?: (estimation: BillEstimation | null) => void;
  restaurantLocation?: string;
}

const BillCalculator: React.FC<BillCalculatorProps> = ({
  items,
  partySize,
  onEstimationChange,
  restaurantLocation = '',
}) => {
  const [estimation, setEstimation] = useState<BillEstimation | null>(null);
  const [customTipPercentage, setCustomTipPercentage] = useState(18);
  const [taxRate, setTaxRate] = useState(8.0);

  // Calculate bill estimation
  useEffect(() => {
    if (items.length === 0) {
      setEstimation(null);
      onEstimationChange?.(null);
      return;
    }

    const subtotal = items.reduce((sum, item) => sum + item.price, 0);
    const tax = subtotal * (taxRate / 100);
    const tip_suggestion = subtotal * (customTipPercentage / 100);
    const total = subtotal + tax + tip_suggestion;
    const per_person = total / Math.max(1, partySize);

    const newEstimation: BillEstimation = {
      subtotal,
      tax,
      tip_suggestion,
      total,
      per_person,
      party_size: partySize,
      items,
      breakdown: {
        subtotal,
        tax: `${taxRate}% = ${formatCurrency(tax)}`,
        tip: `${customTipPercentage}% = ${formatCurrency(tip_suggestion)}`,
      },
    };

    setEstimation(newEstimation);
    onEstimationChange?.(newEstimation);
  }, [items, partySize, customTipPercentage, taxRate, onEstimationChange]);

  // Get tax rate based on location
  const getLocationTaxRate = (location: string): number => {
    const locationTaxRates: { [key: string]: number } = {
      'seattle': 10.25,
      'new york': 8.25,
      'san francisco': 8.75,
      'los angeles': 9.5,
      'chicago': 10.25,
      'miami': 7.0,
      'austin': 8.25,
      'denver': 8.31,
      'portland': 0, // No sales tax in Oregon
      'boston': 6.25,
    };

    const normalizedLocation = location.toLowerCase();
    for (const [city, rate] of Object.entries(locationTaxRates)) {
      if (normalizedLocation.includes(city)) {
        return rate;
      }
    }
    return 8.0; // Default tax rate
  };

  // Update tax rate when location changes
  useEffect(() => {
    if (restaurantLocation) {
      const locationTaxRate = getLocationTaxRate(restaurantLocation);
      setTaxRate(locationTaxRate);
    }
  }, [restaurantLocation]);

  const tipOptions = [15, 18, 20, 22, 25];

  if (!estimation) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <span className="text-4xl">🧮</span>
        <p className="text-gray-600 mt-2">Add items to see bill calculation</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Bill Calculator</h3>

      {/* Tax Rate Adjustment */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Tax Rate (%)
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value))}
            min="0"
            max="15"
            step="0.25"
            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-600">
            {restaurantLocation && `(${restaurantLocation})`}
          </span>
        </div>
      </div>

      {/* Tip Percentage Adjustment */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Tip Percentage
        </label>
        <div className="flex flex-wrap gap-2">
          {tipOptions.map((percentage) => (
            <button
              key={percentage}
              onClick={() => setCustomTipPercentage(percentage)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                customTipPercentage === percentage
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {percentage}%
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Custom:</span>
          <input
            type="number"
            value={customTipPercentage}
            onChange={(e) => setCustomTipPercentage(Number(e.target.value))}
            min="0"
            max="50"
            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-600">%</span>
        </div>
      </div>

      {/* Bill Breakdown */}
      <div className="space-y-3 border-t pt-4">
        <h4 className="font-medium text-gray-900">Bill Breakdown</h4>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">{formatCurrency(estimation.subtotal)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax ({taxRate}%):</span>
            <span className="font-medium">{formatCurrency(estimation.tax)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tip ({customTipPercentage}%):</span>
            <span className="font-medium">{formatCurrency(estimation.tip_suggestion)}</span>
          </div>
          
          <div className="border-t pt-2">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>{formatCurrency(estimation.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Per Person Calculation */}
      {partySize > 1 && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-primary-700 font-medium">
              Per Person ({partySize} people):
            </span>
            <span className="text-primary-800 font-bold text-lg">
              {formatCurrency(estimation.per_person)}
            </span>
          </div>
        </div>
      )}

      {/* Bill Splitting Options */}
      {partySize > 1 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Bill Splitting Options</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <h5 className="text-sm font-medium text-gray-900">Equal Split</h5>
              <p className="text-sm text-gray-600">
                Each person pays: {formatCurrency(estimation.per_person)}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <h5 className="text-sm font-medium text-gray-900">Custom Split</h5>
              <p className="text-sm text-gray-600">
                Divide items individually among diners
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Methods Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Payment Tips</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Most restaurants accept credit cards, debit cards, and cash</li>
          <li>• Some may accept mobile payments (Apple Pay, Google Pay)</li>
          <li>• Check if the restaurant adds automatic gratuity for large parties</li>
          <li>• Consider tipping in cash for better service staff compensation</li>
        </ul>
      </div>
    </div>
  );
};

export default BillCalculator;