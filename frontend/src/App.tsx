import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPage } from './pages/LandingPage';
import { RegisterPage } from './pages/RegisterPage';
import { SymptomPage } from './pages/SymptomPage';
import { ClinicDiscoveryPage } from './pages/ClinicDiscoveryPage';
import { BookingPage } from './pages/BookingPage';
import { QueuePage } from './pages/QueuePage';
import { PostVisitPage } from './pages/PostVisitPage';
import { triage } from './lib/api';
import type { UrgencyLevel } from './lib/triage';

type Page = 'landing' | 'register' | 'symptoms' | 'clinics' | 'booking' | 'queue' | 'post-visit';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const {
    currentUser,
    setCurrentUser,
    selectedClinic,
    setSelectedClinic,
    currentAppointment,
    setCurrentAppointment,
    symptoms,
    setSymptoms,
  } = useApp();

  const handleGetStarted = () => {
    setCurrentPage('register');
  };

  const handleRegister = async (user: any) => {
    setCurrentUser(user);
    setCurrentPage('symptoms');
  };

  const handleSymptomsComplete = async (symptomText: string, urgency: UrgencyLevel) => {
    setSymptoms(symptomText);
      if (currentUser) {
        // use provided urgency immediately for a snappy UI update
        setCurrentUser({ ...currentUser, urgency_level: urgency });
        try {
          const res = await triage({ user_id: Number(currentUser.id), symptoms: symptomText });
          setCurrentUser({ ...currentUser, urgency_level: res.urgency_level });
        } catch (err) {
          // fallback: keep local state
          console.error('Triage error', err);
        }
      }
    setCurrentPage('clinics');
  };

  const handleSelectClinic = (clinic: any) => {
    setSelectedClinic(clinic);
    setCurrentPage('booking');
  };

  const handleBookingComplete = (appointment: any) => {
    setCurrentAppointment(appointment);
    setCurrentPage('queue');
  };

  const handleVisitComplete = () => {
    setCurrentPage('post-visit');
  };

  const handleCancelAppointment = () => {
    setCurrentAppointment(null);
    setSelectedClinic(null);
    setCurrentPage('clinics');
  };

  const handleReturnHome = () => {
    setCurrentUser(null);
    setSelectedClinic(null);
    setCurrentAppointment(null);
    setSymptoms('');
    setCurrentPage('landing');
  };

  return (
    <div className="min-h-screen">
      {currentPage === 'landing' && (
        <LandingPage onGetStarted={handleGetStarted} />
      )}

      {currentPage === 'register' && (
        <RegisterPage
          onRegister={handleRegister}
          onBack={handleReturnHome}
        />
      )}

      {currentPage === 'symptoms' && (
        <SymptomPage
          onComplete={handleSymptomsComplete}
          onBack={() => setCurrentPage('register')}
        />
      )}

      {currentPage === 'clinics' && (
        <ClinicDiscoveryPage
          onSelectClinic={handleSelectClinic}
          onBack={() => setCurrentPage('symptoms')}
        />
      )}

      {currentPage === 'booking' && currentUser && selectedClinic && (
        <BookingPage
          user={currentUser}
          clinic={selectedClinic}
          symptoms={symptoms}
          onBookingComplete={handleBookingComplete}
          onBack={() => setCurrentPage('clinics')}
        />
      )}

      {currentPage === 'queue' && currentUser && selectedClinic && currentAppointment && (
        <QueuePage
          user={currentUser}
          clinic={selectedClinic}
          appointment={currentAppointment}
          onComplete={handleVisitComplete}
          onCancel={handleCancelAppointment}
        />
      )}

      {currentPage === 'post-visit' && currentUser && selectedClinic && (
        <PostVisitPage
          user={currentUser}
          clinic={selectedClinic}
          symptoms={symptoms}
          onReturnHome={handleReturnHome}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
