import React, { useState, useEffect } from 'react';
import { ReservationRequest } from '../types';
import { formatDate, formatTime, isValidPhoneNumber } from '../utils/formatters';

interface ReservationFormProps {
  initialData?: Partial<ReservationRequest>;
  onSubmit: (reservation: ReservationRequest) => void;
  isLoading?: boolean;
  restaurantName?: string;
}

const ReservationForm: React.FC<ReservationFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
  restaurantName,
}) => {
  const [reservation, setReservation] = useState<ReservationRequest>({
    restaurant_id: initialData?.restaurant_id || '',
    date: initialData?.date || '',
    time: initialData?.time || '',
    party_size: initialData?.party_size || 2,
    contact_name: initialData?.contact_name || '',
    contact_phone: initialData?.contact_phone || '',
    special_requests: initialData?.special_requests || '',
  });

  const [errors, setErrors] = useState<Partial<ReservationRequest>>({});

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 17; hour <= 22; hour++) { // 5 PM to 10 PM
      for (let minute = 0; minute < 60; minute += 30) {
        const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const time12 = formatTime(time24);
        slots.push({ value: time12, label: time12 });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Get date 3 months from now
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateString = maxDate.toISOString().split('T')[0];

  const validateForm = (): boolean => {
    const newErrors: Partial<ReservationRequest> = {};

    if (!reservation.restaurant_id.trim()) {
      newErrors.restaurant_id = 'Restaurant is required';
    }

    if (!reservation.date) {
      newErrors.date = 'Date is required';
    } else if (reservation.date < today) {
      newErrors.date = 'Date cannot be in the past';
    }

    if (!reservation.time) {
      newErrors.time = 'Time is required';
    }

    if (!reservation.contact_name.trim()) {
      newErrors.contact_name = 'Name is required';
    }

    if (!reservation.contact_phone.trim()) {
      newErrors.contact_phone = 'Phone number is required';
    } else if (!isValidPhoneNumber(reservation.contact_phone)) {
      newErrors.contact_phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(reservation);
    }
  };

  const handleInputChange = (field: keyof ReservationRequest, value: string | number) => {
    setReservation(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Format phone number as user types
  const handlePhoneChange = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    let formatted = digits;
    if (digits.length >= 6) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    } else if (digits.length >= 3) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    }
    
    handleInputChange('contact_phone', formatted);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Restaurant Info */}
      {restaurantName && (
        <div className="bg-primary-50 border border-primary-200 rounded-md p-4">
          <div className="flex items-center space-x-2">
            <span className="text-primary-600">🍽️</span>
            <div>
              <h3 className="text-primary-800 font-medium">Making reservation for:</h3>
              <p className="text-primary-700">{restaurantName}</p>
            </div>
          </div>
        </div>
      )}

      {/* Restaurant Selection */}
      <div>
        <label htmlFor="restaurant" className="block text-sm font-medium text-gray-700 mb-2">
          Restaurant *
        </label>
        <input
          type="text"
          id="restaurant"
          value={reservation.restaurant_id}
          onChange={(e) => handleInputChange('restaurant_id', e.target.value)}
          placeholder="Enter restaurant name or ID"
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
            errors.restaurant_id ? 'border-red-300' : 'border-gray-300'
          }`}
          disabled={!!restaurantName}
        />
        {errors.restaurant_id && (
          <p className="text-red-600 text-sm mt-1">{errors.restaurant_id}</p>
        )}
        {!restaurantName && (
          <p className="text-xs text-gray-500 mt-1">
            Search for restaurants first to get the restaurant ID
          </p>
        )}
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
            Date *
          </label>
          <input
            type="date"
            id="date"
            value={reservation.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            min={today}
            max={maxDateString}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.date ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.date && (
            <p className="text-red-600 text-sm mt-1">{errors.date}</p>
          )}
        </div>

        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
            Time *
          </label>
          <select
            id="time"
            value={reservation.time}
            onChange={(e) => handleInputChange('time', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.time ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select time</option>
            {timeSlots.map((slot) => (
              <option key={slot.value} value={slot.value}>
                {slot.label}
              </option>
            ))}
          </select>
          {errors.time && (
            <p className="text-red-600 text-sm mt-1">{errors.time}</p>
          )}
        </div>
      </div>

      {/* Party Size */}
      <div>
        <label htmlFor="partySize" className="block text-sm font-medium text-gray-700 mb-2">
          Party Size *
        </label>
        <select
          id="partySize"
          value={reservation.party_size}
          onChange={(e) => handleInputChange('party_size', Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((size) => (
            <option key={size} value={size}>
              {size} {size === 1 ? 'person' : 'people'}
            </option>
          ))}
        </select>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2">
            Contact Name *
          </label>
          <input
            type="text"
            id="contactName"
            value={reservation.contact_name}
            onChange={(e) => handleInputChange('contact_name', e.target.value)}
            placeholder="Your full name"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.contact_name ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.contact_name && (
            <p className="text-red-600 text-sm mt-1">{errors.contact_name}</p>
          )}
        </div>

        <div>
          <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            id="contactPhone"
            value={reservation.contact_phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="(555) 123-4567"
            maxLength={14}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.contact_phone ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.contact_phone && (
            <p className="text-red-600 text-sm mt-1">{errors.contact_phone}</p>
          )}
        </div>
      </div>

      {/* Special Requests */}
      <div>
        <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-2">
          Special Requests
        </label>
        <textarea
          id="specialRequests"
          value={reservation.special_requests}
          onChange={(e) => handleInputChange('special_requests', e.target.value)}
          placeholder="Dietary restrictions, seating preferences, special occasions, etc."
          rows={3}
          maxLength={500}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          {reservation.special_requests?.length || 0}/500 characters
        </p>
      </div>

      {/* Reservation Summary */}
      {reservation.date && reservation.time && (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <h4 className="font-medium text-gray-900 mb-2">Reservation Summary</h4>
          <div className="space-y-1 text-sm text-gray-700">
            <p><strong>Date:</strong> {formatDate(reservation.date)}</p>
            <p><strong>Time:</strong> {reservation.time}</p>
            <p><strong>Party Size:</strong> {reservation.party_size} {reservation.party_size === 1 ? 'person' : 'people'}</p>
            <p><strong>Contact:</strong> {reservation.contact_name || 'Not provided'}</p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary-600 text-white py-3 px-4 rounded-md font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Making Reservation...</span>
          </div>
        ) : (
          'Make Reservation'
        )}
      </button>
    </form>
  );
};

export default ReservationForm;