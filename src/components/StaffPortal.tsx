import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Patient, Appointment, LM6Assessment, LabResult, AttachedFile } from '../types';
import { BASIC_TESTS, SPECIAL_TESTS, LM6_PILLARS_DETAILS, getBasicProgramDetails } from '../data';
import {
  ShieldCheck, Lock, Search, Eye, User, Calendar, FileText, Check, Plus,
  Upload, FileUp, ClipboardList, Trash2, ArrowRight, AlertCircle, RefreshCw, Edit2, Activity,
  BarChart3, PieChart, TrendingUp, Heart, Percent, Users, Scale, Download, FileSpreadsheet
} from 'lucide-react';

interface StaffPortalProps {
  patients: Patient[];
  appointments: Appointment[];
  results: LabResult[];
  assessments: LM6Assessment[];
  onUpdateAppointmentStatus: (id: string, status: 'pending' | 'completed' | 'cancelled' | 'pending_results') => void;
  onUpdateAppointment: (appointment: Appointment) => void;
  onSaveResult: (result: LabResult) => void;
  isStaffLoggedIn: boolean;
  setIsStaffLoggedIn: (status: boolean) => void;
  onUpdatePatient: (patient: Patient) => void;
  onDeletePatient: (patientId: string) => void;
}

export default function StaffPortal({
  patients,
  appointments,
  results,
  assessments,
  onUpdateAppointmentStatus,
  onUpdateAppointment,
  onSaveResult,
  isStaffLoggedIn,
  setIsStaffLoggedIn,
  onUpdatePatient,
  onDeletePatient,
}: StaffPortalProps) {
  // Login State
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Search & Filter Patients States
  const [searchQuery, setSearchQuery] = useState('');

  // Search Appointments by Confirmed Service Date / Patient Name
  const [appointmentSearchQuery, setAppointmentSearchQuery] = useState('');

  // Active Tab inside Staff Portal (default to dashboard as requested)
  const [staffActiveTab, setStaffActiveTab] = useState<'dashboard' | 'registry' | 'appointments'>('dashboard');

  // Excel Export Date Range States
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');

  // Active Patient / Appointment for result entry
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [saveMode, setSaveMode] = useState<'draft' | 'complete'>('complete');

  // Result entry form states
  const [weight, setWeight] = useState<number | string>('');
  const [height, setHeight] = useState<number | string>('');
  const [bp, setBp] = useState<string>('');
  const [hr, setHr] = useState<number | string>('');
  const [bmi, setBmi] = useState<number | string>('');
  const [bmiStatus, setBmiStatus] = useState('ยังไม่ได้คำนวณ');
  const [generalStatus, setGeneralStatus] = useState<'ปกติ' | 'ผิดปกติ' | 'เสี่ยงสูง' | 'เสี่ยงต่ำ' | 'ไม่ประสงค์ตรวจ'>('ปกติ');
  const [physicalNotes, setPhysicalNotes] = useState('');
  const [waistline, setWaistline] = useState<string>('');

  // Chest X-Ray
  const [cxrStatus, setCxrStatus] = useState<'ปกติ' | 'ผิดปกติ' | 'เสี่ยงสูง' | 'เสี่ยงต่ำ' | 'ไม่ประสงค์ตรวจ'>('ปกติ');
  const [cxrDesc, setCxrDesc] = useState('');

  // Lab Parameters input values
  const [labValues, setLabValues] = useState<Record<string, { value: string; status: 'ปกติ' | 'ผิดปกติ' | 'เสี่ยงสูง' | 'เสี่ยงต่ำ' | 'ไม่ประสงค์ตรวจ' }>>({});

  // Declined tests state
  const [declinedTests, setDeclinedTests] = useState<Record<string, boolean>>({});

  // Patient editing form states
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [editName, setEditName] = useState('');
  const [editNationalId, setEditNationalId] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editGender, setEditGender] = useState<'female' | 'male'>('female');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editAge, setEditAge] = useState<number>(35);
  const [editHn, setEditHn] = useState('');
  const [editPassword, setEditPassword] = useState('');

  // File Uploader states
  const [uploadCategory, setUploadCategory] = useState('Chest X-Ray');
  const [uploadedFiles, setUploadedFiles] = useState<AttachedFile[]>([]);
  const [doctorName, setDoctorName] = useState('พญ. นภัสวรรณ อุ่นใจ');
  const [doctorLicense, setDoctorLicense] = useState('ว.70369');
  const [summary, setSummary] = useState('');
  const [recommendationsInput, setRecommendationsInput] = useState('');

  // Confirm and edit tests modal states
  const [confirmingApp, setConfirmingApp] = useState<Appointment | null>(null);
  const [confBasicTests, setConfBasicTests] = useState<string[]>([]);
  const [confSpecialTests, setConfSpecialTests] = useState<string[]>([]);

  const confirmingPatient = confirmingApp
    ? patients.find(p => p.id === confirmingApp.patientId)
    : null;

  const confirmingBasicProgDetails = confirmingPatient
    ? getBasicProgramDetails(confirmingPatient.gender, confirmingPatient.age)
    : null;

  const over35ExclusiveTests = [
    'fbs', 'creatinine', 'bun', 'uricAcid', 'sgot', 'sgpt', 'alk', 'cholesterol', 'triglyceride'
  ];

  const availableBasicTestsInModal = confirmingBasicProgDetails && confirmingPatient
    ? (confirmingPatient.age < 35
        ? [...confirmingBasicProgDetails.tests, ...over35ExclusiveTests]
        : confirmingBasicProgDetails.tests)
    : [];

  const basicCostInModal = confBasicTests.reduce((acc, tId) => acc + (BASIC_TESTS[tId]?.price || 0), 0);
  const specialCostInModal = confSpecialTests.reduce((acc, tId) => acc + (SPECIAL_TESTS[tId]?.price || 0), 0);
  const liveTotalCostInModal = basicCostInModal + specialCostInModal;

  // Auto-calculate BMI
  useEffect(() => {
    const w = typeof weight === 'string' ? parseFloat(weight) : weight;
    const h = typeof height === 'string' ? parseFloat(height) : height;

    if (w && h && w > 0 && h > 0) {
      const heightInMeters = h / 100;
      const calculatedBmi = Number((w / (heightInMeters * heightInMeters)).toFixed(1));
      setBmi(calculatedBmi);

      if (calculatedBmi < 18.5) {
        setBmiStatus('น้ำหนักต่ำกว่าเกณฑ์ (Underweight)');
      } else if (calculatedBmi < 23) {
        setBmiStatus('น้ำหนักปกติ (Normal)');
      } else if (calculatedBmi < 25) {
        setBmiStatus('น้ำหนักท้วม (Overweight - เสี่ยง)');
      } else if (calculatedBmi < 30) {
        setBmiStatus('อ้วนระดับ 1 (Obese Class 1)');
      } else {
        setBmiStatus('อ้วนระดับ 2 (Obese Class 2 - อันตราย)');
      }
    } else {
      setBmi('-');
      setBmiStatus('ยังไม่ได้คำนวณ');
    }
  }, [weight, height]);

  // Handle Staff Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'checkup7036') {
      setIsStaffLoggedIn(true);
      setLoginError('');
      setPasswordInput('');
    } else {
      setLoginError('รหัสผ่านเข้าใช้งานไม่ถูกต้องกรุณาตรวจสอบรหัสผ่านพิเศษจากโรงพยาบาล');
    }
  };

  // Handle Excel Export for Date Range
  const handleExportExcel = () => {
    // Filter appointments within range
    const filteredApps = appointments.filter(app => {
      if (exportStartDate && app.date < exportStartDate) return false;
      if (exportEndDate && app.date > exportEndDate) return false;
      return true;
    });

    // Map screening results
    const screeningRows = filteredApps.map((app, index) => {
      const pat = patients.find(p => p.id === app.patientId);
      const res = results.find(r => r.appointmentId === app.id);

      // Find latest LM6 assessment for this patient
      const patientAsses = assessments.filter(as => as.patientId === app.patientId);
      const latestAssess = patientAsses.length > 0 
        ? [...patientAsses].sort((a, b) => b.date.localeCompare(a.date))[0]
        : null;

      return {
        'ลำดับ (No.)': index + 1,
        'เลขประจำตัวผู้ป่วย (HN)': pat?.hn || '-',
        'เลขประจำตัวประชาชน': pat?.nationalId || '-',
        'ชื่อ-นามสกุล': pat?.name || '-',
        'เพศ': pat?.gender === 'male' ? 'ชาย' : pat?.gender === 'female' ? 'หญิง' : '-',
        'อายุ (ปี)': pat?.age || '-',
        'เบอร์โทรศัพท์': pat?.phone || '-',
        'วันที่เข้ารับบริการ': app.date,
        'เวลาที่นัดหมาย': app.time,
        'รูปแบบบริการ': app.patientType === 'agency' ? 'หน่วยงาน' : 'Walk-In',
        'ชื่อหน่วยงาน/สังกัด': app.agencyName || '-',
        'สิทธิการรักษาพยาบาล': app.medicalCoverage || 'ชำระเงินเอง / ไม่ระบุ',
        'โปรแกรมหลักที่ตรวจ': app.basicProgramName,
        'ค่าบริการรวม (บาท)': app.totalCost,
        'สถานะการนัดหมาย': app.status === 'completed' ? 'ตรวจเสร็จสิ้น' : app.status === 'pending_results' ? 'รอผลตรวจ' : app.status === 'cancelled' ? 'ยกเลิก' : 'รอรับบริการ',
        'แพทย์ผู้ดูแล': res?.doctorName || '-',
        'น้ำหนัก (kg)': res?.physical?.weight ?? '-',
        'ส่วนสูง (cm)': res?.physical?.height ?? '-',
        'เส้นรอบเอว (cm)': res?.physical?.waistline ?? '-',
        'ดัชนีมวลกาย (BMI)': res?.physical?.bmi ?? '-',
        'สถานะ BMI': res?.physical?.bmiStatus || '-',
        'ความดันโลหิต (mmHg)': res?.physical?.bloodPressure || '-',
        'อัตราการเต้นหัวใจ (bpm)': res?.physical?.heartRate ?? '-',
        'ผลการตรวจร่างกายเบื้องต้น': res?.physical?.generalStatus || '-',
        'บันทึกแพทย์เพิ่มเติม (Physical)': res?.physical?.notes || '-',
        'ผลเอกซเรย์ปอด (Chest X-Ray)': res?.chestXray?.status || '-',
        'รายละเอียดเอกซเรย์': res?.chestXray?.description || '-',
        'ระดับน้ำตาลในเลือด (FBS)': res?.parameters?.fbs?.value ?? '-',
        'สถานะ FBS': res?.parameters?.fbs?.status || '-',
        'ระดับยูริก (Uric Acid)': res?.parameters?.uricAcid?.value ?? '-',
        'สถานะ Uric Acid': res?.parameters?.uricAcid?.status || '-',
        'ระดับไนโตรเจนในปัสสาวะ (BUN)': res?.parameters?.bun?.value ?? '-',
        'สถานะ BUN': res?.parameters?.bun?.status || '-',
        'ระดับครีอะตินีน (Creatinine)': res?.parameters?.creatinine?.value ?? '-',
        'สถานะ Creatinine': res?.parameters?.creatinine?.status || '-',
        'ระดับคอเลสเตอรอลทั้งหมด (Cholesterol)': res?.parameters?.cholesterol?.value ?? '-',
        'สถานะ Cholesterol': res?.parameters?.cholesterol?.status || '-',
        'ระดับไตรกลีเซอไรด์ (Triglyceride)': res?.parameters?.triglyceride?.value ?? '-',
        'สถานะ Triglyceride': res?.parameters?.triglyceride?.status || '-',
        'ระดับไขมันดี (HDL-Cholesterol)': res?.parameters?.hdl?.value ?? '-',
        'สถานะ HDL': res?.parameters?.hdl?.status || '-',
        'ระดับไขมันเสีย (LDL-Cholesterol)': res?.parameters?.ldl?.value ?? '-',
        'สถานะ LDL': res?.parameters?.ldl?.status || '-',
        'ผลเอนไซม์ตับ (SGOT/AST)': res?.parameters?.sgot?.value ?? '-',
        'สถานะ SGOT': res?.parameters?.sgot?.status || '-',
        'ผลเอนไซม์ตับ (SGPT/ALT)': res?.parameters?.sgpt?.value ?? '-',
        'สถานะ SGPT': res?.parameters?.sgpt?.status || '-',
        'ผลอัลคาไลน์ฟอสฟาเตส (Alk Phosphatase)': res?.parameters?.alk?.value ?? '-',
        'สถานะ Alk Phosphatase': res?.parameters?.alk?.status || '-',
        'ความสมบูรณ์ของเม็ดเลือด (CBC)': res?.parameters?.cbc?.value ?? '-',
        'สถานะ CBC': res?.parameters?.cbc?.status || '-',
        'ตรวจปัสสาวะ (UA)': res?.parameters?.ua?.value ?? '-',
        'สถานะ UA': res?.parameters?.ua?.status || '-',
        'สรุปภาพรวมจากแพทย์': res?.summary || '-',
        'คำแนะนำการปฏิบัติตัว': res?.recommendations?.join('; ') || '-',
        // Lifestyle Medicine (LM6) Evaluation Scores integration
        'LM_วันที่ทำแบบประเมินล่าสุด': latestAssess?.date || 'ยังไม่ได้ประเมิน',
        'LM_คะแนนโภชนาการ (Nutrition) [เต็ม 15]': latestAssess?.scores.nutrition ?? '-',
        'LM_คะแนนกิจกรรมทางกาย (Physical Activity) [เต็ม 15]': latestAssess?.scores.physicalActivity ?? '-',
        'LM_คะแนนการจัดการความเครียด (Stress Management) [เต็ม 15]': latestAssess?.scores.stressManagement ?? '-',
        'LM_คะแนนการหลีกเลี่ยงสารอันตราย (Avoid Substances) [เต็ม 15]': latestAssess?.scores.avoidSubstances ?? '-',
        'LM_คะแนนการนอนหลับ (Restorative Sleep) [เต็ม 15]': latestAssess?.scores.restorativeSleep ?? '-',
        'LM_คะแนนความสัมพันธ์ทางสังคม (Social Connection) [เต็ม 15]': latestAssess?.scores.socialConnection ?? '-',
        'LM_คะแนนรวมทั้งหมด [เต็ม 90]': latestAssess ? Object.values(latestAssess.scores).reduce((a, b) => a + b, 0) : '-',
        'LM_ระดับพฤติกรรมวิถีชีวิต': latestAssess ? (() => {
          const tot = Object.values(latestAssess.scores).reduce((a, b) => a + b, 0);
          if (tot >= 75) return 'ดีเลิศ (Excellent)';
          if (tot >= 54) return 'ปานกลาง/ดี (Good)';
          return 'ควรปรับปรุง (Needs Improvement)';
        })() : '-',
        'LM_คำแนะนำสรุปพฤติกรรมสุขภาพ': latestAssess?.recommendations.join('; ') || '-',
      };
    });

    // Filter assessments within range
    const filteredAsses = assessments.filter(assess => {
      if (exportStartDate && assess.date < exportStartDate) return false;
      if (exportEndDate && assess.date > exportEndDate) return false;
      return true;
    });

    // Map LM6 assessments
    const assessmentRows = filteredAsses.map((assess, index) => {
      const pat = patients.find(p => p.id === assess.patientId);
      return {
        'ลำดับ (No.)': index + 1,
        'เลขประจำตัวผู้ป่วย (HN)': pat?.hn || '-',
        'เลขประจำตัวประชาชน': pat?.nationalId || '-',
        'ชื่อ-นามสกุล': pat?.name || '-',
        'เพศ': pat?.gender === 'male' ? 'ชาย' : pat?.gender === 'female' ? 'หญิง' : '-',
        'อายุ (ปี)': pat?.age || '-',
        'วันที่ประเมิน': assess.date,
        'ด้านโภชนาการ (Nutrition) [เต็ม 15]': assess.scores.nutrition,
        'ด้านกิจกรรมทางกาย (Physical Activity) [เต็ม 15]': assess.scores.physicalActivity,
        'ด้านการจัดการความเครียด (Stress Management) [เต็ม 15]': assess.scores.stressManagement,
        'ด้านการหลีกเลี่ยงสารอันตราย (Avoid Substances) [เต็ม 15]': assess.scores.avoidSubstances,
        'ด้านการนอนหลับ (Restorative Sleep) [เต็ม 15]': assess.scores.restorativeSleep,
        'ด้านความสัมพันธ์ทางสังคม (Social Connection) [เต็ม 15]': assess.scores.socialConnection,
        'คะแนนรวมทั้งหมด (Total Score) [เต็ม 90]': Object.values(assess.scores).reduce((a, b) => a + b, 0),
        'ระดับพฤติกรรมสุขภาพ': (() => {
          const tot = Object.values(assess.scores).reduce((a, b) => a + b, 0);
          if (tot >= 75) return 'ดีเลิศ (Excellent)';
          if (tot >= 54) return 'ปานกลาง/ดี (Good)';
          return 'ควรปรับปรุง (Needs Improvement)';
        })(),
        'คำแนะนำพฤติกรรมสุขภาพ': assess.recommendations.join('; ') || '-',
      };
    });

    // Create Excel Workbook
    const wb = XLSX.utils.book_new();

    // Worksheets
    const wsScreening = XLSX.utils.json_to_sheet(screeningRows);
    const wsAssessment = XLSX.utils.json_to_sheet(assessmentRows);

    // Append to Book
    XLSX.utils.book_append_sheet(wb, wsScreening, 'ผลตรวจสุขภาพ');
    XLSX.utils.book_append_sheet(wb, wsAssessment, 'ผลประเมินพฤติกรรม LM6');

    // Filename date range indicator
    const startStr = exportStartDate || 'เริ่มต้น';
    const endStr = exportEndDate || 'ปัจจุบัน';
    XLSX.writeFile(wb, `รายงานผลตรวจสุขภาพและผลประเมินLM6_${startStr}_ถึง_${endStr}.xlsx`);
  };

  // Filter patients based on query
  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nationalId.includes(searchQuery)
  );

  // Filter appointments based on query (by confirmed date, date, or patient name)
  const filteredAppointments = appointments.filter((app) => {
    const patient = patients.find((p) => p.id === app.patientId);
    const patientName = patient ? patient.name.toLowerCase() : '';
    const query = appointmentSearchQuery.toLowerCase().trim();
    if (!query) return true;

    const matchesConfirmedDate = app.confirmedServiceDate && app.confirmedServiceDate.toLowerCase().includes(query);
    const matchesPatientName = patientName.includes(query);
    const matchesAppointmentDate = app.date && app.date.toLowerCase().includes(query);

    return matchesConfirmedDate || matchesPatientName || matchesAppointmentDate;
  });

  // Initialize Lab values when an appointment is selected
  const handleSelectAppointment = (app: Appointment) => {
    const patient = patients.find(p => p.id === app.patientId);
    if (!patient) return;

    setSelectedAppointment(app);
    
    // Determine which tests are required based on appointment details
    const basicInfo = BASIC_TESTS;
    const specialInfo = SPECIAL_TESTS;

    const initialValues: Record<string, { value: string; status: 'ปกติ' | 'ผิดปกติ' | 'เสี่ยงสูง' | 'เสี่ยงต่ำ' | 'ไม่ประสงค์ตรวจ' }> = {};
    const initialDeclined: Record<string, boolean> = {};

    // We can pre-initialize values or copy from existing results if editing
    const existingRes = results.find(r => r.appointmentId === app.id);
    if (existingRes) {
      setWeight(existingRes.physical.weight || '');
      setHeight(existingRes.physical.height || '');
      setBp(existingRes.physical.bloodPressure || '');
      setHr(existingRes.physical.heartRate || '');
      setGeneralStatus(existingRes.physical.generalStatus);
      setPhysicalNotes(existingRes.physical.notes);
      setWaistline(existingRes.physical.waistline !== undefined ? String(existingRes.physical.waistline) : '');
      setCxrStatus(existingRes.chestXray.status);
      setCxrDesc(existingRes.chestXray.description);
      setDoctorName(existingRes.doctorName);
      setDoctorLicense(existingRes.doctorLicense || 'ว.70369');
      setSummary(existingRes.summary);
      setRecommendationsInput(existingRes.recommendations.join('\n'));
      setUploadedFiles(existingRes.attachedFiles);
      setLabValues(existingRes.parameters);

      if (existingRes.chestXray.status === 'ไม่ประสงค์ตรวจ' || existingRes.chestXray.declined) {
        initialDeclined['chestXray'] = true;
      }
      Object.entries(existingRes.parameters).forEach(([key, param]) => {
        if (param.status === 'ไม่ประสงค์ตรวจ' || param.declined) {
          initialDeclined[key] = true;
        }
      });
      setDeclinedTests(initialDeclined);
    } else {
      // Default empty structures
      setWeight('');
      setHeight('');
      setBp('');
      setHr('');
      setGeneralStatus('ปกติ');
      setPhysicalNotes('');
      setWaistline('');
      setCxrStatus('ปกติ');
      setCxrDesc(''); // Leave empty/blank as requested
      setUploadedFiles([]);
      setSummary('');
      setRecommendationsInput('');
      setDeclinedTests({});

      // Build parameters based on age & gender basic test list, respecting patient's custom selections
      const basicTestsToUse = app.selectedBasicTests || getBasicProgramDetails(patient.gender, patient.age).tests;
      
      const testsToInclude = [
        ...basicTestsToUse.filter(t => t !== 'physical' && t !== 'chestXray'),
        ...app.specialTests
      ];

      testsToInclude.forEach(testId => {
        const meta = BASIC_TESTS[testId] || SPECIAL_TESTS[testId];
        if (meta) {
          initialValues[testId] = {
            value: '', // Leave empty/blank as requested (เว้นคำตอบอัตโนมัติไว้ก่อน)
            status: 'ปกติ'
          };
        }
      });
      setLabValues(initialValues);
    }
  };

  // Mock upload PDF attachment (saved as base64 in local state for full persistence and real downloading)
  const handleSimulatePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Limit file size to 2 MB to prevent local storage quota limit exceeded
      const maxSizeInBytes = 2 * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        alert(`ไฟล์ "${file.name}" มีขนาดใหญ่เกินไป (${(file.size / 1024 / 1024).toFixed(1)} MB) เพื่อความรวดเร็วและป้องกันพื้นที่จัดเก็บข้อมูลของเบราว์เซอร์เต็ม กรุณาเลือกไฟล์ PDF ที่มีขนาดไม่เกิน 2 MB`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        const newFile: AttachedFile = {
          id: 'file_' + Date.now(),
          category: uploadCategory,
          name: file.name,
          size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
          type: 'application/pdf',
          url: base64Url,
          uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };

        setUploadedFiles([...uploadedFiles, newFile]);
        alert(`อัปโหลดและบันทึกไฟล์รายงาน PDF "${file.name}" สำเร็จสำหรับหัวข้อ "${uploadCategory}" (สามารถกดดาวน์โหลดไฟล์จริงได้ในส่วนแสดงผล)`);
      };

      reader.onerror = () => {
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์ PDF กรุณาลองใหม่อีกครั้ง');
      };

      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles(uploadedFiles.filter(f => f.id !== id));
  };

  // Save full results and update status
  const handleSaveAllResults = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    const patient = patients.find(p => p.id === selectedAppointment.patientId);
    if (!patient) return;

    const recommendationsArray = recommendationsInput
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const mappedParameters: Record<string, { value: string; status: 'ปกติ' | 'ผิดปกติ' | 'เสี่ยงสูง' | 'เสี่ยงต่ำ' | 'ไม่ประสงค์ตรวจ'; declined?: boolean }> = {};
    Object.entries(labValues).forEach(([key, param]) => {
      const valObj = param as { value: string; status: 'ปกติ' | 'ผิดปกติ' | 'เสี่ยงสูง' | 'เสี่ยงต่ำ' | 'ไม่ประสงค์ตรวจ' };
      const isDeclined = !!declinedTests[key];
      mappedParameters[key] = {
        value: isDeclined ? 'ไม่ประสงค์ตรวจ' : valObj.value,
        status: isDeclined ? 'ไม่ประสงค์ตรวจ' : valObj.status,
        declined: isDeclined
      };
    });

    const existingRes = results.find(r => r.appointmentId === selectedAppointment.id);

    const resultStatus = saveMode === 'complete' ? 'completed' : 'pending';
    const appointmentStatus = saveMode === 'complete' ? 'completed' : 'pending_results';

    const finalResult: LabResult = {
      id: existingRes ? existingRes.id : 'res_' + Date.now(),
      patientId: patient.id,
      appointmentId: selectedAppointment.id,
      examDate: new Date().toISOString().split('T')[0],
      doctorName: doctorName.trim() || 'ยังไม่ระบุแพทย์',
      doctorLicense: doctorLicense.trim() || 'ยังไม่ระบุเลข ว.',
      status: resultStatus,
      physical: {
        weight: weight || 0,
        height: height || 0,
        bloodPressure: bp.trim() || 'ยังไม่ได้ตรวจ',
        heartRate: hr || 0,
        bmi,
        bmiStatus,
        generalStatus,
        notes: physicalNotes.trim(),
        waistline: waistline ? Number(waistline) : undefined
      },
      chestXray: {
        status: declinedTests['chestXray'] ? 'ไม่ประสงค์ตรวจ' : cxrStatus,
        description: declinedTests['chestXray'] ? 'ไม่ประสงค์ตรวจ' : (cxrDesc.trim() || 'รอยืนยันผลภาพเอกซเรย์'),
        declined: !!declinedTests['chestXray']
      },
      parameters: mappedParameters,
      attachedFiles: uploadedFiles,
      summary: summary.trim() || (saveMode === 'complete' ? `ตรวจพบสัญญาณชีพโดยทั่วไปอยู่ในเกณฑ์ปกติ มีรายการที่เฝ้าระวังเพิ่มเติม` : `(บันทึกร่างเบื้องต้น) ผลตรวจยังไม่ครบถ้วน`),
      recommendations: recommendationsArray.length > 0 ? recommendationsArray : (saveMode === 'complete' ? ['ออกกำลังกายสม่ำเสมอสัปดาห์ละ 150 นาที', 'เลือกทานอาหารธรรมชาติ ดื่มน้ำสะอาด และพักผ่อนนอนหลับให้เพียงพอ'] : ['รอยืนยันผลการประเมินเพื่อรับคำแนะนำ'])
    };

    onSaveResult(finalResult);
    onUpdateAppointmentStatus(selectedAppointment.id, appointmentStatus);
    setSelectedAppointment(null);
    if (saveMode === 'complete') {
      alert('บันทึกผลการตรวจแลปแบบสมบูรณ์และแสดงรายงาน PDF เรียบร้อยแล้ว! ข้อมูลประวัติคนไข้จะขึ้นสถานะเสร็จสิ้น');
    } else {
      alert('บันทึกผลตรวจเบื้องต้น (ร่าง) สำเร็จ! สถานะคิวได้รับการปรับปรุงเพื่อติดตามต่อแล้ว');
    }
  };

  // Generate Auto-clinical suggestions based on inputted parameters
  const triggerAutoSuggestions = () => {
    let sumText = '';
    const recs: string[] = [];

    if (bmi >= 25) {
      recs.push('ควบคุมปริมาณพลังงานอาหาร และเน้นกิจกรรมทางกายเพิ่มขึ้นเนื่องจากมีภาวะน้ำหนักเกินเกณฑ์');
    }

    // Read lab values
    Object.entries(labValues).forEach(([key, item]) => {
      const valObj = item as { value: string; status: 'ปกติ' | 'ผิดปกติ' | 'เสี่ยงสูง' | 'เสี่ยงต่ำ' };
      const meta = BASIC_TESTS[key] || SPECIAL_TESTS[key];
      if (!meta) return;

      if (valObj.status === 'ผิดปกติ' || valObj.status === 'เสี่ยงสูง') {
        if (key === 'fbs' || key === 'hba1c') {
          recs.push('งดอาหารประเภทน้ำตาล คาร์โบไฮเดรตขัดสี และน้ำอัดลม เพื่อควบคุมระดับน้ำตาลในกระแสเลือด');
        }
        if (key === 'uricAcid') {
          recs.push('หลีกเลี่ยงการรับประทานเครื่องในสัตว์ สัตว์ปีก ยอดผักอ่อน และเครื่องดื่มแอลกอฮอล์เพื่อป้องกันโรคเก๊าท์');
        }
        if (key === 'cholesterol' || key === 'triglyceride' || key === 'ldl') {
          recs.push('งดอาหารทอด อาหารแกงกะทิ ไขมันทรานส์ และเพิ่มการรับประทานอาหารประเภทกากใยสูง');
        }
        if (key === 'creatinine' || key === 'bun') {
          recs.push('ควบคุมปริมาณโซเดียมในอาหาร และปรึกษาแพทย์เฉพาะทางเพื่อประเมินสุขภาพไตเพิ่มเติม');
        }
      }
    });

    if (cxrStatus !== 'ปกติ') {
      recs.push('พบเงาผิดปกติบริเวณทรวงอก ควรพบอายุรแพทย์โรคปอดเพื่อทำการวินิจฉัยละเอียดเพิ่มเติม');
    }

    if (recs.length === 0) {
      sumText = 'ผลการตรวจร่างกาย สัญญาณชีพ และผลทางห้องปฏิบัติการทั่วไปอยู่ในเกณฑ์ดีเยี่ยมเป็นปกติ';
      recs.push('รักษามาตรฐานสุขนิสัยที่ดีเช่นนี้อย่างสม่ำเสมอต่อเนื่อง และตรวจสุขภาพประจำปีสัปดาห์ถัดไป');
    } else {
      sumText = `ตรวจสุขภาพโดยรวมพบสัญญาณชีพมั่นคง แต่มีค่าผลเลือดและผลประเมินบางรายการที่เริ่มมีความเสี่ยงหรือต้องเฝ้าระวังเพิ่มเติม (${recs.length} หัวข้อ)`;
    }

    setSummary(sumText);
    setRecommendationsInput(recs.join('\n'));
  };

  // Open edit modal and fill fields
  const handleOpenEditModal = (p: Patient) => {
    setEditingPatient(p);
    setEditName(p.name);
    setEditNationalId(p.nationalId);
    setEditPhone(p.phone);
    setEditGender(p.gender);
    setEditAge(p.age);
    setEditBirthDate(p.birthDate || '');
    setEditHn(p.hn || '');
    setEditPassword(p.password);
  };

  const handleEditBirthDateChange = (dateStr: string) => {
    setEditBirthDate(dateStr);
    if (dateStr) {
      const birth = new Date(dateStr);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        calculatedAge--;
      }
      setEditAge(calculatedAge > 0 ? calculatedAge : 0);
    }
  };

  // Save edited patient info
  const handleSavePatientEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPatient) return;

    if (!editName.trim() || !editNationalId.trim() || !editPhone.trim()) {
      alert('กรุณากรอกข้อมูลหลักให้ครบถ้วน (ชื่อ, เลขประจำตัวประชาชน, เบอร์โทรศัพท์)');
      return;
    }

    if (editNationalId.trim().length !== 13 || isNaN(Number(editNationalId))) {
      alert('เลขบัประจำตัวประชาชนต้องเป็นตัวเลข 13 หลัก');
      return;
    }

    const isPasswordValid = (pw: string) => /^[A-Z]{4}\d{4,6}$/.test(pw);
    if (!isPasswordValid(editPassword)) {
      alert('รหัสผ่านไม่ตรงตามเงื่อนไข: ต้องเป็นอักษรพิมพ์ใหญ่ A-Z 4 ตัว ตามด้วยตัวเลข 4-6 ตัว เช่น ABCD1234');
      return;
    }

    const updatedPatient: Patient = {
      ...editingPatient,
      name: editName.trim(),
      nationalId: editNationalId.trim(),
      phone: editPhone.trim(),
      gender: editGender,
      age: Number(editAge),
      birthDate: editBirthDate || undefined,
      password: editPassword,
      hn: editHn.trim() || undefined
    };

    onUpdatePatient(updatedPatient);
    setEditingPatient(null);
    alert('แก้ไขข้อมูลผู้รับบริการเรียบร้อยแล้ว!');
  };

  const handleDeletePatientClick = (patient: Patient) => {
    const confirmCancel = window.confirm(
      `คุณต้องการยกเลิกข้อมูลและลบผู้รับบริการ "${patient.name}" หรือไม่?\n\n*ข้อแนะนำ: การดำเนินการนี้จะนำข้อมูลทะเบียน รหัสผ่าน คิวนัดหมายตรวจ และผลแลปตรวจสุขภาพของบุคคลนี้ออกจากระบบอย่างถาวร (กรณีคนไข้ลงทะเบียนค้างไว้แล้วไม่มารับบริการจริง)`
    );
    if (confirmCancel) {
      onDeletePatient(patient.id);
    }
  };

  const handleOpenConfirmModal = (app: Appointment) => {
    const patient = patients.find(p => p.id === app.patientId);
    if (!patient) return;

    setConfirmingApp(app);
    // If patient already had selectedBasicTests, use them. Otherwise default to recommended basic program tests
    const defaultBasicTests = app.selectedBasicTests || getBasicProgramDetails(patient.gender, patient.age).tests;
    setConfBasicTests(defaultBasicTests);
    setConfSpecialTests(app.specialTests);
  };

  const handleSaveConfirmedTests = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmingApp) return;

    const basicCost = confBasicTests.reduce((acc, tId) => acc + (BASIC_TESTS[tId]?.price || 0), 0);
    const specialCost = confSpecialTests.reduce((acc, tId) => acc + (SPECIAL_TESTS[tId]?.price || 0), 0);
    const totalCost = basicCost + specialCost;

    // Get current date/time in Thailand (UTC+7)
    const d = new Date();
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    const thDate = new Date(utc + (3600000 * 7));
    const day = String(thDate.getDate()).padStart(2, '0');
    const month = String(thDate.getMonth() + 1).padStart(2, '0');
    const year = thDate.getFullYear() + 543; // Thai Buddhist calendar year
    const confirmedServiceDateStr = `${day}/${month}/${year}`;

    const updatedApp: Appointment = {
      ...confirmingApp,
      selectedBasicTests: confBasicTests,
      specialTests: confSpecialTests,
      totalCost,
      confirmedServiceDate: confirmedServiceDateStr,
    };

    onUpdateAppointment(updatedApp);
    setConfirmingApp(null);
    alert(`บันทึกการยืนยันรายการตรวจและคำนวณค่าบริการใหม่สำเร็จ!\n\nยอดรวมใหม่: ${totalCost} บาท\nวันที่ยืนยันเข้ารับการตรวจ: ${confirmedServiceDateStr}`);
  };

  // STAFF NOT LOGGED IN
  if (!isStaffLoggedIn) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-3xl shadow-lg border border-[#E0E4D9] overflow-hidden">
          <div className="bg-[#4A6741] px-6 py-8 text-center text-white relative">
            <div className="absolute inset-0 bg-white opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <ShieldCheck className="h-10 w-10 text-green-100 mx-auto mb-3 animate-pulse" />
            <h3 className="text-xl font-bold">เข้าสู่ระบบสำหรับเจ้าหน้าที่และแพทย์</h3>
            <p className="text-xs text-green-100/90 mt-1">
              โรงพยาบาลมหาวิทยาลัยอุบลราชธานี
            </p>
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-4 text-left">
            {loginError && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-xl flex gap-2 text-xs text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                รหัสผ่านพิเศษเจ้าหน้าที่ (Staff Passcode)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  placeholder="กรอกรหัสผ่านเพื่อยืนยันสิทธิ์"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4A6741] focus:border-transparent font-mono"
                  required
                />
              </div>
              <p className="text-[10px] text-gray-400 leading-normal">
                * กรุณาใส่รหัสผ่านพิเศษของเจ้าหน้าที่ เพื่อความปลอดภัยในการเข้าตรวจสอบข้อมูลผู้เข้ารับบริการและบันทึกผลตรวจสุขภาพ
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-[#4A6741] hover:bg-[#3d5635] text-white font-bold py-3 px-4 rounded-xl text-sm shadow-sm hover:shadow transition-all cursor-pointer text-center"
            >
              ยืนยันการเข้าระบบเจ้าหน้าที่
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // DASHBOARD DATA CALCULATIONS
  // ==========================================
  const db_totalPatients = patients.length;
  const db_totalAppointments = appointments.length;
  const db_completedAppointments = appointments.filter(a => a.status === 'completed').length;
  const db_pendingAppointments = appointments.filter(a => a.status === 'pending' || a.status === 'pending_results').length;

  const db_maleCount = patients.filter(p => p.gender === 'male').length;
  const db_femaleCount = patients.filter(p => p.gender === 'female').length;
  const db_malePct = db_totalPatients > 0 ? Math.round((db_maleCount / db_totalPatients) * 100) : 0;
  const db_femalePct = db_totalPatients > 0 ? Math.round((db_femaleCount / db_totalPatients) * 100) : 0;

  // Age Groups distribution
  const db_ageGroup1 = patients.filter(p => p.age <= 15).length;
  const db_ageGroup2 = patients.filter(p => p.age > 15 && p.age <= 35).length;
  const db_ageGroup3 = patients.filter(p => p.age > 35 && p.age <= 60).length;
  const db_ageGroup4 = patients.filter(p => p.age > 60).length;

  // Medical Coverage Rights
  let db_coverageGovernment = 0;
  let db_coverageGoldCard = 0;
  let db_coverageSocialSecurity = 0;
  let db_coveragePrivate = 0;
  let db_walkInCount = 0;
  let db_agencyCount = 0;
  appointments.forEach(a => {
    const cov = (a.medicalCoverage || 'ชำระเงินเอง / ไม่ระบุ').toLowerCase();
    if (cov.includes('ข้าราชการ') || cov.includes('รัฐวิสาหกิจ') || cov.includes('เบิกได้')) {
      db_coverageGovernment++;
    } else if (cov.includes('บัตรทอง') || cov.includes('30 บาท') || cov.includes('ถ้วนหน้า') || cov.includes('สปสช')) {
      db_coverageGoldCard++;
    } else if (cov.includes('ประกันสังคม')) {
      db_coverageSocialSecurity++;
    } else {
      db_coveragePrivate++;
    }

    if (a.patientType === 'agency') {
      db_agencyCount++;
    } else {
      db_walkInCount++;
    }
  });

  // BMI Category distribution (Asia-Pacific standard)
  let db_bmiUnderweight = 0; // < 18.5
  let db_bmiNormal = 0;      // 18.5 - 22.9
  let db_bmiOverweight = 0;  // 23.0 - 24.9 (Pre-obese)
  let db_bmiObeseClass1 = 0; // 25.0 - 29.9
  let db_bmiObeseClass2 = 0; // >= 30.0

  let db_sumWeight = 0;
  let db_sumHeight = 0;
  let db_sumHeartRate = 0;
  let db_sumWaist = 0;
  let db_countWaist = 0;
  let db_sumWaistlineMale = 0;
  let db_sumWaistlineFemale = 0;
  let db_countWaistlineMale = 0;
  let db_countWaistlineFemale = 0;
  let db_maleWaistOver90 = 0;
  let db_femaleWaistOver80 = 0;
  let db_countPhysicalResult = 0;

  let db_sumSystolic = 0;
  let db_sumDiastolic = 0;
  let db_countBP = 0;
  let db_bpNormalCount = 0;
  let db_bpAbnormalCount = 0;

  results.forEach(res => {
    if (res.physical) {
      db_countPhysicalResult++;
      db_sumWeight += res.physical.weight;
      db_sumHeight += res.physical.height;
      db_sumHeartRate += res.physical.heartRate;

      if (res.physical.bloodPressure) {
        const parts = res.physical.bloodPressure.split('/');
        const sys = parseInt(parts[0], 10);
        const dia = parseInt(parts[1], 10);
        if (!isNaN(sys) && !isNaN(dia)) {
          db_sumSystolic += sys;
          db_sumDiastolic += dia;
          db_countBP++;

          // BP normal: systolic 90-140 mmHg, diastolic 60-90 mmHg
          if (sys >= 90 && sys <= 140 && dia >= 60 && dia <= 90) {
            db_bpNormalCount++;
          } else {
            db_bpAbnormalCount++;
          }
        }
      }

      const bmiVal = res.physical.bmi;
      if (bmiVal < 18.5) {
        db_bmiUnderweight++;
      } else if (bmiVal < 23.0) {
        db_bmiNormal++;
      } else if (bmiVal < 25.0) {
        db_bmiOverweight++;
      } else if (bmiVal < 30.0) {
        db_bmiObeseClass1++;
      } else {
        db_bmiObeseClass2++;
      }

      // Waistline from physical
      const pat = patients.find(p => p.id === res.patientId);
      const waist = res.physical.waistline;
      if (waist) {
        db_sumWaist += waist;
        db_countWaist++;
        if (pat?.gender === 'male') {
          db_sumWaistlineMale += waist;
          db_countWaistlineMale++;
          if (waist > 90) {
            db_maleWaistOver90++;
          }
        } else if (pat?.gender === 'female') {
          db_sumWaistlineFemale += waist;
          db_countWaistlineFemale++;
          if (waist > 80) {
            db_femaleWaistOver80++;
          }
        }
      }
    }
  });

  const db_avgWeight = db_countPhysicalResult > 0 ? Number((db_sumWeight / db_countPhysicalResult).toFixed(1)) : 0;
  const db_avgHeight = db_countPhysicalResult > 0 ? Number((db_sumHeight / db_countPhysicalResult).toFixed(1)) : 0;
  const db_avgHeartRate = db_countPhysicalResult > 0 ? Math.round(db_sumHeartRate / db_countPhysicalResult) : 0;
  const db_avgWaist = db_countWaist > 0 ? Number((db_sumWaist / db_countWaist).toFixed(1)) : 0;
  const db_avgWaistlineMale = db_countWaistlineMale > 0 ? Number((db_sumWaistlineMale / db_countWaistlineMale).toFixed(1)) : 0;
  const db_avgWaistlineFemale = db_countWaistlineFemale > 0 ? Number((db_sumWaistlineFemale / db_countWaistlineFemale).toFixed(1)) : 0;

  const db_avgSystolic = db_countBP > 0 ? Math.round(db_sumSystolic / db_countBP) : 120;
  const db_avgDiastolic = db_countBP > 0 ? Math.round(db_sumDiastolic / db_countBP) : 80;

  const db_bmiObese1 = db_bmiObeseClass1;
  const db_bmiObese2 = db_bmiObeseClass2;

  // Lab Parameter Status Counters
  let db_labNormal = 0;
  let db_labAbnormal = 0;
  let db_labHighRisk = 0;
  let db_labLowRisk = 0;
  let db_labTotalParameters = 0;

  let db_labGlucoseNormal = 0;
  let db_labGlucoseAbnormal = 0;
  let db_labLipidNormal = 0;
  let db_labLipidAbnormal = 0;
  let db_labKidneyNormal = 0;
  let db_labKidneyAbnormal = 0;
  let db_labLiverNormal = 0;
  let db_labLiverAbnormal = 0;
  let db_labCbcNormal = 0;
  let db_labCbcAbnormal = 0;
  let db_labUrineNormal = 0;
  let db_labUrineAbnormal = 0;

  // CXR
  let db_cxrNormal = 0;
  let db_cxrAbnormal = 0;
  let db_cxrHighRisk = 0;
  let db_cxrLowRisk = 0;
  let db_cxrTotal = 0;

  results.forEach(res => {
    if (res.chestXray && res.chestXray.status !== 'ไม่ประสงค์ตรวจ') {
      db_cxrTotal++;
      if (res.chestXray.status === 'ปกติ') db_cxrNormal++;
      else if (res.chestXray.status === 'ผิดปกติ') db_cxrAbnormal++;
      else if (res.chestXray.status === 'เสี่ยงสูง') db_cxrHighRisk++;
      else if (res.chestXray.status === 'เสี่ยงต่ำ') db_cxrLowRisk++;
    }

    if (res.parameters) {
      // General Counters
      Object.values(res.parameters).forEach(p => {
        if (p.status !== 'ไม่ประสงค์ตรวจ' && !p.declined) {
          db_labTotalParameters++;
          if (p.status === 'ปกติ') db_labNormal++;
          else if (p.status === 'ผิดปกติ') db_labAbnormal++;
          else if (p.status === 'เสี่ยงสูง') db_labHighRisk++;
          else if (p.status === 'เสี่ยงต่ำ') db_labLowRisk++;
        }
      });

      // Glucose (fbs)
      if (res.parameters.fbs) {
        if (res.parameters.fbs.status === 'ปกติ') db_labGlucoseNormal++;
        else if (res.parameters.fbs.status !== 'ไม่ประสงค์ตรวจ') db_labGlucoseAbnormal++;
      }
      // Lipids (cholesterol, triglyceride, hdl, ldl)
      const lipidParams = ['cholesterol', 'triglyceride', 'hdl', 'ldl'];
      let hasLipidAbnormal = false;
      let hasLipid = false;
      lipidParams.forEach(p => {
        if (res.parameters[p]) {
          hasLipid = true;
          if (res.parameters[p].status !== 'ปกติ' && res.parameters[p].status !== 'ไม่ประสงค์ตรวจ') {
            hasLipidAbnormal = true;
          }
        }
      });
      if (hasLipid) {
        if (hasLipidAbnormal) db_labLipidAbnormal++;
        else db_labLipidNormal++;
      }
      // Kidney (creatinine, bun)
      const kidneyParams = ['creatinine', 'bun'];
      let hasKidneyAbnormal = false;
      let hasKidney = false;
      kidneyParams.forEach(p => {
        if (res.parameters[p]) {
          hasKidney = true;
          if (res.parameters[p].status !== 'ปกติ' && res.parameters[p].status !== 'ไม่ประสงค์ตรวจ') {
            hasKidneyAbnormal = true;
          }
        }
      });
      if (hasKidney) {
        if (hasKidneyAbnormal) db_labKidneyAbnormal++;
        else db_labKidneyNormal++;
      }
      // Liver (sgot, sgpt, alp)
      const liverParams = ['sgot', 'sgpt', 'alp'];
      let hasLiverAbnormal = false;
      let hasLiver = false;
      liverParams.forEach(p => {
        if (res.parameters[p]) {
          hasLiver = true;
          if (res.parameters[p].status !== 'ปกติ' && res.parameters[p].status !== 'ไม่ประสงค์ตรวจ') {
            hasLiverAbnormal = true;
          }
        }
      });
      if (hasLiver) {
        if (hasLiverAbnormal) db_labLiverAbnormal++;
        else db_labLiverNormal++;
      }
      // CBC
      if (res.parameters.cbc) {
        if (res.parameters.cbc.status === 'ปกติ') db_labCbcNormal++;
        else if (res.parameters.cbc.status !== 'ไม่ประสงค์ตรวจ') db_labCbcAbnormal++;
      }
      // Urine (ua)
      if (res.parameters.ua) {
        if (res.parameters.ua.status === 'ปกติ') db_labUrineNormal++;
        else if (res.parameters.ua.status !== 'ไม่ประสงค์ตรวจ') db_labUrineAbnormal++;
      }
    }
  });

  // LM6 Assessments calculations
  const db_totalLM6Assessments = assessments.length;
  const db_lm6Totals = {
    nutrition: 0,
    physicalActivity: 0,
    stressManagement: 0,
    avoidSubstances: 0,
    restorativeSleep: 0,
    socialConnection: 0
  };

  assessments.forEach(as => {
    db_lm6Totals.nutrition += as.scores.nutrition;
    db_lm6Totals.physicalActivity += as.scores.physicalActivity;
    db_lm6Totals.stressManagement += as.scores.stressManagement;
    db_lm6Totals.avoidSubstances += as.scores.avoidSubstances;
    db_lm6Totals.restorativeSleep += as.scores.restorativeSleep;
    db_lm6Totals.socialConnection += as.scores.socialConnection;
  });

  const db_avgLM6 = {
    nutrition: db_totalLM6Assessments > 0 ? Number((db_lm6Totals.nutrition / db_totalLM6Assessments).toFixed(1)) : 0,
    physicalActivity: db_totalLM6Assessments > 0 ? Number((db_lm6Totals.physicalActivity / db_totalLM6Assessments).toFixed(1)) : 0,
    stressManagement: db_totalLM6Assessments > 0 ? Number((db_lm6Totals.stressManagement / db_totalLM6Assessments).toFixed(1)) : 0,
    avoidSubstances: db_totalLM6Assessments > 0 ? Number((db_lm6Totals.avoidSubstances / db_totalLM6Assessments).toFixed(1)) : 0,
    restorativeSleep: db_totalLM6Assessments > 0 ? Number((db_lm6Totals.restorativeSleep / db_totalLM6Assessments).toFixed(1)) : 0,
    socialConnection: db_totalLM6Assessments > 0 ? Number((db_lm6Totals.socialConnection / db_totalLM6Assessments).toFixed(1)) : 0
  };

  const db_avgLM_diet = db_avgLM6.nutrition;
  const db_avgLM_stress = db_avgLM6.stressManagement;
  const db_avgLM_sleep = db_avgLM6.restorativeSleep;
  const db_avgLM_exercise = db_avgLM6.physicalActivity;
  const db_avgLM_social = db_avgLM6.socialConnection;
  const db_avgLM_substance = db_avgLM6.avoidSubstances;

  // STAFF PORTAL WORKSPACE
  return (
    <div className="space-y-8 text-left">
      {/* Selection layout for Active results recording */}
      {selectedAppointment ? (
        // RESULT RECORDER SHEET
        <div className="bg-white rounded-3xl border border-[#E0E4D9] shadow-sm overflow-hidden">
          <div className="bg-[#4A6741] text-white p-6 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-green-100 uppercase block font-mono">
                Medical Records Entry Form
              </span>
              <h3 className="text-lg font-bold">บันทึกผลแลปตรวจสุขภาพและภาพเอกซเรย์</h3>
              <p className="text-xs text-green-100/90 mt-0.5">
                กำลังบันทึกข้อมูลให้กับ: <span className="text-white font-bold underline">
                  {patients.find(p => p.id === selectedAppointment.patientId)?.name}
                </span>
              </p>
            </div>
            <button
              onClick={() => setSelectedAppointment(null)}
              className="bg-white/10 hover:bg-white/20 text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-white/10 transition-colors cursor-pointer"
            >
              ยกเลิกและย้อนกลับ
            </button>
          </div>

          <form onSubmit={handleSaveAllResults} className="p-6 sm:p-8 space-y-8">
            {/* LM ASSESSMENT SUMMARY FOR DOCTOR */}
            {(() => {
              const patientAssessments = assessments.filter(as => as.patientId === selectedAppointment.patientId);
              const latestAssessment = patientAssessments.length > 0 ? patientAssessments[patientAssessments.length - 1] : null;

              return (
                <div className="bg-[#4A6741]/5 p-5 rounded-2xl border border-[#4A6741]/20 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#4A6741]/10 pb-2.5 gap-2">
                    <h4 className="text-sm font-bold text-[#4A6741] flex items-center gap-2">
                      <Activity className="h-5 w-5 text-[#4A6741] animate-pulse" />
                      <span>ข้อมูลประกอบการพิจารณาแพทย์: ผลการประเมินวิถีชีวิต (Lifestyle Medicine - LM6)</span>
                    </h4>
                    {latestAssessment && (
                      <span className="text-[10px] bg-[#4A6741] text-white px-2.5 py-1 rounded-full font-bold">
                        ทำแบบประเมินเมื่อ {latestAssessment.date}
                      </span>
                    )}
                  </div>

                  {latestAssessment ? (
                    <div className="space-y-4">
                      <p className="text-xs text-gray-600 leading-relaxed">
                        ผู้รับบริการได้รับการประเมินพฤติกรรมสุขภาพทางเวชศาสตร์วิถีชีวิต (Lifestyle Medicine 6 Pillars) แล้ว โดยสรุปผลคะแนนแบ่งตาม 6 เสาหลัก (คะแนนเต็มด้านละ 15 คะแนน) เพื่อช่วยประกอบการวินิจฉัยและออกแบบคำแนะนำดูแลสุขภาพเฉพาะบุคคล:
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {Object.entries(latestAssessment.scores).map(([key, val]) => {
                          const pillarInfo = LM6_PILLARS_DETAILS[key as keyof typeof LM6_PILLARS_DETAILS];
                          if (!pillarInfo) return null;
                          return (
                            <div key={key} className="bg-white p-3.5 rounded-xl border border-[#E0E4D9] flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow">
                              <div className="flex justify-between items-start gap-2 mb-1.5">
                                <span className="font-extrabold text-xs text-gray-800 leading-tight">{pillarInfo.title}</span>
                                <span className="font-mono text-xs font-bold text-[#4A6741] whitespace-nowrap">{val} / 15</span>
                              </div>
                              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-1.5">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    val < 9 ? 'bg-red-500' : val < 13 ? 'bg-amber-500' : 'bg-emerald-600'
                                  }`}
                                  style={{ width: `${(val / 15) * 100}%` }}
                                ></div>
                              </div>
                              <span className={`text-[10px] font-bold ${
                                val < 9 ? 'text-red-600' : val < 13 ? 'text-amber-600' : 'text-emerald-700'
                              }`}>
                                {val < 9 ? '⚠️ ควรปรับปรุงพฤติกรรมเร่งด่วน' : val < 13 ? '📋 อยู่ในเกณฑ์ปานกลาง' : '⭐️ ดีเยี่ยม รักษาระดับสม่ำเสมอ'}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {latestAssessment.recommendations && latestAssessment.recommendations.length > 0 && (
                        <div className="bg-white p-4 rounded-xl border border-[#E0E4D9]/80 text-xs shadow-3xs space-y-2">
                          <p className="font-bold text-[#4A6741] flex items-center gap-1">
                            <span>💡 แนวทางการดูแลรักษาผู้รับบริการตามหลักเวชศาสตร์วิถีชีวิต:</span>
                          </p>
                          <ul className="list-disc pl-4 space-y-1 text-gray-600 text-[11px] leading-relaxed">
                            {latestAssessment.recommendations.map((rec, idx) => (
                              <li key={idx} className="font-medium">{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-5 bg-white rounded-xl border border-dashed border-[#E0E4D9]">
                      <AlertCircle className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-gray-500">ยังไม่พบบันทึกการทำแบบประเมินพฤติกรรมสุขภาพ (LM6) ของคนไข้รายนี้</p>
                      <p className="text-[10px] text-gray-400 mt-1">ท่านสามารถแนะนำให้คนไข้ทำแบบประเมินในพอร์ทัลผู้ป่วย เพื่อผลประเมินที่ครบถ้วน</p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 1. Body composition Physical */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-[#4A6741] uppercase tracking-wider border-b pb-1.5 flex items-center space-x-1 border-[#E0E4D9]">
                <ClipboardList className="h-4 w-4" />
                <span>1. ผลการตรวจร่างกายและสัญญาณชีพทั่วไป</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">น้ำหนักตัว (กิโลกรัม)</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="ระบุน้ำหนัก"
                    className="p-2 border border-gray-200 rounded-lg w-full font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[#4A6741]"
                    required={saveMode === 'complete'}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">ส่วนสูง (เซนติเมตร)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="ระบุส่วนสูง"
                    className="p-2 border border-gray-200 rounded-lg w-full font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[#4A6741]"
                    required={saveMode === 'complete'}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">รอบเอว (เซนติเมตร)</label>
                  <input
                    type="number"
                    placeholder="ระบุรอบเอวเป็นเซนติเมตร"
                    value={waistline}
                    onChange={(e) => setWaistline(e.target.value)}
                    className="p-2 border border-gray-200 rounded-lg w-full font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[#4A6741]"
                  />
                </div>
                <div className="space-y-1 bg-[#F9FAF7] p-2 rounded-lg border border-dashed border-[#E0E4D9] text-center">
                  <label className="font-bold text-gray-400 block mb-0.5">ดัชนีมวลกาย (BMI)</label>
                  <span className="text-sm font-extrabold font-mono text-gray-800">{bmi}</span>
                  <span className="text-[10px] text-[#4A6741] block font-semibold line-clamp-1">{bmiStatus}</span>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">ความดันโลหิต (mmHg)</label>
                  <input
                    type="text"
                    value={bp}
                    onChange={(e) => setBp(e.target.value)}
                    placeholder="เช่น 120/80"
                    className="p-2 border border-gray-200 rounded-lg w-full font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[#4A6741]"
                    required={saveMode === 'complete'}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">อัตราเต้นของหัวใจ (bpm)</label>
                  <input
                    type="number"
                    value={hr}
                    onChange={(e) => setHr(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="ระบุอัตราการเต้นหัวใจ"
                    className="p-2 border border-gray-200 rounded-lg w-full font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[#4A6741]"
                    required={saveMode === 'complete'}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">การประเมินรวมสัญญาณชีพ</label>
                  <select
                    value={generalStatus}
                    onChange={(e) => setGeneralStatus(e.target.value as any)}
                    className="p-2 border border-gray-200 rounded-lg w-full text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#4A6741]"
                  >
                    <option value="ปกติ">ปกติ</option>
                    <option value="ผิดปกติ">ผิดปกติ</option>
                    <option value="เสี่ยงสูง">เสี่ยงสูง</option>
                    <option value="เสี่ยงต่ำ">เสี่ยงต่ำ</option>
                  </select>
                </div>
                <div className="col-span-1 sm:col-span-2 space-y-1">
                  <label className="font-bold text-gray-500">บันทึกสภาวะร่างกายทั่วไป</label>
                  <input
                    type="text"
                    placeholder="เช่น แข็งแรงปกติ หรือ ความดันโลหิตสูงเล็กน้อย"
                    value={physicalNotes}
                    onChange={(e) => setPhysicalNotes(e.target.value)}
                    className="p-2 border border-gray-200 rounded-lg w-full text-sm focus:outline-none focus:ring-1 focus:ring-[#4A6741]"
                  />
                </div>
              </div>
            </div>

            {/* 2. Chest X-Ray */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-1.5 border-[#E0E4D9]">
                <h4 className="text-sm font-bold text-[#4A6741] uppercase tracking-wider flex items-center space-x-1">
                  <FileText className="h-4 w-4" />
                  <span>2. การคัดกรองเอกซเรย์ทรวงอก (Chest X-Ray)</span>
                </h4>
                <div className="flex items-center space-x-2 mt-2 sm:mt-0 bg-red-50 px-3 py-1 rounded-lg border border-red-100">
                  <input
                    type="checkbox"
                    id="decline-cxr"
                    checked={!!declinedTests['chestXray']}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setDeclinedTests({ ...declinedTests, chestXray: checked });
                      if (checked) {
                        setCxrStatus('ไม่ประสงค์ตรวจ');
                        setCxrDesc('ผู้รับบริการไม่ประสงค์ตรวจ (Declined Chest X-Ray)');
                      } else {
                        setCxrStatus('ปกติ');
                        setCxrDesc('');
                      }
                    }}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="decline-cxr" className="text-xs font-bold text-red-700 cursor-pointer">
                    ผู้รับบริการไม่ประสงค์ตรวจรายการนี้ (Declined)
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">ผลประเมินเอกซเรย์</label>
                  <select
                    value={cxrStatus}
                    disabled={!!declinedTests['chestXray']}
                    onChange={(e) => setCxrStatus(e.target.value as any)}
                    className="p-2 border border-gray-200 rounded-lg w-full text-sm bg-white focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="ปกติ">ปกติ</option>
                    <option value="ผิดปกติ">ผิดปกติ</option>
                    <option value="เสี่ยงสูง">เสี่ยงสูง</option>
                    <option value="เสี่ยงต่ำ">เสี่ยงต่ำ</option>
                    <option value="ไม่ประสงค์ตรวจ">ไม่ประสงค์ตรวจ (Declined)</option>
                  </select>
                </div>
                <div className="col-span-1 sm:col-span-2 space-y-1">
                  <label className="font-bold text-gray-500">คำวินิจฉัยของรังสีแพทย์</label>
                  <input
                    type="text"
                    value={cxrDesc}
                    disabled={!!declinedTests['chestXray']}
                    placeholder={declinedTests['chestXray'] ? 'ไม่ประสงค์ตรวจ' : 'ระบุคำวินิจฉัย/รายละเอียด เช่น CXR: No active lung lesion.'}
                    onChange={(e) => setCxrDesc(e.target.value)}
                    className="p-2 border border-gray-200 rounded-lg w-full text-sm focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
                    required={saveMode === 'complete' && !declinedTests['chestXray']}
                  />
                </div>
              </div>
            </div>

            {/* 3. Laboratory values */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-[#4A6741] uppercase tracking-wider border-b pb-1.5 flex items-center space-x-1 border-[#E0E4D9]">
                <ClipboardList className="h-4 w-4" />
                <span>3. ข้อมูลผลการตรวจทางห้องปฏิบัติการ (Lab Parameters)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {Object.entries(labValues).map(([key, item]) => {
                  const valObj = item as { value: string; status: 'ปกติ' | 'ผิดปกติ' | 'เสี่ยงสูง' | 'เสี่ยงต่ำ' | 'ไม่ประสงค์ตรวจ' };
                  const meta = BASIC_TESTS[key] || SPECIAL_TESTS[key];
                  if (!meta) return null;
                  const isDeclined = !!declinedTests[key];
                  return (
                    <div key={key} className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2 transition-all ${isDeclined ? 'bg-red-50/40 border-red-200' : 'bg-[#F9FAF7] border-[#E0E4D9]'}`}>
                      <div>
                        <div className="flex justify-between font-bold text-[#4A6741]">
                          <span>{meta.name}</span>
                        </div>
                        <p className="text-[9px] text-gray-400 mb-2">ค่าปกติ: {meta.refRange} {meta.unit}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={isDeclined ? 'ไม่ประสงค์ตรวจ' : valObj.value}
                          disabled={isDeclined}
                          placeholder="กรอกค่าตรวจ"
                          onChange={(e) => {
                            setLabValues({
                              ...labValues,
                              [key]: { ...valObj, value: e.target.value }
                            });
                          }}
                          className="p-1.5 border border-gray-200 rounded bg-white text-sm font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#4A6741] disabled:bg-gray-100 disabled:text-gray-400"
                        />
                        <select
                          value={isDeclined ? 'ไม่ประสงค์ตรวจ' : valObj.status}
                          disabled={isDeclined}
                          onChange={(e) => {
                            setLabValues({
                              ...labValues,
                              [key]: { ...valObj, status: e.target.value as any }
                            });
                          }}
                          className="p-1.5 border border-gray-200 rounded bg-white text-xs focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
                        >
                          <option value="ปกติ">ปกติ</option>
                          <option value="ผิดปกติ">ผิดปกติ</option>
                          <option value="เสี่ยงสูง">เสี่ยงสูง</option>
                          <option value="เสี่ยงต่ำ">เสี่ยงต่ำ</option>
                          <option value="ไม่ประสงค์ตรวจ">ไม่ประสงค์ตรวจ</option>
                        </select>
                      </div>

                      <div className="flex items-center space-x-1.5 mt-2 pt-1.5 border-t border-gray-200/60">
                        <input
                          type="checkbox"
                          id={`decline-${key}`}
                          checked={isDeclined}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setDeclinedTests({ ...declinedTests, [key]: checked });
                            setLabValues({
                              ...labValues,
                              [key]: {
                                value: checked ? 'ไม่ประสงค์ตรวจ' : '',
                                status: checked ? 'ไม่ประสงค์ตรวจ' : 'ปกติ'
                              }
                            });
                          }}
                          className="h-3.5 w-3.5 text-red-600 focus:ring-red-500 border-gray-300 rounded cursor-pointer"
                        />
                        <label htmlFor={`decline-${key}`} className="text-[10px] font-bold text-red-700 cursor-pointer">
                          ผู้รับบริการไม่ประสงค์ตรวจรายการนี้
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. PDF ATTACHMENT PORTION */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-[#4A6741] uppercase tracking-wider border-b pb-1.5 flex items-center space-x-1 border-[#E0E4D9]">
                <Upload className="h-4 w-4" />
                <span>4. แนบไฟล์ PDF รายงานผลตรวจเพิ่มเติม (Attached Medical Documents)</span>
              </h4>
              <p className="text-xs text-gray-400 leading-normal">
                สิทธิ์ในการเพิ่มไฟล์เอกสารโรงพยาบาล เช่น ผลวิเคราะห์จากเครื่องมือเฉพาะทาง ใบวิเคราะห์เลือด ดึงผลคีย์บันทึกคู่กับรายการตรวจ
              </p>

              <div className="bg-[#F9FAF7] p-4 rounded-xl border border-dashed border-[#E0E4D9] flex flex-col sm:flex-row gap-4 items-end">
                <div className="space-y-1 flex-1 text-xs">
                  <label className="font-bold text-gray-500">เลือกหัวข้อรายการตรวจที่ต้องการแนบ</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="p-2 border border-gray-200 rounded-lg w-full bg-white text-sm focus:outline-none"
                  >
                    <option value="Chest X-Ray">Chest X-Ray (เอกซเรย์ปอด)</option>
                    <option value="CBC Result">CBC Result (ผลเม็ดเลือด)</option>
                    <option value="Lipid Profile">Lipid Profile (ผลไขมัน)</option>
                    <option value="Thyroid Panel">Thyroid Panel (ผลไทรอยด์)</option>
                    <option value="Cancer Markers">Cancer Markers (สารบ่งชี้มะเร็ง)</option>
                    <option value="Hepatitis Test">Hepatitis Test (ผลไวรัสตับอักเสบ)</option>
                    <option value="ผลจากกายภาพ">ผลจากกายภาพ (Physical Therapy Result)</option>
                    <option value="ผลจากรังสี">ผลจากรังสี (Radiological Result)</option>
                    <option value="ผลอื่นๆ">ผลอื่นๆ (Other Result)</option>
                  </select>
                </div>

                <div className="shrink-0">
                  <label className="inline-flex items-center space-x-2 bg-[#4A6741] hover:bg-[#3d5635] text-white font-bold py-2 px-4 rounded-xl text-xs transition-all cursor-pointer">
                    <FileUp className="h-4 w-4" />
                    <span>กดอัปโหลดไฟล์ PDF</span>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleSimulatePdfUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Uploaded lists */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-500">รายการไฟล์แนบที่ผูกกับรายงานตรวจสุขภาพแล้ว:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="bg-white p-3 border border-[#E0E4D9] rounded-xl flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="bg-red-50 text-red-600 p-1.5 rounded">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 line-clamp-1">{file.name}</p>
                            <p className="text-[10px] text-gray-400">{file.category} • {file.size}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(file.id)}
                          className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 5. Medical Diagnosis Summary */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-[#4A6741] uppercase tracking-wider border-b pb-1.5 flex justify-between items-center border-[#E0E4D9]">
                <span>5. สรุปความเห็นของแพทย์และคำแนะนำส่วนบุคคล</span>
                <button
                  type="button"
                  onClick={triggerAutoSuggestions}
                  className="inline-flex items-center space-x-1.5 text-xs text-[#4A6741] font-bold bg-[#F2F4ED] border border-[#E0E4D9] px-3 py-1.5 rounded-lg hover:bg-[#E0E4D9] transition-colors cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>วิเคราะห์ผลและสร้างคำแนะนำอัตโนมัติ</span>
                </button>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500 font-medium">ชื่อแพทย์ผู้ประเมิน (Physician Name)</label>
                    <input
                      type="text"
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                      placeholder="ระบุชื่อแพทย์ เช่น พญ. นภัสวรรณ อุ่นใจ"
                      className="p-2 border border-gray-200 rounded-lg w-full text-sm font-semibold text-[#4A6741] focus:outline-none"
                      required={saveMode === 'complete'}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500 font-medium">เลขประจำตัววิชาชีพเวชกรรม (เลข ว.) (Medical License No.)</label>
                    <input
                      type="text"
                      value={doctorLicense}
                      onChange={(e) => setDoctorLicense(e.target.value)}
                      placeholder="ระบุเลข ว. เช่น ว.70369"
                      className="p-2 border border-gray-200 rounded-lg w-full text-sm font-semibold text-[#4A6741] focus:outline-none font-mono"
                      required={saveMode === 'complete'}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">สรุปผลภาพรวม (Clinical Impression)</label>
                  <textarea
                    rows={5}
                    placeholder="สรุปวินิจฉัยทางการแพทย์..."
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="p-2 border border-gray-200 rounded-lg w-full text-sm focus:outline-none min-h-[124px]"
                    required={saveMode === 'complete'}
                  ></textarea>
                </div>
                <div className="col-span-1 md:col-span-2 space-y-1">
                  <label className="font-bold text-gray-500">
                    แนวทางเวชศาสตร์วิถีชีวิตเพื่อการปรับเปลี่ยนพฤติกรรม (ใส่หัวข้อละ 1 บรรทัด)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="เช่น:&#10;- ดื่มน้ำเปล่าเพิ่มวันละ 8 แก้ว&#10;- หลีกเลี่ยงอาหารทะเลและเครื่องในสัตว์เพื่อลดกรดยูริก&#10;- นอนหลับพักผ่อนเฉลี่ยวันละ 7-8 ชั่วโมง"
                    value={recommendationsInput}
                    onChange={(e) => setRecommendationsInput(e.target.value)}
                    className="p-2 border border-gray-200 rounded-lg w-full text-sm font-mono focus:outline-none"
                    required={saveMode === 'complete'}
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Submit Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#E0E4D9]">
              <button
                type="submit"
                onClick={() => setSaveMode('draft')}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 px-4 rounded-xl text-sm shadow-sm transition-all cursor-pointer text-center flex items-center justify-center space-x-2"
              >
                <span>บันทึกเบื้องต้น (ผลยังไม่ครบถ้วน)</span>
              </button>
              <button
                type="submit"
                onClick={() => setSaveMode('complete')}
                className="flex-1 bg-[#4A6741] hover:bg-[#3d5635] text-white font-extrabold py-3.5 px-4 rounded-xl text-sm shadow-sm hover:shadow transition-all cursor-pointer text-center flex items-center justify-center space-x-2"
              >
                <span>บันทึกและแสดงรายงาน PDF</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        // STAFF DIRECTORY AND APPOINTMENT DASHBOARD
        <div className="space-y-8">
          {/* Quick Header */}
          <div className="bg-[#4A6741] text-white p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden text-left">
            <div className="absolute inset-0 bg-white opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold">ระบบบริหารจัดการสำหรับเจ้าหน้าที่คัดกรอง</h3>
              <p className="text-xs text-green-100/95">สถิติแดชบอร์ดสุขภาพ ตรวจสอบฐานข้อมูลคนไข้ เผยรหัสผ่าน และกรอกผลตรวจแลป</p>
            </div>
            <div className="bg-white/20 border border-white/10 px-4 py-2 rounded-xl text-xs font-mono text-white font-bold relative z-10 shrink-0">
              PORTAL MODE: STAFF ACCESS GRANTED
            </div>
          </div>

          {/* Tab Selection Bar */}
          <div className="flex flex-wrap border-b border-[#E0E4D9] gap-2">
            <button
              onClick={() => setStaffActiveTab('dashboard')}
              className={`px-5 py-3 text-xs font-black flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                staffActiveTab === 'dashboard'
                  ? 'border-[#4A6741] text-[#4A6741] bg-[#4A6741]/5 font-black'
                  : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="h-4.5 w-4.5" />
              <span>📊 แดชบอร์ดภาพรวมสุขภาพ (Health Dashboard)</span>
            </button>
            <button
              onClick={() => setStaffActiveTab('registry')}
              className={`px-5 py-3 text-xs font-black flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                staffActiveTab === 'registry'
                  ? 'border-[#4A6741] text-[#4A6741] bg-[#4A6741]/5 font-black'
                  : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              <User className="h-4.5 w-4.5" />
              <span>👥 บัญชีข้อมูลผู้รับบริการ [{db_totalPatients} คน]</span>
            </button>
            <button
              onClick={() => setStaffActiveTab('appointments')}
              className={`px-5 py-3 text-xs font-black flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                staffActiveTab === 'appointments'
                  ? 'border-[#4A6741] text-[#4A6741] bg-[#4A6741]/5 font-black'
                  : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Calendar className="h-4.5 w-4.5" />
              <span>📅 รายการตรวจและลงผลคิวแลป [{db_totalAppointments} คิว]</span>
            </button>
          </div>

          {/* CONDITIONAL RENDER: PATIENT DIRECTORY DATABASE SECTION */}
          {staffActiveTab === 'registry' && (
            <div className="bg-white rounded-2xl border border-[#E0E4D9] shadow-sm p-6 space-y-4 text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E0E4D9] pb-4">
                <h4 className="font-bold text-[#4A6741] text-base flex items-center space-x-1.5">
                  <User className="h-5 w-5 text-[#4A6741]" />
                  <span>บัญชีข้อมูลผู้รับบริการและรหัสผ่าน (Patient Registry)</span>
                </h4>
                <div className="relative w-full sm:w-80 text-xs">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ค้นหาด้วย ชื่อ หรือ เลขบัตรประชาชน..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl w-full focus:outline-none focus:ring-1 focus:ring-[#4A6741] bg-white text-sm"
                  />
                </div>
              </div>

              <div className="overflow-x-auto border border-[#E0E4D9] rounded-xl">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-[#F2F4ED] text-xs font-bold text-[#2D3E2F]">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left uppercase">ชื่อผู้รับบริการ</th>
                      <th scope="col" className="px-4 py-3 text-left uppercase">เลขบัตรประชาชน 13 หลัก</th>
                      <th scope="col" className="px-4 py-3 text-center uppercase">HN (เลขประจำตัวคนไข้)</th>
                      <th scope="col" className="px-4 py-3 text-center uppercase">อายุ / เพศ</th>
                      <th scope="col" className="px-4 py-3 text-center uppercase bg-[#4A6741]/10 text-[#4A6741]">
                        รหัสผ่านที่ตั้งเอง (Password)
                      </th>
                      <th scope="col" className="px-4 py-3 text-center uppercase">เบอร์โทรศัพท์</th>
                      <th scope="col" className="px-4 py-3 text-center uppercase">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100 text-xs">
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((patient) => (
                        <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-bold text-gray-800">{patient.name}</td>
                          <td className="px-4 py-3 font-mono text-gray-500">{patient.nationalId}</td>
                          <td className="px-4 py-3 text-center font-mono font-semibold text-[#4A6741]">
                            {patient.hn || <span className="text-gray-300">ไม่มี</span>}
                          </td>
                          <td className="px-4 py-3 text-center font-medium">
                            {patient.age} ปี / {patient.gender === 'female' ? 'หญิง' : 'ชาย'}
                          </td>
                          <td className="px-4 py-3 text-center font-mono font-extrabold text-[#4A6741] bg-[#F9FAF7] border-x border-[#E0E4D9]">
                            {patient.password}
                          </td>
                          <td className="px-4 py-3 text-center font-mono text-gray-500">{patient.phone}</td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex justify-center items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(patient)}
                                className="bg-[#4A6741] hover:bg-[#3d5635] text-white font-bold py-1.5 px-2.5 rounded text-[11px] shadow-sm transition-all cursor-pointer inline-flex items-center space-x-1"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                                <span>แก้ไข</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePatientClick(patient)}
                                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold py-1.5 px-2.5 rounded text-[11px] transition-all cursor-pointer inline-flex items-center space-x-1"
                                title="ยกเลิกข้อมูลผู้รับบริการ (กรณีไม่มารับบริการ)"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>ยกเลิกข้อมูล</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                          ไม่พบบัญชีรายชื่อผู้รับบริการที่ตรงตามเงื่อนไข
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CONDITIONAL RENDER: HEALTH DASHBOARD SECTION */}
          {staffActiveTab === 'dashboard' && (
            <div className="space-y-6 text-left">
              {/* Top Summary Stats Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-[#4A6741]/5 to-[#4A6741]/10 border border-[#4A6741]/20 p-5 rounded-2xl flex items-center justify-between shadow-2xs">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">ผู้ลงทะเบียนทั้งหมด</p>
                    <h3 className="text-3xl font-black text-[#4A6741] font-mono">{db_totalPatients} <span className="text-sm font-semibold text-gray-400">ราย</span></h3>
                  </div>
                  <div className="p-3.5 bg-[#4A6741] text-white rounded-xl">
                    <User className="h-6 w-6" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#4A6741]/5 to-[#4A6741]/10 border border-[#4A6741]/20 p-5 rounded-2xl flex items-center justify-between shadow-2xs">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">คิวนัดหมายตรวจจริง</p>
                    <h3 className="text-3xl font-black text-[#4A6741] font-mono">{db_totalAppointments} <span className="text-sm font-semibold text-gray-400">คิว</span></h3>
                  </div>
                  <div className="p-3.5 bg-[#4A6741] text-white rounded-xl">
                    <Calendar className="h-6 w-6" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border border-blue-500/20 p-5 rounded-2xl flex items-center justify-between shadow-2xs">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">สัดส่วนผู้เข้ารับบริการ (ช/ญ)</p>
                    <h3 className="text-2xl font-black text-blue-800 font-mono">
                      {db_maleCount} <span className="text-xs font-semibold text-gray-400">ชาย</span> / {db_femaleCount} <span className="text-xs font-semibold text-gray-400">หญิง</span>
                    </h3>
                  </div>
                  <div className="p-3.5 bg-blue-600 text-white rounded-xl">
                    <Users className="h-6 w-6" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border border-amber-500/20 p-5 rounded-2xl flex items-center justify-between shadow-2xs">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">ค่าเฉลี่ย BMI ประชากร</p>
                    {(() => {
                      const avgBmi = db_avgHeight > 0 ? (db_avgWeight / ((db_avgHeight / 100) * (db_avgHeight / 100))) : 0;
                      let bmiLabel = "ปกติ";
                      let bmiColorClass = "text-emerald-700";
                      if (avgBmi < 18.5) { bmiLabel = "น้ำหนักน้อย"; bmiColorClass = "text-sky-600"; }
                      else if (avgBmi >= 18.5 && avgBmi <= 22.9) { bmiLabel = "ปกติ (เกณฑ์เอเชีย)"; bmiColorClass = "text-emerald-600"; }
                      else if (avgBmi >= 23.0 && avgBmi <= 24.9) { bmiLabel = "น้ำหนักเกิน"; bmiColorClass = "text-amber-600"; }
                      else if (avgBmi >= 25.0 && avgBmi <= 29.9) { bmiLabel = "อ้วนระดับ 1"; bmiColorClass = "text-orange-600"; }
                      else if (avgBmi >= 30.0) { bmiLabel = "อ้วนระดับ 2 (รุนแรง)"; bmiColorClass = "text-red-600"; }

                      return (
                        <>
                          <h3 className={`text-3xl font-black font-mono ${bmiColorClass}`}>
                            {avgBmi > 0 ? avgBmi.toFixed(1) : '-'}{' '}
                            <span className="text-xs font-bold text-gray-400">kg/m²</span>
                          </h3>
                          <p className="text-[10px] font-black text-gray-400">เกณฑ์เฉลี่ย: <span className="underline">{bmiLabel}</span></p>
                        </>
                      );
                    })()}
                  </div>
                  <div className="p-3.5 bg-amber-600 text-white rounded-xl">
                    <Activity className="h-6 w-6" />
                  </div>
                </div>
              </div>

              {/* Excel Report Export Control Panel */}
              <div className="bg-white border border-[#E0E4D9] rounded-2xl shadow-xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-[#4A6741] text-sm flex items-center gap-1.5">
                    <FileSpreadsheet className="h-5 w-5 text-[#4A6741]" />
                    <span>ส่งออกรายงานและผลประเมินสุขภาพ (Excel Export)</span>
                  </h4>
                  <p className="text-[11px] text-gray-500 font-medium">
                    ระบุช่วงวันที่เข้าตรวจสุขภาพเพื่อส่งออกรายงานสรุปผลการตรวจและคะแนนผลประเมินพฤติกรรมสุขภาพทั้งหมดในรูปแบบไฟล์ Excel (.xlsx)
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase">วันที่เริ่มต้น (Start Date)</label>
                      <input
                        type="date"
                        value={exportStartDate}
                        onChange={(e) => setExportStartDate(e.target.value)}
                        className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#4A6741]/20 focus:border-[#4A6741] text-gray-700 font-medium"
                      />
                    </div>
                    <span className="text-gray-300 text-xs mt-4">ถึง</span>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase">วันที่สิ้นสุด (End Date)</label>
                      <input
                        type="date"
                        value={exportEndDate}
                        onChange={(e) => setExportEndDate(e.target.value)}
                        className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#4A6741]/20 focus:border-[#4A6741] text-gray-700 font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 md:mt-0">
                    {(exportStartDate || exportEndDate) && (
                      <button
                        onClick={() => {
                          setExportStartDate('');
                          setExportEndDate('');
                        }}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold px-3 py-2 rounded-xl transition-colors cursor-pointer"
                      >
                        ล้างค่า
                      </button>
                    )}
                    <button
                      onClick={handleExportExcel}
                      className="text-xs bg-[#4A6741] hover:bg-[#3D5435] text-white font-bold px-4 py-2 rounded-xl shadow-xs hover:shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="h-4 w-4" />
                      <span>ดาวน์โหลดรายงาน Excel</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bento Grid layout for visual dashboard sections */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 1. Demographics & Medical Coverage Distribution (4 Columns) */}
                <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E0E4D9] shadow-xs p-6 space-y-5">
                  <div className="border-b border-[#E0E4D9] pb-3">
                    <h4 className="font-extrabold text-[#4A6741] text-sm flex items-center space-x-1.5">
                      <Users className="h-4.5 w-4.5 text-[#4A6741]" />
                      <span>ข้อมูลทั่วไปและสิทธิรักษาพยาบาล</span>
                    </h4>
                  </div>

                  {/* Age Distribution Segmented Bar */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-gray-500">ช่วงอายุผู้รับบริการ (Age Distribution)</span>
                    <div className="h-3 w-full rounded-full bg-gray-100 flex overflow-hidden">
                      {(() => {
                        const sum = db_ageGroup1 + db_ageGroup2 + db_ageGroup3 + db_ageGroup4 || 1;
                        const p1 = (db_ageGroup1 / sum) * 100;
                        const p2 = (db_ageGroup2 / sum) * 100;
                        const p3 = (db_ageGroup3 / sum) * 100;
                        const p4 = (db_ageGroup4 / sum) * 100;
                        return (
                          <>
                            <div style={{ width: `${p1}%` }} className="bg-sky-400" title={`เด็ก 0-15 ปี (${db_ageGroup1} คน)`}></div>
                            <div style={{ width: `${p2}%` }} className="bg-emerald-400" title={`วัยรุ่น/ทำงาน 16-35 ปี (${db_ageGroup2} คน)`}></div>
                            <div style={{ width: `${p3}%` }} className="bg-amber-400" title={`วัยผู้ใหญ่ 36-60 ปี (${db_ageGroup3} คน)`}></div>
                            <div style={{ width: `${p4}%` }} className="bg-rose-400" title={`ผู้สูงอายุ 60 ปีขึ้นไป (${db_ageGroup4} คน)`}></div>
                          </>
                        );
                      })()}
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px] font-semibold text-gray-600">
                      <div className="flex items-center space-x-1">
                        <span className="h-2 w-2 rounded-full bg-sky-400 block shrink-0"></span>
                        <span className="truncate">0 - 15 ปี ({db_ageGroup1} คน)</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 block shrink-0"></span>
                        <span className="truncate">16 - 35 ปี ({db_ageGroup2} คน)</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="h-2 w-2 rounded-full bg-amber-400 block shrink-0"></span>
                        <span className="truncate">36 - 60 ปี ({db_ageGroup3} คน)</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="h-2 w-2 rounded-full bg-rose-400 block shrink-0"></span>
                        <span className="truncate">60 ปีขึ้นไป ({db_ageGroup4} คน)</span>
                      </div>
                    </div>
                  </div>

                  {/* Medical Coverage (สิทธิการรักษา) */}
                  <div className="space-y-2.5 pt-2">
                    <span className="text-[11px] font-bold text-gray-500">ประเภทสิทธิการรักษาพยาบาล (Medical Coverage)</span>
                    <div className="space-y-2">
                      {[
                        { label: 'สิทธิข้าราชการ/รัฐวิสาหกิจ', count: db_coverageGovernment, color: 'bg-[#4A6741]' },
                        { label: 'สิทธิบัตรทอง (30 บาทรักษาทุกโรค)', count: db_coverageGoldCard, color: 'bg-amber-500' },
                        { label: 'สิทธิประกันสังคม', count: db_coverageSocialSecurity, color: 'bg-blue-600' },
                        { label: 'สิทธิประกันสุขภาพเอกชน/จ่ายเอง', count: db_coveragePrivate, color: 'bg-indigo-600' }
                      ].map((cov, idx) => {
                        const total = db_coverageGovernment + db_coverageGoldCard + db_coverageSocialSecurity + db_coveragePrivate || 1;
                        const pct = (cov.count / total) * 100;
                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between items-center text-[10px] font-bold text-gray-600">
                              <span>{cov.label}</span>
                              <span className="font-mono text-[#4A6741]">{cov.count} คน ({pct.toFixed(0)}%)</span>
                            </div>
                            <div className="w-full bg-gray-100 h-2.5 rounded-lg overflow-hidden">
                              <div style={{ width: `${pct}%` }} className={`h-full ${cov.color} rounded-lg`}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Walk-in vs Corporate/Agency Booking */}
                  <div className="space-y-2.5 pt-4 border-t border-gray-100">
                    <span className="text-[11px] font-bold text-gray-500 block">รูปแบบการเข้ารับบริการ (Walk-In / หน่วยงาน)</span>
                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="bg-emerald-50/50 p-3 rounded-xl border border-[#4A6741]/10 text-center space-y-0.5">
                        <span className="text-gray-500 text-[10px] font-bold block">Walk-In ทั่วไป</span>
                        <p className="text-lg font-black text-[#4A6741] font-mono">
                          {db_walkInCount} <span className="text-xs font-semibold text-gray-400">ราย</span>
                        </p>
                      </div>
                      <div className="bg-blue-50/40 p-3 rounded-xl border border-blue-500/10 text-center space-y-0.5">
                        <span className="text-gray-500 text-[10px] font-bold block">ในนามหน่วยงาน</span>
                        <p className="text-lg font-black text-blue-700 font-mono">
                          {db_agencyCount} <span className="text-xs font-semibold text-gray-400">ราย</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Asia-Pacific BMI Perspective Distribution (4 Columns) */}
                <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E0E4D9] shadow-xs p-6 space-y-4">
                  <div className="border-b border-[#E0E4D9] pb-3">
                    <h4 className="font-extrabold text-[#4A6741] text-sm flex items-center space-x-1.5">
                      <Scale className="h-4.5 w-4.5 text-[#4A6741]" />
                      <span>เกณฑ์ดัชนีมวลกายประชากรเอเชีย (The Asia-Pacific BMI)</span>
                    </h4>
                  </div>

                  <p className="text-[10px] text-gray-500 italic leading-relaxed">
                    อ้างอิงตามเกณฑ์ความชุกของโรคอ้วนในประชากรเอเชียแปซิฟิก (The Asia-Pacific perspective WHO) เพื่อประเมินความเสี่ยงโรคหัวใจและหลอดเลือดอย่างแม่นยำ
                  </p>

                  <div className="space-y-3">
                    {[
                      { label: 'น้ำหนักต่ำกว่าเกณฑ์ (Underweight)', range: '< 18.5', count: db_bmiUnderweight, color: 'bg-sky-400', desc: 'เสี่ยงทุพโภชนาการ' },
                      { label: 'น้ำหนักปกติสุขภาพดี (Normal Weight)', range: '18.5 - 22.9', count: db_bmiNormal, color: 'bg-emerald-500', desc: 'สุขภาพดี สมส่วน' },
                      { label: 'น้ำหนักเกินเกณฑ์ (Overweight)', range: '23.0 - 24.9', count: db_bmiOverweight, color: 'bg-amber-400', desc: 'เริ่มมีความเสี่ยง' },
                      { label: 'อ้วนระดับที่ 1 (Obese Class 1)', range: '25.0 - 29.9', count: db_bmiObese1, color: 'bg-orange-500', desc: 'เสี่ยงโรคความดันเบาหวาน' },
                      { label: 'อ้วนระดับที่ 2 (Obese Class 2)', range: '>= 30.0', count: db_bmiObese2, color: 'bg-rose-600', desc: 'ความเสี่ยงโรคภัยสูงมาก' }
                    ].map((bmi, idx) => {
                      const total = db_bmiUnderweight + db_bmiNormal + db_bmiOverweight + db_bmiObese1 + db_bmiObese2 || 1;
                      const pct = (bmi.count / total) * 100;
                      return (
                        <div key={idx} className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex flex-col space-y-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[11px] font-black text-gray-700 block">{bmi.label}</span>
                              <span className="text-[9px] text-gray-400 block font-semibold">เกณฑ์เอเชีย: {bmi.range} ({bmi.desc})</span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-black text-[#4A6741] font-mono block">{bmi.count} คน</span>
                              <span className="text-[9px] font-bold text-gray-400 block font-mono">({pct.toFixed(0)}%)</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-1">
                            <div style={{ width: `${pct}%` }} className={`h-full ${bmi.color} rounded-full`}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Physical Examination Averages & Waistline (4 Columns) */}
                <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E0E4D9] shadow-xs p-6 space-y-4">
                  <div className="border-b border-[#E0E4D9] pb-3">
                    <h4 className="font-extrabold text-[#4A6741] text-sm flex items-center space-x-1.5">
                      <Heart className="h-4.5 w-4.5 text-[#4A6741]" />
                      <span>ค่าเฉลี่ยผลตรวจคัดกรองร่างกาย (Physical Averages)</span>
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-[#4A6741]/5 p-3 rounded-xl border border-[#4A6741]/10 text-center space-y-1">
                      <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">น้ำหนักเฉลี่ย</span>
                      <p className="text-xl font-black text-[#4A6741] font-mono">{db_avgWeight > 0 ? db_avgWeight.toFixed(1) : '-'} <span className="text-[10px] font-bold text-gray-500">กิโลกรัม</span></p>
                    </div>

                    <div className="bg-[#4A6741]/5 p-3 rounded-xl border border-[#4A6741]/10 text-center space-y-1">
                      <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">ส่วนสูงเฉลี่ย</span>
                      <p className="text-xl font-black text-[#4A6741] font-mono">{db_avgHeight > 0 ? db_avgHeight.toFixed(0) : '-'} <span className="text-[10px] font-bold text-gray-500">เซนติเมตร</span></p>
                    </div>

                    <div className="bg-red-500/5 p-3 rounded-xl border border-red-500/10 text-center space-y-1 col-span-2">
                      <span className="text-red-800 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1">
                        <Activity className="h-3.5 w-3.5 text-red-600" />
                        <span>ความดันโลหิตเฉลี่ย (BP Average)</span>
                      </span>
                      <p className="text-2xl font-black text-red-700 font-mono">
                        {db_avgSystolic > 0 ? db_avgSystolic.toFixed(0) : '-'}/{db_avgDiastolic > 0 ? db_avgDiastolic.toFixed(0) : '-'} <span className="text-xs font-bold text-gray-500">mmHg</span>
                      </p>
                      {(() => {
                        if (db_avgSystolic === 0) return null;
                        let status = "ความดันปกติสุขภาพดี";
                        let clr = "text-emerald-700";
                        if (db_avgSystolic >= 140 || db_avgDiastolic >= 90) { status = "ความดันโลหิตสูงระดับรุนแรง"; clr = "text-red-600"; }
                        else if (db_avgSystolic >= 130 || db_avgDiastolic >= 80) { status = "ความดันโลหิตสูงเล็กน้อย (Pre-HT)"; clr = "text-orange-600"; }
                        else if (db_avgSystolic >= 120) { status = "ความดันโลหิตเริ่มเพิ่มสูง"; clr = "text-amber-600"; }
                        return <span className={`text-[9px] font-bold ${clr} block`}>เฉลี่ยอยู่ในเกณฑ์: {status}</span>;
                      })()}
                      
                      <div className="flex justify-around items-center pt-2 mt-1 border-t border-red-500/10 text-[10px] font-bold text-gray-600">
                        <span className="text-emerald-700">BP ปกติ: {db_bpNormalCount} ราย</span>
                        <span className="text-red-600">BP ผิดปกติ: {db_bpAbnormalCount} ราย</span>
                      </div>
                      <p className="text-[8px] text-gray-400 font-medium">
                        *เกณฑ์ปกติ: ตัวบน 90-140 / ตัวล่าง 60-90 mmHg (ถือว่าปกติ)
                      </p>
                    </div>

                    <div className="bg-[#4A6741]/5 p-3 rounded-xl border border-[#4A6741]/10 text-center space-y-1">
                      <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">อัตราเต้นหัวใจเฉลี่ย</span>
                      <p className="text-xl font-black text-[#4A6741] font-mono">{db_avgHeartRate > 0 ? db_avgHeartRate.toFixed(0) : '-'} <span className="text-[10px] font-bold text-gray-500">ครั้ง/นาที</span></p>
                    </div>

                    <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/10 text-center space-y-1">
                      <span className="text-amber-800 text-[10px] font-black uppercase tracking-wider block">เส้นรอบเอวเฉลี่ย</span>
                      <p className="text-xl font-black text-amber-700 font-mono">{db_avgWaist > 0 ? db_avgWaist.toFixed(1) : '-'} <span className="text-[10px] font-bold text-gray-500">ซม.</span></p>
                    </div>
                  </div>

                  {/* Physical Waistline Standard Exceedance Card */}
                  <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 space-y-2.5 text-xs text-amber-900">
                    <p className="font-extrabold text-[#4A6741] flex items-center gap-1 text-[11px]">
                      <span>⚠️ สถิติรอบเอวเกินมาตรฐาน (โรคอ้วนลงพุง)</span>
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="bg-white p-2 rounded-lg border border-amber-200/60 flex flex-col justify-between">
                        <span className="font-bold text-gray-500 block">ชาย (&gt; 90 ซม.) เกินเกณฑ์</span>
                        <div className="mt-1 flex items-baseline justify-between">
                          <span className="text-base font-black text-amber-700 font-mono">{db_maleWaistOver90} <span className="text-[10px] text-gray-400 font-bold">คน</span></span>
                          <span className="text-[9px] text-gray-400 font-bold font-mono">จาก {db_countWaistlineMale} ราย</span>
                        </div>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-amber-200/60 flex flex-col justify-between">
                        <span className="font-bold text-gray-500 block">หญิง (&gt; 80 ซม.) เกินเกณฑ์</span>
                        <div className="mt-1 flex items-baseline justify-between">
                          <span className="text-base font-black text-amber-700 font-mono">{db_femaleWaistOver80} <span className="text-[10px] text-gray-400 font-bold">คน</span></span>
                          <span className="text-[9px] text-gray-400 font-bold font-mono">จาก {db_countWaistlineFemale} ราย</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-amber-800/80 leading-relaxed font-semibold">
                      *อิงตามเกณฑ์โรคอ้วนลงพุงของคนไทย (ชายเกิน 90 cm / หญิงเกิน 80 cm มีความเสี่ยงสูงต่อโรค NCDs และควรตรวจระดับน้ำตาล/ไขมันเพิ่มเติม)
                    </p>
                  </div>
                </div>

              </div>

              {/* Lab Results Statistics & Lifestyle Medicine Profile (Bottom Grid) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 4. Laboratory Abnormalities Grid List (6 Columns) */}
                <div className="lg:col-span-6 bg-white rounded-2xl border border-[#E0E4D9] shadow-xs p-6 space-y-4">
                  <div className="border-b border-[#E0E4D9] pb-3 flex justify-between items-center">
                    <h4 className="font-extrabold text-[#4A6741] text-sm flex items-center space-x-1.5">
                      <ClipboardList className="h-4.5 w-4.5 text-[#4A6741]" />
                      <span>สถานะห้องปฏิบัติการแลป & อัตราความผิดปกติ (Lab Findings)</span>
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {[
                      { name: 'ระดับน้ำตาลในเลือด (Fasting Blood Sugar)', norm: db_labGlucoseNormal, abnorm: db_labGlucoseAbnormal, clr: 'from-amber-400 to-amber-600', unit: 'mg/dL' },
                      { name: 'ระดับไขมันคอเลสเตอรอล (Lipid Panels)', norm: db_labLipidNormal, abnorm: db_labLipidAbnormal, clr: 'from-rose-400 to-rose-600', unit: 'mg/dL' },
                      { name: 'การทำงานของไต (Creatinine/eGFR)', norm: db_labKidneyNormal, abnorm: db_labKidneyAbnormal, clr: 'from-sky-400 to-sky-600', unit: 'Cr' },
                      { name: 'ตรวจการทำงานของตับ (SGOT/SGPT)', norm: db_labLiverNormal, abnorm: db_labLiverAbnormal, clr: 'from-indigo-400 to-indigo-600', unit: 'U/L' },
                      { name: 'ตรวจความสมบูรณ์เม็ดเลือด (CBC Panel)', norm: db_labCbcNormal, abnorm: db_labCbcAbnormal, clr: 'from-pink-400 to-pink-600', unit: 'Hct' },
                      { name: 'ตรวจปัสสาวะเพื่อคัดกรอง (Urinalysis)', norm: db_labUrineNormal, abnorm: db_labUrineAbnormal, clr: 'from-yellow-400 to-yellow-600', unit: 'UA' }
                    ].map((lab, idx) => {
                      const total = lab.norm + lab.abnorm;
                      const pctAbnormal = total > 0 ? (lab.abnorm / total) * 100 : 0;
                      return (
                        <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5 text-xs">
                          <p className="font-black text-gray-700 truncate" title={lab.name}>{lab.name}</p>
                          <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold">
                            <span>เคสคีย์แล้ว: {total} ราย</span>
                            <span className="text-red-600">ผิดปกติ: {lab.abnorm} คน ({pctAbnormal.toFixed(0)}%)</span>
                          </div>
                          <div className="relative w-full bg-emerald-100 h-2 rounded-full overflow-hidden flex">
                            <div style={{ width: `${100 - pctAbnormal}%` }} className="h-full bg-emerald-500" title={`ผลตรวจปกติ ${lab.norm} ราย`}></div>
                            <div style={{ width: `${pctAbnormal}%` }} className="h-full bg-red-500" title={`ผลตรวจผิดปกติ ${lab.abnorm} ราย`}></div>
                          </div>
                          <div className="flex justify-between text-[8px] font-bold text-gray-400">
                            <span className="text-emerald-700">ปกติ: {lab.norm} ราย</span>
                            <span className="text-red-700">พบผิดปกติ: {lab.abnorm} ราย</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Lifestyle Medicine (LM6) Health Risk Habits Profile (6 Columns) */}
                <div className="lg:col-span-6 bg-white rounded-2xl border border-[#E0E4D9] shadow-xs p-6 space-y-4">
                  <div className="border-b border-[#E0E4D9] pb-3">
                    <h4 className="font-extrabold text-[#4A6741] text-sm flex items-center space-x-1.5">
                      <TrendingUp className="h-4.5 w-4.5 text-[#4A6741]" />
                      <span>ดัชนีคะแนนเวชศาสตร์วิถีชีวิต 6 มิติ (Lifestyle Medicine Score)</span>
                    </h4>
                  </div>

                  <p className="text-[10px] text-gray-500 italic leading-relaxed">
                    คะแนนประเมินเฉลี่ยจากเครื่องมือคัดกรองพฤติกรรมสุขภาพ <strong>LM6 Assessment (คะแนนเต็ม 10 คะแนน)</strong> ยิ่งคะแนนสูงสะท้อนพฤติกรรมวิถีชีวิตสุขภาพดีเลิศ
                  </p>

                  <div className="space-y-3 pt-1">
                    {[
                      { label: 'มิติที่ 1: การรับประทานอาหารสุขภาพวิถีชีวิตใหม่ (Dietary Intake)', score: db_avgLM_diet, desc: 'เน้นพืชผัก ลดอาหารแปรรูป น้ำตาล และโซเดียม', color: 'bg-emerald-500' },
                      { label: 'มิติที่ 2: การจัดการความเครียดเชิงรุก (Stress Management)', score: db_avgLM_stress, desc: 'สมาธิ ฝึกสติ โยคะ จัดการอารมณ์บวกรู้ทันตน', color: 'bg-indigo-400' },
                      { label: 'มิติที่ 3: สุขอนามัยการนอนหลับมีคุณภาพ (Restorative Sleep)', score: db_avgLM_sleep, desc: 'นอนหลับ 7-8 ชั่วโมง พักผ่อนลึกเต็มอิ่มอย่างสม่ำเสมอ', color: 'bg-sky-400' },
                      { label: 'มิติที่ 4: กิจกรรมทางกายและการเคลื่อนไหว (Physical Activity)', score: db_avgLM_exercise, desc: 'ออกกำลังกายระดับปานกลาง 150 นาที/สัปดาห์ขึ้นไป', color: 'bg-amber-400' },
                      { label: 'มิติที่ 5: สัมพันธภาพและความเชื่อมโยงทางสังคม (Social Connection)', score: db_avgLM_social, desc: 'พูดคุย แลกเปลี่ยน ทำความดี เกื้อกูลครอบครัวและชุมชน', color: 'bg-rose-400' },
                      { label: 'มิติที่ 6: การหลีกเลี่ยงสารเสพติดและแอลกอฮอล์ (Substance Avoidance)', score: db_avgLM_substance, desc: 'งดสูบบุหรี่ เลิกสารเสพติด เลี่ยงเหล้าเบียร์เพื่อถนอมตับ', color: 'bg-teal-400' }
                    ].map((dim, idx) => {
                      const displayScore = dim.score > 0 ? dim.score : 0;
                      const pct = (displayScore / 10) * 100;
                      return (
                        <div key={idx} className="space-y-1 text-xs">
                          <div className="flex justify-between items-center font-bold text-gray-700">
                            <span className="text-[11px] font-black">{dim.label}</span>
                            <span className="font-mono text-[#4A6741] text-xs bg-[#4A6741]/5 px-2 py-0.5 rounded-lg border border-[#4A6741]/10">
                              {displayScore > 0 ? displayScore.toFixed(1) : 'ยังไม่ประเมิน'}/10
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 h-2.5 rounded-lg overflow-hidden flex">
                            {displayScore > 0 ? (
                              <div style={{ width: `${pct}%` }} className={`h-full ${dim.color} rounded-lg`}></div>
                            ) : (
                              <div className="w-full h-full bg-gray-250 italic text-[8px] text-gray-400 flex items-center justify-center">ไม่มีข้อมูลพฤติกรรมสุขภาพ</div>
                            )}
                          </div>
                          <span className="text-[9px] text-gray-450 block font-medium leading-normal italic">{dim.desc}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Dashboard Tips Footer Banner */}
              <div className="bg-gradient-to-r from-[#4A6741] to-[#3a5033] text-white p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-left space-y-0.5">
                  <p className="font-bold text-sm">💡 ทราบหรือไม่? การปรับพฤติกรรมตามหลักเวชศาสตร์วิถีชีวิต (Lifestyle Medicine)</p>
                  <p className="text-xs text-green-100/90">สามารถชะลอการเกิดโรคเรื้อรัง (NCDs) เช่น โรคเบาหวาน โรคความดันโลหิตสูง และไขมันในเลือดสูงได้ดีกว่ายาเคมีบำบัดถึง 80%</p>
                </div>
                <button
                  type="button"
                  onClick={() => setStaffActiveTab('appointments')}
                  className="bg-white text-[#4A6741] hover:bg-green-50 font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-sm transition-colors cursor-pointer shrink-0"
                >
                  ไปที่หน้าบันทึกผลแลปประจำวัน ➔
                </button>
              </div>
            </div>
          )}

          {/* Appointments database management */}
          {staffActiveTab === 'appointments' && (
            <div className="bg-white rounded-2xl border border-[#E0E4D9] shadow-sm p-6 space-y-4">
            <div className="flex flex-col gap-4 border-b border-[#E0E4D9] pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="font-extrabold text-[#4A6741] text-base flex items-center space-x-1.5">
                  <Calendar className="h-5 w-5 text-[#4A6741]" />
                  <span>รายการนัดหมายตรวจสุขภาพและการบันทึกผลแลป</span>
                </h4>
                <span className="text-[11px] text-amber-700 bg-amber-50 px-3 py-1 rounded-lg border border-amber-100 font-medium">
                  💡 คำแนะนำ: <strong>คลิกขวา</strong> บนแถวคิวใดก็ได้ เพื่อยืนยันหรือยกเลิกรายการตรวจและคำนวณราคาใหม่
                </span>
              </div>

              {/* Enhanced Search Input for Daily Records and Confirmed Date */}
              <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-amber-500/5 p-4 rounded-xl border border-amber-500/20 shadow-3xs">
                <div className="text-xs space-y-1">
                  <span className="text-amber-800 text-sm font-extrabold flex items-center gap-1.5">
                    <Search className="h-4.5 w-4.5 text-amber-600" />
                    <span>ค้นหาข้อมูลคิวนัดหมายตรวจสุขภาพ</span>
                  </span>
                  <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                    ค้นหาและกรองข้อมูลผู้รับบริการด้วย <strong>วันที่ยืนยันเข้ารับการตรวจ (เช่น 09/07/2569)</strong>, วันนัดคิว หรือชื่อคนไข้ เพื่อให้เจ้าหน้าที่และแพทย์บันทึกผลแลปรายวันได้สะดวกรวดเร็ว
                  </p>
                </div>
                <div className="relative w-full md:w-96 text-xs">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
                  <input
                    type="text"
                    placeholder="พิมพ์วันที่ยืนยัน (09/07/2569), วันนัดคิว หรือชื่อคนไข้..."
                    value={appointmentSearchQuery}
                    onChange={(e) => setAppointmentSearchQuery(e.target.value)}
                    className="pl-9 pr-12 py-2.5 border-2 border-emerald-600/30 rounded-xl w-full font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-white shadow-3xs"
                  />
                  {appointmentSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setAppointmentSearchQuery('')}
                      className="absolute right-3 top-2.5 bg-gray-150 hover:bg-gray-250 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-md font-bold transition-all cursor-pointer"
                    >
                      ล้าง
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto border border-[#E0E4D9] rounded-xl">
              <table className="min-w-full divide-y divide-gray-200 text-xs text-left">
                <thead className="bg-[#F2F4ED] font-bold text-[#2D3E2F]">
                  <tr>
                    <th scope="col" className="px-4 py-3">วันนัดคิว</th>
                    <th scope="col" className="px-4 py-3">ช่วงเวลา</th>
                    <th scope="col" className="px-4 py-3">ชื่อคนไข้</th>
                    <th scope="col" className="px-4 py-3">รายละเอียดโปรแกรมการตรวจ</th>
                    <th scope="col" className="px-4 py-3 text-center">ราคา</th>
                    <th scope="col" className="px-4 py-3 text-center">สถานะ</th>
                    <th scope="col" className="px-4 py-3 text-center">การจัดการ</th>
                    <th scope="col" className="px-4 py-3 text-center bg-[#4A6741]/5 text-[#4A6741] whitespace-nowrap">วันที่ยืนยันเข้ารับการตรวจ</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredAppointments.length > 0 ? (
                    filteredAppointments.map((app) => {
                      const patient = patients.find(p => p.id === app.patientId);
                      return (
                        <tr
                          key={app.id}
                          className="hover:bg-gray-50 transition-colors cursor-context-menu"
                          onContextMenu={(e) => {
                            e.preventDefault();
                            handleOpenConfirmModal(app);
                          }}
                          title="คลิกขวาเพื่อยืนยัน/ยกเลิกรายการตรวจที่ผู้รับบริการเลือก และคำนวณราคาใหม่"
                        >
                          <td className="px-4 py-3 font-mono font-bold text-gray-700">{app.date}</td>
                          <td className="px-4 py-3 font-mono text-gray-500">{app.time}</td>
                          <td className="px-4 py-3 font-bold text-gray-800">{patient?.name || 'ไม่พบบัญชี'}</td>
                          <td className="px-4 py-3 text-gray-500">
                            <p className="font-semibold text-gray-700">{app.basicProgramName}</p>
                            {app.selectedBasicTests && app.selectedBasicTests.length > 0 && (
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                รายการพื้นฐาน: {app.selectedBasicTests.map(tId => BASIC_TESTS[tId]?.name || tId).join(', ')}
                              </p>
                            )}
                            {app.specialTests.length > 0 && (
                              <p className="text-[10px] text-[#4A6741] font-semibold mt-0.5">ตรวจเพิ่มเติม: {app.specialTests.map(tId => SPECIAL_TESTS[tId]?.name || tId).join(', ')}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center font-mono font-bold text-[#4A6741]">{app.totalCost} บ.</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              app.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                                : app.status === 'cancelled'
                                ? 'bg-red-50 text-red-800 border border-red-100'
                                : app.status === 'pending_results'
                                ? 'bg-amber-50 text-amber-800 border border-amber-100 animate-pulse'
                                : 'bg-orange-50 text-orange-800 border border-orange-100'
                            }`}>
                              {app.status === 'completed' 
                                ? 'ออกผลแล้ว' 
                                : app.status === 'cancelled' 
                                ? 'ยกเลิก' 
                                : app.status === 'pending_results'
                                ? 'ผลออกบางส่วน (ติดตามต่อ)'
                                : 'รอดำเนินการ'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex justify-center gap-1.5 flex-wrap">
                              {app.status !== 'completed' && app.status !== 'cancelled' && (
                                <>
                                  <button
                                    onClick={() => handleOpenConfirmModal(app)}
                                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-1 px-2 rounded text-[10px] shadow-sm transition-all cursor-pointer"
                                    title="ยืนยัน/ยกเลิกรายการตรวจจริง และคำนวณราคาใหม่"
                                  >
                                    ยืนยันรายการตรวจ
                                  </button>
                                  <button
                                    onClick={() => handleSelectAppointment(app)}
                                    className="bg-[#4A6741] hover:bg-[#3d5635] text-white font-bold py-1 px-2 rounded text-[10px] shadow-sm transition-all cursor-pointer"
                                  >
                                    {app.status === 'pending_results' ? 'กรอกผลตรวจต่อ' : 'บันทึกผลตรวจ'}
                                  </button>
                                  <button
                                    onClick={() => onUpdateAppointmentStatus(app.id, 'cancelled')}
                                    className="border border-red-200 text-red-600 hover:bg-red-50 font-bold py-1 px-2 rounded text-[10px] transition-all cursor-pointer"
                                  >
                                    ยกเลิกคิว
                                  </button>
                                </>
                              )}
                              {app.status === 'completed' && (
                                <>
                                  <button
                                    onClick={() => handleOpenConfirmModal(app)}
                                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-1 px-2 rounded text-[10px] shadow-sm transition-all cursor-pointer"
                                    title="แก้ไข/คำนวณราคาใหม่สำหรับรายการตรวจ"
                                  >
                                    ปรับรายการตรวจ
                                  </button>
                                  <button
                                    onClick={() => handleSelectAppointment(app)}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-1 px-2 rounded text-[10px] transition-all cursor-pointer"
                                  >
                                    แก้ไขผลตรวจ
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center font-mono font-bold text-gray-700 bg-[#4A6741]/5">
                            {app.confirmedServiceDate ? (
                              <span className="inline-block bg-emerald-100 text-emerald-850 border border-emerald-300 px-2.5 py-1 rounded-lg text-[10px] font-black shadow-3xs animate-fade-in">
                                {app.confirmedServiceDate}
                              </span>
                            ) : (
                              <span className="text-gray-450 italic text-[10px] font-medium">ยังไม่ยืนยันรายการ</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-gray-400 font-medium">
                        {appointmentSearchQuery ? (
                          <div className="space-y-1">
                            <p className="text-gray-500 font-bold">🔍 ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา</p>
                            <p className="text-xs text-gray-400">กรุณาลองป้อน วันที่ยืนยัน (เช่น 09/07/2569) หรือชื่อผู้รับบริการใหม่อีกครั้ง</p>
                          </div>
                        ) : (
                          'ยังไม่มีรายการคิวนัดหมายตรวจสุขภาพในระบบในขณะนี้'
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          )}
        </div>
      )}

      {/* Patient Profile Editing Modal */}
      {editingPatient && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E0E4D9] w-full max-w-lg shadow-xl overflow-hidden animate-fade-in text-xs text-left">
            <div className="bg-[#4A6741] text-white p-5 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-green-100" />
                <div>
                  <h3 className="text-base font-bold text-white">แก้ไขข้อมูลผู้รับบริการ</h3>
                  <p className="text-[10px] text-green-100/90">แก้ไขข้อมูลทั่วไปและ HN ป้องกันสะกดชื่อผิดหรือคำนำหน้าคลาดเคลื่อน</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingPatient(null)}
                className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePatientEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-gray-500">ชื่อผู้รับบริการ (รวมคำนำหน้านาม เช่น นาย / นาง / นางสาว / ดร.)</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="p-2.5 border border-gray-200 rounded-lg w-full text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-[#4A6741]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-500">หมายเลข HN (Hospital Number)</label>
                  <input
                    type="text"
                    placeholder="เช่น HN12345"
                    value={editHn}
                    onChange={(e) => setEditHn(e.target.value)}
                    className="p-2.5 border border-gray-200 rounded-lg w-full text-sm font-mono font-bold text-[#4A6741] focus:outline-none focus:ring-1 focus:ring-[#4A6741]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-500">เลขบัตรประชาชน 13 หลัก</label>
                  <input
                    type="text"
                    value={editNationalId}
                    onChange={(e) => setEditNationalId(e.target.value)}
                    className="p-2.5 border border-gray-200 rounded-lg w-full text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[#4A6741]"
                    maxLength={13}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-500">วันเกิด (ค.ศ.)</label>
                  <input
                    type="date"
                    value={editBirthDate}
                    onChange={(e) => handleEditBirthDateChange(e.target.value)}
                    className="p-2.5 border border-gray-200 rounded-lg w-full text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[#4A6741]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-400">อายุ (ปี) - อัตโนมัติ</label>
                  <input
                    type="text"
                    value={editBirthDate ? `${editAge} ปี` : `${editAge} ปี (กรุณาระบุวันเกิด)`}
                    disabled
                    className="p-2.5 border border-gray-150 rounded-lg w-full text-sm font-bold bg-gray-50 text-gray-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-500">เพศ</label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value as any)}
                    className="p-2.5 border border-gray-200 rounded-lg w-full text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#4A6741]"
                  >
                    <option value="male">ชาย (Male)</option>
                    <option value="female">หญิง (Female)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-500">เบอร์โทรศัพท์</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="p-2.5 border border-gray-200 rounded-lg w-full text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[#4A6741]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-500">รหัสผ่านของระบบ (Password)</label>
                  <input
                    type="text"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="p-2.5 border border-gray-200 rounded-lg w-full text-sm font-mono font-bold text-[#4A6741] focus:outline-none focus:ring-1 focus:ring-[#4A6741]"
                    required
                  />
                  <p className="text-[9px] text-gray-400">ต้องเป็นอักษร A-Z 4 ตัว และตัวเลข 4-6 ตัว เช่น UBUH1234</p>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-[#E0E4D9]">
                <button
                  type="button"
                  onClick={() => setEditingPatient(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#4A6741] hover:bg-[#3d5635] text-white font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm & Edit Appointment Tests Modal */}
      {confirmingApp && confirmingPatient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E0E4D9] w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in text-xs text-left">
            <div className="bg-[#4A6741] text-white p-5 flex justify-between items-center relative">
              <div className="absolute inset-0 bg-white opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
              <div className="flex items-center space-x-2 relative z-10">
                <ClipboardList className="h-5 w-5 text-green-100" />
                <div>
                  <h3 className="text-base font-bold text-white">ตรวจสอบและยืนยันรายการตรวจสุขภาพจริง</h3>
                  <p className="text-[10px] text-green-100/90">
                    ผู้รับบริการ: {confirmingPatient.name} • เพศ{confirmingPatient.gender === 'female' ? 'หญิง' : 'ชาย'} • อายุ {confirmingPatient.age} ปี
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfirmingApp(null)}
                className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all cursor-pointer relative z-10"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveConfirmedTests} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-1.5">
                <p className="font-bold text-amber-800 text-sm flex items-center gap-1">
                  <span>⚠️ ข้อมูลการจองเดิม (Original Selection)</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                  <p>• <strong>โปรแกรมตรวจ:</strong> {confirmingApp.basicProgramName} ({confirmingApp.basicProgramPrice} บ.)</p>
                  <p>• <strong>วัน-เวลานัดคิว:</strong> {confirmingApp.date} ({confirmingApp.time} น.)</p>
                  <p className="sm:col-span-2 text-amber-950 font-semibold text-[10px] leading-relaxed">
                    * ติ๊กถูกที่รายการตรวจที่ผู้รับบริการยืนยันต้องการตรวจจริง หรือติ๊กออกหากขอยกเลิกบางรายการตรวจเพื่อคำนวณเงินใหม่ให้เหมาะสมตามสิทธิ์คนไข้จริง
                  </p>
                </div>
              </div>

              {/* Basic tests selection */}
              <div className="space-y-3">
                <h4 className="font-bold text-[#4A6741] text-xs uppercase tracking-wider flex items-center gap-1.5 border-b pb-1.5 border-gray-150">
                  <span>1. รายการตรวจพื้นฐานประจำโปรแกรม (Basic & Recommended Tests)</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                  {availableBasicTestsInModal.map((tId) => {
                    const test = BASIC_TESTS[tId];
                    if (!test) return null;
                    const isChecked = confBasicTests.includes(tId);
                    const isRecommendedByDefault = confirmingBasicProgDetails?.tests.includes(tId);

                    return (
                      <label
                        key={tId}
                        className={`flex items-start space-x-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                          isChecked 
                            ? 'bg-[#F9FAF7] border-[#4A6741]/40 shadow-xs' 
                            : 'bg-white border-gray-150 hover:bg-gray-50/50 opacity-60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setConfBasicTests(confBasicTests.filter(id => id !== tId));
                            } else {
                              setConfBasicTests([...confBasicTests, tId]);
                            }
                          }}
                          className="mt-0.5 rounded border-gray-300 text-[#4A6741] focus:ring-[#4A6741] cursor-pointer"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-baseline font-bold text-gray-800">
                            <span className="flex items-center gap-1 flex-wrap">
                              {test.name}
                              {isRecommendedByDefault && (
                                <span className="bg-[#4A6741]/10 text-[#4A6741] text-[8px] font-bold px-1.5 py-0.2 rounded-full">แนะนำ</span>
                              )}
                            </span>
                            <span className="font-mono text-[#4A6741]">{test.price} บ.</span>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{test.detail}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Special tests selection */}
              <div className="space-y-3">
                <h4 className="font-bold text-[#4A6741] text-xs uppercase tracking-wider flex items-center gap-1.5 border-b pb-1.5 border-gray-150">
                  <span>2. รายการตรวจพิเศษเสริมเพิ่มเติม (Special Additional Tests)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                  {Object.values(SPECIAL_TESTS)
                    .filter(t => t.categories.includes(confirmingPatient.gender === 'female' ? 'female_only' : 'male_only') || !t.categories.includes('female_only') && !t.categories.includes('male_only'))
                    .map((test) => {
                      const isChecked = confSpecialTests.includes(test.id);
                      return (
                        <label
                          key={test.id}
                          className={`flex items-start space-x-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                            isChecked 
                              ? 'bg-[#F9FAF7] border-[#4A6741]/40 shadow-xs' 
                              : 'bg-white border-gray-150 hover:bg-gray-50/50 opacity-60'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setConfSpecialTests(confSpecialTests.filter(id => id !== test.id));
                              } else {
                                setConfSpecialTests([...confSpecialTests, test.id]);
                              }
                            }}
                            className="mt-0.5 rounded border-gray-300 text-[#4A6741] focus:ring-[#4A6741] cursor-pointer"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-baseline font-bold text-gray-800">
                              <span>{test.name}</span>
                              <span className="font-mono text-[#4A6741]">+{test.price} บ.</span>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{test.detail}</p>
                          </div>
                        </label>
                      );
                    })}
                </div>
              </div>

              {/* Dynamic live cost recalculation panel */}
              <div className="border-t border-gray-100 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#F9FAF7] p-4 rounded-2xl border border-dashed border-[#E0E4D9]">
                <div className="text-left space-y-0.5">
                  <p className="text-[10px] text-[#4A6741] font-bold uppercase tracking-wider">คำนวณค่าบริการแบบเรียลไทม์ (Live Pricing Recalculator):</p>
                  <p className="text-[10px] text-gray-400 leading-normal">
                    (ตรวจพื้นฐานที่เลือก: {basicCostInModal} บ. + ตรวจพิเศษที่เลือก: {specialCostInModal} บ.)
                  </p>
                </div>
                <div className="text-right flex items-baseline gap-2">
                  <span className="text-xs font-bold text-gray-500">ราคาสุทธิใหม่:</span>
                  <span className="text-2xl font-black text-[#4A6741] font-mono">{liveTotalCostInModal.toLocaleString()} บาท</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t border-[#E0E4D9]">
                <button
                  type="button"
                  onClick={() => setConfirmingApp(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors cursor-pointer"
                >
                  ยกเลิกและย้อนกลับ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#4A6741] hover:bg-[#3d5635] text-white font-bold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center space-x-1"
                >
                  <Check className="h-4 w-4" />
                  <span>บันทึกและคำนวณราคาใหม่</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
