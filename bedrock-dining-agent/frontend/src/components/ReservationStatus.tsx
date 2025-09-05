import React from 'react';
import { ReservationResponse } from '../types';
import { formatDate, formatTime } from '../utils/formatters';

interface ReservationStatusProps {
  reservation: ReservationResponse;
  onClose?: () => void;
  onNewReservation?: () => void;
}

const ReservationStatus: React.FC<ReservationStatusProps> = ({
  reservation,
  onClose,
  onNewReservation,
}) => {
  const getStatusIcon = () => {
    switch (reservation.status) {
      case 'confirmed':
        return '✅';
      case 'initiated':
        return '📞';
      case 'failed':
        return '❌';
      default:
        return '⏳';
    }
  };

  const getStatusColor = () => {
    switch (reservation.status) {
      case 'confirmed':
        return 'text-green-800 bg-green-50 border-green-200';
      case 'initiated':
        return 'text-blue-800 bg-blue-50 border-blue-200';
      case 'failed':
        return 'text-red-800 bg-red-50 border-red-200';
      default:
        return 'text-gray-800 bg-gray-50 border-gray-200';
    }
  };

  const getStatusTitle = () => {
    switch (reservation.status) {
      case 'confirmed':
        return 'Reservation Confirmed!';
      case 'initiated':
        return 'Voice Call Initiated';
      case 'failed':
        return 'Reservation Failed';
      default:
        return 'Processing Reservation';
    }
  };

  const getStatusMessage = () => {
    switch (reservation.status) {
      case 'confirmed':
        return 'Your reservation has been successfully confirmed. You should receive a confirmation email shortly.';
      case 'initiated':
        return 'We\'ve initiated a voice call to the restaurant using Nova Sonic. You will receive a callback with confirmation details.';
      case 'failed':
        return 'We were unable to complete your reservation. Please try again or contact the restaurant directly.';
      default:
        return 'Your reservation is being processed...';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Reservation Status</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className={`border rounded-lg p-4 ${getStatusColor()}`}>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getStatusIcon()}</span>
              <div>
                <h3 className="font-semibold">{getStatusTitle()}</h3>
                <p className="text-sm mt-1">{getStatusMessage()}</p>
              </div>
            </div>
          </div>

          {/* Reservation Details */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Reservation Details</h4>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Restaurant:</span>
                <span className="font-medium">{reservation.restaurant_name}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{formatDate(reservation.details.date)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{reservation.details.time}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Party Size:</span>
                <span className="font-medium">
                  {reservation.details.party_size} {reservation.details.party_size === 1 ? 'person' : 'people'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Contact:</span>
                <span className="font-medium">{reservation.details.contact_name}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Method:</span>
                <span className="font-medium capitalize">
                  {reservation.method === 'online' ? 'Online Booking' : 'Voice Call'}
                </span>
              </div>
            </div>

            {/* Confirmation Number */}
            {reservation.confirmation_number && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-green-700 font-medium">Confirmation Number:</span>
                  <span className="text-green-800 font-mono font-bold">
                    {reservation.confirmation_number}
                  </span>
                </div>
                <p className="text-green-600 text-sm mt-1">
                  Please save this number for your records
                </p>
              </div>
            )}

            {/* Call ID for Voice Reservations */}
            {reservation.call_id && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-blue-700 font-medium">Call ID:</span>
                  <span className="text-blue-800 font-mono font-bold">
                    {reservation.call_id}
                  </span>
                </div>
                <p className="text-blue-600 text-sm mt-1">
                  Reference this ID when the restaurant calls you back
                </p>
              </div>
            )}

            {/* Special Requests */}
            {reservation.details.special_requests && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Special Requests:</h5>
                <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
                  {reservation.details.special_requests}
                </p>
              </div>
            )}

            {/* Additional Message */}
            {reservation.message && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">{reservation.message}</p>
              </div>
            )}

            {/* Error Message */}
            {reservation.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{reservation.error}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {reservation.status === 'confirmed' && onNewReservation && (
              <button
                onClick={onNewReservation}
                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md font-medium hover:bg-primary-700 transition-colors"
              >
                Make Another Reservation
              </button>
            )}
            
            {reservation.status === 'failed' && onNewReservation && (
              <button
                onClick={onNewReservation}
                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md font-medium hover:bg-primary-700 transition-colors"
              >
                Try Again
              </button>
            )}
            
            {onClose && (
              <button
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            )}
          </div>

          {/* Voice Reservation Info */}
          {reservation.method === 'voice_call' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">ℹ️</span>
                <div className="text-blue-800 text-sm">
                  <p className="font-medium mb-1">About Voice Reservations:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Our AI assistant will call the restaurant on your behalf</li>
                    <li>You'll receive a callback with confirmation details</li>
                    <li>The restaurant may call you directly to confirm</li>
                    <li>Voice calls are powered by Nova Sonic technology</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationStatus;