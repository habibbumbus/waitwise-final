import React, { useState, useEffect } from 'react';
import { Users, Clock, Bell, X, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type User = Database['public']['Tables']['users']['Row'];
type Clinic = Database['public']['Tables']['clinics']['Row'];
type Appointment = Database['public']['Tables']['appointments']['Row'];

interface QueuePageProps {
  user: User;
  clinic: Clinic;
  appointment: Appointment;
  onComplete: () => void;
  onCancel: () => void;
}

export function QueuePage({ user, clinic, appointment: initialAppointment, onComplete, onCancel }: QueuePageProps) {
  const [appointment, setAppointment] = useState(initialAppointment);
  const [showNotification, setShowNotification] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [estimatedWait, setEstimatedWait] = useState(0);

  useEffect(() => {
    loadAppointmentData();
    const interval = setInterval(loadAppointmentData, 5000);
    return () => clearInterval(interval);
  }, [appointment.id]);

  const loadAppointmentData = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointment.id)
        .single();

      if (error) throw error;
      if (data) {
        setAppointment(data);

        if (data.position <= 2 && data.status === 'queued') {
          setShowNotification(true);
        }

        if (data.status === 'completed') {
          setTimeout(() => {
            onComplete();
          }, 2000);
        }
      }
    } catch (err) {
      console.error('Error loading appointment:', err);
    }
  };

  useEffect(() => {
    const avgTimePerPatient = 15;
    setEstimatedWait(appointment.position * avgTimePerPatient);
  }, [appointment.position]);

  const handleCancel = async () => {
    try {
      await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointment.id);

      await supabase
        .from('clinics')
        .update({ active_patients: Math.max(0, clinic.active_patients - 1) })
        .eq('id', clinic.id);

      const { data: queuedAppointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('clinic_id', clinic.id)
        .eq('status', 'queued')
        .gt('position', appointment.position)
        .order('position', { ascending: true });

      if (queuedAppointments && queuedAppointments.length > 0) {
        for (const appt of queuedAppointments) {
          await supabase
            .from('appointments')
            .update({ position: appt.position - 1 })
            .eq('id', appt.id);
        }
      }

      onCancel();
    } catch (err) {
      console.error('Error cancelling appointment:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'queued':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'notified':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'confirmed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'completed':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {showNotification && (
          <div className="bg-orange-50 border-2 border-orange-500 rounded-lg p-4 mb-6 animate-pulse">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-orange-600" />
              <div>
                <h3 className="font-bold text-orange-900">Almost Your Turn!</h3>
                <p className="text-orange-700">Please be ready. You'll be called soon.</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Queue Status</h1>
            <p className="text-gray-600">{clinic.name}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white text-center">
              <p className="text-blue-100 mb-2">Your Position</p>
              <p className="text-5xl font-bold">{appointment.position}</p>
              <p className="text-blue-100 mt-2 text-sm">in queue</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white text-center">
              <p className="text-green-100 mb-2">Estimated Wait</p>
              <p className="text-5xl font-bold">{estimatedWait}</p>
              <p className="text-green-100 mt-2 text-sm">minutes</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white text-center">
              <p className="text-purple-100 mb-2">People Ahead</p>
              <p className="text-5xl font-bold">{Math.max(0, appointment.position - 1)}</p>
              <p className="text-purple-100 mt-2 text-sm">patients</p>
            </div>
          </div>

          <div className={`border-2 rounded-lg p-4 mb-6 ${getStatusColor(appointment.status)}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Status: {appointment.status.toUpperCase()}</p>
                <p className="text-sm mt-1">
                  {appointment.status === 'queued' && 'Waiting in queue'}
                  {appointment.status === 'notified' && 'Get ready - almost your turn!'}
                  {appointment.status === 'confirmed' && 'Please proceed to the clinic'}
                  {appointment.status === 'completed' && 'Visit completed'}
                </p>
              </div>
              {appointment.status === 'completed' && (
                <CheckCircle className="w-8 h-8" />
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Appointment Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Patient Name:</span>
                <span className="font-medium text-gray-900">{user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium text-gray-900">{user.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Priority Level:</span>
                <span className="font-medium text-gray-900 capitalize">{user.urgency_level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Booked At:</span>
                <span className="font-medium text-gray-900">
                  {new Date(appointment.created_at).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">SMS Notifications Active</h4>
                <p className="text-sm text-blue-700">
                  You'll receive text messages when your position changes or when it's your turn.
                  You can leave this page and return anytime.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowCancelModal(true)}
            className="w-full bg-red-50 text-red-600 border-2 border-red-200 py-3 rounded-lg font-semibold hover:bg-red-100 transition-colors"
          >
            Cancel Appointment
          </button>
        </div>
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">Cancel Appointment?</h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel your appointment? Your spot will be given to the next patient in line.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Keep Appointment
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
