import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import InfoPortal from './components/InfoPortal';
import PatientPortal from './components/PatientPortal';
import StaffPortal from './components/StaffPortal';
import { Patient, Appointment, LM6Assessment, LabResult } from './types';
import {
  INITIAL_PATIENTS,
  INITIAL_APPOINTMENTS,
  INITIAL_ASSESSMENTS,
  INITIAL_RESULTS
} from './data';
import { Heart, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'info' | 'patient' | 'staff'>('info');

  // Core Database States synced with localStorage
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [assessments, setAssessments] = useState<LM6Assessment[]>([]);
  const [results, setResults] = useState<LabResult[]>([]);

  // Auth States
  const [loggedInPatient, setLoggedInPatient] = useState<Patient | null>(null);
  const [isStaffLoggedIn, setIsStaffLoggedIn] = useState(false);

  // Load from LocalStorage or initialize with rich realistic mock data
  useEffect(() => {
    const localPatients = localStorage.getItem('ubuh_patients');
    const localAppointments = localStorage.getItem('ubuh_appointments');
    const localAssessments = localStorage.getItem('ubuh_assessments');
    const localResults = localStorage.getItem('ubuh_results');

    if (localPatients) setPatients(JSON.parse(localPatients));
    else {
      setPatients(INITIAL_PATIENTS);
      localStorage.setItem('ubuh_patients', JSON.stringify(INITIAL_PATIENTS));
    }

    if (localAppointments) setAppointments(JSON.parse(localAppointments));
    else {
      setAppointments(INITIAL_APPOINTMENTS);
      localStorage.setItem('ubuh_appointments', JSON.stringify(INITIAL_APPOINTMENTS));
    }

    if (localAssessments) setAssessments(JSON.parse(localAssessments));
    else {
      setAssessments(INITIAL_ASSESSMENTS);
      localStorage.setItem('ubuh_assessments', JSON.stringify(INITIAL_ASSESSMENTS));
    }

    if (localResults) setResults(JSON.parse(localResults));
    else {
      setResults(INITIAL_RESULTS);
      localStorage.setItem('ubuh_results', JSON.stringify(INITIAL_RESULTS));
    }
  }, []);

  // Sync state helpers
  const handleRegisterPatient = (newPatient: Patient) => {
    const updated = [...patients, newPatient];
    setPatients(updated);
    localStorage.setItem('ubuh_patients', JSON.stringify(updated));
  };

  const handleUpdatePatient = (updatedPatient: Patient) => {
    const updated = patients.map((p) => (p.id === updatedPatient.id ? updatedPatient : p));
    setPatients(updated);
    localStorage.setItem('ubuh_patients', JSON.stringify(updated));
    if (loggedInPatient && loggedInPatient.id === updatedPatient.id) {
      setLoggedInPatient(updatedPatient);
    }
  };

  const handleBookAppointment = (newApp: Appointment) => {
    const updated = [...appointments, newApp];
    setAppointments(updated);
    localStorage.setItem('ubuh_appointments', JSON.stringify(updated));
  };

  const handleSaveAssessment = (newAs: LM6Assessment) => {
    const updated = [...assessments, newAs];
    setAssessments(updated);
    localStorage.setItem('ubuh_assessments', JSON.stringify(updated));
  };

  const handleSaveResult = (newRes: LabResult) => {
    // Check if result for this appointment already exists (editing)
    const existingIdx = results.findIndex(r => r.appointmentId === newRes.appointmentId);
    let updated: LabResult[];
    if (existingIdx > -1) {
      updated = [...results];
      updated[existingIdx] = newRes;
    } else {
      updated = [...results, newRes];
    }
    setResults(updated);
    localStorage.setItem('ubuh_results', JSON.stringify(updated));
  };

  const handleUpdateAppointmentStatus = (id: string, status: 'pending' | 'completed' | 'cancelled' | 'pending_results') => {
    const updated = appointments.map((ap) => {
      if (ap.id === id) {
        return { ...ap, status };
      }
      return ap;
    });
    setAppointments(updated);
    localStorage.setItem('ubuh_appointments', JSON.stringify(updated));
  };

  const handleUpdateAppointment = (updatedApp: Appointment) => {
    const updated = appointments.map((ap) => (ap.id === updatedApp.id ? updatedApp : ap));
    setAppointments(updated);
    localStorage.setItem('ubuh_appointments', JSON.stringify(updated));
  };

  const handlePatientLogout = () => {
    setLoggedInPatient(null);
  };

  const handleStaffLogout = () => {
    setIsStaffLoggedIn(false);
  };

  const handleDeletePatient = (patientId: string) => {
    // Remove patient from directory
    const updatedPatients = patients.filter((p) => p.id !== patientId);
    setPatients(updatedPatients);
    localStorage.setItem('ubuh_patients', JSON.stringify(updatedPatients));

    // Remove appointments
    const updatedAppointments = appointments.filter((app) => app.patientId !== patientId);
    setAppointments(updatedAppointments);
    localStorage.setItem('ubuh_appointments', JSON.stringify(updatedAppointments));

    // Remove assessments
    const updatedAssessments = assessments.filter((as) => as.patientId !== patientId);
    setAssessments(updatedAssessments);
    localStorage.setItem('ubuh_assessments', JSON.stringify(updatedAssessments));

    // Remove results
    const updatedResults = results.filter((res) => res.patientId !== patientId);
    setResults(updatedResults);
    localStorage.setItem('ubuh_results', JSON.stringify(updatedResults));

    // Log out if the current logged in patient was deleted
    if (loggedInPatient && loggedInPatient.id === patientId) {
      setLoggedInPatient(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header & Nav */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isLoggedIn={!!loggedInPatient}
        loggedInPatientName={loggedInPatient?.name}
        onLogout={handlePatientLogout}
        isStaffLoggedIn={isStaffLoggedIn}
        onStaffLogout={handleStaffLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="space-y-12">
          {activeTab === 'info' && <InfoPortal />}

          {activeTab === 'patient' && (
            <PatientPortal
              patients={patients}
              appointments={appointments}
              assessments={assessments}
              results={results}
              onRegister={handleRegisterPatient}
              onBookAppointment={handleBookAppointment}
              onSaveAssessment={handleSaveAssessment}
              loggedInPatient={loggedInPatient}
              setLoggedInPatient={setLoggedInPatient}
            />
          )}

          {activeTab === 'staff' && (
            <StaffPortal
              patients={patients}
              appointments={appointments}
              results={results}
              assessments={assessments}
              onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
              onUpdateAppointment={handleUpdateAppointment}
              onSaveResult={handleSaveResult}
              isStaffLoggedIn={isStaffLoggedIn}
              setIsStaffLoggedIn={setIsStaffLoggedIn}
              onUpdatePatient={handleUpdatePatient}
              onDeletePatient={handleDeletePatient}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#4A6741] text-white py-8 border-t border-[#3d5635] mt-12 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <p className="text-sm font-bold tracking-wide">โรงพยาบาลมหาวิทยาลัยอุบลราชธานี (UBUH)</p>
            <p className="text-xs text-green-100">
              ระบบศูนย์ตรวจสุขภาพออนไลน์ประจำปีและส่งเสริมเวชศาสตร์วิถีชีวิต
            </p>
          </div>
          <p className="text-xs text-green-200/80 font-mono">
            &copy; {new Date().getFullYear()} UBUH Health Checkup Center. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
