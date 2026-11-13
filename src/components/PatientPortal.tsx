import React, { useState } from 'react';
import { Patient, Appointment, LM6Assessment, LabResult, AttachedFile } from '../types';
import {
  BASIC_TESTS,
  SPECIAL_TESTS,
  BASIC_TEST_GROUPS_2570,
  CHECKUP_2570_PACKAGES,
  Program2570Key,
  getBasicProgramDetails,
  get2570ProgramSelection,
  LM6_QUESTIONS,
  LM6_PILLARS_DETAILS,
} from '../data';
import {
  User, Lock, Key, ShieldAlert, CheckCircle2, Calendar, Clock,
  FileText, Activity, AlertCircle, Sparkles, Heart, Plus, Minus, Check, ArrowRight
} from 'lucide-react';
import OfficialReport from './OfficialReport';

interface PatientPortalProps {
  patients: Patient[];
  appointments: Appointment[];
  assessments: LM6Assessment[];
  results: LabResult[];
  onRegister: (patient: Patient) => void;
  onBookAppointment: (appointment: Appointment) => void;
  onSaveAssessment: (assessment: LM6Assessment) => void;
  loggedInPatient: Patient | null;
  setLoggedInPatient: (patient: Patient | null) => void;
}

const THAI_MONTHS = [
  { value: '01', name: 'มกราคม (ม.ค. / 01)' },
  { value: '02', name: 'กุมภาพันธ์ (ก.พ. / 02)' },
  { value: '03', name: 'มีนาคม (มี.ค. / 03)' },
  { value: '04', name: 'เมษายน (เม.ย. / 04)' },
  { value: '05', name: 'พฤษภาคม (พ.ค. / 05)' },
  { value: '06', name: 'มิถุนายน (มิ.ย. / 06)' },
  { value: '07', name: 'กรกฎาคม (ก.ค. / 07)' },
  { value: '08', name: 'สิงหาคม (ส.ค. / 08)' },
  { value: '09', name: 'กันยายน (ก.ย. / 09)' },
  { value: '10', name: 'ตุลาคม (ต.ค. / 10)' },
  { value: '11', name: 'พฤศจิกายน (พ.ย. / 11)' },
  { value: '12', name: 'ธันวาคม (ธ.ค. / 12)' },
];

const CURRENT_YEAR = new Date().getFullYear();
const BIRTH_YEARS = Array.from({ length: 105 }, (_, i) => {
  const ad = CURRENT_YEAR - i;
  const be = ad + 543;
  return { ad: String(ad), be: String(be), label: `ค.ศ. ${ad} (พ.ศ. ${be})` };
});

export default function PatientPortal({
  patients,
  appointments,
  assessments,
  results,
  onRegister,
  onBookAppointment,
  onSaveAssessment,
  loggedInPatient,
  setLoggedInPatient,
}: PatientPortalProps) {
  // Login / Register Form States
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginIdentity, setLoginIdentity] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regPdpaConsent, setRegPdpaConsent] = useState(false);
  const [regPhone, setRegPhone] = useState('');
  const [regGender, setRegGender] = useState<'female' | 'male'>('female');
  const [regBirthDate, setRegBirthDate] = useState('');
  const [regBirthDay, setRegBirthDay] = useState('');
  const [regBirthMonth, setRegBirthMonth] = useState('');
  const [regBirthYear, setRegBirthYear] = useState('');
  const [useCalendarPicker, setUseCalendarPicker] = useState(false);
  const [regAge, setRegAge] = useState<number>(35);
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  // Booking Appointment States
  const [bookDate, setBookDate] = useState('');
  const [bookTime, setBookTime] = useState('08:00 - 08:30');
  const [selectedProgramKey, setSelectedProgramKey] = useState<Program2570Key | 'custom'>('basic_under35');
  const [selectedBasicTests, setSelectedBasicTests] = useState<string[]>([]);
  const [selectedSpecialTests, setSelectedSpecialTests] = useState<string[]>([]);
  const [bookPatientType, setBookPatientType] = useState<'walk-in' | 'agency'>('walk-in');
  const [bookAgencyName, setBookAgencyName] = useState('');
  const [bookMedicalCoverage, setBookMedicalCoverage] = useState('ชำระเงินเอง');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // LM 6 Pillars Wizard States
  const [lmStep, setLmStep] = useState<'intro' | 'questions' | 'results'>('intro');
  const [lmAnswers, setLmAnswers] = useState<Record<string, number>>({});
  const [currentPillarIndex, setCurrentPillarIndex] = useState(0);
  const [activeResultReport, setActiveResultReport] = useState<LabResult | null>(null);
  const [patientSubTab, setPatientSubTab] = useState<'appointments' | 'results' | 'assessment'>('appointments');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [pendingBookingDraft, setPendingBookingDraft] = useState<Appointment | null>(null);

  // 6 Pillars identifiers
  const pillars: ('nutrition' | 'physicalActivity' | 'stressManagement' | 'avoidSubstances' | 'restorativeSleep' | 'socialConnection')[] = [
    'nutrition', 'physicalActivity', 'stressManagement', 'avoidSubstances', 'restorativeSleep', 'socialConnection'
  ];

  // Password requirement regex check
  const isPasswordValid = (pw: string) => /^[A-Z]{4}\d{4,6}$/.test(pw);

  // Calculate age helper safely handling both A.D. (ค.ศ.) and B.E. (พ.ศ.)
  const calculateAge = (bDateStr: string) => {
    if (!bDateStr) return 0;
    const parts = bDateStr.split('-');
    if (parts.length !== 3) return 0;
    let year = parseInt(parts[0], 10);
    if (year > 2400) year -= 543;
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const birth = new Date(year, month, day);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      calculatedAge--;
    }
    return calculatedAge > 0 ? calculatedAge : 0;
  };

  // Update birth date from explicit Day, Month, Year dropdowns (Always in A.D. / ค.ศ.)
  const updateBirthDateFromDropdowns = (day: string, month: string, year: string) => {
    setRegBirthDay(day);
    setRegBirthMonth(month);
    setRegBirthYear(year);

    if (day && month && year) {
      const formatted = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      setRegBirthDate(formatted);
      const calculated = calculateAge(formatted);
      setRegAge(calculated);
    } else {
      setRegBirthDate('');
    }
  };

  // Handle native calendar picker change (Auto-normalizes B.E. / พ.ศ. > 2400 to A.D. / ค.ศ.)
  const handleBirthDateChange = (dateStr: string) => {
    if (!dateStr) {
      setRegBirthDate('');
      setRegBirthDay('');
      setRegBirthMonth('');
      setRegBirthYear('');
      return;
    }
    let normalized = dateStr;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      let y = parseInt(parts[0], 10);
      if (y > 2400) {
        y -= 543;
      }
      const m = parts[1];
      const d = parts[2];
      normalized = `${y}-${m}-${d}`;
      setRegBirthYear(String(y));
      setRegBirthMonth(m);
      setRegBirthDay(String(parseInt(d, 10)));
    }
    setRegBirthDate(normalized);
    const calculated = calculateAge(normalized);
    setRegAge(calculated);
  };

  // Handle Login - Supports both A.D. (ค.ศ. เช่น 19958249) and B.E. (พ.ศ. เช่น 25388249)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const inputId = loginIdentity.trim();
    const found = patients.find((p) => {
      if (!p.birthDate || !p.hn) return false;
      const parts = p.birthDate.split('-');
      let birthYearAD = parseInt(parts[0], 10);
      if (birthYearAD > 2400) birthYearAD -= 543;
      const birthYearBE = birthYearAD + 543;

      const expectedIdAD = `${birthYearAD}${p.hn}`;
      const expectedIdBE = `${birthYearBE}${p.hn}`;

      return (expectedIdAD === inputId || expectedIdBE === inputId) && p.password === loginPassword.trim();
    });

    if (found) {
      setLoggedInPatient(found);
      setLoginIdentity('');
      setLoginPassword('');
    } else {
      setLoginError('รหัสระบุตัวตน (ปีเกิด ค.ศ. หรือ พ.ศ. + HN) หรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง (สำหรับผู้รับบริการใหม่ กรุณารอเจ้าหน้าที่ออกหมายเลข HN ในระบบก่อนเข้าสู่ระบบ)');
    }
  };

  // Handle Register
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess(false);

    if (!regName.trim() || !regPhone.trim()) {
      setRegError('กรุณากรอกข้อมูลส่วนตัวให้ครบทุกช่อง');
      return;
    }

    if (!regBirthDate) {
      setRegError('กรุณาระบุวันเดือนปีเกิดเพื่อประกอบการคำนวณอายุและสิทธิ์การตรวจสุขภาพ');
      return;
    }

    if (!isPasswordValid(regPassword)) {
      setRegError('รหัสผ่านไม่ตรงตามเงื่อนไข: ต้องขึ้นต้นด้วยตัวอักษรพิมพ์ใหญ่ A-Z 4 ตัว และตามด้วยตัวเลข 4-6 หลัก (เช่น ABCD1234)');
      return;
    }

    if (!regPdpaConsent) {
      setRegError('กรุณากดยินยอมให้นโยบายความเป็นส่วนตัวและ PDPA เพื่อบันทึกข้อมูล');
      return;
    }

    const newPatient: Patient = {
      id: 'p_' + Date.now(),
      name: regName.trim(),
      phone: regPhone.trim(),
      gender: regGender,
      age: Number(regAge),
      birthDate: regBirthDate,
      password: regPassword,
      registeredAt: new Date().toISOString().split('T')[0],
      pdpaConsent: true,
      pdpaConsentAt: new Date().toISOString()
    };

    onRegister(newPatient);
    setRegSuccess(true);
    setTimeout(() => {
      setIsRegistering(false);
      setLoggedInPatient(newPatient);
      // Clean forms
      setRegName('');
      setRegPhone('');
      setRegBirthDate('');
      setRegBirthDay('');
      setRegBirthMonth('');
      setRegBirthYear('');
      setRegPassword('');
      setRegPdpaConsent(false);
      setRegSuccess(false);
    }, 1500);
  };

  // Logged-in Patient context queries
  const patientAppointments = loggedInPatient
    ? appointments.filter((ap) => ap.patientId === loggedInPatient.id)
    : [];

  const patientResults = loggedInPatient
    ? results.filter((res) => res.patientId === loggedInPatient.id && res.status === 'completed')
    : [];

  const patientAssessments = loggedInPatient
    ? assessments.filter((as) => as.patientId === loggedInPatient.id)
    : [];

  const activeAppointments = patientAppointments
    .filter((ap) => ap.status === 'pending' || ap.status === 'pending_results')
    .sort((a, b) => {
      const tsA = Number(a.id.replace(/\D/g, '')) || 0;
      const tsB = Number(b.id.replace(/\D/g, '')) || 0;
      if (tsA !== tsB) return tsB - tsA;
      return b.date.localeCompare(a.date);
    });

  const recommendedBasicProgram = loggedInPatient
    ? getBasicProgramDetails(loggedInPatient.gender, loggedInPatient.age)
    : null;

  const availableBasicGroups = loggedInPatient
    ? BASIC_TEST_GROUPS_2570.filter(
        (g) => !g.genderOnly || g.genderOnly === loggedInPatient.gender
      )
    : [];

  const allAvailableBasicTestIds = availableBasicGroups.flatMap((g) => g.testIds);

  const selectedBasicGroupsCount = availableBasicGroups.filter((g) =>
    g.testIds.every((id) => selectedBasicTests.includes(id))
  ).length;

  const activeProgramMeta =
    selectedProgramKey !== 'custom' && loggedInPatient
      ? get2570ProgramSelection(selectedProgramKey, loggedInPatient.gender)
      : null;

  // Sync default 2570 Basic program with patient age & gender
  React.useEffect(() => {
    if (loggedInPatient && recommendedBasicProgram) {
      const defaultKey: Program2570Key =
        loggedInPatient.age < 35 ? 'basic_under35' : 'basic_over35';
      setSelectedProgramKey(defaultKey);
      setSelectedBasicTests(recommendedBasicProgram.tests);
      setSelectedSpecialTests([]);
    }
  }, [loggedInPatient?.id, recommendedBasicProgram?.name]);

  React.useEffect(() => {
    setPendingBookingDraft(null);
    setShowBookingForm(false);
    setPatientSubTab('appointments');
  }, [loggedInPatient?.id]);

  const handleSelectProgramPreset = (pkgKey: Program2570Key) => {
    if (!loggedInPatient) return;
    const preset = get2570ProgramSelection(pkgKey, loggedInPatient.gender);
    setSelectedProgramKey(pkgKey);
    setSelectedBasicTests(preset.basicTests);
    setSelectedSpecialTests(preset.specialTests);
  };

  const handleToggleBasicGroup = (groupTestIds: string[]) => {
    const isAllGroupSelected = groupTestIds.every((id) =>
      selectedBasicTests.includes(id)
    );
    if (isAllGroupSelected) {
      setSelectedBasicTests(
        selectedBasicTests.filter((id) => !groupTestIds.includes(id))
      );
    } else {
      const next = new Set([...selectedBasicTests, ...groupTestIds]);
      setSelectedBasicTests(Array.from(next));
    }
    setSelectedProgramKey('custom');
  };

  // Step 1 -> 2: Validate booking form & store draft, then guide patient to LM6 assessment before saving
  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedInPatient || !recommendedBasicProgram) return;

    if (!bookDate) {
      alert('กรุณาเลือกวันที่ต้องการเข้ารับบริการ');
      return;
    }

    if (selectedBasicTests.length === 0 && selectedSpecialTests.length === 0) {
      alert('กรุณาเลือกรายการตรวจอย่างน้อย 1 รายการ');
      return;
    }

    // Check if weekend
    const day = new Date(bookDate).getDay();
    if (day === 0 || day === 6) {
      alert('ขออภัยค่ะ ศูนย์ตรวจสุขภาพเปิดให้บริการเฉพาะวันจันทร์ - วันศุกร์ เท่านั้น');
      return;
    }

    const basicCost = selectedBasicTests.reduce((acc, tId) => acc + (BASIC_TESTS[tId]?.price || 0), 0);
    const costOfSpecial = selectedSpecialTests.reduce((acc, tId) => acc + (SPECIAL_TESTS[tId]?.price || 0), 0);
    const total = basicCost + costOfSpecial;

    const chosenProgramName = activeProgramMeta
      ? activeProgramMeta.name
      : `${recommendedBasicProgram.name} (ปรับแต่งรายการ)`;

    const draftApp: Appointment = {
      id: 'ap_' + Date.now(),
      patientId: loggedInPatient.id,
      date: bookDate,
      time: bookTime,
      basicProgramName: chosenProgramName,
      basicProgramPrice: basicCost,
      selectedBasicTests: selectedBasicTests,
      specialTests: selectedSpecialTests,
      totalCost: total,
      status: 'pending',
      patientType: bookPatientType,
      agencyName: bookPatientType === 'agency' ? bookAgencyName.trim() : undefined,
      medicalCoverage: bookMedicalCoverage
    };

    // Proceed to LM6 assessment first before finalizing & saving the appointment
    setPendingBookingDraft(draftApp);
    setLmAnswers({});
    setCurrentPillarIndex(0);
    setLmStep('intro');
    setPatientSubTab('assessment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Final Step: Confirm and save the pending booking draft after completing LM6
  const handleConfirmSavePendingBooking = () => {
    if (!pendingBookingDraft || !loggedInPatient || !recommendedBasicProgram) return;

    const finalAppointment: Appointment = {
      ...pendingBookingDraft,
      id: 'ap_' + Date.now(),
    };

    onBookAppointment(finalAppointment);
    setPendingBookingDraft(null);
    setBookingSuccess(true);
    setShowBookingForm(false);
    setBookDate('');
    setBookPatientType('walk-in');
    setBookAgencyName('');
    setBookMedicalCoverage('ชำระเงินเอง');
    const defaultKey: Program2570Key =
      loggedInPatient.age < 35 ? 'basic_under35' : 'basic_over35';
    setSelectedProgramKey(defaultKey);
    setSelectedBasicTests(recommendedBasicProgram.tests);
    setSelectedSpecialTests([]);
    setPatientSubTab('appointments');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
      setBookingSuccess(false);
    }, 5000);
  };

  const handleToggleSpecialTest = (testId: string) => {
    if (selectedSpecialTests.includes(testId)) {
      setSelectedSpecialTests(selectedSpecialTests.filter((id) => id !== testId));
    } else {
      setSelectedSpecialTests([...selectedSpecialTests, testId]);
    }
    setSelectedProgramKey('custom');
  };

  // Handle LM6 Assessment questions answering
  const handleAnswerChange = (qId: string, value: number) => {
    setLmAnswers({ ...lmAnswers, [qId]: value });
  };

  const currentPillar = pillars[currentPillarIndex];
  const currentPillarQuestions = LM6_QUESTIONS.filter((q) => q.pillar === currentPillar);

  const isCurrentPillarComplete = () => {
    return currentPillarQuestions.every((q) => lmAnswers[q.id] !== undefined);
  };

  const calculateLM6Results = () => {
    if (!loggedInPatient) return;

    // Calculate score per pillar
    const scores = {
      nutrition: 0,
      physicalActivity: 0,
      stressManagement: 0,
      avoidSubstances: 0,
      restorativeSleep: 0,
      socialConnection: 0,
    };

    LM6_QUESTIONS.forEach((q) => {
      const val = lmAnswers[q.id] || 0;
      scores[q.pillar] += val;
    });

    const recommendations: string[] = [];
    Object.entries(scores).forEach(([pillarKey, score]) => {
      const detail = LM6_PILLARS_DETAILS[pillarKey as keyof typeof LM6_PILLARS_DETAILS];
      if (score < 9) {
        recommendations.push(
          `${detail.title}: คะแนนอยู่ในเกณฑ์ควรปรับปรุง (${score}/15) - แนะนำ: ${detail.tips[0]}`
        );
      } else if (score < 13) {
        recommendations.push(
          `${detail.title}: คะแนนอยู่ในเกณฑ์ปานกลาง (${score}/15) - ลองฝึกเสริมเพิ่มเติม: ${detail.tips[1]}`
        );
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('พฤติกรรมสุขภาพองค์รวม 6 เสาหลัก อยู่ในเกณฑ์ดีเลิศ รักษาสุขนิสัยที่ดีสม่ำเสมอต่อไปค่ะ');
    }

    const newAssessment: LM6Assessment = {
      id: 'as_' + Date.now(),
      patientId: loggedInPatient.id,
      date: new Date().toISOString().split('T')[0],
      scores,
      answers: lmAnswers,
      recommendations,
    };

    onSaveAssessment(newAssessment);
    setLmStep('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetLM6 = () => {
    setLmAnswers({});
    setCurrentPillarIndex(0);
    setLmStep('intro');
  };

  // If a report is actively being viewed, override screen content
  if (activeResultReport && loggedInPatient) {
    return (
      <OfficialReport
        patient={loggedInPatient}
        result={activeResultReport}
        appointment={appointments.find((ap) => ap.id === activeResultReport.appointmentId)}
        onBack={() => setActiveResultReport(null)}
      />
    );
  }

  // PORTAL NOT LOGGED IN SCREEN
  if (!loggedInPatient) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-3xl shadow-lg border border-[#D4AF37]/35 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#03241B] via-[#064E3B] to-[#04392B] px-6 py-8 text-center text-white relative border-b-2 border-[#D4AF37]">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <Heart className="h-10 w-10 text-[#F3D98B] mx-auto mb-3 relative z-10" />
            <h3 className="text-xl font-bold relative z-10">เข้าใช้งานระบบผู้รับบริการ</h3>
            <p className="text-emerald-100/85 text-xs mt-1 relative z-10">
              โรงพยาบาลมหาวิทยาลัยอุบลราชธานี
            </p>
          </div>

          {/* Toggle Tab Ribbons */}
          <div className="flex border-b border-[#064E3B]/15 bg-[#F2F7F4] p-1.5 gap-1">
            <button
              onClick={() => {
                setIsRegistering(false);
                setLoginError('');
                setRegError('');
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                !isRegistering ? 'bg-gradient-to-r from-[#064E3B] to-[#047857] text-white shadow-xs border border-[#D4AF37]/40' : 'text-slate-600 hover:text-[#064E3B]'
              }`}
            >
              เข้าสู่ระบบเช็กผลตรวจ
            </button>
            <button
              onClick={() => {
                setIsRegistering(true);
                setLoginError('');
                setRegError('');
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                isRegistering ? 'bg-gradient-to-r from-[#064E3B] to-[#047857] text-white shadow-xs border border-[#D4AF37]/40' : 'text-slate-600 hover:text-[#064E3B]'
              }`}
            >
              ลงทะเบียนใหม่ (ครั้งแรก)
            </button>
          </div>

          <div className="p-6">
            {/* LOGIN FORM */}
            {!isRegistering ? (
              <form onSubmit={handleLogin} className="space-y-4 text-left">
                {loginError && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded-xl flex gap-2 text-xs text-red-600">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                    รหัสระบุตัวตน (ปีเกิด ค.ศ. หรือ พ.ศ. + HN)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      maxLength={20}
                      placeholder="เช่น ค.ศ. 1995 (หรือ พ.ศ. 2538) + HN 8249 = 19958249"
                      value={loginIdentity}
                      onChange={(e) => setLoginIdentity(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                      className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#065F46] focus:border-transparent font-mono"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 leading-normal">
                    * กรอกปีเกิดของท่าน 4 หลัก (ใช้ได้ทั้ง ค.ศ. หรือ พ.ศ.) ติดกันด้วยหมายเลข HN ของท่าน
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                    รหัสผ่านส่วนตัว
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                    <input
                      type="password"
                      placeholder="ตัวอักษรใหญ่ 4 ตัว + เลข 4-6 ตัว"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#065F46] focus:border-transparent"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 leading-normal">
                    * รหัสผ่านที่ท่านกำหนดขึ้นเองขณะลงทะเบียน (เช่น ABCD1234)
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#064E3B] to-[#047857] hover:from-[#04392B] hover:to-[#065F46] text-white font-bold py-3 px-4 rounded-xl text-sm shadow-md shadow-[#064E3B]/15 hover:shadow-lg transition-all cursor-pointer flex justify-center items-center space-x-2 border border-[#D4AF37]/40"
                >
                  <span>เข้าสู่ระบบ</span>
                </button>
              </form>
            ) : (
              /* REGISTRATION FORM */
              <form onSubmit={handleRegister} className="space-y-4 text-left">
                {regError && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded-xl flex gap-2 text-xs text-red-600">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{regError}</span>
                  </div>
                )}
                {regSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex gap-2 text-xs text-emerald-600">
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>ลงทะเบียนและตั้งรหัสผ่านสำเร็จ! กำลังเข้าสู่ระบบ...</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                    ชื่อ-นามสกุล (พร้อมคำนำหน้า)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น นายมานะ เฝ้าดี"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="px-4 py-2.5 w-full border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#065F46] focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">เพศ</label>
                    <select
                      value={regGender}
                      onChange={(e) => setRegGender(e.target.value as 'female' | 'male')}
                      className="px-4 py-2.5 w-full border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#065F46] focus:border-transparent"
                    >
                      <option value="female">เพศหญิง</option>
                      <option value="male">เพศชาย</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">อายุคำนวณอัตโนมัติ (ปี)</label>
                    <input
                      type="text"
                      value={regBirthDate ? `${regAge} ปี (บันทึก ค.ศ. ${regBirthDate.split('-')[0]} / พ.ศ. ${Number(regBirthDate.split('-')[0]) + 543})` : 'กรุณาระบุวันเดือนปีเกิด'}
                      disabled
                      className="px-4 py-2.5 w-full border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-700 font-bold"
                    />
                  </div>
                </div>

                {/* Dedicated Birth Date Selector - Explicitly in A.D. (ค.ศ.) */}
                <div className="space-y-2 bg-gradient-to-br from-[#F2F7F4] via-[#F9FBF9] to-[#FBF7EC]/60 p-4 rounded-2xl border border-[#D4AF37]/40">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#064E3B] uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-[#8A6114] shrink-0" />
                      <span>วันเดือนปีเกิด (กำหนดเป็น ค.ศ. ชัดเจน)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setUseCalendarPicker(!useCalendarPicker)}
                      className="text-[11px] text-[#065F46] hover:text-[#03241B] font-bold underline cursor-pointer"
                    >
                      {useCalendarPicker ? '← เลือกแบบ วัน/เดือน/ปี' : 'เลือกจากปฏิทินมือถือ 📅'}
                    </button>
                  </div>

                  {!useCalendarPicker ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">วันที่ (Day)</label>
                        <select
                          value={regBirthDay}
                          onChange={(e) => updateBirthDateFromDropdowns(e.target.value, regBirthMonth, regBirthYear)}
                          className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm bg-white font-medium focus:ring-2 focus:ring-[#065F46] focus:outline-none"
                          required
                        >
                          <option value="">-- วันที่ --</option>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                            <option key={d} value={String(d)}>
                              วันที่ {d}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">เดือน (Month)</label>
                        <select
                          value={regBirthMonth}
                          onChange={(e) => updateBirthDateFromDropdowns(regBirthDay, e.target.value, regBirthYear)}
                          className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm bg-white font-medium focus:ring-2 focus:ring-[#065F46] focus:outline-none"
                          required
                        >
                          <option value="">-- เดือน --</option>
                          {THAI_MONTHS.map((m) => (
                            <option key={m.value} value={m.value}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#03241B] mb-1">ปีเกิด ค.ศ. (เทียบ พ.ศ.)</label>
                        <select
                          value={regBirthYear}
                          onChange={(e) => updateBirthDateFromDropdowns(regBirthDay, regBirthMonth, e.target.value)}
                          className="w-full px-3 py-2.5 border-2 border-[#065F46]/40 rounded-xl text-sm bg-white font-bold text-[#064E3B] focus:ring-2 focus:ring-[#065F46] focus:outline-none"
                          required
                        >
                          <option value="">-- ปี ค.ศ. (พ.ศ.) --</option>
                          {BIRTH_YEARS.map((y) => (
                            <option key={y.ad} value={y.ad}>
                              {y.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-1">
                      <input
                        type="date"
                        max={new Date().toISOString().split('T')[0]}
                        value={regBirthDate}
                        onChange={(e) => handleBirthDateChange(e.target.value)}
                        className="px-4 py-2.5 w-full border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#065F46] font-mono"
                        required
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        * ไม่ว่ามือถือจะแสดงเป็น พ.ศ. หรือ ค.ศ. ระบบจะตรวจจับและแปลงบันทึกเป็น ค.ศ. ให้โดยอัตโนมัติ
                      </p>
                    </div>
                  )}

                  {/* Summary confirmation banner */}
                  {regBirthDate && (
                    <div className="bg-white/95 p-3 rounded-xl border border-[#D4AF37]/50 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-3xs mt-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span className="font-bold text-[#064E3B]">
                          วันเกิด: {regBirthDate.split('-')[2]} {THAI_MONTHS.find(m => m.value === regBirthDate.split('-')[1])?.name.split(' ')[0]} ค.ศ. {regBirthDate.split('-')[0]} (พ.ศ. {Number(regBirthDate.split('-')[0]) + 543})
                        </span>
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          อายุ {regAge} ปี
                        </span>
                      </div>
                      <div className="text-[11px] text-[#064E3B] bg-[#FBF7EC] px-2.5 py-1 rounded-lg border border-[#D4AF37]/45 font-mono font-bold self-start sm:self-auto">
                        รหัสปี ค.ศ. เกิด: <span className="text-[#8A6114] font-black">{regBirthDate.split('-')[0]}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                    เบอร์โทรศัพท์ติดต่อ
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="เช่น 0812345678"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                    className="px-4 py-2.5 w-full border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#065F46] focus:border-transparent font-mono"
                    required
                  />
                </div>

                <div className="space-y-2 bg-[#F2F7F4] p-4 rounded-2xl border border-[#D4AF37]/40">
                  <label className="block text-xs font-bold text-[#064E3B] uppercase tracking-wider">
                    ตั้งรหัสผ่านสำหรับดูผลตรวจของคุณเอง
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-[#8A6114]" />
                    <input
                      type="text"
                      placeholder="เช่น ABCD1234"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value.toUpperCase())}
                      className="pl-10 pr-4 py-2.5 w-full border border-[#064E3B]/25 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#065F46] focus:border-transparent font-mono font-bold text-[#064E3B]"
                      required
                    />
                  </div>
                  <div className="text-[10px] space-y-1 leading-normal text-slate-700">
                    <p className="font-bold">* ข้อกำหนดรหัสผ่านเพื่อความปลอดภัย:</p>
                    <p className="flex items-center gap-1">
                      <span className={/^[A-Z]{4}/.test(regPassword) ? 'text-emerald-600 font-bold' : 'text-gray-400'}>
                        ✓ มีตัวอักษรพิมพ์ใหญ่ A-Z 4 ตัวแรก
                      </span>
                    </p>
                    <p className="flex items-center gap-1">
                      <span className={/\d{4,6}$/.test(regPassword) ? 'text-emerald-600 font-bold' : 'text-gray-400'}>
                        ✓ มีตัวเลขตามหลัง 4 - 6 ตัว
                      </span>
                    </p>
                  </div>
                </div>

                {/* PDPA Consent Box */}
                <div className="bg-[#FAFBF9] border border-[#064E3B]/15 p-4 rounded-xl space-y-3">
                  <div className="flex items-start space-x-2.5">
                    <input
                      type="checkbox"
                      id="pdpa-consent"
                      checked={regPdpaConsent}
                      onChange={(e) => setRegPdpaConsent(e.target.checked)}
                      className="mt-1 h-4 w-4 text-[#064E3B] border-gray-300 rounded focus:ring-[#065F46]"
                      required
                    />
                    <label htmlFor="pdpa-consent" className="text-xs text-slate-600 leading-relaxed cursor-pointer select-none">
                      ฉันยินยอมให้ <strong className="text-[#064E3B]">ศูนย์ตรวจสุขภาพ รพ.มหาวิทยาลัยอุบลราชธานี</strong> เก็บรวบรวม ใช้ และประมวลผลข้อมูลส่วนบุคคลและข้อมูลด้านสุขภาพของฉัน เพื่อวัตถุประสงค์ในการลงทะเบียน นัดหมายล่วงหน้า และประมวลผลเพื่อแสดงรายงานผลตรวจสุขภาพออนไลน์ตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)
                    </label>
                  </div>
                  <p className="text-[10px] text-gray-400">
                    * ข้อมูลส่วนบุคคลและข้อมูลการตรวจวิเคราะห์ของท่านจะถูกจัดเก็บเป็นความลับสูงสุดตามมาตรฐานสากลและกฎหมายคุ้มครองข้อมูลส่วนบุคคลด้านสาธารณสุข
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!isPasswordValid(regPassword) || !regPdpaConsent}
                  className={`w-full font-bold py-3 px-4 rounded-xl text-sm shadow-md transition-all flex justify-center items-center space-x-2 ${
                    isPasswordValid(regPassword) && regPdpaConsent
                      ? 'bg-gradient-to-r from-[#064E3B] to-[#047857] hover:from-[#04392B] hover:to-[#065F46] text-white border border-[#D4AF37]/40 hover:shadow-lg cursor-pointer'
                      : 'bg-gray-150 text-gray-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  <span>ลงทะเบียนรับรหัสส่วนตัว</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // PORTAL LOGGED IN DASHBOARD
  return (
    <div className="space-y-8 text-left">
      {/* Patient Welcome Header e-Card */}
      <div className="bg-gradient-to-r from-[#03241B] via-[#064E3B] to-[#04392B] rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md border-t-4 border-[#D4AF37] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="space-y-1.5 relative z-10">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#F3D98B] font-mono bg-[#D4AF37]/15 px-2.5 py-0.5 rounded border border-[#D4AF37]/40">
            Official Patient e-Card
          </span>
          <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2 flex-wrap">
            <span>{loggedInPatient.name}</span>
            {loggedInPatient.hn && (
              <span className="bg-gradient-to-r from-[#D4AF37] via-[#ECCF73] to-[#C89D3C] text-[#03241B] text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg shadow-xs shrink-0 font-mono">
                HN: {loggedInPatient.hn}
              </span>
            )}
          </h2>
          <p className="text-xs text-emerald-100/85">
            สิทธิในการคัดกรอง: {loggedInPatient.gender === 'female' ? 'เพศหญิง' : 'เพศชาย'} • อายุ {loggedInPatient.age} ปี • เบอร์โทร: {loggedInPatient.phone}
          </p>
        </div>
        <button
          onClick={() => setLoggedInPatient(null)}
          className="text-xs font-bold text-rose-200 hover:text-white bg-white/10 hover:bg-rose-600/50 px-4 py-2 rounded-xl transition-all border border-[#D4AF37]/30 relative z-10 cursor-pointer shrink-0"
        >
          ออกจากระบบ
        </button>
      </div>

      {/* Tab Navigation Ribbon Bar for Patients (แถบนำทางหลักสำหรับผู้รับบริการ) */}
      <div className="flex flex-wrap bg-white p-1.5 rounded-2xl border border-[#D4AF37]/35 shadow-3xs gap-1.5">
        <button
          onClick={() => setPatientSubTab('appointments')}
          className={`flex-1 min-w-[200px] py-3 px-4 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap ${
            patientSubTab === 'appointments'
              ? 'bg-gradient-to-r from-[#064E3B] to-[#047857] text-white shadow-sm shadow-[#064E3B]/20 border border-[#D4AF37]/40'
              : 'text-slate-600 hover:text-[#064E3B] hover:bg-[#F2F7F4]'
          }`}
        >
          <Calendar className={`h-4 w-4 ${patientSubTab === 'appointments' ? 'text-[#F3D98B]' : ''}`} />
          <span>1. การนัดหมาย & จองคิวตรวจ</span>
          {activeAppointments.length > 0 && (
            <span className="bg-[#F3D98B] text-[#03241B] text-[10px] px-2 py-0.5 rounded-full font-black ml-1">
              มี {activeAppointments.length} คิว
            </span>
          )}
        </button>
        <button
          onClick={() => setPatientSubTab('results')}
          className={`flex-1 min-w-[200px] py-3 px-4 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap ${
            patientSubTab === 'results'
              ? 'bg-gradient-to-r from-[#064E3B] to-[#047857] text-white shadow-sm shadow-[#064E3B]/20 border border-[#D4AF37]/40'
              : 'text-slate-600 hover:text-[#064E3B] hover:bg-[#F2F7F4]'
          }`}
        >
          <FileText className={`h-4 w-4 ${patientSubTab === 'results' ? 'text-[#F3D98B]' : ''}`} />
          <span>2. ประวัติและรายงานผลตรวจ (PDF)</span>
          {patientResults.length > 0 && (
            <span className="bg-[#F3D98B] text-[#03241B] text-[10px] px-2 py-0.5 rounded-full font-black ml-1">
              {patientResults.length} ฉบับ
            </span>
          )}
        </button>
        <button
          onClick={() => setPatientSubTab('assessment')}
          className={`flex-1 min-w-[200px] py-3 px-4 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap ${
            patientSubTab === 'assessment'
              ? 'bg-gradient-to-r from-[#064E3B] to-[#047857] text-white shadow-sm shadow-[#064E3B]/20 border border-[#D4AF37]/40'
              : 'text-slate-600 hover:text-[#064E3B] hover:bg-[#F2F7F4]'
          }`}
        >
          <Activity className={`h-4 w-4 ${patientSubTab === 'assessment' ? 'text-[#F3D98B]' : ''}`} />
          <span>3. แบบประเมินสุขภาวะวิถีชีวิต (LM6)</span>
          {pendingBookingDraft && (
            <span className="bg-amber-300 text-[#03241B] text-[10px] px-2 py-0.5 rounded-full font-black ml-1 animate-pulse">
              รอยืนยันคิว
            </span>
          )}
        </button>
      </div>

      {/* SUB-TAB 1: APPOINTMENTS & BOOKING */}
      {patientSubTab === 'appointments' && (
        <div className="space-y-8">
          {/* Pending booking draft reminder */}
          {pendingBookingDraft && (
            <div className="rounded-3xl shadow-sm border-2 border-[#D4AF37] bg-gradient-to-br from-[#F2F7F4] via-white to-[#FBF7EC] p-6 sm:p-8 space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-[#064E3B] text-[#F3D98B] p-2.5 rounded-xl shrink-0">
                  <Activity className="h-5 w-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#8A6114] bg-[#FBF7EC] border border-[#D4AF37]/50 px-2.5 py-0.5 rounded-full">
                    <span>กำลังรอทำแบบประเมิน LM6 และยืนยันบันทึกคิว</span>
                  </div>
                  <h3 className="text-lg font-black text-[#03241B] pt-1">
                    ท่านเลือกรายการตรวจไว้แล้ว · กรุณาทำแบบประเมิน LM6 และกดบันทึกจองคิว
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    วันนัดหมาย: <strong>{pendingBookingDraft.date}</strong> ({pendingBookingDraft.time} น.) · {pendingBookingDraft.basicProgramName} · รวม <strong>{pendingBookingDraft.totalCost.toLocaleString()} บาท</strong>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setPatientSubTab('assessment')}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#064E3B] to-[#047857] hover:from-[#04392B] hover:to-[#065F46] text-white border border-[#D4AF37]/50 font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-sm cursor-pointer transition-all"
                >
                  <Activity className="h-4 w-4 text-[#F3D98B]" />
                  <span>ดำเนินการต่อที่แบบประเมิน LM6</span>
                  <ArrowRight className="h-4 w-4 text-[#F3D98B]" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPendingBookingDraft(null);
                    setShowBookingForm(true);
                  }}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-800 underline px-3 py-2 cursor-pointer"
                >
                  แก้ไข / ยกเลิกร่างการจองนี้
                </button>
              </div>
            </div>
          )}

          {/* Success confirmation banner after final save */}
          {bookingSuccess && (
            <div className="bg-emerald-50 border border-emerald-300 px-5 py-4 rounded-2xl text-xs sm:text-sm text-emerald-950 font-bold flex items-center justify-between gap-3 flex-wrap shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <span>บันทึกจองคิวนัดหมายตรวจสุขภาพและผลประเมินสุขภาวะวิถีชีวิต (LM6) เรียบร้อยแล้ว!</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowBookingForm(true);
                  setBookingSuccess(false);
                }}
                className="text-xs bg-white text-[#064E3B] border border-[#064E3B]/30 hover:bg-[#F2F7F4] px-3 py-1.5 rounded-lg font-bold cursor-pointer"
              >
                + จองคิวเพิ่มอีกครั้ง
              </button>
            </div>
          )}

          {/* Active Appointments List (Supports multiple open appointments for repeat visits) */}
          {activeAppointments.length > 0 && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F2F7F4] border border-[#D4AF37]/40 px-5 py-3.5 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-5 w-5 text-[#064E3B] shrink-0" />
                  <div>
                    <h3 className="font-black text-sm text-[#03241B]">
                      รายการนัดหมายที่เปิดอยู่ ({activeAppointments.length} คิว)
                    </h3>
                    <p className="text-[11px] text-slate-600">
                      สามารถจองคิวนัดหมายเพิ่มเติมได้หลายครั้ง สำหรับการมาใช้บริการหรือติดตามผลในครั้งถัดไป
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBookingForm(!showBookingForm)}
                  className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#064E3B] to-[#047857] hover:from-[#04392B] hover:to-[#065F46] text-white border border-[#D4AF37]/50 font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
                >
                  <Plus className="h-4 w-4 text-[#F3D98B]" />
                  <span>{showBookingForm ? 'ซ่อนฟอร์มจองคิวใหม่' : 'จองคิวนัดหมายเพิ่มเติม (ครั้งถัดไป)'}</span>
                </button>
              </div>

              {activeAppointments.map((appItem, idx) => (
                <div key={appItem.id} className="rounded-3xl shadow-sm border border-[#D4AF37]/40 bg-white overflow-hidden">
                  <div className="bg-gradient-to-r from-[#03241B] via-[#064E3B] to-[#04392B] text-white px-6 py-4 flex items-center justify-between gap-2 flex-wrap border-b border-[#D4AF37]/40">
                    <h3 className="font-extrabold text-sm flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-[#F3D98B]" />
                      <span>
                        นัดหมายที่เปิดอยู่ (Active Appointment)
                        {activeAppointments.length > 1 ? ` · คิวที่ ${activeAppointments.length - idx}` : ''}
                      </span>
                      {idx === 0 && activeAppointments.length > 1 && (
                        <span className="bg-[#D4AF37] text-[#03241B] text-[10px] font-black px-2 py-0.5 rounded-full">
                          ล่าสุด
                        </span>
                      )}
                    </h3>
                    <span className={`text-xs font-black px-3 py-1 rounded-full border shadow-sm ${
                      appItem.status === 'pending_results'
                        ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                        : 'bg-[#F3D98B] text-[#03241B] border-[#D4AF37]'
                    }`}>
                      {appItem.status === 'pending_results' ? '🔔 ผลออกบางส่วน (ติดตามผลต่อ)' : '📅 นัดหมายสำเร็จ / รอรับบริการ'}
                    </span>
                  </div>

                  <div className="p-6 sm:p-8 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F2F7F4] p-5 rounded-2xl border border-[#D4AF37]/35">
                      <div className="space-y-1.5">
                        <p className="text-xs text-[#064E3B] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-[#8A6114]" />
                          วันและเวลาที่นัดหมายตรวจสุขภาพ
                        </p>
                        <p className="text-lg font-black text-slate-900">
                          {new Date(appItem.date).toLocaleDateString('th-TH', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-xs text-[#03241B] font-bold flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <Clock className="h-4 w-4 text-[#065F46] shrink-0" /> เวลา <span className="bg-[#FBF7EC] border border-[#D4AF37]/40 px-2.5 py-0.5 rounded-lg text-[#064E3B] text-xs font-extrabold font-mono">{appItem.time} น.</span>
                          {(appItem.time?.includes('13:') || appItem.time?.includes('14:') || appItem.time?.includes('13.') || appItem.time?.includes('14.')) && (
                            <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md font-bold">
                              *รอบบ่าย ไม่มีแพทย์ออกตรวจ
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="text-left sm:text-right bg-white p-4 rounded-xl border border-[#D4AF37]/40 shadow-3xs min-w-[150px]">
                        <p className="text-[10px] text-slate-500 font-bold">อัตราค่าบริการโดยประมาณ</p>
                        <p className="text-2xl font-black text-[#8A6114] font-mono tabular-nums">{appItem.totalCost.toLocaleString()} บาท</p>
                      </div>
                    </div>

                    {/* Fasting Warning Indicator */}
                    {(loggedInPatient.age >= 35 || appItem.specialTests.length > 0) && (
                      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-900 flex gap-2.5">
                        <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                        <div className="space-y-1 text-left">
                          <p className="font-bold text-amber-950">คำแนะนำเตรียมตัวที่สำคัญ (Pre-Examination Guidelines):</p>
                          <p>เนื่องจากมีอายุตั้งแต่ 35 ปีขึ้นไป หรือมีการตรวจระดับน้ำตาล/ไขมันในเลือด</p>
                          <p className="font-semibold underline">งดเครื่องดื่มและอาหารทุกชนิดอย่างน้อย 10 ชั่วโมง ก่อนเข้ารับการบริการ (ดื่มน้ำเปล่าบริสุทธิ์ได้เท่านั้น)</p>
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-slate-600 space-y-2 bg-[#F9FBF9] p-4 rounded-2xl border border-[#064E3B]/15">
                      <p className="font-bold text-[#03241B]">รายละเอียดคิวตรวจ:</p>
                      <p>• <strong>โปรแกรมพื้นฐาน:</strong> {appItem.basicProgramName}</p>
                      {appItem.selectedBasicTests && appItem.selectedBasicTests.length > 0 && (
                        <p>• <strong>รายการตรวจพื้นฐานที่เลือก:</strong> {appItem.selectedBasicTests.map(tId => BASIC_TESTS[tId]?.name || tId).join(', ')}</p>
                      )}
                      {appItem.specialTests.length > 0 && (
                        <p>• <strong>ตรวจพิเศษเพิ่มเติม:</strong> {appItem.specialTests.map(tId => SPECIAL_TESTS[tId]?.name || BASIC_TESTS[tId]?.name || tId).join(', ')}</p>
                      )}
                      <p>• <strong>ประเภทผู้รับบริการ:</strong> {appItem.patientType === 'agency' ? `ในนามคณะ/หน่วยงาน (${appItem.agencyName})` : 'Walk-in (ชำระเงิน)'}</p>
                      <p>• <strong>สิทธิการรักษา:</strong> {appItem.medicalCoverage || 'ชำระเงินเอง'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* New Appointment Form (Shown if no active appointment OR toggled by user) */}
          {(activeAppointments.length === 0 || showBookingForm) && (
            <div className="bg-white rounded-3xl border border-[#D4AF37]/35 shadow-sm p-6 sm:p-8 space-y-6 text-left">
              {/* Header Ribbon for Booking */}
              <div className="bg-gradient-to-r from-[#03241B] via-[#064E3B] to-[#04392B] text-white p-4 sm:p-5 rounded-2xl shadow-sm flex items-center justify-between gap-3 border-b-2 border-[#D4AF37]">
                <div className="flex items-center space-x-3">
                  <div className="bg-[#D4AF37]/15 border border-[#D4AF37]/35 p-2.5 rounded-xl">
                    <Calendar className="h-6 w-6 text-[#F3D98B]" />
                  </div>
                  <div>
                    <h3 className="font-black text-base sm:text-lg">
                      {activeAppointments.length > 0 ? 'จองคิวนัดหมายตรวจสุขภาพเพิ่มเติม (ครั้งถัดไป)' : 'จองคิวนัดหมายตรวจสุขภาพ'}
                    </h3>
                    <p className="text-xs text-emerald-100/85">เลือกวัน เวลา และรายการตรวจสุขภาพ จากนั้นทำแบบประเมิน LM6 เพื่อยืนยันบันทึกคิว (วันจันทร์ - ศุกร์ 08:00 - 12:00 น.)</p>
                  </div>
                </div>
                {activeAppointments.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="text-xs font-bold text-[#F3D98B] hover:text-white bg-white/10 px-3 py-1.5 rounded-lg border border-[#D4AF37]/30 cursor-pointer shrink-0"
                  >
                    ซ่อนฟอร์ม
                  </button>
                )}
              </div>

              <form onSubmit={handleBookAppointment} className="space-y-6">
                {/* แถบขั้นตอนที่ 1: ข้อมูลวัน-เวลาและประเภทการเข้ารับบริการ */}
                <div className="space-y-4">
                  <div className="bg-[#F2F7F4] border border-[#D4AF37]/35 px-4 py-2.5 rounded-xl font-bold text-xs text-[#03241B] flex items-center gap-2">
                    <span className="bg-[#064E3B] text-[#F3D98B] rounded-full w-5 h-5 flex items-center justify-center text-[10px]">1</span>
                    <span>แถบข้อมูลวัน-เวลาและประเภทการเข้ารับบริการ</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        เลือกวันที่ (งดเว้น ส.-อา.)
                      </label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={bookDate}
                        onChange={(e) => setBookDate(e.target.value)}
                        className="px-3.5 py-2.5 w-full border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#065F46] bg-white"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="block text-xs font-bold text-slate-700">
                          เลือกช่วงเวลาเข้ารับบริการ
                        </label>
                        {(bookTime.startsWith('13:') || bookTime.startsWith('14:')) && (
                          <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md">
                            ⚠️ ช่วงบ่าย ไม่มีแพทย์ออกตรวจ
                          </span>
                        )}
                      </div>
                      <select
                        value={bookTime}
                        onChange={(e) => setBookTime(e.target.value)}
                        className="px-3.5 py-2.5 w-full border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#065F46] font-medium"
                      >
                        <optgroup label="รอบเช้า (มีแพทย์ออกตรวจ)">
                          <option value="08:00 - 08:30">08:00 - 08:30 น.</option>
                          <option value="08:30 - 09:00">08:30 - 09:00 น.</option>
                          <option value="09:00 - 09:30">09:00 - 09:30 น.</option>
                          <option value="09:30 - 10:00">09:30 - 10:00 น.</option>
                          <option value="10:00 - 10:30">10:00 - 10:30 น.</option>
                          <option value="10:30 - 11:00">10:30 - 11:00 น.</option>
                        </optgroup>
                        <optgroup label="รอบบ่าย (หมายเหตุในเวลา: ไม่มีแพทย์ออกตรวจ)">
                          <option value="13:00 - 14:00">13:00 - 14:00 น. (ไม่มีแพทย์ออกตรวจ)</option>
                          <option value="14:00 - 15:00">14:00 - 15:00 น. (ไม่มีแพทย์ออกตรวจ)</option>
                        </optgroup>
                      </select>
                      {(bookTime.startsWith('13:') || bookTime.startsWith('14:')) && (
                        <div className="text-[11px] text-amber-800 bg-amber-50/90 p-2.5 rounded-xl border border-amber-200 flex items-start gap-1.5 mt-1.5">
                          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                          <p className="leading-relaxed">
                            <strong>หมายเหตุในเวลา:</strong> รอบเวลาช่วงบ่าย (13:00 - 15:00 น.) <u>ไม่มีแพทย์ออกตรวจ</u> (ให้บริการเฉพาะการเจาะเลือด เก็บสิ่งส่งตรวจตรวจทางห้องปฏิบัติการ และเอกซเรย์)
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        ประเภทผู้รับบริการ
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setBookPatientType('walk-in')}
                          className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                            bookPatientType === 'walk-in'
                              ? 'bg-[#064E3B] border-[#D4AF37]/50 text-white shadow-xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-[#F2F7F4]'
                          }`}
                        >
                          Walk-in
                        </button>
                        <button
                          type="button"
                          onClick={() => setBookPatientType('agency')}
                          className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                            bookPatientType === 'agency'
                              ? 'bg-[#064E3B] border-[#D4AF37]/50 text-white shadow-xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-[#F2F7F4]'
                          }`}
                        >
                          หน่วยงาน
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        สิทธิการรักษา
                      </label>
                      <select
                        value={bookMedicalCoverage}
                        onChange={(e) => setBookMedicalCoverage(e.target.value)}
                        className="px-3.5 py-2.5 w-full border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#065F46]"
                      >
                        <option value="ชำระเงินเอง">ชำระเงินเอง</option>
                        <option value="สิทธิข้าราชการ / จ่ายตรง">สิทธิข้าราชการ / จ่ายตรง</option>
                        <option value="สิทธิประกันสังคม">สิทธิประกันสังคม</option>
                        <option value="สิทธิบัตรทอง (30 บาท)">สิทธิบัตรทอง (30 บาท)</option>
                        <option value="รัฐวิสาหกิจ">รัฐวิสาหกิจ</option>
                        <option value="อื่นๆ">อื่นๆ</option>
                      </select>
                    </div>
                  </div>

                  {bookPatientType === 'agency' && (
                    <div className="space-y-1.5 pt-2">
                      <label className="block text-xs font-bold text-slate-700">
                        ระบุชื่อคณะ / หน่วยงาน
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น คณะวิทยาศาสตร์, บริษัท สมาร์ท จำกัด"
                        value={bookAgencyName}
                        onChange={(e) => setBookAgencyName(e.target.value)}
                        className="px-3.5 py-2.5 w-full border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#065F46]"
                        required={bookPatientType === 'agency'}
                      />
                    </div>
                  )}
                </div>

                {/* แถบขั้นตอนที่ 2: โปรแกรมตรวจพื้นฐานตามช่วงวัย */}
                <div className="space-y-4">
                  <div className="bg-[#F2F7F4] border border-[#D4AF37]/35 px-4 py-2.5 rounded-xl font-bold text-xs text-[#03241B] flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#064E3B] text-[#F3D98B] rounded-full w-5 h-5 flex items-center justify-center text-[10px] shrink-0">2</span>
                      <span>
                        แถบโปรแกรมตรวจสุขภาพ ประจำปี 2570 (
                        {activeProgramMeta ? activeProgramMeta.shortLabel : recommendedBasicProgram?.name}
                        )
                      </span>
                    </div>
                    <span className="text-[#8A6114] font-mono font-bold text-xs tabular-nums">
                      {selectedBasicTests.reduce((acc, tId) => acc + (BASIC_TESTS[tId]?.price || 0), 0).toLocaleString()} บาท
                    </span>
                  </div>

                  {/* Quick 2570 Program Presets matching Homepage */}
                  <div className="bg-[#FBF7EC]/75 border border-[#D4AF37]/35 rounded-2xl p-3.5 space-y-2">
                    <p className="text-[11px] font-bold text-[#03241B]">
                      เลือกชุดโปรแกรมตรวจสุขภาพ ประจำปี 2570 (ราคาสอดคล้องกับหน้าแรก แล้วปรับเพิ่ม/ลดรายการเองได้):
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {CHECKUP_2570_PACKAGES.map((pkg) => {
                        const preset = get2570ProgramSelection(pkg.key, loggedInPatient.gender);
                        const isPresetActive = selectedProgramKey === pkg.key;
                        return (
                          <button
                            key={pkg.key}
                            type="button"
                            onClick={() => handleSelectProgramPreset(pkg.key)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 ${
                              isPresetActive
                                ? 'bg-[#064E3B] border-[#D4AF37] text-white shadow-xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-[#C9A24D] hover:text-[#064E3B]'
                            }`}
                          >
                            <span>{preset.shortLabel}</span>
                            <span className={`font-mono tabular-nums text-[11px] ${isPresetActive ? 'text-[#F3D98B]' : 'text-[#8A6114]'}`}>
                              {preset.totalPrice.toLocaleString()} บ.
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-[#F9FBF9] space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 gap-2 flex-wrap">
                      <label className="flex items-center space-x-2 cursor-pointer font-bold text-xs text-[#03241B]">
                        <input
                          type="checkbox"
                          checked={
                            allAvailableBasicTestIds.length > 0 &&
                            allAvailableBasicTestIds.every((id) => selectedBasicTests.includes(id))
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBasicTests(allAvailableBasicTestIds);
                            } else {
                              setSelectedBasicTests([]);
                            }
                            setSelectedProgramKey('custom');
                          }}
                          className="rounded border-slate-300 text-[#064E3B] focus:ring-[#065F46]"
                        />
                        <span>เลือกรายการตรวจพื้นฐานทั้งหมด (อัตราค่าบริการ ประจำปี 2570)</span>
                      </label>
                      <span className="text-[11px] text-slate-500 font-medium">
                        เลือกแล้ว {selectedBasicGroupsCount} จาก {availableBasicGroups.length} รายการ
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
                      {availableBasicGroups.map((group) => {
                        const isChecked = group.testIds.every((id) =>
                          selectedBasicTests.includes(id)
                        );
                        return (
                          <label
                            key={group.id}
                            className={`flex items-start space-x-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-white border-[#D4AF37]/60 shadow-3xs text-slate-900 font-medium'
                                : 'border-slate-200 text-slate-500 hover:bg-white opacity-70'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleBasicGroup(group.testIds)}
                              className="mt-0.5 rounded border-slate-300 text-[#064E3B] focus:ring-[#065F46]"
                            />
                            <div className="flex-1 text-xs">
                              <div className="flex justify-between items-baseline font-bold gap-2">
                                <span>{group.name}</span>
                                <span className="font-mono text-[#8A6114] tabular-nums whitespace-nowrap shrink-0">
                                  {group.price > 0 ? `+${group.price.toLocaleString()} บ.` : 'รวมในชุด'}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 line-clamp-1">{group.detail}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* แถบขั้นตอนที่ 3: รายการตรวจพิเศษเสริม (Special Tests) */}
                <div className="space-y-4">
                  <div className="bg-[#F2F7F4] border border-[#D4AF37]/35 px-4 py-2.5 rounded-xl font-bold text-xs text-[#03241B] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#064E3B] text-[#F3D98B] rounded-full w-5 h-5 flex items-center justify-center text-[10px]">3</span>
                      <span>แถบรายการตรวจพิเศษเสริมเพิ่มเติม (Special Additional Tests)</span>
                    </div>
                    <span className="text-[#8A6114] font-mono font-bold text-xs tabular-nums">
                      +{selectedSpecialTests.reduce((acc, tId) => acc + (SPECIAL_TESTS[tId]?.price || 0), 0).toLocaleString()} บาท
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-[#F9FBF9] space-y-3">
                    <p className="text-xs text-slate-500">
                      ท่านสามารถเลือกรายการตรวจเฉพาะทางเพิ่มเติมตามอัตราค่าบริการ ประจำปี 2570 เช่น ตรวจแมมโมแกรม (2,400 บาท), ตรวจอัลตราซาวด์, หรือตรวจคัดกรองมะเร็ง
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
                      {Object.values(SPECIAL_TESTS)
                        .filter(t => t.categories.includes(loggedInPatient.gender === 'female' ? 'female_only' : 'male_only') || !t.categories.includes('female_only') && !t.categories.includes('male_only'))
                        .map((test) => {
                          const isChecked = selectedSpecialTests.includes(test.id);
                          return (
                            <label
                              key={test.id}
                              className={`flex items-start space-x-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                                isChecked
                                  ? 'bg-white border-[#064E3B] shadow-xs ring-2 ring-[#D4AF37]/25 text-slate-900 font-semibold'
                                  : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-white hover:border-[#D4AF37]/40'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleSpecialTest(test.id)}
                                className="mt-0.5 rounded border-slate-300 text-[#064E3B] focus:ring-[#065F46] cursor-pointer"
                              />
                              <div className="flex-1 text-xs">
                                <div className="flex justify-between items-baseline font-bold">
                                  <span className={test.id === 'mammogram' ? 'text-[#064E3B] font-extrabold' : ''}>{test.name}</span>
                                  <span className="font-mono text-[#8A6114] font-bold shrink-0 tabular-nums">+{test.price.toLocaleString()} บ.</span>
                                </div>
                                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{test.detail}</p>
                              </div>
                            </label>
                          );
                        })}
                    </div>
                  </div>
                </div>

                {/* แถบคำนวณราคาสุทธิแบบเรียลไทม์ (Live Net Price Recalculator Ribbon) */}
                <div className="bg-gradient-to-r from-[#03241B] via-[#064E3B] to-[#04392B] text-white p-5 rounded-2xl shadow-md border-t-4 border-[#D4AF37] flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="space-y-0.5 text-center sm:text-left">
                    <p className="text-xs font-bold text-[#F3D98B] uppercase tracking-wider">
                      สรุปอัตราค่าบริการสุทธิ (Net Total Amount):
                    </p>
                    <p className="text-xs text-emerald-100/85">
                      ตรวจพื้นฐาน: {selectedBasicTests.reduce((acc, tId) => acc + (BASIC_TESTS[tId]?.price || 0), 0).toLocaleString()} บ. + ตรวจพิเศษเสริม: {selectedSpecialTests.reduce((acc, tId) => acc + (SPECIAL_TESTS[tId]?.price || 0), 0).toLocaleString()} บ.
                    </p>
                  </div>
                  <div className="text-center sm:text-right">
                    <span className="text-3xl font-black text-[#F3D98B] font-mono tabular-nums">
                      {(selectedBasicTests.reduce((acc, tId) => acc + (BASIC_TESTS[tId]?.price || 0), 0) + selectedSpecialTests.reduce((acc, tId) => acc + (SPECIAL_TESTS[tId]?.price || 0), 0)).toLocaleString()}
                    </span>
                    <span className="text-sm font-bold text-white ml-1.5">บาท</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#064E3B] to-[#047857] hover:from-[#04392B] hover:to-[#065F46] text-white font-black py-4 px-6 rounded-2xl text-sm shadow-md hover:shadow-lg transition-all cursor-pointer text-center flex items-center justify-center space-x-2 border border-[#D4AF37]/50 hover:scale-[1.005]"
                >
                  <Activity className="h-5 w-5 text-[#F3D98B]" />
                  <span>ถัดไป: ทำแบบประเมินสุขภาวะวิถีชีวิต (LM6) เพื่อบันทึกจองคิว</span>
                  <ArrowRight className="h-4 w-4 text-[#F3D98B]" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: RESULTS & OFFICIAL REPORTS */}
      {patientSubTab === 'results' && (
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-[#D4AF37]/35 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-[#03241B] via-[#064E3B] to-[#04392B] text-white px-6 py-4 flex items-center justify-between border-b border-[#D4AF37]/40">
              <h3 className="font-extrabold text-sm flex items-center space-x-2">
                <FileText className="h-5 w-5 text-[#F3D98B]" />
                <span>ประวัติและรายงานผลตรวจสุขภาพ (Official Medical Reports)</span>
              </h3>
              <span className="text-xs bg-[#D4AF37]/15 text-[#F3D98B] px-3 py-1 rounded-full border border-[#D4AF37]/40 font-mono">
                {patientResults.length} RECORDS
              </span>
            </div>

            <div className="p-6 sm:p-8">
              {patientResults.length > 0 ? (
                <div className="space-y-4">
                  {patientResults.map((result) => (
                    <div
                      key={result.id}
                      className="bg-[#F9FBF9] border border-[#064E3B]/20 p-5 rounded-2xl hover:border-[#D4AF37]/60 hover:bg-[#F2F7F4] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-[#064E3B] font-mono">
                            วันที่ตรวจ: {result.examDate}
                          </span>
                          <span className="bg-[#FBF7EC] text-[#8A6114] border border-[#D4AF37]/40 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                            ID: {result.id}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-base">ใบรายงานผลตรวจสุขภาพอย่างเป็นทางการ</h4>
                        <p className="text-xs text-slate-500 line-clamp-1">{result.summary}</p>
                        <p className="text-[11px] text-slate-400">แพทย์ผู้ตรวจ: {result.doctorName} {result.doctorLicense ? `(${result.doctorLicense})` : ''}</p>
                      </div>

                      <button
                        onClick={() => setActiveResultReport(result)}
                        className="text-xs font-bold text-white bg-gradient-to-r from-[#064E3B] to-[#047857] hover:from-[#04392B] hover:to-[#065F46] border border-[#D4AF37]/40 px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <FileText className="h-4 w-4 text-[#F3D98B]" />
                        <span>เปิดอ่าน / พิมพ์รายงาน PDF</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-sm text-slate-400 space-y-2">
                  <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-medium">ไม่พบผลการตรวจสุขภาพย้อนหลังของท่านในระบบออนไลน์</p>
                  <p className="text-xs text-slate-400">
                    หากท่านเพิ่งเข้ารับการตรวจสุขภาพ กรุณารอแพทย์และพยาบาลสรุปผลตรวจและลงนามในระบบ
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* PERSONALIZED HEALTH COMPANION */}
          {patientResults.length > 0 && (
            <div className="bg-gradient-to-tr from-[#F2F7F4] via-[#F9FBF9] to-[#FBF7EC]/70 border border-[#D4AF37]/40 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 text-[#064E3B]">
                <Sparkles className="h-5 w-5 text-[#8A6114]" />
                <h4 className="text-base font-extrabold">ระบบส่งเสริมสุขภาพส่วนบุคคล (Personal Health Companion)</h4>
              </div>
              <p className="text-xs text-slate-500">วิเคราะห์ผลแลปตรวจล่าสุดของคุณโดยระบบการแพทย์เพื่อมอบสุขนิสัยที่ดีเฉพาะบุคคล</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {patientResults.map((res) => (
                  <React.Fragment key={res.id}>
                    {res.physical.bmi > 24.9 && (
                      <div className="bg-white p-4 rounded-2xl border border-amber-300 text-xs space-y-1 text-left shadow-3xs">
                        <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">ภาวะน้ำหนักเกิน</span>
                        <p className="font-bold text-slate-900">ปรับพฤติกรรมลด BMI: {res.physical.bmi}</p>
                        <p className="text-slate-500 leading-relaxed">
                          ควรขยับกายวันละ 30 นาที และจำกัดอาหารแปรรูป ของหวาน ชาไข่มุก เพื่อช่วยรักษาสุขภาพหลอดเลือดและหัวใจ
                        </p>
                      </div>
                    )}
                    {res.parameters.uricAcid && res.parameters.uricAcid.status === 'ผิดปกติ' && (
                      <div className="bg-white p-4 rounded-2xl border border-rose-300 text-xs space-y-1 text-left shadow-3xs">
                        <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">กรดยูริกสูง</span>
                        <p className="font-bold text-slate-900">หลีกเลี่ยงเก๊าท์กำเริบ</p>
                        <p className="text-slate-500 leading-relaxed">
                          หลีกเลี่ยงการดื่มเครื่องดื่มแอลกอฮอล์ ยอดผัก เครื่องในสัตว์ สัตว์ปีก และดื่มน้ำสะอาดมากๆ เพื่อช่วยขับกรดยูริกออกจากไต
                        </p>
                      </div>
                    )}
                    {res.parameters.fbs && (res.parameters.fbs.status === 'ผิดปกติ' || res.parameters.fbs.status === 'เสี่ยงสูง') && (
                      <div className="bg-white p-4 rounded-2xl border border-amber-300 text-xs space-y-1 text-left shadow-3xs">
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">เสี่ยงภาวะน้ำตาลสูง</span>
                        <p className="font-bold text-slate-900">ควบคุมระดับเบาหวาน</p>
                        <p className="text-slate-500 leading-relaxed">
                          งดน้ำตาลขัดสี ทานข้าวซ้อมมือ ข้าวไรซ์เบอร์รี่ และเพิ่มมวลกล้ามเนื้อด้วยการเวทเทรนนิ่งเพื่อเพิ่มการดูดซึมน้ำตาลของกล้ามเนื้อ
                        </p>
                      </div>
                    )}
                  </React.Fragment>
                ))}
                <div className="bg-white p-4 rounded-2xl border border-[#D4AF37]/45 text-xs space-y-1 text-left shadow-3xs">
                  <span className="bg-[#F2F7F4] text-[#064E3B] border border-[#064E3B]/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">ตรวจคัดกรองประจำปี</span>
                  <p className="font-bold text-slate-900">ตรวจติดตามสุขภาพสม่ำเสมอ</p>
                  <p className="text-slate-500 leading-relaxed">
                    ควรเข้ารับการคัดกรองตรวจสุขภาพอย่างน้อยปีละ 1 ครั้ง และทำการประเมินสุขภาวะ LM 6 เสาหลักเพื่อตรวจเช็กสุขนิสัยเป็นประจำ
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: LM 6 PILLARS ASSESSMENT */}
      {patientSubTab === 'assessment' && (
        <div className="bg-white rounded-3xl border border-[#D4AF37]/35 shadow-sm p-6 sm:p-8 space-y-6 text-left">
          {/* Post-Selection Guided Banner inside LM6 (before final save) */}
          {pendingBookingDraft && (
            <div className="bg-gradient-to-r from-[#F2F7F4] via-[#FBF7EC] to-[#F2F7F4] border-2 border-[#D4AF37]/60 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[#03241B] font-bold text-xs sm:text-sm">
                  <Calendar className="h-5 w-5 text-[#064E3B] shrink-0" />
                  <span>
                    รายการที่เลือกไว้: {pendingBookingDraft.date} ({pendingBookingDraft.time} น.) · {pendingBookingDraft.totalCost.toLocaleString()} บาท
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowBookingForm(true);
                    setPatientSubTab('appointments');
                  }}
                  className="text-xs font-bold text-[#064E3B] hover:text-[#8A6114] underline cursor-pointer self-start sm:self-auto shrink-0"
                >
                  &larr; กลับไปแก้ไขโปรแกรม / รายการตรวจ
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200">
                  ✓ 1. เลือกโปรแกรมและวัน-เวลาแล้ว
                </span>
                <span className="text-slate-400">&rarr;</span>
                <span className={`px-2.5 py-1 rounded-lg border ${lmStep === 'results' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-[#064E3B] text-[#F3D98B] border-[#D4AF37]/60'}`}>
                  {lmStep === 'results' ? '✓ 2. ประเมิน LM6 เสร็จสิ้น' : '● 2. ทำแบบประเมินสุขภาวะวิถีชีวิต (LM6)'}
                </span>
                <span className="text-slate-400">&rarr;</span>
                <span className={`px-2.5 py-1 rounded-lg border ${lmStep === 'results' ? 'bg-[#064E3B] text-[#F3D98B] border-[#D4AF37]/60' : 'bg-white text-slate-500 border-slate-200'}`}>
                  {lmStep === 'results' ? '● 3. กดบันทึกเพื่อการจองคิวในนัดหมาย' : '3. บันทึกเพื่อการจองคิวในนัดหมาย'}
                </span>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-r from-[#03241B] via-[#064E3B] to-[#04392B] text-white p-4 sm:p-5 rounded-2xl shadow-sm flex items-center justify-between border-b-2 border-[#D4AF37]">
            <div className="flex items-center space-x-3">
              <div className="bg-[#D4AF37]/15 border border-[#D4AF37]/35 p-2.5 rounded-xl">
                <Activity className="h-6 w-6 text-[#F3D98B]" />
              </div>
              <div>
                <h3 className="font-black text-base sm:text-lg">ประเมินพฤติกรรมสุขภาพ LM 6 เสาหลัก (Lifestyle Medicine)</h3>
                <p className="text-xs text-emerald-100/85">การคัดกรองพฤติกรรมสุขภาพเบื้องต้น 6 ด้านเพื่อรับคำแนะนำในการปรับเปลี่ยนพฤติกรรมเฉพาะบุคคล</p>
              </div>
            </div>
          </div>

          {lmStep === 'intro' && (
            <div className="space-y-5">
              <div className="bg-[#F2F7F4] p-5 rounded-2xl text-xs text-[#03241B] space-y-3 border border-[#D4AF37]/35">
                <p className="font-bold text-sm">6 เสาหลักเวชศาสตร์วิถีชีวิตประกอบด้วย:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-[#064E3B]/15">
                    <p className="font-bold text-[#064E3B]">1. โภชนาการที่ดี (Nutrition)</p>
                    <p className="text-[11px] text-slate-500 mt-1">เน้นอาหารจากพืช ไม่ผ่านการแปรรูป ลดหวาน มัน เค็ม</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-[#064E3B]/15">
                    <p className="font-bold text-[#064E3B]">2. การขยับกายออกกำลังกาย (Physical Activity)</p>
                    <p className="text-[11px] text-slate-500 mt-1">ขยับกายสม่ำเสมออย่างน้อย 150 นาทีต่อสัปดาห์</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-[#064E3B]/15">
                    <p className="font-bold text-[#064E3B]">3. การจัดการความเครียด (Stress Management)</p>
                    <p className="text-[11px] text-slate-500 mt-1">ฝึกสติ ผ่อนคลายกล้ามเนื้อ และทำกิจกรรมที่ชอบ</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-[#064E3B]/15">
                    <p className="font-bold text-[#064E3B]">4. หลีกเลี่ยงสารอันตราย (Avoid Substances)</p>
                    <p className="text-[11px] text-slate-500 mt-1">งดสูบบุหรี่ บุหรี่ไฟฟ้า และจำกัดแอลกอฮอล์</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-[#064E3B]/15">
                    <p className="font-bold text-[#064E3B]">5. การนอนหลับที่มีคุณภาพ (Sleep)</p>
                    <p className="text-[11px] text-slate-500 mt-1">นอนหลับ 7-8 ชั่วโมงต่อคืนอย่างต่อเนื่อง</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-[#064E3B]/15">
                    <p className="font-bold text-[#064E3B]">6. ความสัมพันธ์ทางสังคม (Social Connection)</p>
                    <p className="text-[11px] text-slate-500 mt-1">สร้างสัมพันธภาพเชิงบวกกับคนรอบข้าง</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setLmStep('questions')}
                className="w-full bg-gradient-to-r from-[#064E3B] to-[#047857] hover:from-[#04392B] hover:to-[#065F46] text-white font-black py-3.5 px-6 rounded-2xl text-sm shadow-md border border-[#D4AF37]/45 transition-all text-center cursor-pointer flex justify-center items-center gap-2"
              >
                <span>เริ่มทำแบบประเมินพฤติกรรมสุขภาพ (6 เสาหลัก)</span>
                <ArrowRight className="h-4 w-4 text-[#F3D98B]" />
              </button>
            </div>
          )}

          {lmStep === 'questions' && (
            <div className="space-y-5 bg-[#F9FBF9] p-5 sm:p-6 rounded-2xl border border-[#064E3B]/15">
              <div className="flex justify-between items-center text-xs font-bold text-[#03241B] border-b border-slate-200 pb-3">
                <span className="bg-[#FBF7EC] text-[#8A6114] border border-[#D4AF37]/40 px-3 py-1 rounded-full">
                  เสาหลักที่ {currentPillarIndex + 1} จาก 6 เสาหลัก
                </span>
                <span className="text-[#064E3B] font-extrabold text-sm">
                  {LM6_PILLARS_DETAILS[currentPillar].title}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200">
                {LM6_PILLARS_DETAILS[currentPillar].desc}
              </p>

              {/* Sub-questions for current pillar */}
              <div className="space-y-4 pt-2">
                {currentPillarQuestions.map((q) => (
                  <div key={q.id} className="space-y-2 bg-white p-4 rounded-xl border border-slate-200">
                    <p className="text-xs font-bold text-slate-900">{q.text}</p>
                    <p className="text-[11px] text-slate-400">{q.description}</p>
                    <div className="flex justify-between gap-1.5 pt-1">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          type="button"
                          onClick={() => handleAnswerChange(q.id, score)}
                          className={`flex-1 py-2 px-1 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                            lmAnswers[q.id] === score
                              ? 'bg-gradient-to-r from-[#064E3B] to-[#047857] border-[#D4AF37] text-white shadow-xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-[#F2F7F4]'
                          }`}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-400 font-medium font-mono px-1">
                      <span>แทบไม่ได้ทำ (1)</span>
                      <span>สม่ำเสมอทุกวัน (5)</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Controls */}
              <div className="flex justify-between gap-3 pt-3 border-t border-slate-200">
                <button
                  disabled={currentPillarIndex === 0}
                  onClick={() => setCurrentPillarIndex(idx => idx - 1)}
                  className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-white border border-slate-200 text-slate-700 disabled:opacity-40 cursor-pointer"
                >
                  ก่อนหน้า
                </button>
                {currentPillarIndex < pillars.length - 1 ? (
                  <button
                    disabled={!isCurrentPillarComplete()}
                    onClick={() => setCurrentPillarIndex(idx => idx + 1)}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl text-white transition-all cursor-pointer ${
                      isCurrentPillarComplete() ? 'bg-gradient-to-r from-[#064E3B] to-[#047857] hover:from-[#04392B] hover:to-[#065F46] border border-[#D4AF37]/40 shadow-xs' : 'bg-slate-300 cursor-not-allowed'
                    }`}
                  >
                    ถัดไป
                  </button>
                ) : (
                  <button
                    disabled={!isCurrentPillarComplete()}
                    onClick={calculateLM6Results}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl text-white transition-all cursor-pointer ${
                      isCurrentPillarComplete() ? 'bg-gradient-to-r from-[#064E3B] to-[#047857] hover:from-[#04392B] hover:to-[#065F46] border border-[#D4AF37]/40 shadow-md' : 'bg-slate-300 cursor-not-allowed'
                    }`}
                  >
                    เสร็จสิ้นและสรุปผล
                  </button>
                )}
              </div>
            </div>
          )}

          {lmStep === 'results' && patientAssessments.length > 0 && (
            <div className="space-y-5">
              <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl text-xs text-emerald-950 text-center font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span>✓ ประเมินเรียบร้อยแล้ว! ข้อมูลพฤติกรรมบันทึกเข้าระบบเพื่อใช้ส่งเสริมการแพทย์แล้ว</span>
              </div>

              {pendingBookingDraft ? (
                <div className="bg-gradient-to-r from-[#03241B] via-[#064E3B] to-[#04392B] text-white p-5 rounded-2xl border-2 border-[#D4AF37] shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-[#F3D98B]">
                      ขั้นตอนสุดท้าย · บันทึกคิวนัดหมายใหม่เข้าสู่ระบบ
                    </p>
                    <p className="text-sm sm:text-base font-black">
                      {pendingBookingDraft.basicProgramName}
                    </p>
                    <p className="text-xs text-emerald-100/90">
                      วันที่ {pendingBookingDraft.date} · เวลา {pendingBookingDraft.time} น. · ค่าบริการรวม {pendingBookingDraft.totalCost.toLocaleString()} บาท
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleConfirmSavePendingBooking}
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] via-[#ECCF73] to-[#C89D3C] hover:brightness-105 text-[#03241B] font-black text-xs sm:text-sm px-5 py-3.5 rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>ยืนยันบันทึกจองคิวนัดหมายตรวจสุขภาพ</span>
                  </button>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-[#03241B] via-[#064E3B] to-[#04392B] text-white p-5 rounded-2xl border-2 border-[#D4AF37] shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-[#F3D98B]">
                      ต้องการจองคิวตรวจสุขภาพสำหรับการมารับบริการครั้งถัดไป?
                    </p>
                    <p className="text-sm sm:text-base font-black">
                      สามารถทำนัดหมายใหม่เพิ่มเติมได้ทันที
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBookingForm(true);
                      setPatientSubTab('appointments');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] via-[#ECCF73] to-[#C89D3C] hover:brightness-105 text-[#03241B] font-black text-xs sm:text-sm px-5 py-3 rounded-xl shadow-sm transition-all cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                    <span>จองคิวนัดหมายตรวจสุขภาพ (ครั้งใหม่)</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Score results card */}
              <div className="space-y-3 bg-[#F9FBF9] p-5 rounded-2xl border border-[#064E3B]/15">
                <p className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-2">ผลคะแนนเฉลี่ย 6 เสาหลัก (เต็ม 15):</p>
                {Object.entries(patientAssessments[patientAssessments.length - 1].scores).map(([key, val]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700">{LM6_PILLARS_DETAILS[key as keyof typeof LM6_PILLARS_DETAILS].title}</span>
                      <span className="font-mono text-[#8A6114] font-bold">{val} / 15</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${val < 9 ? 'bg-rose-500' : val < 13 ? 'bg-amber-500' : 'bg-gradient-to-r from-[#064E3B] to-[#10B981]'}`}
                        style={{ width: `${(val / 15) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-xs text-slate-700 space-y-2 bg-[#FBF7EC] p-4 rounded-2xl border border-[#D4AF37]/40 leading-normal">
                <p className="font-bold text-[#03241B]">คำแนะนำสุขภาพจากแพทย์และพยาบาล:</p>
                {patientAssessments[patientAssessments.length - 1].recommendations.map((rec, idx) => (
                  <p key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#8A6114]">•</span>
                    <span>{rec}</span>
                  </p>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {pendingBookingDraft ? (
                  <button
                    type="button"
                    onClick={handleConfirmSavePendingBooking}
                    className="flex-1 bg-gradient-to-r from-[#D4AF37] via-[#ECCF73] to-[#C89D3C] hover:brightness-105 text-[#03241B] font-black py-3.5 px-4 rounded-xl text-xs sm:text-sm text-center cursor-pointer transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>ยืนยันบันทึกจองคิวนัดหมายตรวจสุขภาพ</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setShowBookingForm(true);
                      setPatientSubTab('appointments');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex-1 bg-gradient-to-r from-[#D4AF37] via-[#ECCF73] to-[#C89D3C] hover:brightness-105 text-[#03241B] font-black py-3 px-4 rounded-xl text-xs text-center cursor-pointer transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>จองคิวนัดหมายตรวจสุขภาพ (ครั้งถัดไป)</span>
                  </button>
                )}
                <button
                  onClick={resetLM6}
                  className="flex-1 bg-gradient-to-r from-[#064E3B] to-[#047857] hover:from-[#04392B] hover:to-[#065F46] text-white font-bold py-3 px-4 rounded-xl text-xs text-center cursor-pointer transition-all border border-[#D4AF37]/40"
                >
                  ทำแบบประเมินอีกครั้ง
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
