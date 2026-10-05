import React, { useRef, useState, useEffect } from 'react';
import { Patient, LabResult, Appointment, AttachedFile } from '../types';
import { BASIC_TESTS, SPECIAL_TESTS } from '../data';
import {
  Printer,
  Download,
  ArrowLeft,
  ShieldAlert,
  CheckCircle2,
  User,
  HelpCircle,
  FileText,
  Eye,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { downloadPdfFile } from '../lib/pdfHelper';
import PdfPreviewModal from './PdfPreviewModal';

interface OfficialReportProps {
  patient: Patient;
  result: LabResult;
  appointment?: Appointment;
  onBack?: () => void;
}

export default function OfficialReport({ patient, result, appointment, onBack }: OfficialReportProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const labTableScrollRef = useRef<HTMLDivElement>(null);
  const [previewFile, setPreviewFile] = useState<AttachedFile | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollPosition = () => {
    if (labTableScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = labTableScrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  const scrollLabTable = (direction: 'left' | 'right') => {
    if (labTableScrollRef.current) {
      const offset = direction === 'left' ? -260 : 260;
      labTableScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
      setTimeout(checkScrollPosition, 300);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    window.addEventListener('resize', checkScrollPosition);
    return () => window.removeEventListener('resize', checkScrollPosition);
  }, []);

  const handlePrint = () => {
    const printContent = printAreaRef.current?.innerHTML;
    const originalContent = document.body.innerHTML;

    if (printContent) {
      // Create a clean print frame or temporarily swap body content
      const style = document.createElement('style');
      style.innerHTML = `
        @media print {
          body {
            background: white !important;
            color: black !important;
            font-family: 'Sarabun', 'Inter', sans-serif !important;
          }
          .no-print, header, footer, nav, button {
            display: none !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden;
          }
          #official-print-report, #official-print-report * {
            visibility: visible;
          }
          #official-print-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0 !important;
            padding: 0.5cm !important;
            border: none !important;
            box-shadow: none !important;
          }
          .print-card {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          .sticky-col {
            position: static !important;
            box-shadow: none !important;
          }
          .table-header {
            background-color: #f3f4f6 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .status-ปกติ {
            color: #10b981 !important;
            font-weight: bold !important;
          }
          .status-ผิดปกติ {
            color: #ef4444 !important;
            font-weight: bold !important;
          }
          .status-เสี่ยงสูง {
            color: #f97316 !important;
            font-weight: bold !important;
          }
          .status-เสี่ยงต่ำ {
            color: #eab308 !important;
            font-weight: bold !important;
          }
          .stamp-mark {
            border-color: #ef4444 !important;
            color: #ef4444 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `;
      document.head.appendChild(style);
      window.print();
      document.head.removeChild(style);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ปกติ':
        return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'ผิดปกติ':
        return 'text-red-600 bg-red-50 border-red-100';
      case 'เสี่ยงสูง':
        return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'เสี่ยงต่ำ':
        return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'ไม่ประสงค์ตรวจ':
        return 'text-red-700 bg-red-50/70 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-100';
    }
  };

  const getStatusBadgeText = (status: string) => {
    switch (status) {
      case 'ปกติ':
        return 'ปกติ (Normal)';
      case 'ผิดปกติ':
        return 'ผิดปกติ (Abnormal)';
      case 'เสี่ยงสูง':
        return 'เสี่ยงสูง (High Risk)';
      case 'เสี่ยงต่ำ':
        return 'เสี่ยงต่ำ (Low Risk)';
      case 'ไม่ประสงค์ตรวจ':
        return 'ไม่ประสงค์ตรวจ (Declined)';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Actions - NOT Printed */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-[#F0F7FF] p-4 rounded-2xl border border-[#CBD5E1] no-print">
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-[#1E3A8A] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>ย้อนกลับ</span>
          </button>
        )}
        <div className="flex items-center space-x-3 ml-auto">
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-2 bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white font-bold py-2 px-5 rounded-xl shadow-sm hover:shadow transition-all text-sm cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>พิมพ์รายงาน / ดาวน์โหลด PDF</span>
          </button>
        </div>
      </div>

      {/* Official Medical Report Container */}
      <div
        ref={printAreaRef}
        id="official-print-report"
        className="bg-white border-2 border-[#CBD5E1] shadow-md rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-12 text-left space-y-8 font-sans print-card relative max-w-full overflow-hidden"
      >
        {/* Decorative Stamp for Official Document Look */}
        <div className="absolute top-12 right-12 border-4 border-red-400/40 text-red-400/40 font-extrabold uppercase tracking-widest text-[11px] sm:text-xs py-1 px-3 sm:py-1.5 sm:px-4 rounded-xl rotate-12 pointer-events-none select-none">
          โรงพยาบาลมหาวิทยาลัยอุบลราชธานี <br />
          <span className="text-[9px] block text-center mt-0.5 font-mono">OFFICIAL RECORD</span>
        </div>

        {/* Report Header */}
        <div className="border-b-2 border-[#1E3A8A] pb-6 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex items-center space-x-4">
            {/* Hospital Logo simulation */}
            <div className="bg-[#1E3A8A] text-white p-3 rounded-2xl shadow-inner shrink-0">
              <svg className="h-8 w-8 text-amber-300 fill-current" viewBox="0 0 24 24">
                <path d="M19 10.5V20c0 .6-.4 1-1 1h-5v-5h-2v5H6c-.6 0-1-.4-1-1v-9.5l7-4.8 7 4.8zM12 2L2 9h3v11c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V9h3L12 2z" />
                <path d="M10.5 11h3v3h-3z" />
              </svg>
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-bold tracking-widest text-[#1E3A8A] uppercase font-mono block">
                Ubon Ratchathani University Hospital
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E3A8A] tracking-tight leading-tight">
                ศูนย์ตรวจสุขภาพ โรงพยาบาลมหาวิทยาลัยอุบลราชธานี
              </h2>
              <p className="text-xs text-gray-500 font-semibold font-mono">
                85 Sathonlamark Rd, Warin Chamrap District, Ubon Ratchathani 34190 | Tel: 045-353909 ext 7036
              </p>
            </div>
          </div>
          <div className="text-center sm:text-right shrink-0">
            <span className="bg-[#1E3A8A] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full block mb-2 font-mono">
              HEALTH CHECKUP REPORT
            </span>
            <p className="text-xs text-gray-400">เลขที่เอกสารอ้างอิง</p>
            <p className="text-sm font-bold text-gray-700 font-mono">UBUH-2026-{result.id}</p>
          </div>
        </div>

        {/* Patient Demographic Info */}
        <div className="bg-[#F0F7FF] p-6 rounded-2xl border border-[#CBD5E1] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-sm">
          <div className="space-y-0.5">
            <span className="text-xs text-gray-400 font-medium">ชื่อ-นามสกุล ผู้รับบริการ</span>
            <p className="font-bold text-gray-800">{patient.name}</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-xs text-gray-400 font-medium">หมายเลขคนไข้ (HN)</span>
            <p className="font-bold text-[#1E3A8A] font-mono">{patient.hn || <span className="text-gray-400 font-normal">ยังไม่ได้ระบุ</span>}</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-xs text-gray-400 font-medium">วันเดือนปีเกิด (Date of Birth)</span>
            <p className="font-bold text-gray-800 font-mono">
              {patient.birthDate ? new Date(patient.birthDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
            </p>
          </div>
          <div className="space-y-0.5">
            <span className="text-xs text-gray-400 font-medium">เพศ / อายุ</span>
            <p className="font-bold text-gray-800">
              {patient.gender === 'female' ? 'หญิง (Female)' : 'ชาย (Male)'} | {patient.age} ปี
            </p>
          </div>
          <div className="space-y-0.5">
            <span className="text-xs text-gray-400 font-medium">เบอร์โทรศัพท์ติดต่อ</span>
            <p className="font-bold text-gray-800 font-mono">{patient.phone}</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-xs text-gray-400 font-medium">วันที่เข้ารับการตรวจ (Exam Date)</span>
            <p className="font-bold text-gray-800 font-mono">{result.examDate}</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-xs text-gray-400 font-medium">แพทย์ผู้ตรวจและลงนาม (Physician)</span>
            <p className="font-bold text-[#1E3A8A]">
              {result.doctorName} {result.doctorLicense ? `(${result.doctorLicense})` : ''}
            </p>
          </div>
        </div>

        {/* Body Composition & Physical Exam results */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#1E3A8A] uppercase tracking-widest border-l-4 border-[#1E3A8A] pl-3">
            1. สัญญาณชีพและผลการตรวจร่างกายทั่วไป (Vital Signs & Physical Examination)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-4 text-xs">
            <div className="bg-white p-3.5 rounded-xl border border-[#CBD5E1] text-center">
              <span className="text-gray-400 font-medium block">น้ำหนัก</span>
              <span className="text-base font-extrabold text-gray-800 font-mono mt-1 block">{result.physical.weight}</span>
              <span className="text-gray-400 font-medium text-[10px] mt-0.5 block">กิโลกรัม (kg)</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-[#CBD5E1] text-center">
              <span className="text-gray-400 font-medium block">ส่วนสูง</span>
              <span className="text-base font-extrabold text-gray-800 font-mono mt-1 block">{result.physical.height}</span>
              <span className="text-gray-400 font-medium text-[10px] mt-0.5 block">เซนติเมตร (cm)</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-[#CBD5E1] text-center">
              <span className="text-gray-400 font-medium block">ดัชนีมวลกาย (BMI)</span>
              <span className="text-base font-extrabold text-gray-800 font-mono mt-1 block">{result.physical.bmi}</span>
              <span className="text-[10px] font-bold text-[#1E3A8A] mt-0.5 block">{result.physical.bmiStatus}</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-[#CBD5E1] text-center">
              <span className="text-gray-400 font-medium block">รอบเอว</span>
              <span className="text-base font-extrabold text-gray-800 font-mono mt-1 block">{result.physical.waistline || '-'}</span>
              <span className="text-gray-400 font-medium text-[10px] mt-0.5 block">เซนติเมตร (cm)</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-[#CBD5E1] text-center">
              <span className="text-gray-400 font-medium block">ความดันโลหิต</span>
              <span className="text-base font-extrabold text-gray-800 font-mono mt-1 block">{result.physical.bloodPressure}</span>
              <span className="text-gray-400 font-medium text-[10px] mt-0.5 block">มม.ปรอท (mmHg)</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-[#CBD5E1] text-center">
              <span className="text-gray-400 font-medium block">อัตราการเต้นหัวใจ</span>
              <span className="text-base font-extrabold text-gray-800 font-mono mt-1 block">{result.physical.heartRate}</span>
              <span className="text-gray-400 font-medium text-[10px] mt-0.5 block">ครั้ง/นาที (bpm)</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-[#CBD5E1] text-center flex flex-col justify-between">
              <span className="text-gray-400 font-medium block">ประเมินรวม</span>
              <span className={`inline-flex self-center px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${getStatusColor(result.physical.generalStatus)} mt-1`}>
                {result.physical.generalStatus}
              </span>
              <span className="text-[10px] block text-gray-400 mt-1">ร่างกายทั่วไป</span>
            </div>
          </div>
          {result.physical.notes && (
            <div className="bg-[#F8FAFC] border border-[#CBD5E1] p-4 rounded-xl text-xs text-gray-600">
              <span className="font-bold text-gray-700 block mb-1">บันทึกเพิ่มเติมทางการแพทย์:</span>
              <p>{result.physical.notes}</p>
            </div>
          )}
        </div>

        {/* Chest X-ray outcomes */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#1E3A8A] uppercase tracking-widest border-l-4 border-[#1E3A8A] pl-3">
            2. ผลตรวจเอกซเรย์ทรวงอก (Chest X-Ray)
          </h3>
          <div className="bg-white border border-[#CBD5E1] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs text-gray-400 font-medium">ผลการวินิจฉัยรังสีแพทย์</p>
              <p className="text-sm font-bold text-gray-800">{result.chestXray.description}</p>
            </div>
            <div className="shrink-0 text-left sm:text-right">
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(result.chestXray.status)}`}>
                {getStatusBadgeText(result.chestXray.status)}
              </span>
            </div>
          </div>
        </div>

        {/* Lab Parameters table */}
        <div className="space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 border-l-4 border-[#1E3A8A] pl-3">
            <div>
              <h3 className="text-sm font-bold text-[#1E3A8A] uppercase tracking-widest">
                3. สรุปผลการตรวจทางห้องปฏิบัติการ (Laboratory Investigation Results)
              </h3>
              <p className="text-[11px] text-gray-500 font-medium">
                รายละเอียดผลตรวจทางห้องปฏิบัติการ ค่าอ้างอิงมาตรฐาน และการประเมินผลทางการแพทย์
              </p>
            </div>

            {/* Quick scroll controls for Phones and Tablets */}
            <div className="lg:hidden flex items-center gap-2 self-start sm:self-auto no-print">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-sky-900 font-semibold bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                <ArrowLeftRight className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
                <span>เลื่อนซ้าย-ขวาเพื่อดูรายละเอียด</span>
              </span>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => scrollLabTable('left')}
                  disabled={!canScrollLeft}
                  className={`p-1.5 rounded-lg border text-xs flex items-center transition-all ${
                    canScrollLeft
                      ? 'bg-white text-blue-900 border-blue-200 hover:bg-blue-50 active:scale-95 shadow-xs cursor-pointer'
                      : 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed'
                  }`}
                  title="เลื่อนไปทางซ้าย"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollLabTable('right')}
                  disabled={!canScrollRight}
                  className={`p-1.5 rounded-lg border text-xs flex items-center transition-all ${
                    canScrollRight
                      ? 'bg-white text-blue-900 border-blue-200 hover:bg-blue-50 active:scale-95 shadow-xs cursor-pointer'
                      : 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed'
                  }`}
                  title="เลื่อนไปทางขวา"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="border border-[#CBD5E1] rounded-2xl shadow-sm overflow-hidden bg-white">
            {/* Mobile & Tablet swipe helper bar */}
            <div className="lg:hidden bg-gradient-to-r from-sky-50 via-blue-50/50 to-slate-50 border-b border-sky-100 px-3.5 py-2.5 flex items-center justify-between text-xs text-sky-950 font-medium no-print">
              <span className="flex items-center gap-1.5">
                <ArrowLeftRight className="h-4 w-4 text-blue-700 shrink-0" />
                <span className="text-[11px] sm:text-xs">
                  หน้าจอโทรศัพท์/แท็บเล็ต: สามารถใช้นิ้วปัดเลื่อนซ้าย-ขวา หรือกดปุ่มเลื่อนดูได้
                </span>
              </span>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <button
                  type="button"
                  onClick={() => scrollLabTable('left')}
                  className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-800 text-[11px] font-bold rounded-md border border-blue-200 shadow-2xs flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>ซ้าย</span>
                </button>
                <button
                  type="button"
                  onClick={() => scrollLabTable('right')}
                  className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white text-[11px] font-bold rounded-md shadow-2xs flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
                >
                  <span>ขวา</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div
              ref={labTableScrollRef}
              onScroll={checkScrollPosition}
              className="overflow-x-auto w-full overscroll-x-contain touch-pan-x [-webkit-overflow-scrolling:touch]"
            >
              <table className="min-w-[760px] md:min-w-[820px] w-full divide-y divide-gray-200">
                <thead className="bg-[#F0F7FF] table-header">
                  <tr>
                    <th
                      scope="col"
                      className="sticky-col sticky left-0 z-20 bg-[#F0F7FF] px-5 py-3.5 text-left text-xs font-bold text-[#1E3A8A] uppercase tracking-wider min-w-[220px] shadow-[2px_0_6px_-2px_rgba(0,0,0,0.06)]"
                    >
                      รายการตรวจ (Investigation)
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-left text-xs font-bold text-[#1E3A8A] uppercase tracking-wider min-w-[180px]">
                      ค่าที่ตรวจได้ (Result Value)
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-left text-xs font-bold text-[#1E3A8A] uppercase tracking-wider min-w-[180px]">
                      ค่าอ้างอิงปกติ (Reference Range)
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-center text-xs font-bold text-[#1E3A8A] uppercase tracking-wider min-w-[150px]">
                      ผลการประเมิน (Assessment)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-sm">
                  {Object.entries(result.parameters).map(([key, item]) => {
                    // Find meta from BASIC or SPECIAL list
                    const meta = BASIC_TESTS[key] || SPECIAL_TESTS[key];
                    if (!meta) return null;
                    const isDeclined = item.status === 'ไม่ประสงค์ตรวจ' || item.value === 'ไม่ประสงค์ตรวจ';
                    return (
                      <tr key={key} className={`group hover:bg-sky-50/30 transition-colors ${isDeclined ? 'bg-red-50/10' : ''}`}>
                        <td className="sticky-col sticky left-0 z-10 bg-white group-hover:bg-[#F8FAFC] px-5 py-3.5 whitespace-nowrap shadow-[2px_0_6px_-2px_rgba(0,0,0,0.06)] transition-colors">
                          <div className="space-y-0.5">
                            <p className={`font-bold text-sm ${isDeclined ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{meta.name}</p>
                            <p className="text-[10px] text-gray-400 font-medium line-clamp-1">{meta.detail}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {!isDeclined && (!item.value || item.value.trim() === '') ? (
                            <span className="text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 font-bold text-xs">
                              ผลตามเอกสารแนบ
                            </span>
                          ) : (
                            <span className={`font-extrabold font-mono text-sm ${isDeclined ? 'text-red-700/80 font-bold' : 'text-gray-900'}`}>
                              {item.value} {!isDeclined && <span className="text-xs font-medium text-gray-500 ml-1">{meta.unit}</span>}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-600 font-mono">
                          {isDeclined ? (
                            'ไม่ได้ตรวจสอบ'
                          ) : (
                            <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md border border-slate-200 font-semibold">
                              {meta.refRange}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-center">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border shadow-3xs ${getStatusColor(item.status)}`}>
                            {getStatusBadgeText(item.status)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom scroll status bar on mobile/tablet */}
            <div className="lg:hidden bg-slate-50 border-t border-slate-100 px-4 py-2 flex items-center justify-between text-[11px] text-slate-500 no-print">
              <span>
                {canScrollRight
                  ? '👉 มีข้อมูลทางขวา (เลื่อนเพื่อดูผลการประเมิน)'
                  : '👈 แสดงข้อมูลครบถ้วนแล้ว (เลื่อนซ้ายเพื่อดูชื่อตรวจ)'}
              </span>
              <div className="flex gap-2 font-mono text-[10px] text-slate-400">
                <span>แตะลากเลื่อนได้ ⇄</span>
              </div>
            </div>
          </div>
        </div>

        {/* Attached Files from nurse */}
        {result.attachedFiles && result.attachedFiles.length > 0 && (
          <div className="space-y-3 no-print">
            <h3 className="text-sm font-bold text-[#1E3A8A] uppercase tracking-widest border-l-4 border-[#1E3A8A] pl-3">
              4. เอกสารและใบรายงานผลเพิ่มเติม (Attached Official PDF Results)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.attachedFiles.map((file) => (
                <div
                  key={file.id}
                  className="bg-white hover:bg-sky-50/40 border border-slate-200 hover:border-sky-300 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-3xs transition-all group"
                >
                  <div
                    onClick={() => setPreviewFile(file)}
                    className="flex items-center space-x-3 cursor-pointer min-w-0 flex-1"
                    title="คลิกเพื่อเปิดดูตัวอย่างเอกสาร"
                  >
                    <div className="bg-red-50 group-hover:bg-red-100 text-red-600 p-2.5 rounded-xl border border-red-100 shrink-0 transition-colors">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-blue-900 transition-colors">
                        {file.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {file.category} • {file.size}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-center">
                    {/* In-App Preview Modal Button */}
                    <button
                      type="button"
                      onClick={() => setPreviewFile(file)}
                      className="text-xs font-bold text-blue-900 hover:text-white bg-sky-100/90 hover:bg-blue-800 flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-3xs"
                      title="เปิดดูเอกสารในระบบ (In-App Preview Modal)"
                    >
                      <Eye className="h-3.5 w-3.5 text-blue-800 hover:text-white" />
                      <span>เปิดดู</span>
                    </button>

                    {/* Download Button */}
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await downloadPdfFile(file, patient.name, result.examDate);
                        } catch (e) {
                          console.error('Download failed:', e);
                          alert('ไม่สามารถดาวน์โหลดไฟล์ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง');
                        }
                      }}
                      className="text-xs font-bold text-slate-700 hover:text-blue-900 bg-white hover:bg-slate-50 flex items-center space-x-1.5 border border-slate-200 hover:border-blue-400 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-3xs"
                      title="ดาวน์โหลดไฟล์ลงเครื่อง"
                    >
                      <Download className="h-3.5 w-3.5 text-slate-500" />
                      <span>ดาวน์โหลด</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations block */}
        <div className="bg-[#F0F7FF] border border-[#CBD5E1] rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center space-x-2 text-[#1E3A8A]">
            <ShieldAlert className="h-5 w-5 text-[#1E3A8A]" />
            <h4 className="text-base font-extrabold">สรุปภาพรวมและคำแนะนำส่วนบุคคลเพื่อการปรับเปลี่ยนพฤติกรรม (Clinical Impression & Personalized Plan)</h4>
          </div>
          <p className="text-sm font-semibold text-gray-700 leading-relaxed border-b border-[#CBD5E1] pb-3">
            {result.summary}
          </p>
          <div className="space-y-2">
            <p className="text-xs text-[#1E3A8A] font-bold uppercase tracking-wider">แนวทางปฏิบัติเพื่อสุขภาพที่ดีขึ้น (Actionable Recommendations):</p>
            <ul className="text-xs text-gray-600 space-y-1.5 list-disc list-inside">
              {result.recommendations.map((rec, idx) => (
                <li key={idx} className="leading-relaxed font-medium">
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Doctor Signature Block */}
        <div className="pt-8 border-t border-gray-150 flex flex-col sm:flex-row items-center justify-between gap-8 text-sm">
          <div className="text-left text-xs text-gray-400 leading-relaxed">
            <p>รายงานผลตรวจสุขภาพนี้ได้รับการยืนยันความถูกต้องผ่านระบบบริการอิเล็กทรอนิกส์</p>
            <p className="font-mono">ออกเอกสาร ณ เวลา {new Date().toLocaleDateString('th-TH')} • โรงพยาบาลมหาวิทยาลัยอุบลราชธานี</p>
          </div>
          <div className="text-center space-y-3 shrink-0 w-64">
            <div className="relative min-h-[64px] flex items-center justify-center">
              {result.doctorSignature ? (
                <div className="relative">
                  <img
                    src={result.doctorSignature}
                    alt="Doctor Signature"
                    className="max-h-16 object-contain mix-blend-multiply mx-auto"
                  />
                  {/* Doctor Official Stamp represent */}
                  <div className="absolute -top-3 -right-8 border-2 border-red-500/30 text-red-500/30 font-bold text-[9px] uppercase tracking-widest py-1 px-2 rounded-full rotate-[-8deg] pointer-events-none select-none">
                    UBUH SIGNED
                  </div>
                </div>
              ) : (
                <div className="h-16 flex items-end justify-center pb-2">
                  <span className="text-xs text-gray-300 italic border-b border-dashed border-gray-300 pb-1 w-48 block text-center">
                    (ลงลายมือชื่อจริงด้วยตนเอง)
                  </span>
                </div>
              )}
            </div>
            <div className="w-48 h-[1px] bg-gray-300 mx-auto"></div>
            <div>
              <p className="font-bold text-gray-700">{result.doctorName}</p>
              <p className="text-xs text-gray-400">แพทย์ผู้วินิจฉัยและลงนาม {result.doctorLicense ? `(${result.doctorLicense})` : ''}</p>
            </div>
          </div>
        </div>
      </div>

      {/* In-App PDF Preview Modal */}
      <PdfPreviewModal
        isOpen={!!previewFile}
        file={previewFile}
        patientName={patient.name}
        examDate={result.examDate}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
}
