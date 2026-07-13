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
import { db } from './lib/firebase';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';

export default function App() {
  const [activeTab, setActiveTab] = useState<'info' | 'patient' | 'staff'>('info');

  // Core Database States synced with Firestore
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [assessments, setAssessments] = useState<LM6Assessment[]>([]);
  const [results, setResults] = useState<LabResult[]>([]);

  // Auth States
  const [loggedInPatient, setLoggedInPatient] = useState<Patient | null>(null);
  const [isStaffLoggedIn, setIsStaffLoggedIn] = useState(false);

  // Load from Firestore in real-time
  useEffect(() => {
    // 1. Subscribe to Patients
    const unsubscribePatients = onSnapshot(collection(db, 'patients'), async (snapshot) => {
      if (snapshot.empty) {
        try {
          const batch = writeBatch(db);
          INITIAL_PATIENTS.forEach((p) => {
            batch.set(doc(db, 'patients', p.id), p);
          });
          await batch.commit();
        } catch (e) {
          console.error("Error seeding initial patients: ", e);
        }
      } else {
        const list: Patient[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Patient);
        });
        setPatients(list);
      }
    }, (error) => {
      console.error("Error fetching patients: ", error);
    });

    // 2. Subscribe to Appointments
    const unsubscribeAppointments = onSnapshot(collection(db, 'appointments'), async (snapshot) => {
      if (snapshot.empty) {
        try {
          const batch = writeBatch(db);
          INITIAL_APPOINTMENTS.forEach((ap) => {
            batch.set(doc(db, 'appointments', ap.id), ap);
          });
          await batch.commit();
        } catch (e) {
          console.error("Error seeding initial appointments: ", e);
        }
      } else {
        const list: Appointment[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Appointment);
        });
        setAppointments(list);
      }
    }, (error) => {
      console.error("Error fetching appointments: ", error);
    });

    // 3. Subscribe to Assessments
    const unsubscribeAssessments = onSnapshot(collection(db, 'assessments'), async (snapshot) => {
      if (snapshot.empty) {
        try {
          const batch = writeBatch(db);
          INITIAL_ASSESSMENTS.forEach((as) => {
            batch.set(doc(db, 'assessments', as.id), as);
          });
          await batch.commit();
        } catch (e) {
          console.error("Error seeding initial assessments: ", e);
        }
      } else {
        const list: LM6Assessment[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as LM6Assessment);
        });
        setAssessments(list);
      }
    }, (error) => {
      console.error("Error fetching assessments: ", error);
    });

    // 4. Subscribe to Results
    const unsubscribeResults = onSnapshot(collection(db, 'results'), async (snapshot) => {
      if (snapshot.empty) {
        try {
          const batch = writeBatch(db);
          INITIAL_RESULTS.forEach((res) => {
            batch.set(doc(db, 'results', res.appointmentId), res);
          });
          await batch.commit();
        } catch (e) {
          console.error("Error seeding initial results: ", e);
        }
      } else {
        const list: LabResult[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as LabResult);
        });
        setResults(list);
      }
    }, (error) => {
      console.error("Error fetching results: ", error);
    });

    return () => {
      unsubscribePatients();
      unsubscribeAppointments();
      unsubscribeAssessments();
      unsubscribeResults();
    };
  }, []);

  // Update loggedInPatient in real-time if their database details change
  useEffect(() => {
    if (loggedInPatient) {
      const updated = patients.find((p) => p.id === loggedInPatient.id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(loggedInPatient)) {
        setLoggedInPatient(updated);
      }
    }
  }, [patients, loggedInPatient]);

  // Sync state helpers to Firestore
  const handleRegisterPatient = async (newPatient: Patient) => {
    try {
      await setDoc(doc(db, 'patients', newPatient.id), newPatient);
    } catch (e) {
      console.error("Error registering patient: ", e);
    }
  };

  const handleUpdatePatient = async (updatedPatient: Patient) => {
    try {
      await setDoc(doc(db, 'patients', updatedPatient.id), updatedPatient);
      if (loggedInPatient && loggedInPatient.id === updatedPatient.id) {
        setLoggedInPatient(updatedPatient);
      }
    } catch (e) {
      console.error("Error updating patient: ", e);
    }
  };

  const handleBookAppointment = async (newApp: Appointment) => {
    try {
      await setDoc(doc(db, 'appointments', newApp.id), newApp);
    } catch (e) {
      console.error("Error booking appointment: ", e);
    }
  };

  const handleSaveAssessment = async (newAs: LM6Assessment) => {
    try {
      await setDoc(doc(db, 'assessments', newAs.id), newAs);
    } catch (e) {
      console.error("Error saving assessment: ", e);
    }
  };

  const handleSaveResult = async (newRes: LabResult) => {
    try {
      await setDoc(doc(db, 'results', newRes.appointmentId), newRes);
    } catch (e) {
      console.error("Error saving result: ", e);
    }
  };

  const handleUpdateAppointmentStatus = async (id: string, status: 'pending' | 'completed' | 'cancelled' | 'pending_results') => {
    const ap = appointments.find(a => a.id === id);
    if (ap) {
      try {
        await setDoc(doc(db, 'appointments', id), { ...ap, status });
      } catch (e) {
        console.error("Error updating status: ", e);
      }
    }
  };

  const handleUpdateAppointment = async (updatedApp: Appointment) => {
    try {
      await setDoc(doc(db, 'appointments', updatedApp.id), updatedApp);
    } catch (e) {
      console.error("Error updating appointment: ", e);
    }
  };

  const handlePatientLogout = () => {
    setLoggedInPatient(null);
  };

  const handleStaffLogout = () => {
    setIsStaffLoggedIn(false);
  };

  const handleDeletePatient = async (patientId: string) => {
    try {
      // Remove patient from directory
      await deleteDoc(doc(db, 'patients', patientId));

      // Remove appointments
      const apptsToDelete = appointments.filter((app) => app.patientId === patientId);
      for (const app of apptsToDelete) {
        await deleteDoc(doc(db, 'appointments', app.id));
      }

      // Remove assessments
      const asToDelete = assessments.filter((as) => as.patientId === patientId);
      for (const as of asToDelete) {
        await deleteDoc(doc(db, 'assessments', as.id));
      }

      // Remove results
      const resToDelete = results.filter((res) => res.patientId === patientId);
      for (const res of resToDelete) {
        await deleteDoc(doc(db, 'results', res.appointmentId));
      }

      // Log out if the current logged in patient was deleted
      if (loggedInPatient && loggedInPatient.id === patientId) {
        setLoggedInPatient(null);
      }
    } catch (e) {
      console.error("Error deleting patient: ", e);
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
