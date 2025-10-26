import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Users, Navigation } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Clinic = Database['public']['Tables']['clinics']['Row'];

interface ClinicDiscoveryPageProps {
  onSelectClinic: (clinic: Clinic) => void;
  onBack: () => void;
}

export function ClinicDiscoveryPage({ onSelectClinic, onBack }: ClinicDiscoveryPageProps) {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    loadClinics();
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setUserLocation({ lat: 43.6532, lon: -79.3832 });
        }
      );
    } else {
      setUserLocation({ lat: 43.6532, lon: -79.3832 });
    }
  };

  const loadClinics = async () => {
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .order('current_wait', { ascending: true });

      if (error) throw error;
      setClinics(data || []);
    } catch (err) {
      console.error('Error loading clinics:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getWaitTimeColor = (minutes: number) => {
    if (minutes <= 15) return 'text-green-600 bg-green-50';
    if (minutes <= 30) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const sortedClinics = userLocation
    ? [...clinics].sort((a, b) => {
        const distA = calculateDistance(userLocation.lat, userLocation.lon, a.latitude, a.longitude);
        const distB = calculateDistance(userLocation.lat, userLocation.lon, b.latitude, b.longitude);
        return distA - distB;
      })
    : clinics;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading nearby clinics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Find a Clinic</h1>
          <p className="text-gray-600">
            Choose from nearby clinics based on wait times and distance
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Navigation className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Your Location</h2>
            </div>
            <p className="text-gray-600 mb-4">
              {userLocation
                ? `Showing clinics near ${userLocation.lat.toFixed(4)}, ${userLocation.lon.toFixed(4)}`
                : 'Location access denied. Showing all clinics.'}
            </p>
            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
              <MapPin className="w-12 h-12 text-gray-400" />
            </div>
          </div>

          <div className="space-y-4">
            {sortedClinics.map((clinic) => {
              const distance = userLocation
                ? calculateDistance(userLocation.lat, userLocation.lon, clinic.latitude, clinic.longitude)
                : null;

              return (
                <div
                  key={clinic.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => onSelectClinic(clinic)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {clinic.name}
                      </h3>
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        {clinic.address}
                      </div>
                      {distance !== null && (
                        <p className="text-sm text-gray-500 mt-1">
                          {distance.toFixed(1)} km away
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className={`px-3 py-2 rounded-lg ${getWaitTimeColor(clinic.current_wait)}`}>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-semibold">{clinic.current_wait} min</span>
                      </div>
                      <p className="text-xs mt-1">Wait Time</p>
                    </div>

                    <div className="bg-gray-50 px-3 py-2 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Users className="w-4 h-4" />
                        <span className="font-semibold">{clinic.active_patients}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">In Queue</p>
                    </div>

                    <div className="bg-blue-50 px-3 py-2 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-700">
                        <Users className="w-4 h-4" />
                        <span className="font-semibold">{clinic.capacity}</span>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">Capacity</p>
                    </div>
                  </div>

                  <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                    Book Appointment
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
