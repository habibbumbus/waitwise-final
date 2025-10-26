import { useState } from 'react';
import { Calendar, Clock, MapPin, CheckCircle } from 'lucide-react';
import { bookAppointment, getAppointment } from '../lib/api';
import type { Database } from '../lib/database.types';

type User = Database['public']['Tables']['users']['Row'];
type Clinic = Database['public']['Tables']['clinics']['Row'];
type Appointment = Database['public']['Tables']['appointments']['Row'];

interface BookingPageProps {
  user: User;
  clinic: Clinic;
  symptoms: string;
  onBookingComplete: (appointment: Appointment) => void;
  onBack: () => void;
}

export function BookingPage({ user, clinic, symptoms, onBookingComplete, onBack }: BookingPageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleBooking = async () => {
    setLoading(true);
    setError('');

    try {
      try {
  const res = await bookAppointment(Number(user.id), Number(clinic.id));
        setShowConfirmation(true);
        // try to fetch the created appointment from backend
        if (res && res.appointment_id) {
          const appointment = await getAppointment(res.appointment_id);
          setTimeout(() => {
            if (appointment) onBookingComplete(appointment as any);
          }, 1200);
        } else {
          // fallback: build a minimal appointment object
          const appointment = {
            id: res.appointment_id,
            position: res.position,
            status: res.status,
            created_at: new Date().toISOString(),
            user_id: user.id,
            clinic_id: clinic.id,
          };
          setTimeout(() => onBookingComplete(appointment as any), 1200);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to book appointment');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-4">
            You'll receive SMS notifications about your queue status
          </p>
          <div className="animate-pulse text-blue-600">Redirecting to queue...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-700 font-medium mb-6"
          >
            ← Back to Clinics
          </button>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Confirm Booking</h2>
          <p className="text-gray-600 mb-8">
            Review your appointment details before confirming
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Clinic Details
              </h3>
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">{clinic.name}</p>
                <p className="text-gray-600">{clinic.address}</p>
                <div className="flex gap-4 mt-4">
                  <div className="bg-white px-4 py-2 rounded-lg">
                    <p className="text-sm text-gray-500">Current Wait</p>
                    <p className="text-xl font-bold text-blue-600">{clinic.current_wait} min</p>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-lg">
                    <p className="text-sm text-gray-500">In Queue</p>
                    <p className="text-xl font-bold text-gray-900">{clinic.active_patients}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                Patient Information
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-900">{user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium text-gray-900">{user.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Priority:</span>
                  <span className="font-medium text-gray-900 capitalize">{user.urgency_level}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                Symptoms
              </h3>
              <p className="text-gray-700">{symptoms || 'No symptoms recorded'}</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• You'll receive an SMS confirmation</li>
                <li>• Track your queue position in real-time</li>
                <li>• Get notified when it's almost your turn</li>
                <li>• Receive another notification when ready to see the doctor</li>
              </ul>
            </div>

            <button
              onClick={handleBooking}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
