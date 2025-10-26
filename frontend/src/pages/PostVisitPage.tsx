import React from 'react';
import { FileText, Download, Mail, CheckCircle, Home } from 'lucide-react';
import type { Database } from '../lib/database.types';

type User = Database['public']['Tables']['users']['Row'];
type Clinic = Database['public']['Tables']['clinics']['Row'];

interface PostVisitPageProps {
  user: User;
  clinic: Clinic;
  symptoms: string;
  onReturnHome: () => void;
}

export function PostVisitPage({ user, clinic, symptoms, onReturnHome }: PostVisitPageProps) {
  const visitDate = new Date();
  const diagnosisText = 'Patient presented with reported symptoms. Examination completed. Prescription and follow-up care instructions provided.';
  const prescriptionText = 'Take prescribed medication as directed. Rest and hydration recommended. Follow up if symptoms persist beyond 7 days.';

  const handleDownloadPDF = () => {
    const pdfContent = `
VISIT SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Patient Information:
Name: ${user.name}
Date: ${visitDate.toLocaleDateString()}
Time: ${visitDate.toLocaleTimeString()}

Clinic Information:
${clinic.name}
${clinic.address}

Presenting Symptoms:
${symptoms}

Diagnosis:
${diagnosisText}

Treatment Plan:
${prescriptionText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is a simulated document for demonstration purposes.
    `;

    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visit-summary-${visitDate.toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleEmailSummary = () => {
    alert(`Visit summary sent to ${user.email}\n\nIn production, this would trigger an actual email with PDF attachment.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Visit Complete</h1>
            <p className="text-gray-600">Thank you for using WaitWise Health</p>
          </div>

          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <FileText className="w-6 h-6 text-green-600 mt-1" />
              <div>
                <h3 className="font-semibold text-green-900 mb-1">Your Visit Summary is Ready</h3>
                <p className="text-green-700">
                  Download your visit summary and prescription information below.
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Visit Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="font-medium text-gray-900">
                    {visitDate.toLocaleDateString()} at {visitDate.toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Clinic</p>
                  <p className="font-medium text-gray-900">{clinic.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Patient</p>
                  <p className="font-medium text-gray-900">{user.name}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Presenting Symptoms</h3>
              <p className="text-gray-700">{symptoms}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Assessment</h3>
            <p className="text-gray-700 mb-4">{diagnosisText}</p>

            <h3 className="font-semibold text-gray-900 mb-3">Treatment & Prescriptions</h3>
            <p className="text-gray-700">{prescriptionText}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-900 mb-2">Important Notes</h4>
            <ul className="space-y-1 text-sm text-blue-700">
              <li>• Keep this summary for your medical records</li>
              <li>• Follow all prescribed treatment instructions</li>
              <li>• Contact your healthcare provider if symptoms worsen</li>
              <li>• Schedule follow-up appointments as recommended</li>
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Download Summary
            </button>

            <button
              onClick={handleEmailSummary}
              className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              <Mail className="w-5 h-5" />
              Email to Me
            </button>
          </div>

          <button
            onClick={onReturnHome}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            <Home className="w-5 h-5" />
            Return to Home
          </button>

          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-2">How was your experience?</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className="text-3xl text-gray-300 hover:text-yellow-400 transition-colors"
                  onClick={() => alert(`Thank you for rating us ${star} stars!`)}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-gray-900 mb-3">About This Demo</h3>
          <p className="text-gray-600 text-sm">
            This is a demonstration of the WaitWise Health platform. In a production environment,
            this would include actual medical assessments, real prescriptions, and secure document
            delivery to your patient portal. All information shown here is simulated for
            demonstration purposes only.
          </p>
        </div>
      </div>
    </div>
  );
}
