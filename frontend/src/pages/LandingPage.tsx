import { Clock, MapPin, Bell, FileText } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Clock className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            WaitWise Health
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Reduce healthcare wait times with smart queue management. Book appointments, track your position, and get notified when it's your turn.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Find Clinics</h3>
            <p className="text-gray-600">
              Discover nearby walk-in clinics with real-time wait times
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Triage</h3>
            <p className="text-gray-600">
              Quick symptom assessment to prioritize urgent care needs
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Bell className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Updates</h3>
            <p className="text-gray-600">
              Get SMS notifications when your appointment is ready
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Digital Records</h3>
            <p className="text-gray-600">
              Receive visit summaries and prescriptions instantly
            </p>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={onGetStarted}
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Get Started
          </button>
          <p className="text-sm text-gray-500 mt-4">
            No appointment needed. Walk in and get care faster.
          </p>
        </div>

        <div className="mt-16 bg-white rounded-lg p-8 shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Register & Assess</h3>
              <p className="text-gray-600">Create your profile and describe your symptoms for triage</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Choose & Book</h3>
              <p className="text-gray-600">Select a nearby clinic and reserve your spot in the queue</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Track & Visit</h3>
              <p className="text-gray-600">Monitor your queue position and arrive when notified</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
