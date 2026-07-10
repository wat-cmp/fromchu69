import React, { useState } from 'react';
import { BASIC_TESTS, SPECIAL_TESTS, getBasicProgramDetails } from '../data';
import { Clock, MapPin, AlertCircle, Phone, Mail, FileText, Check, Activity, Award, CheckCircle2 } from 'lucide-react';

export default function InfoPortal() {
  const [selectedGender, setSelectedGender] = useState<'female' | 'male'>('female');
  const [selectedAge, setSelectedAge] = useState<number>(36);

  const basicDetails = getBasicProgramDetails(selectedGender, selectedAge);

  return (
    <div className="space-y-12">
      {/* Hero Banner with Yellow and Blue colors of UBUH */}
      <div className="relative bg-[#4A6741] text-white rounded-3xl overflow-hidden shadow-xl border border-[#3d5635]">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative max-w-5xl mx-auto px-6 py-12 sm:px-12 sm:py-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-6 max-w-2xl text-left">
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 shadow-sm font-mono uppercase">
              UBU Hospital Checkup Center
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              งานตรวจสุขภาพ <br />
              <span className="text-amber-300 font-bold">โรงพยาบาลมหาวิทยาลัยอุบลราชธานี</span>
            </h2>
            <p className="text-green-50/90 text-sm sm:text-base max-w-lg">
              มุ่งเน้นการให้บริการตรวจสุขภาพประจำปีที่มีคุณภาพ ได้มาตรฐาน เบิกจ่ายตรงตามกรมบัญชีกลาง
              พร้อมระบบคัดกรองพฤติกรรมสุขภาพองค์รวมเพื่อให้คุณมีชีวิตที่ยืนยาวและแข็งแรง
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center space-x-2 text-xs bg-white/10 backdrop-blur-sm border border-white/10 px-3.5 py-2 rounded-xl text-green-100">
                <Clock className="h-4 w-4 text-amber-300" />
                <span>วันจันทร์ - วันศุกร์ 08:00 - 12:00 น.</span>
              </div>
              <div className="flex items-center space-x-2 text-xs bg-white/10 backdrop-blur-sm border border-white/10 px-3.5 py-2 rounded-xl text-green-100">
                <MapPin className="h-4 w-4 text-amber-300" />
                <span>ชั้น 3 อาคารโรงพยาบาล ม.อุบลราชธานี</span>
              </div>
            </div>
          </div>
          {/* Visual Badge represent standard pricing */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl w-full md:w-80 shadow-inner flex flex-col justify-between">
            <div className="text-left space-y-2">
              <div className="flex items-center space-x-2 text-amber-300">
                <Award className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-wider">กรมบัญชีกลาง</span>
              </div>
              <p className="text-sm font-semibold text-white">สิทธิข้าราชการเบิกจ่ายตรง</p>
              <p className="text-xs text-green-100/85">
                สามารถเบิกค่าตรวจสุขภาพประจำปีได้ปีละ 1 ครั้งตามรายการที่กระทรวงการคลังกำหนด
                (บุคคลในครอบครัวไม่สามารถเบิกได้ตาม พรฎ. มาตรา 18)
              </p>
            </div>
            <div className="mt-6 border-t border-white/10 pt-4 flex items-center justify-between text-xs text-green-100/85">
              <span>สายด่วนตรวจสุขภาพ:</span>
              <span className="font-mono text-white font-bold">045-353909 ต่อ 7036</span>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Instructions Banner */}
      <div className="bg-[#F2F4ED] border-l-4 border-[#4A6741] p-5 rounded-2xl shadow-sm border-y border-r border-[#E0E4D9] flex gap-4 items-start text-left">
        <AlertCircle className="h-6 w-6 text-[#4A6741] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-base font-bold text-slate-800">คำแนะนำและข้อพึงระวังในการเข้ารับบริการ</h4>
          <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
            <li><span className="font-bold">งดอาหารและเครื่องดื่มทุกชนิด</span> อย่างน้อย 10 ชั่วโมง (หรือเริ่มงดตั้งแต่เวลา 20:00 น. ในคืนก่อนวันตรวจ) สำหรับผู้ที่มีอายุตั้งแต่ 35 ปีขึ้นไป หรือเมื่อเลือกตรวจที่มีการตรวจน้ำตาลและไขมันในเลือด</li>
            <li>สามารถ<span className="font-bold text-[#4A6741] underline">ดื่มน้ำเปล่าสะอาดได้เท่านั้น</span> เพื่อป้องกันภาวะขาดน้ำ</li>
            <li>กรุณานำบัตรประจำตัวประชาชนตัวจริงมาด้วยในวันนัดหมาย</li>
          </ul>
        </div>
      </div>

      {/* Interactive Package Calculator */}
      <div className="space-y-6">
        <div className="text-left space-y-2">
          <h3 className="text-2xl font-bold text-[#4A6741] tracking-tight">คำนวณและประเมินค่าใช้จ่ายโปรแกรมพื้นฐาน</h3>
          <p className="text-gray-500 text-sm">
            เลือกข้อมูลเพื่อแสดงรายการตรวจที่ระบบแนะนำโดยอัตโนมัติ พร้อมอัตราค่าบริการตามเกณฑ์กรมบัญชีกลาง
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E0E4D9] shadow-sm space-y-6 text-left">
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">ระบุเพศ</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedGender('female')}
                  className={`py-2 px-4 text-sm font-medium rounded-xl border transition-all ${
                    selectedGender === 'female'
                      ? 'bg-[#4A6741] border-[#4A6741] text-white shadow-sm'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  เพศหญิง
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGender('male')}
                  className={`py-2 px-4 text-sm font-medium rounded-xl border transition-all ${
                    selectedGender === 'male'
                      ? 'bg-[#4A6741] border-[#4A6741] text-white shadow-sm'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  เพศชาย
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">ระบุอายุ</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAge(30)}
                  className={`py-2 px-4 text-sm font-medium rounded-xl border transition-all ${
                    selectedAge < 35
                      ? 'bg-[#4A6741] border-[#4A6741] text-white shadow-sm'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  อายุน้อยกว่า 35 ปี
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAge(40)}
                  className={`py-2 px-4 text-sm font-medium rounded-xl border transition-all ${
                    selectedAge >= 35
                      ? 'bg-[#4A6741] border-[#4A6741] text-white shadow-sm'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  อายุตั้งแต่ 35 ปีขึ้นไป
                </button>
              </div>
            </div>
          </div>

          {/* Active Program Info banner */}
          <div className="bg-[#F2F4ED] border border-[#E0E4D9] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-[#4A6741] font-semibold uppercase tracking-wider">โปรแกรมที่เหมาะสมสำหรับคุณ</p>
              <h4 className="text-lg font-bold text-slate-800 mt-1">{basicDetails.name}</h4>
              <p className="text-xs text-gray-500 mt-1">รวมทั้งหมด {basicDetails.tests.length} รายการตรวจพื้นฐาน</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs text-gray-500">ค่าบริการรวมทั้งสิ้น</p>
              <p className="text-3xl font-extrabold text-[#4A6741]">
                {basicDetails.price.toLocaleString()} <span className="text-base font-medium text-gray-500">บาท</span>
              </p>
            </div>
          </div>

          {/* List of included tests */}
          <div className="space-y-3">
            <h5 className="text-sm font-bold text-gray-700 uppercase tracking-wider">รายการตรวจที่รวมอยู่ในโปรแกรมนี้</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {basicDetails.tests.map((testId, idx) => {
                const test = BASIC_TESTS[testId];
                if (!test) return null;
                return (
                  <div key={testId} className="flex gap-3 bg-[#F9FAF7] p-3.5 rounded-xl border border-[#E0E4D9] hover:border-[#D0D4C9] transition-all">
                    <div className="bg-[#F2F4ED] text-[#4A6741] h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 font-bold">
                      <Check className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="font-bold text-sm text-gray-900">{idx + 1}. {test.name}</span>
                        <span className="text-xs text-gray-500 font-mono">
                          {test.price > 0 ? `${test.price} บ.` : 'ฟรี/ไม่มีค่าตรวจ'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{test.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Special Tests List */}
      <div className="space-y-6 text-left">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-[#4A6741] tracking-tight">รายการตรวจพิเศษเพิ่มเติม</h3>
          <p className="text-gray-500 text-sm">
            รายการตรวจเสริมประสิทธิภาพเพื่อการวินิจฉัยเฉพาะทาง สามารถเลือกเพิ่มเติมได้ตามความต้องการหรือคำแนะนำของแพทย์
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(SPECIAL_TESTS).map((test) => (
            <div
              key={test.id}
              className="bg-white p-5 rounded-2xl border border-[#E0E4D9] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-bold text-[#4A6741] text-sm line-clamp-1">{test.name}</h4>
                  <span className="bg-[#F2F4ED] text-[#4A6741] text-xs px-2.5 py-1 rounded-full font-mono font-bold shrink-0 border border-[#D0D4C9]">
                    {test.price} บาท
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed min-h-[3rem]">{test.detail}</p>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-400 font-mono">
                <span>ค่าอ้างอิงปกติ:</span>
                <span className="text-gray-600 font-semibold">{test.refRange} {test.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hospital contact info footer */}
      <div className="bg-[#F2F4ED] p-8 rounded-3xl border border-[#E0E4D9] grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-[#4A6741]">งานตรวจสุขภาพ โรงพยาบาลมหาวิทยาลัยอุบลราชธานี</h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            ให้บริการตรวจสุขภาพเชิงรุกและให้คำปรึกษาพฤติกรรมสุขภาพตามแนวทางเวชศาสตร์วิถีชีวิต (Lifestyle Medicine)
            เพื่อช่วยปรับพฤติกรรม ป้องกันความเจ็บป่วยเรื้อรัง และการมีสุขภาวะที่ดีอย่างยั่งยืน
          </p>
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <MapPin className="h-4 w-4 text-slate-400" />
            <span>85 ถนนสถลมาร์ค ตำบลเมืองศรีไค อำเภอวารินชำราบ จังหวัดอุบลราชธานี 34190</span>
          </div>
        </div>
        <div className="space-y-4 md:border-l md:pl-8 md:border-[#E0E4D9]">
          <h4 className="text-base font-bold text-[#4A6741]">ช่องทางการติดต่อ</h4>
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-[#4A6741] shrink-0" />
              <span>045-353909 ต่อ 7036 (ในวันเวลาราชการ)</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-[#4A6741] shrink-0" />
              <span className="font-mono">primarycareunit.ubuh@ubu.ac.th</span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-amber-800 font-semibold bg-amber-50 p-2 rounded-lg border border-amber-200">
              <Clock className="h-4 w-4 shrink-0" />
              <span>กรุณาติดต่อจองคิวตรวจล่วงหน้าอย่างน้อย 3 วันทำการ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
