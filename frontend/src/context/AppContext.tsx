/*
  This file intentionally exports a context and a hook. The react-refresh rule
  (`react-refresh/only-export-components`) warns when files export non-component
  values because Fast Refresh works best when files only export components.
  It's safe here to disable that rule for this file.
*/
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Database } from '../lib/database.types';

type User = Database['public']['Tables']['users']['Row'];
type Clinic = Database['public']['Tables']['clinics']['Row'];
type Appointment = Database['public']['Tables']['appointments']['Row'];

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  selectedClinic: Clinic | null;
  setSelectedClinic: (clinic: Clinic | null) => void;
  currentAppointment: Appointment | null;
  setCurrentAppointment: (appointment: Appointment | null) => void;
  symptoms: string;
  setSymptoms: (symptoms: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null);
  const [symptoms, setSymptoms] = useState<string>('');

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        selectedClinic,
        setSelectedClinic,
        currentAppointment,
        setCurrentAppointment,
        symptoms,
        setSymptoms,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
