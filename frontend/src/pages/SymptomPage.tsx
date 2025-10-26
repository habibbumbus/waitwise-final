import React, { useState } from 'react';
import { ClipboardList, AlertCircle, CheckCircle } from 'lucide-react';
import { classifySymptoms, getUrgencyColor, getUrgencyLabel } from '../lib/triage';
import type { UrgencyLevel } from '../lib/triage';

interface SymptomPageProps {
  onComplete: (symptoms: string, urgency: UrgencyLevel) => void;
  onBack: () => void;
}

const commonSymptoms = [
  'Fever',
  'Cough',
  'Sore throat',
  'Headache',
  'Nausea',
  'Abdominal pain',
  'Back pain',
  'Skin rash',
  'Minor cut',
  'Sprain',
];

export function SymptomPage({ onComplete, onBack }: SymptomPageProps) {
  const [symptoms, setSymptoms] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [urgency, setUrgency] = useState<UrgencyLevel | null>(null);

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleAnalyze = () => {
    const allSymptoms = [...selectedSymptoms, symptoms].filter(Boolean).join(', ');
    const urgencyLevel = classifySymptoms(allSymptoms);
    setUrgency(urgencyLevel);
  };

  const handleSubmit = () => {
    if (urgency) {
      const allSymptoms = [...selectedSymptoms, symptoms].filter(Boolean).join(', ');
      onComplete(allSymptoms, urgency);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <ClipboardList className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
            Symptom Assessment
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Help us understand your condition for better care prioritization
          </p>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Common Symptoms
            </label>
            <div className="grid grid-cols-2 gap-3">
              {commonSymptoms.map((symptom) => (
                <button
                  key={symptom}
                  type="button"
                  onClick={() => handleSymptomToggle(symptom)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    selectedSymptoms.includes(symptom)
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {symptom}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Symptoms or Details
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe any other symptoms or provide more details..."
            />
          </div>

          {urgency && (
            <div className={`mb-6 p-4 rounded-lg border-2 ${getUrgencyColor(urgency)}`}>
              <div className="flex items-center gap-3">
                {urgency === 'high' ? (
                  <AlertCircle className="w-6 h-6" />
                ) : (
                  <CheckCircle className="w-6 h-6" />
                )}
                <div>
                  <h3 className="font-semibold">
                    Priority Level: {getUrgencyLabel(urgency)}
                  </h3>
                  <p className="text-sm mt-1">
                    {urgency === 'high' && 'Your symptoms indicate urgent care may be needed. You will be prioritized in the queue.'}
                    {urgency === 'medium' && 'Your symptoms require medical attention. Expected moderate wait time.'}
                    {urgency === 'low' && 'Your symptoms can be addressed during routine care. Standard queue time applies.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {!urgency ? (
              <>
                <button
                  onClick={onBack}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={selectedSymptoms.length === 0 && !symptoms.trim()}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Analyze Symptoms
                </button>
              </>
            ) : (
              <button
                onClick={handleSubmit}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Continue to Find Clinics
              </button>
            )}
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This is not a medical diagnosis. If you are experiencing a medical emergency, please call 911 immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
