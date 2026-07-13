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

  // 6 Pillars identifiers
  const pillars: ('nutrition' | 'physicalActivity' | 'stressManagement' | 'avoidSubstances' | 'restorativeSleep' | 'socialConnection')[] = [
    'nutrition', 'physicalActivity', 'stressManagement', 'avoidSubstances', 'restorativeSleep', 'socialConnection'
  ];

  // Password requirement regex check
  const isPasswordValid = (pw: string) => /^[A-Z]{4}\d{4,6}$/.test(pw);

  // Calculate age helper
  const calculateAge = (bDateStr: string) => {
    if (!bDateStr) return 0;
    const birth = new Date(bDateStr);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      calculatedAge--;
    }
    return calculatedAge > 0 ? calculatedAge : 0;
  };

  const handleBirthDateChange = (dateStr: string) => {
    setRegBirthDate(dateStr);
    const calculated = calculateAge(dateStr);
    setRegAge(calculated);
  };

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const inputId = loginIdentity.trim();
    const found = patients.find((p) => {
      if (!p.birthDate || !p.hn) return false;
      const birthYear = p.birthDate.substring(0, 4); // YYYY from YYYY-MM-DD
      const expectedId = `${birthYear}${p.hn}`;
      return expectedId === inputId && p.password === loginPassword.trim();
    });

    if (found) {
      setLoggedInPatient(found);
      setLoginIdentity('');
      setLoginPassword('');
    } else {
      setLoginError('รหัสระบุตัวตน (ค.ศ.เกิด + HN) หรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง (สำหรับผู้รับบริการใหม่ กรุณารอเจ้าหน้าที่ออกหมายเลข HN ในระบบก่อนเข้าสู่ระบบ)');
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
        <div className="bg-white rounded-3xl shadow-lg border border-[#E0E4D9] overflow-hidden">
          {/* Header */}
          <div className="bg-[#4A6741] px-6 py-8 text-center text-white relative">
            <div className="absolute inset-0 bg-white opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <Heart className="h-10 w-10 text-white/80 mx-auto mb-3" />
            <h3 className="text-xl font-bold">เข้าใช้งานระบบผู้รับบริการ</h3>
            <p className="text-green-100 text-xs mt-1">
              โรงพยาบาลมหาวิทยาลัยอุบลราชธานี
            </p>
          </div>

          {/* Toggle Tab */}
          <div className="flex border-b border-[#E0E4D9] bg-[#F2F4ED] p-1">
            <button
              onClick={() => {
                setIsRegistering(false);
                setLoginError('');
                setRegError('');
              }}
              className={`flex-1 py-3 text-sm font-semibold rounded-2xl transition-all ${
                !isRegistering ? 'bg-white text-[#4A6741] shadow-sm' : 'text-slate-500 hover:text-[#4A6741]'
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
              className={`flex-1 py-3 text-sm font-semibold rounded-2xl transition-all ${
                isRegistering ? 'bg-white text-[#4A6741] shadow-sm' : 'text-slate-500 hover:text-[#4A6741]'
              }`}
            >
              ลงทะเบียนใหม่
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
                    รหัสระบุตัวตน (ค.ศ.เกิด + HN)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      maxLength={20}
                      placeholder="เช่น ค.ศ.เกิด 1995 + HN 8249 = 19958249"
                      value={loginIdentity}
                      onChange={(e) => setLoginIdentity(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                      className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4A6741] focus:border-transparent font-mono"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 leading-normal">
                    * กรอกปี ค.ศ. เกิดของท่าน (4 หลัก) ติดกันด้วยหมายเลข HN ของท่าน
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
                      className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4A6741] focus:border-transparent"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 leading-normal">
                    * รหัสผ่านที่ท่านกำหนดขึ้นเองขณะลงทะเบียน (เช่น ABCD1234)
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#4A6741] hover:bg-[#3d5635] text-white font-bold py-3 px-4 rounded-xl text-sm shadow-md shadow-[#4A6741]/10 hover:shadow-lg transition-all cursor-pointer flex justify-center items-center space-x-2"
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
                    className="px-4 py-2.5 w-full border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4A6741] focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">เพศ</label>
                    <select
                      value={regGender}
                      onChange={(e) => setRegGender(e.target.value as 'female' | 'male')}
                      className="px-4 py-2.5 w-full border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4A6741] focus:border-transparent"
                    >
                      <option value="female">เพศหญิง</option>
                      <option value="male">เพศชาย</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">วันเดือนปีเกิด (ค.ศ.)</label>
                    <input
                      type="date"
                      max={new Date().toISOString().split('T')[0]}
                      value={regBirthDate}
                      onChange={(e) => handleBirthDateChange(e.target.value)}
                      className="px-4 py-2.5 w-full border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4A6741] focus:border-transparent font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">อายุ (ปี)</label>
                    <input
                      type="text"
                      value={regBirthDate ? `${regAge} ปี (อัตโนมัติ)` : 'เลือกวันเกิด'}
                      disabled
                      className="px-4 py-2.5 w-full border border-gray-150 rounded-xl text-sm bg-gray-50 text-gray-500 font-bold"
                    />
                  </div>
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
                    className="px-4 py-2.5 w-full border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4A6741] focus:border-transparent font-mono"
                    required
                  />
                </div>

                <div className="space-y-2 bg-[#F2F4ED] p-4 rounded-2xl border border-[#E0E4D9]">
                  <label className="block text-xs font-bold text-[#4A6741] uppercase tracking-wider">
                    ตั้งรหัสผ่านสำหรับดูผลตรวจของคุณเอง
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-[#4A6741]/60" />
                    <input
                      type="text"
                      placeholder="เช่น ABCD1234"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value.toUpperCase())}
                      className="pl-10 pr-4 py-2.5 w-full border border-[#E0E4D9] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4A6741] focus:border-transparent font-mono font-bold text-[#4A6741]"
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
                <div className="bg-[#FAFBF9] border border-[#E0E4D9] p-4 rounded-xl space-y-3">
                  <div className="flex items-start space-x-2.5">
                    <input
                      type="checkbox"
                      id="pdpa-consent"
                      checked={regPdpaConsent}
                      onChange={(e) => setRegPdpaConsent(e.target.checked)}
                      className="mt-1 h-4 w-4 text-[#4A6741] border-gray-300 rounded focus:ring-[#4A6741]"
                      required
                    />
                    <label htmlFor="pdpa-consent" className="text-xs text-slate-600 leading-relaxed cursor-pointer select-none">
                      ฉันยินยอมให้ <strong className="text-[#4A6741]">ศูนย์ตรวจสุขภาพ รพ.มหาวิทยาลัยอุบลราชธานี</strong> เก็บรวบรวม ใช้ และประมวลผลข้อมูลส่วนบุคคลและข้อมูลด้านสุขภาพของฉัน เพื่อวัตถุประสงค์ในการลงทะเบียน นัดหมายล่วงหน้า และประมวลผลเพื่อแสดงรายงานผลตรวจสุขภาพออนไลน์ตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)
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
                      ? 'bg-[#4A6741] hover:bg-[#3d5635] text-white hover:shadow-lg cursor-pointer'
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
      {/* Patient Welcome Header */}
      <div className="bg-[#4A6741] rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-white opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="space-y-1.5 relative z-10">
          <p className="text-xs text-green-100 font-semibold uppercase tracking-widest font-mono">
            Welcome to Patient Portal
          </p>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 flex-wrap">
            <span>{loggedInPatient.name}</span>
            {loggedInPatient.hn && (
              <span className="bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs shrink-0 font-mono">
                HN: {loggedInPatient.hn}
              </span>
            )}
          </h2>
          <p className="text-xs text-green-100/90">
            สิทธิในการคัดกรอง: {loggedInPatient.gender === 'female' ? 'เพศหญิง' : 'เพศชาย'} • อายุ {loggedInPatient.age} ปี • รหัสผ่าน: <span className="font-mono font-bold text-white bg-white/20 px-1.5 py-0.5 rounded">{loggedInPatient.password}</span>
          </p>
        </div>
        <button
          onClick={() => setLoggedInPatient(null)}
          className="text-xs font-semibold text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all border border-white/10 relative z-10 cursor-pointer"
        >
          ออกจากระบบ
        </button>
      </div>

      {/* Grid containing Quick Info and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Appointments & History */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Appointment Section */}
          <div className={`rounded-2xl shadow-md overflow-hidden transition-all duration-300 ${
            activeAppointment 
              ? 'border-2 border-amber-500 bg-amber-50/15 scale-[1.01]' 
              : 'border border-[#E0E4D9] bg-white'
          }`}>
            <div className={`px-6 py-4 border-b flex items-center justify-between transition-colors duration-300 ${
              activeAppointment 
                ? 'bg-amber-500 text-white border-amber-500' 
                : 'bg-[#F2F4ED] border-[#E0E4D9] text-[#4A6741]'
            }`}>
              <h3 className="font-extrabold text-sm flex items-center space-x-2">
                <Calendar className={`h-5 w-5 ${activeAppointment ? 'text-white' : 'text-[#4A6741]'}`} />
                <span>นัดหมายที่เปิดอยู่ (Active Appointment)</span>
              </h3>
              {activeAppointment && (
                <span className={`text-xs font-black px-3 py-1 rounded-full border shadow-sm ${
                  activeAppointment.status === 'pending_results'
                    ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                    : 'bg-emerald-600 text-white border-emerald-500'
                }`}>
                  {activeAppointment.status === 'pending_results' ? '🔔 ผลออกบางส่วน (ติดตามผลต่อ)' : '📅 นัดหมายสำเร็จ / รอรับบริการ'}
                </span>
              )}
            </div>

            <div className="p-6">
              {activeAppointment ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-amber-500/10 p-5 rounded-xl border border-amber-300">
                    <div className="space-y-1.5">
                      <p className="text-xs text-amber-800 font-extrabold uppercase tracking-wider flex items-center gap-1">
                        <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                        วันและเวลาที่นัดหมายตรวจสุขภาพ
                      </p>
                      <p className="text-base font-extrabold text-gray-900">
                        {new Date(activeAppointment.date).toLocaleDateString('th-TH', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-amber-900 font-bold flex items-center gap-1.5 mt-0.5">
                        <Clock className="h-4 w-4 text-amber-700" /> เวลา <span className="bg-amber-200 px-2 py-0.5 rounded-lg text-amber-950 text-xs font-extrabold font-mono">{activeAppointment.time} น.</span>
                      </p>
                    </div>
                    <div className="text-left sm:text-right bg-white p-3 rounded-lg border border-amber-200 shadow-3xs min-w-[140px]">
                      <p className="text-[10px] text-gray-500 font-bold">ค่าบริการโดยประมาณ</p>
                      <p className="text-xl font-extrabold text-amber-600 font-mono">{activeAppointment.totalCost} บาท</p>
                    </div>
                  </div>

                  {/* Fasting Warning Indicator */}
                  {(loggedInPatient.age >= 35 || activeAppointment.specialTests.length > 0) && (
                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-xs text-amber-800 flex gap-2.5">
                      <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                      <div className="space-y-1 text-left">
                        <p className="font-bold">คำแนะนำเตรียมตัวที่สำคัญ (Pre-Examination Guidelines):</p>
                        <p>เนื่องจากมีอายุตั้งแต่ 35 ปีขึ้นไป หรือมีการตรวจตรวจระดับน้ำตาล/ไขมันในเลือด</p>
                        <p className="font-semibold underline">กรุณางดน้ำและอาหารทุกชนิดอย่างน้อย 10 ชั่วโมง ก่อนเข้ารับการบริการ (ดื่มน้ำเปล่าบริสุทธิ์ได้เท่านั้น)</p>
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 space-y-2 bg-[#F2F4ED] p-3.5 rounded-xl border border-[#E0E4D9]">
                    <p className="font-bold text-[#4A6741]">รายละเอียดคิวตรวจ:</p>
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
                </div>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <p className="text-sm text-gray-400">ท่านยังไม่มีนัดหมายการตรวจสุขภาพในระบบขณะนี้</p>
                  <p className="text-xs text-gray-400">ท่านสามารถกรอกข้อมูลขอทำการนัดหมายตรวจล่วงหน้าได้จากฟอร์มด้านขวา</p>
                </div>
              )}
            </div>
          </div>

          {/* Health Checkup Results Online */}
          <div className="bg-white rounded-2xl border border-[#E0E4D9] shadow-sm overflow-hidden">
            <div className="bg-[#F2F4ED] px-6 py-4 border-b border-[#E0E4D9]">
              <h3 className="font-bold text-[#4A6741] text-sm flex items-center space-x-2">
                <FileText className="h-4 w-4 text-[#4A6741]" />
                <span>ผลตรวจสุขภาพออนไลน์ (Online Checkup Reports)</span>
              </h3>
            </div>
            <div className="p-6">
              {patientResults.length > 0 ? (
                <div className="space-y-3">
                  {patientResults.map((result) => (
                    <div
                      key={result.id}
                      className="bg-[#F9FAF7] border border-[#E0E4D9] p-4 rounded-xl hover:border-[#4A6741] hover:shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400 font-mono">วันที่ตรวจ: {result.examDate}</p>
                        <h4 className="font-bold text-gray-800 text-sm">รายงานผลตรวจสุขภาพอย่างเป็นทางการ</h4>
                        <p className="text-xs text-gray-500 line-clamp-1">{result.summary}</p>
                      </div>
                      <button
                        onClick={() => setActiveResultReport(result)}
                        className="text-xs font-bold text-[#4A6741] hover:text-white hover:bg-[#4A6741] border border-[#4A6741]/40 px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>เปิดอ่าน / โหลดรายงาน PDF</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-sm text-gray-400">
                  ไม่พบผลการตรวจสุขภาพย้อนหลังของท่านในระบบออนไลน์ <br />
                  <span className="text-xs block mt-1">(หากท่านเพิ่งตรวจเสร็จกรุณารอแพทย์และเจ้าหน้าที่คีย์ข้อมูลลงระบบ)</span>
                </div>
              )}
            </div>
          </div>

          {/* PERSONALIZED PROMOTION CARDS (Base on Lab values if available) */}
          {patientResults.length > 0 && (
            <div className="bg-gradient-to-tr from-[#F2F4ED] to-[#F9FAF7] border border-[#E0E4D9] rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-[#4A6741]">
                <Sparkles className="h-5 w-5 text-[#4A6741] animate-bounce" />
                <h4 className="text-base font-extrabold">ระบบส่งเสริมสุขภาพส่วนบุคคล (Personal Health Companion)</h4>
              </div>
              <p className="text-xs text-gray-500">วิเคราะห์ผลแลปตรวจล่าสุดของคุณโดยระบบการแพทย์เพื่อมอบสุขนิสัยที่ดีเฉพาะบุคคล</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {patientResults.map((res) => {
                  return (
                    <React.Fragment key={res.id}>
                      {res.physical.bmi > 24.9 && (
                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-[#E0E4D9] text-xs space-y-1 text-left shadow-sm">
                          <span className="bg-[#F2F4ED] text-[#4A6741] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">ภาวะน้ำหนักเกิน</span>
                          <p className="font-bold text-gray-800">ปรับพฤติกรรมลด BMI: {res.physical.bmi}</p>
                          <p className="text-gray-500 leading-relaxed">
                            ควรขยับกายวันละ 30 นาที และจำกัดอาหารแปรรูป ของหวาน ชาไข่มุก เพื่อช่วยรักษาสุขภาพหลอดเลือดและหัวใจ
                          </p>
                        </div>
                      )}
                      {res.parameters.uricAcid && res.parameters.uricAcid.status === 'ผิดปกติ' && (
                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-[#E0E4D9] text-xs space-y-1 text-left shadow-sm">
                          <span className="bg-red-100 text-red-800 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">กรดยูริกสูง</span>
                          <p className="font-bold text-gray-800">หลีกเลี่ยงเก๊าท์กำเริบ</p>
                          <p className="text-gray-500 leading-relaxed">
                            หลีกเลี่ยงการดื่มเครื่องดื่มแอลกอฮอล์ ยอดผัก เครื่องในสัตว์ สัตว์ปีก และดื่มน้ำสะอาดมากๆ เพื่อช่วยขับกรดยูริกออกจากไต
                          </p>
                        </div>
                      )}
                      {res.parameters.fbs && (res.parameters.fbs.status === 'ผิดปกติ' || res.parameters.fbs.status === 'เสี่ยงสูง') && (
                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-[#E0E4D9] text-xs space-y-1 text-left shadow-sm">
                          <span className="bg-orange-100 text-orange-800 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">เสี่ยงภาวะน้ำตาลสูง</span>
                          <p className="font-bold text-gray-800">ควบคุมระดับเบาหวาน</p>
                          <p className="text-gray-500 leading-relaxed">
                            งดน้ำตาลขัดสี ทานข้าวซ้อมมือ ข้าวไรซ์เบอร์รี่ และเพิ่มมวลกล้ามเนื้อด้วยการเวทเทรนนิ่งเพื่อเพิ่มการดูดซึมน้ำตาลของกล้ามเนื้อ
                          </p>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
                {/* Fallback normal health promotion */}
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-[#E0E4D9] text-xs space-y-1 text-left shadow-sm">
                  <span className="bg-[#F2F4ED] text-[#4A6741] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">ตรวจคัดกรองประจำปี</span>
                  <p className="font-bold text-gray-800">ตรวจติดตามสุขภาพ</p>
                  <p className="text-gray-500 leading-relaxed">
                    ควรเข้ารับการคัดกรองตรวจสุขภาพอย่างน้อยปีละ 1 ครั้ง และทำการประเมินสุขภาวะ LM 6 เสาหลักเพื่อตรวจเช็กสุขนิสัยเป็นประจำ
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Booking Form & LM 6 Pillars Assessment */}
        <div className="space-y-8">
          {/* New Appointment Form */}
          {!activeAppointment && (
            <div className="bg-white rounded-2xl border-2 border-emerald-600 shadow-md p-6 space-y-5 text-left transition-all hover:shadow-lg ring-4 ring-emerald-50">
              <div className="space-y-1 bg-gradient-to-r from-emerald-600 to-[#4A6741] text-white p-4 rounded-xl shadow-xs">
                <h3 className="font-extrabold text-base flex items-center gap-1.5">
                  <Calendar className="h-5 w-5 text-amber-300" />
                  <span>จองคิวนัดหมายตรวจสุขภาพ</span>
                </h3>
                <p className="text-xs text-emerald-100 font-medium">จองตรวจสุขภาพเพื่อรับคิวออนไลน์ (จันทร์ - ศุกร์ 08:00 - 12:00 น.)</p>
              </div>

              {bookingSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-600 font-medium">
                  ส่งคำขอนัดหมายตรวจสุขภาพสำเร็จ! กรุณาเตรียมตัวงดน้ำงดอาหารในคืนก่อนวันนัด
                </div>
              )}

              <form onSubmit={handleBookAppointment} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                    เลือกวันที่ (งดเว้น ส.-อา.)
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={bookDate}
                    onChange={(e) => setBookDate(e.target.value)}
                    className="px-3.5 py-2 w-full border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4A6741]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                    เลือกช่วงเวลาเข้ารับบริการ
                  </label>
                  <select
                    value={bookTime}
                    onChange={(e) => setBookTime(e.target.value)}
                    className="px-3.5 py-2 w-full border border-gray-200 rounded-xl text-sm bg-white focus:outline-none"
                  >
                    <option value="08:00 - 08:30">08:00 - 08:30 น.</option>
                    <option value="08:30 - 09:00">08:30 - 09:00 น.</option>
                    <option value="09:00 - 09:30">09:00 - 09:30 น.</option>
                    <option value="09:30 - 10:00">09:30 - 10:00 น.</option>
                    <option value="10:00 - 10:30">10:00 - 10:30 น.</option>
                    <option value="10:30 - 11:00">10:30 - 11:00 น.</option>
                  </select>
                </div>

                {/* Patient Type Select */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                    ประเภทผู้รับบริการ
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setBookPatientType('walk-in')}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                        bookPatientType === 'walk-in'
                          ? 'bg-[#4A6741] border-[#4A6741] text-white shadow-sm'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      Walk-in (ชำระเงินเอง)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookPatientType('agency')}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                        bookPatientType === 'agency'
                          ? 'bg-[#4A6741] border-[#4A6741] text-white shadow-sm'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      ในนามคณะ/หน่วยงาน
                    </button>
                  </div>
                </div>

                {bookPatientType === 'agency' && (
                  <div className="space-y-1 animate-fadeIn">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                      ระบุชื่อคณะ / หน่วยงาน
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น คณะวิทยาศาสตร์, บริษัท สมาร์ท จำกัด"
                      value={bookAgencyName}
                      onChange={(e) => setBookAgencyName(e.target.value)}
                      className="px-3.5 py-2 w-full border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4A6741]"
                      required={bookPatientType === 'agency'}
                    />
                  </div>
                )}

                {/* Treatment Benefit Select */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                    สิทธิการรักษา
                  </label>
                  <select
                    value={bookMedicalCoverage}
                    onChange={(e) => setBookMedicalCoverage(e.target.value)}
                    className="px-3.5 py-2 w-full border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4A6741]"
                  >
                    <option value="ชำระเงินเอง">ชำระเงินเอง</option>
                    <option value="สิทธิข้าราชการ / จ่ายตรง">สิทธิข้าราชการ / จ่ายตรง</option>
                    <option value="สิทธิประกันสังคม">สิทธิประกันสังคม</option>
                    <option value="สิทธิบัตรทอง (30 บาท)">สิทธิบัตรทอง (30 บาท)</option>
                    <option value="รัฐวิสาหกิจ">รัฐวิสาหกิจ</option>
                    <option value="อื่นๆ">อื่นๆ</option>
                  </select>
                </div>

                {/* Customizable Basic Tests Checklist */}
                <div className="space-y-2.5 border-2 border-[#4A6741] rounded-2xl p-4 bg-emerald-50/30 text-xs shadow-sm ring-4 ring-[#4A6741]/10">
                  <span className="text-[10px] bg-[#4A6741] text-white font-black uppercase py-1 px-3 rounded-full inline-block tracking-wider">
                    เลือกรายการตรวจในโปรแกรมพื้นฐาน (แนะนำตรวจครบถ้วน)
                  </span>
                  <p className="font-extrabold text-gray-900 text-sm mb-1 flex items-center gap-1">
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span>{recommendedBasicProgram?.name}</span>
                  </p>
                  
                  {/* Select All Toggle */}
                  <label className="flex items-center space-x-2 pb-2 mb-2 border-b border-[#E0E4D9] cursor-pointer font-bold text-[#4A6741]">
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
                      className="rounded border-gray-300 text-[#4A6741] focus:ring-[#4A6741]"
                    />
                    <span>✓ เลือกรายการตรวจพื้นฐานทั้งหมด (ติ๊กทั้งหมด)</span>
                  </label>

                  {/* Individual Basic Tests Checklist */}
                  <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                    {/* Recommended Basic Tests */}
                    {recommendedBasicProgram?.tests.map((tId) => {
                      const test = BASIC_TESTS[tId];
                      if (!test) return null;
                      const isChecked = selectedBasicTests.includes(tId);
                      return (
                        <label key={tId} className={`flex items-start space-x-2 cursor-pointer py-1.5 px-2 rounded-xl transition-all border ${isChecked ? 'bg-white border-[#4A6741] shadow-3xs font-medium text-gray-900 ring-2 ring-[#4A6741]/5' : 'border-transparent hover:bg-white text-gray-700 opacity-85'}`}>
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
                            className="mt-0.5 rounded border-gray-300 text-[#4A6741] focus:ring-[#4A6741]"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between font-semibold">
                              <span className="flex items-center gap-1">
                                {test.name}
                                <span className="bg-[#4A6741]/10 text-[#4A6741] text-[9px] font-bold px-1.5 py-0.2 rounded-full">แนะนำ</span>
                              </span>
                              <span className="font-bold text-[#4A6741] shrink-0 font-mono">{test.price} บ.</span>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-0.5">{test.detail}</p>
                          </div>
                        </label>
                      );
                    })}

                    {/* Optional Extra Tests for under 35 */}
                    {loggedInPatient && loggedInPatient.age < 35 && (
                      <React.Fragment>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider pt-2 pb-1 border-t border-gray-100/60 mt-2">
                          รายการตรวจเพิ่มเติมสำหรับอายุ 35 ปีขึ้นไป (เลือกเพิ่มเติมได้)
                        </div>
                        {over35ExclusiveTests.map((tId) => {
                          const test = BASIC_TESTS[tId];
                          if (!test) return null;
                          const isChecked = selectedBasicTests.includes(tId);
                          return (
                            <label key={tId} className={`flex items-start space-x-2 cursor-pointer py-1.5 px-2 rounded-xl transition-all border ${isChecked ? 'bg-white border-[#4A6741] shadow-3xs font-medium text-gray-900 ring-2 ring-[#4A6741]/5' : 'border-transparent hover:bg-white text-gray-700 opacity-85'}`}>
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
                                className="mt-0.5 rounded border-gray-300 text-[#4A6741] focus:ring-[#4A6741]"
                              />
                              <div className="flex-1">
                                <div className="flex justify-between font-semibold">
                                  <span className="flex items-center gap-1">
                                    {test.name}
                                    <span className="bg-gray-100 text-gray-500 text-[9px] font-bold px-1.5 py-0.2 rounded-full">สำหรับอายุ 35+</span>
                                  </span>
                                  <span className="font-bold text-[#4A6741] shrink-0 font-mono">{test.price} บ.</span>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-0.5">{test.detail}</p>
                              </div>
                            </label>
                          );
                        })}
                      </React.Fragment>
                    )}
                  </div>
                  <div className="pt-2 border-t border-[#E0E4D9] flex justify-between font-bold text-[#4A6741] text-[11px]">
                    <span>ราคาตรวจพื้นฐานที่เลือก:</span>
                    <span className="font-mono">{selectedBasicTests.reduce((acc, tId) => acc + (BASIC_TESTS[tId]?.price || 0), 0)} บาท</span>
                  </div>
                </div>

                {/* Additional Tests Selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold text-[#4A6741] uppercase tracking-wider flex items-center gap-1">
                    <span>✨ เลือกรายการตรวจพิเศษเสริม (เลือกได้มากกว่า 1)</span>
                  </label>
                  <div className="max-h-48 overflow-y-auto border-2 border-[#4A6741] rounded-2xl p-3 bg-emerald-50/20 space-y-2 text-xs shadow-3xs ring-4 ring-[#4A6741]/5">
                    {Object.values(SPECIAL_TESTS)
                      .filter(t => t.categories.includes(loggedInPatient.gender === 'female' ? 'female_only' : 'male_only') || !t.categories.includes('female_only') && !t.categories.includes('male_only'))
                      .map((test) => {
                        const isChecked = selectedSpecialTests.includes(test.id);
                        return (
                          <label key={test.id} className={`flex items-start space-x-2 cursor-pointer py-1.5 px-2 rounded-xl transition-all border ${isChecked ? 'bg-white border-[#4A6741] shadow-3xs font-medium text-gray-900 ring-2 ring-[#4A6741]/5' : 'border-transparent hover:bg-white text-gray-700 opacity-85'}`}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleSpecialTest(test.id)}
                              className="mt-0.5 rounded border-gray-300 text-[#4A6741] focus:ring-[#4A6741]"
                            />
                            <div className="flex-1">
                              <div className="flex justify-between font-semibold">
                                <span>{test.name}</span>
                                <span className="font-bold text-[#4A6741] shrink-0 font-mono">+{test.price} บ.</span>
                              </div>
                              <p className="text-[10px] text-gray-400 line-clamp-1">{test.detail}</p>
                            </div>
                          </label>
                        );
                      })}
                  </div>
                </div>

                <div className="border-t border-emerald-100 pt-3 flex justify-between items-center bg-emerald-50/50 p-3 rounded-lg border-2 border-dashed border-emerald-500/30">
                  <span className="text-xs text-emerald-950 font-extrabold">ราคารวมทั้งสิ้น (Net Price):</span>
                  <span className="text-2xl font-black text-emerald-700 font-mono">
                    {(selectedBasicTests.reduce((acc, tId) => acc + (BASIC_TESTS[tId]?.price || 0), 0) + selectedSpecialTests.reduce((acc, tId) => acc + (SPECIAL_TESTS[tId]?.price || 0), 0)).toLocaleString()} บาท
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-4 rounded-xl text-sm shadow-md hover:shadow-lg transition-all cursor-pointer text-center flex items-center justify-center space-x-2 border-b-4 border-emerald-800 active:border-b-0 active:mt-1 hover:scale-[1.01]"
                >
                  <span>ยืนยันจองคิวนัดหมายตรวจสุขภาพ</span>
                </button>
              </form>
            </div>
          )}

          {/* LIFESTYLE MEDICINE (LM) 6 PILLARS ASSESSMENT CARD */}
          <div className="bg-white rounded-2xl border border-[#E0E4D9] shadow-sm p-6 space-y-4 text-left">
            <div className="flex items-center space-x-2 text-[#4A6741]">
              <Activity className="h-5 w-5 text-[#4A6741]" />
              <h3 className="font-bold text-[#4A6741] text-base">ประเมินพฤติกรรมสุขภาพ LM 6 เสาหลัก</h3>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              การคัดกรองพฤติกรรมสุขภาพเบื้องต้น 6 ด้านตามหลักเวชศาสตร์วิถีชีวิต (Lifestyle Medicine) เพื่อรับคำแนะนำในการปรับเปลี่ยนพฤติกรรมเฉพาะบุคคล
            </p>

            {lmStep === 'intro' && (
              <div className="space-y-4">
                <div className="bg-[#F2F4ED] p-4 rounded-xl text-xs text-[#4A6741] space-y-2">
                  <p className="font-bold">6 เสาหลักเวชศาสตร์วิถีชีวิตประกอบด้วย:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>โภชนาการที่ดี (Nutrition)</li>
                    <li>การขยับกายออกกำลังกาย (Physical Activity)</li>
                    <li>การจัดการและคลายความเครียด (Stress Management)</li>
                    <li>หลีกเลี่ยงบุหรี่ สุรา สารอันตราย (Avoid Substances)</li>
                    <li>การนอนหลับที่มีคุณภาพ (Sleep)</li>
                    <li>ความเชื่อมโยงและสัมพันธ์ทางสังคมที่ดี (Social Connection)</li>
                  </ol>
                </div>
                <button
                  onClick={() => setLmStep('questions')}
                  className="w-full bg-[#4A6741] hover:bg-[#3d5635] text-white font-bold py-2 px-4 rounded-xl text-xs shadow-sm transition-all text-center cursor-pointer flex justify-center items-center gap-1.5"
                >
                  <span>เริ่มทำแบบประเมินพฤติกรรม</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {lmStep === 'questions' && (
              <div className="space-y-4 bg-[#F9FAF7] p-4 rounded-xl border border-[#E0E4D9]">
                <div className="flex justify-between items-center text-xs font-bold text-[#4A6741] border-b pb-2">
                  <span>เสาหลักที่ {currentPillarIndex + 1}/6:</span>
                  <span className="text-amber-600">
                    {LM6_PILLARS_DETAILS[currentPillar].title}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  {LM6_PILLARS_DETAILS[currentPillar].desc}
                </p>

                {/* Sub-questions for current pillar */}
                <div className="space-y-4 pt-2 border-t">
                  {currentPillarQuestions.map((q) => (
                    <div key={q.id} className="space-y-1.5">
                      <p className="text-xs font-bold text-gray-700">{q.text}</p>
                      <p className="text-[10px] text-gray-400">{q.description}</p>
                      <div className="flex justify-between gap-1">
                        {[1, 2, 3, 4, 5].map((score) => (
                          <button
                            key={score}
                            type="button"
                            onClick={() => handleAnswerChange(q.id, score)}
                            className={`flex-1 py-1 px-1 text-xs font-bold rounded-lg border text-center transition-all ${
                              lmAnswers[q.id] === score
                                ? 'bg-[#4A6741] border-[#4A6741] text-white shadow-sm'
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                      <div className="flex justify-between text-[8px] text-gray-400 font-medium font-mono px-1">
                        <span>แทบไม่ได้ทำ (1)</span>
                        <span>สม่ำเสมอทุกวัน (5)</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Controls */}
                <div className="flex justify-between gap-3 pt-3 border-t">
                  <button
                    disabled={currentPillarIndex === 0}
                    onClick={() => setCurrentPillarIndex(idx => idx - 1)}
                    className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-white border border-gray-200 text-gray-600 disabled:opacity-40"
                  >
                    ก่อนหน้า
                  </button>
                  {currentPillarIndex < pillars.length - 1 ? (
                    <button
                      disabled={!isCurrentPillarComplete()}
                      onClick={() => setCurrentPillarIndex(idx => idx + 1)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg text-white ${
                        isCurrentPillarComplete() ? 'bg-[#4A6741] hover:bg-[#3d5635]' : 'bg-gray-300 cursor-not-allowed'
                      }`}
                    >
                      ถัดไป
                    </button>
                  ) : (
                    <button
                      disabled={!isCurrentPillarComplete()}
                      onClick={calculateLM6Results}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg text-white ${
                        isCurrentPillarComplete() ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-300 cursor-not-allowed'
                      }`}
                    >
                      เสร็จสิ้นและสรุปผล
                    </button>
                  )}
                </div>
              </div>
            )}

            {lmStep === 'results' && patientAssessments.length > 0 && (
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl text-xs text-emerald-800 text-center font-bold">
                  ✓ ประเมินเรียบร้อยแล้ว! ข้อมูลพฤติกรรมบันทึกเข้าระบบเพื่อใช้ส่งเสริมการแพทย์แล้ว
                </div>
                
                {/* Score results card */}
                <div className="space-y-2.5 bg-[#F9FAF7] p-4 rounded-xl border border-[#E0E4D9]">
                  <p className="text-xs font-bold text-gray-700 border-b pb-1">ผลคะแนนเฉลี่ย 6 เสาหลัก (เต็ม 15):</p>
                  {Object.entries(patientAssessments[patientAssessments.length - 1].scores).map(([key, val]) => (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-gray-600">{LM6_PILLARS_DETAILS[key as keyof typeof LM6_PILLARS_DETAILS].title}</span>
                        <span className="font-mono text-[#4A6741]">{val} / 15</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${val < 9 ? 'bg-red-400' : val < 13 ? 'bg-amber-400' : 'bg-[#4A6741]'}`}
                          style={{ width: `${(val / 15) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-gray-600 space-y-1.5 bg-[#F2F4ED] p-3.5 rounded-xl border border-[#E0E4D9] leading-normal">
                  <p className="font-bold text-[#4A6741]">คำแนะนำสุขภาพจากแพทย์และพยาบาล:</p>
                  {patientAssessments[patientAssessments.length - 1].recommendations.map((rec, idx) => (
                    <p key={idx}>• {rec}</p>
                  ))}
                </div>

                <button
                  onClick={resetLM6}
                  className="w-full bg-[#4A6741] hover:bg-[#3d5635] text-white font-bold py-1.5 px-4 rounded-xl text-xs text-center"
                >
                  ทำแบบประเมินอีกครั้ง
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
