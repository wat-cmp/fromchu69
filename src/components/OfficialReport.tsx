import React, { useRef } from 'react';
import { Patient, LabResult, Appointment } from '../types';
import { BASIC_TESTS, SPECIAL_TESTS } from '../data';
import { Printer, Download, ArrowLeft, ShieldAlert, CheckCircle2, User, HelpCircle, FileText } from 'lucide-react';

interface OfficialReportProps {
  patient: Patient;
  result: LabResult;
  appointment?: Appointment;
  onBack?: () => void;
}

export default function OfficialReport({ patient, result, appointment, onBack }: OfficialReportProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

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
      <div className="flex flex-wrap justify-between items-center gap-4 bg-[#F2F4ED] p-4 rounded-2xl border border-[#E0E4D9] no-print">
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-[#4A6741] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>ย้อนกลับ</span>
          </button>
        )}
        <div className="flex items-center space-x-3 ml-auto">
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-2 bg-[#4A6741] hover:bg-[#3d5635] text-white font-bold py-2 px-5 rounded-xl shadow-sm hover:shadow transition-all text-sm cursor-pointer"
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
        className="bg-white border-2 border-[#E0E4D9] shadow-md rounded-3xl p-6 sm:p-12 text-left space-y-8 font-sans print-card relative"
      >
        {/* Decorative Stamp for Official Document Look */}
        <div className="absolute top-12 right-12 border-4 border-red-400/40 text-red-400/40 font-extrabold uppercase tracking-widest text-[11px] sm:text-xs py-1 px-3 sm:py-1.5 sm:px-4 rounded-xl rotate-12 pointer-events-none select-none">
          โรงพยาบาลมหาวิทยาลัยอุบลราชธานี <br />
          <span className="text-[9px] block text-center mt-0.5 font-mono">OFFICIAL RECORD</span>
        </div>

        {/* Report Header */}
        <div className="border-b-2 border-[#4A6741] pb-6 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex items-center space-x-4">
            {/* Hospital Logo simulation */}
            <div className="bg-[#4A6741] text-white p-3 rounded-2xl shadow-inner shrink-0">
              <svg className="h-8 w-8 text-amber-300 fill-current" viewBox="0 0 24 24">
                <path d="M19 10.5V20c0 .6-.4 1-1 1h-5v-5h-2v5H6c-.6 0-1-.4-1-1v-9.5l7-4.8 7 4.8zM12 2L2 9h3v11c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V9h3L12 2z" />
                <path d="M10.5 11h3v3h-3z" />
              </svg>
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-bold tracking-widest text-[#4A6741] uppercase font-mono block">
                Ubon Ratchathani University Hospital
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#4A6741] tracking-tight leading-tight">
                ศูนย์ตรวจสุขภาพ โรงพยาบาลมหาวิทยาลัยอุบลราชธานี
              </h2>
              <p className="text-xs text-gray-500 font-semibold font-mono">
                85 Sathonlamark Rd, Warin Chamrap District, Ubon Ratchathani 34190 | Tel: 045-353909 ext 7036
              </p>
            </div>
          </div>
          <div className="text-center sm:text-right shrink-0">
            <span className="bg-[#4A6741] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full block mb-2 font-mono">
              HEALTH CHECKUP REPORT
            </span>
            <p className="text-xs text-gray-400">เลขที่เอกสารอ้างอิง</p>
            <p className="text-sm font-bold text-gray-700 font-mono">UBUH-2026-{result.id}</p>
          </div>
        </div>

        {/* Patient Demographic Info */}
        <div className="bg-[#F2F4ED] p-6 rounded-2xl border border-[#E0E4D9] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-sm">
          <div className="space-y-0.5">
            <span className="text-xs text-gray-400 font-medium">ชื่อ-นามสกุล ผู้รับบริการ</span>
            <p className="font-bold text-gray-800">{patient.name}</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-xs text-gray-400 font-medium">หมายเลขคนไข้ (HN)</span>
            <p className="font-bold text-[#4A6741] font-mono">{patient.hn || <span className="text-gray-400 font-normal">ยังไม่ได้ระบุ</span>}</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-xs text-gray-400 font-medium">เลขประจำตัวประชาชน (National ID)</span>
            <p className="font-bold text-gray-800 font-mono">{patient.nationalId}</p>
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
            <p className="font-bold text-[#4A6741]">
              {result.doctorName} {result.doctorLicense ? `(${result.doctorLicense})` : ''}
            </p>
          </div>
        </div>

        {/* Body Composition & Physical Exam results */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#4A6741] uppercase tracking-widest border-l-4 border-[#4A6741] pl-3">
            1. สัญญาณชีพและผลการตรวจร่างกายทั่วไป (Vital Signs & Physical Examination)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-4 text-xs">
            <div className="bg-white p-3.5 rounded-xl border border-[#E0E4D9] text-center">
              <span className="text-gray-400 font-medium block">น้ำหนัก</span>
              <span className="text-base font-extrabold text-gray-800 font-mono mt-1 block">{result.physical.weight}</span>
              <span className="text-gray-400 font-medium text-[10px] mt-0.5 block">กิโลกรัม (kg)</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-[#E0E4D9] text-center">
              <span className="text-gray-400 font-medium block">ส่วนสูง</span>
              <span className="text-base font-extrabold text-gray-800 font-mono mt-1 block">{result.physical.height}</span>
              <span className="text-gray-400 font-medium text-[10px] mt-0.5 block">เซนติเมตร (cm)</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-[#E0E4D9] text-center">
              <span className="text-gray-400 font-medium block">ดัชนีมวลกาย (BMI)</span>
              <span className="text-base font-extrabold text-gray-800 font-mono mt-1 block">{result.physical.bmi}</span>
              <span className="text-[10px] font-bold text-[#4A6741] mt-0.5 block">{result.physical.bmiStatus}</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-[#E0E4D9] text-center">
              <span className="text-gray-400 font-medium block">รอบเอว</span>
              <span className="text-base font-extrabold text-gray-800 font-mono mt-1 block">{result.physical.waistline || '-'}</span>
              <span className="text-gray-400 font-medium text-[10px] mt-0.5 block">เซนติเมตร (cm)</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-[#E0E4D9] text-center">
              <span className="text-gray-400 font-medium block">ความดันโลหิต</span>
              <span className="text-base font-extrabold text-gray-800 font-mono mt-1 block">{result.physical.bloodPressure}</span>
              <span className="text-gray-400 font-medium text-[10px] mt-0.5 block">มม.ปรอท (mmHg)</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-[#E0E4D9] text-center">
              <span className="text-gray-400 font-medium block">อัตราการเต้นหัวใจ</span>
              <span className="text-base font-extrabold text-gray-800 font-mono mt-1 block">{result.physical.heartRate}</span>
              <span className="text-gray-400 font-medium text-[10px] mt-0.5 block">ครั้ง/นาที (bpm)</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-[#E0E4D9] text-center flex flex-col justify-between">
              <span className="text-gray-400 font-medium block">ประเมินรวม</span>
              <span className={`inline-flex self-center px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${getStatusColor(result.physical.generalStatus)} mt-1`}>
                {result.physical.generalStatus}
              </span>
              <span className="text-[10px] block text-gray-400 mt-1">ร่างกายทั่วไป</span>
            </div>
          </div>
          {result.physical.notes && (
            <div className="bg-[#F9FAF7] border border-[#E0E4D9] p-4 rounded-xl text-xs text-gray-600">
              <span className="font-bold text-gray-700 block mb-1">บันทึกเพิ่มเติมทางการแพทย์:</span>
              <p>{result.physical.notes}</p>
            </div>
          )}
        </div>

        {/* Chest X-ray outcomes */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#4A6741] uppercase tracking-widest border-l-4 border-[#4A6741] pl-3">
            2. ผลตรวจเอกซเรย์ทรวงอก (Chest X-Ray)
          </h3>
          <div className="bg-white border border-[#E0E4D9] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#4A6741] uppercase tracking-widest border-l-4 border-[#4A6741] pl-3">
            3. สรุปผลการตรวจทางห้องปฏิบัติการ (Laboratory Investigation Results)
          </h3>
          <div className="overflow-hidden border border-[#E0E4D9] rounded-2xl shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#F2F4ED] table-header">
                <tr>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-[#4A6741] uppercase tracking-wider">
                    รายการตรวจ (Investigation)
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-[#4A6741] uppercase tracking-wider">
                    ค่าที่ตรวจได้ (Result Value)
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-[#4A6741] uppercase tracking-wider">
                    ค่าอ้างอิงปกติ (Reference Range)
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-center text-xs font-bold text-[#4A6741] uppercase tracking-wider">
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
                    <tr key={key} className={`hover:bg-gray-50 transition-colors ${isDeclined ? 'bg-red-50/10' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <p className={`font-bold text-sm ${isDeclined ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{meta.name}</p>
                          <p className="text-[10px] text-gray-400 font-medium line-clamp-1">{meta.detail}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {!isDeclined && (!item.value || item.value.trim() === '') ? (
                          <span className="text-amber-800 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 font-bold text-xs">
                            ผลตามเอกสารแนบ
                          </span>
                        ) : (
                          <span className={`font-extrabold font-mono text-sm ${isDeclined ? 'text-red-700/80 font-bold' : 'text-gray-900'}`}>
                            {item.value} {!isDeclined && <span className="text-xs font-medium text-gray-500">{meta.unit}</span>}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">
                        {isDeclined ? 'ไม่ได้ตรวจสอบ' : meta.refRange}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Attached Files from nurse */}
        {result.attachedFiles && result.attachedFiles.length > 0 && (
          <div className="space-y-3 no-print">
            <h3 className="text-sm font-bold text-[#4A6741] uppercase tracking-widest border-l-4 border-[#4A6741] pl-3">
              4. เอกสารและใบรายงานผลเพิ่มเติม (Attached Official PDF Results)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.attachedFiles.map((file) => (
                <div
                  key={file.id}
                  className="bg-[#F9FAF7] border border-[#E0E4D9] p-4 rounded-xl flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-red-100 text-red-700 p-2 rounded-lg">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-gray-800 line-clamp-1">{file.name}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{file.category} • {file.size}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      alert(`จำลองการดาวน์โหลดไฟล์: ${file.name} (ไฟล์เอกสารบันทึกรายงานผลตรวจเพิ่มเติมของโรงพยาบาล)`);
                    }}
                    className="text-xs font-bold text-[#4A6741] hover:text-[#3d5635] flex items-center space-x-1 border border-[#E0E4D9] hover:border-[#4A6741] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <Download className="h-3 w-3" />
                    <span>ดาวน์โหลด</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations block */}
        <div className="bg-[#F2F4ED] border border-[#E0E4D9] rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center space-x-2 text-[#4A6741]">
            <ShieldAlert className="h-5 w-5 text-[#4A6741]" />
            <h4 className="text-base font-extrabold">สรุปภาพรวมและคำแนะนำส่วนบุคคลเพื่อการปรับเปลี่ยนพฤติกรรม (Clinical Impression & Personalized Plan)</h4>
          </div>
          <p className="text-sm font-semibold text-gray-700 leading-relaxed border-b border-[#E0E4D9] pb-3">
            {result.summary}
          </p>
          <div className="space-y-2">
            <p className="text-xs text-[#4A6741] font-bold uppercase tracking-wider">แนวทางปฏิบัติเพื่อสุขภาพที่ดีขึ้น (Actionable Recommendations):</p>
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
          <div className="text-center space-y-3 shrink-0">
            <div className="relative inline-block">
              {/* Fake signature line */}
              <p className="font-mono text-xs text-[#4A6741]/80 italic tracking-wider relative z-10 select-none">
                {result.doctorName.split(' ').pop()}
              </p>
              {/* Doctor Official Stamp represent */}
              <div className="absolute -top-3 -left-8 border-2 border-red-500/30 text-red-500/30 font-bold text-[9px] uppercase tracking-widest py-1 px-3 rounded-full rotate-[-8deg] pointer-events-none select-none">
                UBUH OFFICIAL
              </div>
            </div>
            <div className="w-48 h-[1px] bg-gray-300 mx-auto"></div>
            <div>
              <p className="font-bold text-gray-700">{result.doctorName}</p>
              <p className="text-xs text-gray-400">แพทย์ผู้วินิจฉัยและลงนาม {result.doctorLicense ? `(${result.doctorLicense})` : ''}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
