import React, { useState } from 'react';
import { Patient, Appointment, LM6Assessment, LabResult, AttachedFile } from '../types';
import { BASIC_TESTS, SPECIAL_TESTS, LM6_QUESTIONS, LM6_PILLARS_DETAILS, getBasicProgramDetails } from '../data';
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

  const activeAppointment = patientAppointments.find((ap) => ap.status === 'pending' || ap.status === 'pending_results');

  const recommendedBasicProgram = loggedInPatient
    ? getBasicProgramDetails(loggedInPatient.gender, loggedInPatient.age)
    : null;

  const over35ExclusiveTests = [
    'fbs', 'creatinine', 'bun', 'uricAcid', 'sgot', 'sgpt', 'alk', 'cholesterol', 'triglyceride'
  ];

  const availableBasicTests = recommendedBasicProgram && loggedInPatient
    ? (loggedInPatient.age < 35
        ? [...recommendedBasicProgram.tests, ...over35ExclusiveTests]
        : recommendedBasicProgram.tests)
    : [];

  // Sync selectedBasicTests with recommendedBasicProgram
  React.useEffect(() => {
    if (recommendedBasicProgram) {
      setSelectedBasicTests(recommendedBasicProgram.tests);
    }
  }, [recommendedBasicProgram?.name]);

  // Handle Booking Appointment
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

    const newApp: Appointment = {
      id: 'ap_' + Date.now(),
      patientId: loggedInPatient.id,
      date: bookDate,
      time: bookTime,
      basicProgramName: recommendedBasicProgram.name,
      basicProgramPrice: basicCost,
      selectedBasicTests: selectedBasicTests,
      specialTests: selectedSpecialTests,
      totalCost: total,
      status: 'pending',
      patientType: bookPatientType,
      agencyName: bookPatientType === 'agency' ? bookAgencyName.trim() : undefined,
      medicalCoverage: bookMedicalCoverage
    };

    onBookAppointment(newApp);
    setBookingSuccess(true);
    setBookDate('');
    setBookPatientType('walk-in');
    setBookAgencyName('');
    setBookMedicalCoverage('ชำระเงินเอง');
    // will be auto-reset by useEffect anyway, but reset to show empty specials:
    setSelectedSpecialTests([]);
    setTimeout(() => {
      setBookingSuccess(false);
    }, 3000);
  };

  const handleToggleSpecialTest = (testId: string) => {
    if (selectedSpecialTests.includes(testId)) {
      setSelectedSpecialTests(selectedSpecialTests.filter((id) => id !== testId));
    } else {
      setSelectedSpecialTests([...selectedSpecialTests, testId]);
    }
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
        <div className="bg-white rounded-3xl shadow-lg border border-[#CBD5E1] overflow-hidden">
          {/* Header */}
          <div className="bg-[#1E3A8A] px-6 py-8 text-center text-white relative">
            <div className="absolute inset-0 bg-white opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <Heart className="h-10 w-10 text-white/80 mx-auto mb-3" />
            <h3 className="text-xl font-bold">เข้าใช้งานระบบผู้รับบริการ</h3>
            <p className="text-sky-200 text-xs mt-1">
              โรงพยาบาลมหาวิทยาลัยอุบลราชธานี
            </p>
          </div>

          {/* Toggle Tab Ribbons */}
          <div className="flex border-b border-slate-200 bg-slate-100/90 p-1.5 gap-1">
            <button
              onClick={() => {
                setIsRegistering(false);
                setLoginError('');
                setRegError('');
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                !isRegistering ? 'bg-gradient-to-r from-blue-700 to-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-blue-800'
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
                isRegistering ? 'bg-gradient-to-r from-blue-700 to-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-blue-800'
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
                      className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent font-mono"
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
                      className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 leading-normal">
                    * รหัสผ่านที่ท่านกำหนดขึ้นเองขณะลงทะเบียน (เช่น ABCD1234)
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white font-bold py-3 px-4 rounded-xl text-sm shadow-md shadow-[#1E3A8A]/10 hover:shadow-lg transition-all cursor-pointer flex justify-center items-center space-x-2"
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
                    className="px-4 py-2.5 w-full border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">เพศ</label>
                    <select
                      value={regGender}
                      onChange={(e) => setRegGender(e.target.value as 'female' | 'male')}
                      className="px-4 py-2.5 w-full border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
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
                <div className="space-y-2 bg-gradient-to-br from-sky-50/80 via-blue-50/50 to-slate-50 p-4 rounded-2xl border border-sky-200">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#1E3A8A] uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-blue-700 shrink-0" />
                      <span>วันเดือนปีเกิด (กำหนดเป็น ค.ศ. ชัดเจน)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setUseCalendarPicker(!useCalendarPicker)}
                      className="text-[11px] text-blue-700 hover:text-blue-900 font-bold underline cursor-pointer"
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
                          className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm bg-white font-medium focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none"
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
                          className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm bg-white font-medium focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none"
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
                        <label className="block text-[11px] font-bold text-blue-950 mb-1">ปีเกิด ค.ศ. (เทียบ พ.ศ.)</label>
                        <select
                          value={regBirthYear}
                          onChange={(e) => updateBirthDateFromDropdowns(regBirthDay, regBirthMonth, e.target.value)}
                          className="w-full px-3 py-2.5 border-2 border-blue-600/40 rounded-xl text-sm bg-white font-bold text-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none"
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
                        className="px-4 py-2.5 w-full border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] font-mono"
                        required
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        * ไม่ว่ามือถือจะแสดงเป็น พ.ศ. หรือ ค.ศ. ระบบจะตรวจจับและแปลงบันทึกเป็น ค.ศ. ให้โดยอัตโนมัติ
                      </p>
                    </div>
                  )}

                  {/* Summary confirmation banner */}
                  {regBirthDate && (
                    <div className="bg-white/95 p-3 rounded-xl border border-sky-300/80 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-3xs mt-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span className="font-bold text-[#1E3A8A]">
                          วันเกิด: {regBirthDate.split('-')[2]} {THAI_MONTHS.find(m => m.value === regBirthDate.split('-')[1])?.name.split(' ')[0]} ค.ศ. {regBirthDate.split('-')[0]} (พ.ศ. {Number(regBirthDate.split('-')[0]) + 543})
                        </span>
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          อายุ {regAge} ปี
                        </span>
                      </div>
                      <div className="text-[11px] text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 font-mono font-bold self-start sm:self-auto">
                        รหัสปี ค.ศ. เกิด: <span className="text-blue-700 font-black">{regBirthDate.split('-')[0]}</span>
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
                    className="px-4 py-2.5 w-full border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent font-mono"
                    required
                  />
                </div>

                <div className="space-y-2 bg-[#F0F7FF] p-4 rounded-2xl border border-[#CBD5E1]">
                  <label className="block text-xs font-bold text-[#1E3A8A] uppercase tracking-wider">
                    ตั้งรหัสผ่านสำหรับดูผลตรวจของคุณเอง
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-[#1E3A8A]/60" />
                    <input
                      type="text"
                      placeholder="เช่น ABCD1234"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value.toUpperCase())}
                      className="pl-10 pr-4 py-2.5 w-full border border-[#CBD5E1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent font-mono font-bold text-[#1E3A8A]"
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
                <div className="bg-[#FAFBF9] border border-[#CBD5E1] p-4 rounded-xl space-y-3">
                  <div className="flex items-start space-x-2.5">
                    <input
                      type="checkbox"
                      id="pdpa-consent"
                      checked={regPdpaConsent}
                      onChange={(e) => setRegPdpaConsent(e.target.checked)}
                      className="mt-1 h-4 w-4 text-[#1E3A8A] border-gray-300 rounded focus:ring-[#1E3A8A]"
                      required
                    />
                    <label htmlFor="pdpa-consent" className="text-xs text-slate-600 leading-relaxed cursor-pointer select-none">
                      ฉันยินยอมให้ <strong className="text-[#1E3A8A]">ศูนย์ตรวจสุขภาพ รพ.มหาวิทยาลัยอุบลราชธานี</strong> เก็บรวบรวม ใช้ และประมวลผลข้อมูลส่วนบุคคลและข้อมูลด้านสุขภาพของฉัน เพื่อวัตถุประสงค์ในการลงทะเบียน นัดหมายล่วงหน้า และประมวลผลเพื่อแสดงรายงานผลตรวจสุขภาพออนไลน์ตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)
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
                      ? 'bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white hover:shadow-lg cursor-pointer'
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
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-sky-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md border-t-4 border-sky-400 relative overflow-hidden">
        <div className="absolute inset-0 bg-white opacity-5 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="space-y-1.5 relative z-10">
          <span className="text-[10px] font-black uppercase tracking-widest text-sky-300 font-mono bg-sky-500/20 px-2.5 py-0.5 rounded border border-sky-400/30">
            Official Patient e-Card
          </span>
          <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2 flex-wrap">
            <span>{loggedInPatient.name}</span>
            {loggedInPatient.hn && (
              <span className="bg-amber-400 text-slate-900 text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg shadow-xs shrink-0 font-mono">
                HN: {loggedInPatient.hn}
              </span>
            )}
          </h2>
          <p className="text-xs text-sky-200">
            สิทธิในการคัดกรอง: {loggedInPatient.gender === 'female' ? 'เพศหญิง' : 'เพศชาย'} • อายุ {loggedInPatient.age} ปี • เบอร์โทร: {loggedInPatient.phone}
          </p>
        </div>
        <button
          onClick={() => setLoggedInPatient(null)}
          className="text-xs font-bold text-rose-300 hover:text-white bg-white/10 hover:bg-rose-600/40 px-4 py-2 rounded-xl transition-all border border-white/20 relative z-10 cursor-pointer"
        >
          ออกจากระบบ
        </button>
      </div>

      {/* Tab Navigation Ribbon Bar for Patients (แถบนำทางหลักสำหรับผู้รับบริการ) */}
      <div className="flex flex-wrap bg-white p-1.5 rounded-2xl border border-slate-200 shadow-3xs gap-1.5">
        <button
          onClick={() => setPatientSubTab('appointments')}
          className={`flex-1 min-w-[200px] py-3 px-4 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            patientSubTab === 'appointments'
              ? 'bg-gradient-to-r from-blue-700 to-sky-600 text-white shadow-sm shadow-blue-500/20'
              : 'text-slate-600 hover:text-blue-700 hover:bg-slate-50'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>1. การนัดหมาย & จองคิวตรวจ</span>
          {activeAppointment && (
            <span className="bg-sky-300 text-blue-950 text-[10px] px-2 py-0.5 rounded-full font-black ml-1">
              มี 1 คิว
            </span>
          )}
        </button>
        <button
          onClick={() => setPatientSubTab('results')}
          className={`flex-1 min-w-[200px] py-3 px-4 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            patientSubTab === 'results'
              ? 'bg-gradient-to-r from-blue-700 to-sky-600 text-white shadow-sm shadow-blue-500/20'
              : 'text-slate-600 hover:text-blue-700 hover:bg-slate-50'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>2. ประวัติและรายงานผลตรวจ (PDF)</span>
          {patientResults.length > 0 && (
            <span className="bg-sky-300 text-blue-950 text-[10px] px-2 py-0.5 rounded-full font-black ml-1">
              {patientResults.length} ฉบับ
            </span>
          )}
        </button>
        <button
          onClick={() => setPatientSubTab('assessment')}
          className={`flex-1 min-w-[200px] py-3 px-4 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            patientSubTab === 'assessment'
              ? 'bg-gradient-to-r from-blue-700 to-sky-600 text-white shadow-sm shadow-blue-500/20'
              : 'text-slate-600 hover:text-blue-700 hover:bg-slate-50'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>3. แบบประเมินสุขภาวะวิถีชีวิต (LM6)</span>
        </button>
      </div>

      {/* SUB-TAB 1: APPOINTMENTS & BOOKING */}
      {patientSubTab === 'appointments' && (
        <div className="space-y-8">
          {/* Active Appointment Section if exists */}
          {activeAppointment && (
            <div className="rounded-3xl shadow-sm border border-sky-200 bg-white overflow-hidden">
              <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-sky-800 text-white px-6 py-4 flex items-center justify-between">
                <h3 className="font-extrabold text-sm flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-sky-300" />
                  <span>นัดหมายที่เปิดอยู่ (Active Appointment)</span>
                </h3>
                <span className={`text-xs font-black px-3 py-1 rounded-full border shadow-sm ${
                  activeAppointment.status === 'pending_results'
                    ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                    : 'bg-sky-400 text-blue-950 border-sky-300'
                }`}>
                  {activeAppointment.status === 'pending_results' ? '🔔 ผลออกบางส่วน (ติดตามผลต่อ)' : '📅 นัดหมายสำเร็จ / รอรับบริการ'}
                </span>
              </div>

              <div className="p-6 sm:p-8 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-sky-50/70 p-5 rounded-2xl border border-sky-200">
                  <div className="space-y-1.5">
                    <p className="text-xs text-blue-900 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping"></span>
                      วันและเวลาที่นัดหมายตรวจสุขภาพ
                    </p>
                    <p className="text-lg font-black text-slate-900">
                      {new Date(activeAppointment.date).toLocaleDateString('th-TH', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-blue-950 font-bold flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <Clock className="h-4 w-4 text-sky-600 shrink-0" /> เวลา <span className="bg-sky-200/80 px-2.5 py-0.5 rounded-lg text-blue-950 text-xs font-extrabold font-mono">{activeAppointment.time} น.</span>
                      {(activeAppointment.time?.includes('13:') || activeAppointment.time?.includes('14:') || activeAppointment.time?.includes('13.') || activeAppointment.time?.includes('14.')) && (
                        <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md font-bold">
                          *รอบบ่าย ไม่มีแพทย์ออกตรวจ
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-left sm:text-right bg-white p-4 rounded-xl border border-sky-200 shadow-3xs min-w-[150px]">
                    <p className="text-[10px] text-slate-500 font-bold">อัตราค่าบริการโดยประมาณ</p>
                    <p className="text-2xl font-black text-blue-700 font-mono">{activeAppointment.totalCost.toLocaleString()} บาท</p>
                  </div>
                </div>

                {/* Fasting Warning Indicator */}
                {(loggedInPatient.age >= 35 || activeAppointment.specialTests.length > 0) && (
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl text-xs text-amber-900 flex gap-2.5 border-y border-r border-amber-200">
                    <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                    <div className="space-y-1 text-left">
                      <p className="font-bold text-amber-950">คำแนะนำเตรียมตัวที่สำคัญ (Pre-Examination Guidelines):</p>
                      <p>เนื่องจากมีอายุตั้งแต่ 35 ปีขึ้นไป หรือมีการตรวจตรวจระดับน้ำตาล/ไขมันในเลือด</p>
                      <p className="font-semibold underline">กรุณางดน้ำและอาหารทุกชนิดอย่างน้อย 10 ชั่วโมง ก่อนเข้ารับการบริการ (ดื่มน้ำเปล่าบริสุทธิ์ได้เท่านั้น)</p>
                    </div>
                  </div>
                )}

                <div className="text-xs text-slate-600 space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <p className="font-bold text-blue-950">รายละเอียดคิวตรวจ:</p>
                  <p>• <strong>โปรแกรมพื้นฐาน:</strong> {activeAppointment.basicProgramName}</p>
                  {activeAppointment.selectedBasicTests && activeAppointment.selectedBasicTests.length > 0 && (
                    <p>• <strong>รายการตรวจพื้นฐานที่เลือก:</strong> {activeAppointment.selectedBasicTests.map(tId => BASIC_TESTS[tId]?.name || tId).join(', ')}</p>
                  )}
                  {activeAppointment.specialTests.length > 0 && (
                    <p>• <strong>ตรวจพิเศษเพิ่มเติม:</strong> {activeAppointment.specialTests.map(tId => SPECIAL_TESTS[tId]?.name).join(', ')}</p>
                  )}
                  <p>• <strong>ประเภทผู้รับบริการ:</strong> {activeAppointment.patientType === 'agency' ? `ในนามคณะ/หน่วยงาน (${activeAppointment.agencyName})` : 'Walk-in (ชำระเงิน)'}</p>
                  <p>• <strong>สิทธิการรักษา:</strong> {activeAppointment.medicalCoverage || 'ชำระเงินเอง'}</p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setShowBookingForm(!showBookingForm)}
                    className="text-xs font-bold text-blue-700 hover:text-blue-900 border border-blue-300 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{showBookingForm ? 'ซ่อนฟอร์มจองคิวใหม่' : '+ ต้องการจองคิวนัดหมายเพิ่มเติม'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* New Appointment Form (Shown if no active appointment OR toggled by user) */}
          {(!activeAppointment || showBookingForm) && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 text-left">
              {/* Header Ribbon for Booking */}
              <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-sky-700 text-white p-4 sm:p-5 rounded-2xl shadow-sm flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2.5 rounded-xl">
                    <Calendar className="h-6 w-6 text-sky-200" />
                  </div>
                  <div>
                    <h3 className="font-black text-base sm:text-lg">จองคิวนัดหมายตรวจสุขภาพ</h3>
                    <p className="text-xs text-sky-200">เลือกวัน เวลา และปรับแต่งรายการตรวจสุขภาพตามต้องการ (วันจันทร์ - ศุกร์ 08:00 - 12:00 น.)</p>
                  </div>
                </div>
              </div>

              {bookingSuccess && (
                <div className="bg-sky-50 border border-sky-300 p-4 rounded-xl text-xs text-blue-900 font-bold flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-sky-600" />
                  <span>ส่งคำขอนัดหมายตรวจสุขภาพสำเร็จ! กรุณาเตรียมตัวงดน้ำงดอาหารในคืนก่อนวันนัดหมาย</span>
                </div>
              )}

              <form onSubmit={handleBookAppointment} className="space-y-6">
                {/* แถบขั้นตอนที่ 1: ข้อมูลวัน-เวลาและประเภทการเข้ารับบริการ */}
                <div className="space-y-4">
                  <div className="bg-sky-50 border-l-4 border-blue-700 px-4 py-2 rounded-r-xl font-bold text-xs text-blue-950 flex items-center gap-2">
                    <span className="bg-blue-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]">1</span>
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
                        className="px-3.5 py-2.5 w-full border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
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
                        className="px-3.5 py-2.5 w-full border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
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
                              ? 'bg-blue-700 border-blue-700 text-white shadow-xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          Walk-in
                        </button>
                        <button
                          type="button"
                          onClick={() => setBookPatientType('agency')}
                          className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                            bookPatientType === 'agency'
                              ? 'bg-blue-700 border-blue-700 text-white shadow-xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
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
                        className="px-3.5 py-2.5 w-full border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                        className="px-3.5 py-2.5 w-full border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                        required={bookPatientType === 'agency'}
                      />
                    </div>
                  )}
                </div>

                {/* แถบขั้นตอนที่ 2: โปรแกรมตรวจพื้นฐานตามช่วงวัย */}
                <div className="space-y-4">
                  <div className="bg-sky-50 border-l-4 border-blue-700 px-4 py-2 rounded-r-xl font-bold text-xs text-blue-950 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]">2</span>
                      <span>แถบโปรแกรมตรวจพื้นฐานตามช่วงวัย ({recommendedBasicProgram?.name})</span>
                    </div>
                    <span className="text-blue-800 font-mono font-bold text-xs">
                      {selectedBasicTests.reduce((acc, tId) => acc + (BASIC_TESTS[tId]?.price || 0), 0).toLocaleString()} บาท
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                      <label className="flex items-center space-x-2 cursor-pointer font-bold text-xs text-blue-950">
                        <input
                          type="checkbox"
                          checked={availableBasicTests.length > 0 && selectedBasicTests.length === availableBasicTests.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBasicTests(availableBasicTests);
                            } else {
                              setSelectedBasicTests([]);
                            }
                          }}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                        />
                        <span>เลือกรายการตรวจพื้นฐานทั้งหมด (แนะนำให้ตรวจครบถ้วน)</span>
                      </label>
                      <span className="text-[11px] text-slate-500 font-medium">
                        เลือกแล้ว {selectedBasicTests.length} จาก {availableBasicTests.length} รายการ
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                      {availableBasicTests.map((tId) => {
                        const test = BASIC_TESTS[tId];
                        if (!test) return null;
                        const isChecked = selectedBasicTests.includes(tId);
                        return (
                          <label
                            key={tId}
                            className={`flex items-start space-x-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-white border-blue-400 shadow-3xs text-slate-900 font-medium'
                                : 'border-slate-200 text-slate-500 hover:bg-white opacity-70'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setSelectedBasicTests(selectedBasicTests.filter(id => id !== tId));
                                } else {
                                  setSelectedBasicTests([...selectedBasicTests, tId]);
                                }
                              }}
                              className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                            />
                            <div className="flex-1 text-xs">
                              <div className="flex justify-between items-baseline font-bold">
                                <span>{test.name}</span>
                                <span className="font-mono text-blue-700">
                                  {test.price > 0 ? `+${test.price} บ.` : 'รวมในชุด'}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 line-clamp-1">{test.detail}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* แถบขั้นตอนที่ 3: รายการตรวจพิเศษเสริม (Special Tests) */}
                <div className="space-y-4">
                  <div className="bg-sky-50 border-l-4 border-blue-700 px-4 py-2 rounded-r-xl font-bold text-xs text-blue-950 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]">3</span>
                      <span>แถบรายการตรวจพิเศษเสริมเพิ่มเติม (Special Additional Tests)</span>
                    </div>
                    <span className="text-blue-800 font-mono font-bold text-xs">
                      +{selectedSpecialTests.reduce((acc, tId) => acc + (SPECIAL_TESTS[tId]?.price || 0), 0).toLocaleString()} บาท
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-slate-50/50 space-y-3">
                    <p className="text-xs text-slate-500">
                      ท่านสามารถเลือกรายการตรวจเฉพาะทางเพิ่มเติมได้ตามความต้องการ เช่น ตรวจ Memmogram (2,400 บาท), ตรวจอัลตราซาวด์, หรือตรวจคัดกรองมะเร็ง
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
                                  ? 'bg-white border-blue-600 shadow-xs ring-2 ring-blue-500/10 text-slate-900 font-semibold'
                                  : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleSpecialTest(test.id)}
                                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                              />
                              <div className="flex-1 text-xs">
                                <div className="flex justify-between items-baseline font-bold">
                                  <span className={test.id === 'mammogram' ? 'text-blue-900 font-extrabold' : ''}>{test.name}</span>
                                  <span className="font-mono text-blue-700 font-bold shrink-0">+{test.price.toLocaleString()} บ.</span>
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
                <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-sky-900 text-white p-5 rounded-2xl shadow-md border-t-4 border-sky-400 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="space-y-0.5 text-center sm:text-left">
                    <p className="text-xs font-bold text-sky-200 uppercase tracking-wider">
                      สรุปอัตราค่าบริการสุทธิ (Net Total Amount):
                    </p>
                    <p className="text-xs text-sky-100/80">
                      ตรวจพื้นฐาน: {selectedBasicTests.reduce((acc, tId) => acc + (BASIC_TESTS[tId]?.price || 0), 0).toLocaleString()} บ. + ตรวจพิเศษเสริม: {selectedSpecialTests.reduce((acc, tId) => acc + (SPECIAL_TESTS[tId]?.price || 0), 0).toLocaleString()} บ.
                    </p>
                  </div>
                  <div className="text-center sm:text-right">
                    <span className="text-3xl font-black text-sky-300 font-mono">
                      {(selectedBasicTests.reduce((acc, tId) => acc + (BASIC_TESTS[tId]?.price || 0), 0) + selectedSpecialTests.reduce((acc, tId) => acc + (SPECIAL_TESTS[tId]?.price || 0), 0)).toLocaleString()}
                    </span>
                    <span className="text-sm font-bold text-white ml-1.5">บาท</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-700 to-sky-600 hover:from-blue-800 hover:to-sky-700 text-white font-black py-4 px-6 rounded-2xl text-sm shadow-md hover:shadow-lg transition-all cursor-pointer text-center flex items-center justify-center space-x-2 border-b-4 border-blue-950 active:border-b-0 active:mt-1 hover:scale-[1.005]"
                >
                  <Calendar className="h-5 w-5" />
                  <span>ยืนยันบันทึกจองคิวนัดหมายตรวจสุขภาพ</span>
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: RESULTS & OFFICIAL REPORTS */}
      {patientSubTab === 'results' && (
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-sky-800 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-extrabold text-sm flex items-center space-x-2">
                <FileText className="h-5 w-5 text-sky-300" />
                <span>ประวัติและรายงานผลตรวจสุขภาพ (Official Medical Reports)</span>
              </h3>
              <span className="text-xs bg-sky-500/20 text-sky-200 px-3 py-1 rounded-full border border-sky-400/30 font-mono">
                {patientResults.length} RECORDS
              </span>
            </div>

            <div className="p-6 sm:p-8">
              {patientResults.length > 0 ? (
                <div className="space-y-4">
                  {patientResults.map((result) => (
                    <div
                      key={result.id}
                      className="bg-slate-50 border-l-4 border-blue-600 border-y border-r border-slate-200 p-5 rounded-2xl hover:border-blue-400 hover:bg-sky-50/20 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-blue-900 font-mono">
                            วันที่ตรวจ: {result.examDate}
                          </span>
                          <span className="bg-sky-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                            ID: {result.id}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-base">ใบรายงานผลตรวจสุขภาพอย่างเป็นทางการ</h4>
                        <p className="text-xs text-slate-500 line-clamp-1">{result.summary}</p>
                        <p className="text-[11px] text-slate-400">แพทย์ผู้ตรวจ: {result.doctorName} {result.doctorLicense ? `(${result.doctorLicense})` : ''}</p>
                      </div>

                      <button
                        onClick={() => setActiveResultReport(result)}
                        className="text-xs font-bold text-white bg-gradient-to-r from-blue-700 to-sky-600 hover:from-blue-800 hover:to-sky-700 px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <FileText className="h-4 w-4" />
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
            <div className="bg-gradient-to-tr from-sky-50 via-blue-50/50 to-indigo-50/30 border border-sky-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 text-blue-900">
                <Sparkles className="h-5 w-5 text-sky-600 animate-bounce" />
                <h4 className="text-base font-extrabold">ระบบส่งเสริมสุขภาพส่วนบุคคล (Personal Health Companion)</h4>
              </div>
              <p className="text-xs text-slate-500">วิเคราะห์ผลแลปตรวจล่าสุดของคุณโดยระบบการแพทย์เพื่อมอบสุขนิสัยที่ดีเฉพาะบุคคล</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {patientResults.map((res) => (
                  <React.Fragment key={res.id}>
                    {res.physical.bmi > 24.9 && (
                      <div className="bg-white p-4 rounded-2xl border-l-4 border-amber-500 border-y border-r border-slate-200 text-xs space-y-1 text-left shadow-3xs">
                        <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">ภาวะน้ำหนักเกิน</span>
                        <p className="font-bold text-slate-900">ปรับพฤติกรรมลด BMI: {res.physical.bmi}</p>
                        <p className="text-slate-500 leading-relaxed">
                          ควรขยับกายวันละ 30 นาที และจำกัดอาหารแปรรูป ของหวาน ชาไข่มุก เพื่อช่วยรักษาสุขภาพหลอดเลือดและหัวใจ
                        </p>
                      </div>
                    )}
                    {res.parameters.uricAcid && res.parameters.uricAcid.status === 'ผิดปกติ' && (
                      <div className="bg-white p-4 rounded-2xl border-l-4 border-rose-500 border-y border-r border-slate-200 text-xs space-y-1 text-left shadow-3xs">
                        <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">กรดยูริกสูง</span>
                        <p className="font-bold text-slate-900">หลีกเลี่ยงเก๊าท์กำเริบ</p>
                        <p className="text-slate-500 leading-relaxed">
                          หลีกเลี่ยงการดื่มเครื่องดื่มแอลกอฮอล์ ยอดผัก เครื่องในสัตว์ สัตว์ปีก และดื่มน้ำสะอาดมากๆ เพื่อช่วยขับกรดยูริกออกจากไต
                        </p>
                      </div>
                    )}
                    {res.parameters.fbs && (res.parameters.fbs.status === 'ผิดปกติ' || res.parameters.fbs.status === 'เสี่ยงสูง') && (
                      <div className="bg-white p-4 rounded-2xl border-l-4 border-amber-500 border-y border-r border-slate-200 text-xs space-y-1 text-left shadow-3xs">
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">เสี่ยงภาวะน้ำตาลสูง</span>
                        <p className="font-bold text-slate-900">ควบคุมระดับเบาหวาน</p>
                        <p className="text-slate-500 leading-relaxed">
                          งดน้ำตาลขัดสี ทานข้าวซ้อมมือ ข้าวไรซ์เบอร์รี่ และเพิ่มมวลกล้ามเนื้อด้วยการเวทเทรนนิ่งเพื่อเพิ่มการดูดซึมน้ำตาลของกล้ามเนื้อ
                        </p>
                      </div>
                    )}
                  </React.Fragment>
                ))}
                <div className="bg-white p-4 rounded-2xl border-l-4 border-sky-500 border-y border-r border-slate-200 text-xs space-y-1 text-left shadow-3xs">
                  <span className="bg-sky-100 text-blue-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">ตรวจคัดกรองประจำปี</span>
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
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 text-left">
          <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-sky-700 text-white p-4 sm:p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2.5 rounded-xl">
                <Activity className="h-6 w-6 text-sky-200" />
              </div>
              <div>
                <h3 className="font-black text-base sm:text-lg">ประเมินพฤติกรรมสุขภาพ LM 6 เสาหลัก (Lifestyle Medicine)</h3>
                <p className="text-xs text-sky-200">การคัดกรองพฤติกรรมสุขภาพเบื้องต้น 6 ด้านเพื่อรับคำแนะนำในการปรับเปลี่ยนพฤติกรรมเฉพาะบุคคล</p>
              </div>
            </div>
          </div>

          {lmStep === 'intro' && (
            <div className="space-y-5">
              <div className="bg-sky-50/80 p-5 rounded-2xl text-xs text-blue-950 space-y-3 border border-sky-200">
                <p className="font-bold text-sm">6 เสาหลักเวชศาสตร์วิถีชีวิตประกอบด้วย:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-sky-100">
                    <p className="font-bold text-blue-900">1. โภชนาการที่ดี (Nutrition)</p>
                    <p className="text-[11px] text-slate-500 mt-1">เน้นอาหารจากพืช ไม่ผ่านการแปรรูป ลดหวาน มัน เค็ม</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-sky-100">
                    <p className="font-bold text-blue-900">2. การขยับกายออกกำลังกาย (Physical Activity)</p>
                    <p className="text-[11px] text-slate-500 mt-1">ขยับกายสม่ำเสมออย่างน้อย 150 นาทีต่อสัปดาห์</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-sky-100">
                    <p className="font-bold text-blue-900">3. การจัดการความเครียด (Stress Management)</p>
                    <p className="text-[11px] text-slate-500 mt-1">ฝึกสติ ผ่อนคลายกล้ามเนื้อ และทำกิจกรรมที่ชอบ</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-sky-100">
                    <p className="font-bold text-blue-900">4. หลีกเลี่ยงสารอันตราย (Avoid Substances)</p>
                    <p className="text-[11px] text-slate-500 mt-1">งดสูบบุหรี่ บุหรี่ไฟฟ้า และจำกัดแอลกอฮอล์</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-sky-100">
                    <p className="font-bold text-blue-900">5. การนอนหลับที่มีคุณภาพ (Sleep)</p>
                    <p className="text-[11px] text-slate-500 mt-1">นอนหลับ 7-8 ชั่วโมงต่อคืนอย่างต่อเนื่อง</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-sky-100">
                    <p className="font-bold text-blue-900">6. ความสัมพันธ์ทางสังคม (Social Connection)</p>
                    <p className="text-[11px] text-slate-500 mt-1">สร้างสัมพันธภาพเชิงบวกกับคนรอบข้าง</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setLmStep('questions')}
                className="w-full bg-gradient-to-r from-blue-700 to-sky-600 hover:from-blue-800 hover:to-sky-700 text-white font-black py-3.5 px-6 rounded-2xl text-sm shadow-md transition-all text-center cursor-pointer flex justify-center items-center gap-2"
              >
                <span>เริ่มทำแบบประเมินพฤติกรรมสุขภาพ (6 เสาหลัก)</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {lmStep === 'questions' && (
            <div className="space-y-5 bg-slate-50/80 p-5 sm:p-6 rounded-2xl border border-slate-200">
              <div className="flex justify-between items-center text-xs font-bold text-blue-950 border-b border-slate-200 pb-3">
                <span className="bg-blue-100 text-blue-900 px-3 py-1 rounded-full">
                  เสาหลักที่ {currentPillarIndex + 1} จาก 6 เสาหลัก
                </span>
                <span className="text-blue-700 font-extrabold text-sm">
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
                              ? 'bg-gradient-to-r from-blue-700 to-sky-600 border-blue-600 text-white shadow-xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
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
                      isCurrentPillarComplete() ? 'bg-gradient-to-r from-blue-700 to-sky-600 hover:from-blue-800 hover:to-sky-700 shadow-xs' : 'bg-slate-300 cursor-not-allowed'
                    }`}
                  >
                    ถัดไป
                  </button>
                ) : (
                  <button
                    disabled={!isCurrentPillarComplete()}
                    onClick={calculateLM6Results}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl text-white transition-all cursor-pointer ${
                      isCurrentPillarComplete() ? 'bg-gradient-to-r from-blue-700 to-sky-600 hover:from-blue-800 hover:to-sky-700 shadow-md' : 'bg-slate-300 cursor-not-allowed'
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
              <div className="bg-sky-50 border border-sky-300 p-4 rounded-xl text-xs text-blue-900 text-center font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-sky-600" />
                <span>✓ ประเมินเรียบร้อยแล้ว! ข้อมูลพฤติกรรมบันทึกเข้าระบบเพื่อใช้ส่งเสริมการแพทย์แล้ว</span>
              </div>

              {/* Score results card */}
              <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <p className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-2">ผลคะแนนเฉลี่ย 6 เสาหลัก (เต็ม 15):</p>
                {Object.entries(patientAssessments[patientAssessments.length - 1].scores).map(([key, val]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700">{LM6_PILLARS_DETAILS[key as keyof typeof LM6_PILLARS_DETAILS].title}</span>
                      <span className="font-mono text-blue-700 font-bold">{val} / 15</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${val < 9 ? 'bg-rose-500' : val < 13 ? 'bg-amber-500' : 'bg-gradient-to-r from-blue-600 to-sky-500'}`}
                        style={{ width: `${(val / 15) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-xs text-slate-700 space-y-2 bg-sky-50/70 p-4 rounded-2xl border border-sky-200 leading-normal">
                <p className="font-bold text-blue-950">คำแนะนำสุขภาพจากแพทย์และพยาบาล:</p>
                {patientAssessments[patientAssessments.length - 1].recommendations.map((rec, idx) => (
                  <p key={idx} className="flex items-start gap-1.5">
                    <span className="text-blue-600">•</span>
                    <span>{rec}</span>
                  </p>
                ))}
              </div>

              <button
                onClick={resetLM6}
                className="w-full bg-gradient-to-r from-blue-700 to-sky-600 hover:from-blue-800 hover:to-sky-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs text-center cursor-pointer transition-all"
              >
                ทำแบบประเมินอีกครั้ง
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
