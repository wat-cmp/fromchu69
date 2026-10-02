import React, { useState } from 'react';
import { BASIC_TESTS, SPECIAL_TESTS, getBasicProgramDetails } from '../data';
import { Clock, MapPin, AlertCircle, Phone, Mail, FileText, Check, Activity, Award, CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react';

export default function InfoPortal() {
  const [selectedGender, setSelectedGender] = useState<'female' | 'male'>('female');
  const [selectedAge, setSelectedAge] = useState<number>(36);

  const basicDetails = getBasicProgramDetails(selectedGender, selectedAge);

  return (
    <div className="space-y-10">
      {/* Hero Banner with Royal Navy & Sky Blue palette */}
      <div className="relative bg-gradient-to-br from-blue-950 via-blue-900 to-sky-900 text-white rounded-3xl overflow-hidden shadow-xl border border-blue-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        {/* Top Decorative Blue-Cyan Ribbon Strip */}
        <div className="h-2 w-full bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-300"></div>

        <div className="relative max-w-5xl mx-auto px-6 py-10 sm:px-12 sm:py-14 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-5 max-w-2xl text-left">
            <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-200 border border-sky-400/40 shadow-xs font-mono uppercase tracking-wider">
              UBU Hospital Checkup Center
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              งานตรวจสุขภาพ <br />
              <span className="text-sky-300">โรงพยาบาลมหาวิทยาลัยอุบลราชธานี</span>
            </h2>
            <p className="text-sky-100/90 text-sm sm:text-base max-w-lg leading-relaxed">
              มุ่งเน้นการให้บริการตรวจสุขภาพประจำปีที่มีคุณภาพ ได้มาตรฐาน เบิกจ่ายตรงตามกรมบัญชีกลาง
              พร้อมระบบคัดกรองพฤติกรรมสุขภาพองค์รวมตามแนวทางเวชศาสตร์วิถีชีวิต (Lifestyle Medicine)
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <div className="flex items-center space-x-2 text-xs bg-white/10 backdrop-blur-sm border border-white/15 px-3.5 py-2 rounded-xl text-sky-100">
                <Clock className="h-4 w-4 text-sky-300" />
                <span>วันจันทร์ - วันศุกร์ 08:00 - 12:00 น.</span>
              </div>
              <div className="flex items-center space-x-2 text-xs bg-white/10 backdrop-blur-sm border border-white/15 px-3.5 py-2 rounded-xl text-sky-100">
                <MapPin className="h-4 w-4 text-sky-300" />
                <span>ชั้น 3 อาคารโรงพยาบาล ม.อุบลราชธานี</span>
              </div>
            </div>
          </div>

          {/* Visual Card represent standard government direct billing */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl w-full md:w-80 shadow-lg flex flex-col justify-between">
            <div className="text-left space-y-2.5">
              <div className="flex items-center space-x-2 text-amber-300">
                <Award className="h-5 w-5" />
                <span className="text-xs font-black uppercase tracking-wider">กรมบัญชีกลาง</span>
              </div>
              <p className="text-sm font-bold text-white">สิทธิข้าราชการเบิกจ่ายตรง</p>
              <p className="text-xs text-sky-100/85 leading-relaxed">
                สามารถเบิกค่าตรวจสุขภาพประจำปีได้ปีละ 1 ครั้งตามรายการที่กระทรวงการคลังกำหนด
                (บุคคลในครอบครัวไม่สามารถเบิกได้ตาม พรฎ. มาตรา 18)
              </p>
            </div>
            <div className="mt-6 border-t border-white/15 pt-4 flex items-center justify-between text-xs text-sky-100/90">
              <span>สายด่วนตรวจสุขภาพ:</span>
              <span className="font-mono text-white font-bold text-sm">045-353-909ต่อ 7036</span>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Instructions Banner (แถบคำแนะนำในการเตรียมตัว) */}
      <div className="bg-sky-50 border-l-4 border-sky-600 p-5 rounded-2xl shadow-xs border-y border-r border-sky-200 flex gap-4 items-start text-left">
        <div className="bg-sky-600 text-white p-2 rounded-xl shrink-0 mt-0.5 shadow-3xs">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div className="space-y-1.5 flex-1">
          <h4 className="text-base font-bold text-blue-950 flex items-center gap-2">
            <span>คำแนะนำและข้อพึงระวังในการเข้ารับบริการตรวจสุขภาพ</span>
            <span className="text-[11px] bg-sky-200 text-blue-900 font-semibold px-2 py-0.5 rounded-full">สำคัญมาก</span>
          </h4>
          <ul className="text-xs sm:text-sm text-slate-700 space-y-1.5 list-disc list-inside leading-relaxed">
            <li><span className="font-bold text-blue-950">งดอาหารและเครื่องดื่มทุกชนิด</span> อย่างน้อย 10 ชั่วโมง (หรือเริ่มงดตั้งแต่เวลา 20:00 น. ในคืนก่อนวันตรวจ) สำหรับผู้ที่มีอายุตั้งแต่ 35 ปีขึ้นไป หรือเมื่อเลือกตรวจที่มีการตรวจน้ำตาลและไขมันในเลือด</li>
            <li>สามารถ<span className="font-bold text-blue-700 underline">ดื่มน้ำเปล่าสะอาดได้เท่านั้น</span> เพื่อป้องกันภาวะร่างกายขาดน้ำ</li>
            <li>กรุณานำบัตรประจำตัวประชาชนตัวจริงมาด้วยในวันนัดหมายเพื่อตรวจสอบสิทธิเบิกจ่ายตรง</li>
          </ul>
        </div>
      </div>

      {/* Interactive Package Calculator (แถบคำนวณโปรแกรมตรวจ) */}
      <div className="space-y-6">
        {/* Section Header Ribbon */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-sky-700 text-white px-5 py-3 rounded-2xl shadow-sm flex items-center justify-between text-left">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <Activity className="h-5 w-5 text-sky-200" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">คำนวณและประเมินค่าใช้จ่ายโปรแกรมพื้นฐาน</h3>
              <p className="text-xs text-sky-200">
                เลือกเพศและช่วงอายุเพื่อแสดงชุดตรวจที่ระบบแนะนำอัตโนมัติตามเกณฑ์กรมบัญชีกลาง
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-left">
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">
                1. ระบุเพศของคุณ
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedGender('female')}
                  className={`py-2.5 px-4 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    selectedGender === 'female'
                      ? 'bg-gradient-to-r from-blue-700 to-sky-600 border-blue-600 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  เพศหญิง (Female)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGender('male')}
                  className={`py-2.5 px-4 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    selectedGender === 'male'
                      ? 'bg-gradient-to-r from-blue-700 to-sky-600 border-blue-600 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  เพศชาย (Male)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">
                2. ระบุช่วงอายุ
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAge(30)}
                  className={`py-2.5 px-4 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    selectedAge < 35
                      ? 'bg-gradient-to-r from-blue-700 to-sky-600 border-blue-600 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  อายุน้อยกว่า 35 ปี (&lt; 35 ปี)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAge(40)}
                  className={`py-2.5 px-4 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    selectedAge >= 35
                      ? 'bg-gradient-to-r from-blue-700 to-sky-600 border-blue-600 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  อายุตั้งแต่ 35 ปีขึ้นไป (≥ 35 ปี)
                </button>
              </div>
            </div>
          </div>

          {/* Active Program Info banner (แถบสรุปโปรแกรมที่เหมาะสม) */}
          <div className="bg-gradient-to-r from-sky-50 via-blue-50/60 to-indigo-50/40 border-l-4 border-blue-600 rounded-2xl p-5 border-y border-r border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-extrabold text-blue-800 uppercase tracking-wider bg-blue-100/80 px-2.5 py-0.5 rounded-full">
                โปรแกรมที่แนะนำสำหรับคุณ
              </span>
              <h4 className="text-xl font-black text-blue-950 mt-1">{basicDetails.name}</h4>
              <p className="text-xs text-slate-600 mt-1">รวมทั้งหมด {basicDetails.tests.length} รายการตรวจพื้นฐานตามช่วงวัย</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs text-slate-500 font-medium">อัตราค่าบริการรวมทั้งสิ้น</p>
              <p className="text-3xl font-black text-blue-700 font-mono">
                {basicDetails.price.toLocaleString()} <span className="text-sm font-semibold text-slate-600">บาท</span>
              </p>
            </div>
          </div>

          {/* List of included tests */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>รายการตรวจที่รวมอยู่ในโปรแกรมนี้</span>
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {basicDetails.tests.map((testId, idx) => {
                const test = BASIC_TESTS[testId];
                if (!test) return null;
                return (
                  <div key={testId} className="flex gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-sky-50/30 transition-all">
                    <div className="bg-blue-100 text-blue-700 h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="font-bold text-sm text-slate-900">{idx + 1}. {test.name}</span>
                        <span className="text-xs text-blue-700 font-mono font-bold">
                          {test.price > 0 ? `${test.price} บ.` : 'รวมในแพ็กเกจ'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{test.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Special Tests List (แถบรายการตรวจพิเศษเพิ่มเติม) */}
      <div className="space-y-6 text-left">
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-sky-700 text-white px-5 py-3 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <Sparkles className="h-5 w-5 text-sky-200" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">รายการตรวจพิเศษเพิ่มเติม (Special Additional Tests)</h3>
              <p className="text-xs text-sky-200">
                รายการตรวจเสริมประสิทธิภาพเพื่อการวินิจฉัยเฉพาะทาง สามารถเลือกเพิ่มเติมได้ตามความต้องการ
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(SPECIAL_TESTS).map((test) => (
            <div
              key={test.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-sky-300 transition-all flex flex-col justify-between border-t-4 border-t-sky-500"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-bold text-blue-950 text-sm line-clamp-1">{test.name}</h4>
                  <span className="bg-sky-50 text-sky-800 text-xs px-2.5 py-1 rounded-full font-mono font-bold shrink-0 border border-sky-200">
                    {test.price.toLocaleString()} บาท
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed min-h-[3rem]">{test.detail}</p>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>ค่าอ้างอิงปกติ:</span>
                <span className="text-slate-700 font-semibold">{test.refRange} {test.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hospital contact info banner (แถบข้อมูลติดต่อโรงพยาบาล) */}
      <div className="bg-gradient-to-r from-sky-50 via-blue-50/50 to-indigo-50/30 p-8 rounded-3xl border border-sky-200 grid grid-cols-1 md:grid-cols-2 gap-8 text-left shadow-xs">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <h4 className="text-lg font-black text-blue-950">งานตรวจสุขภาพ โรงพยาบาลมหาวิทยาลัยอุบลราชธานี</h4>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            ให้บริการตรวจสุขภาพเชิงรุกและให้คำปรึกษาพฤติกรรมสุขภาพตามแนวทางเวชศาสตร์วิถีชีวิต (Lifestyle Medicine)
            เพื่อช่วยปรับพฤติกรรม ป้องกันความเจ็บป่วยเรื้อรัง และการมีสุขภาวะที่ดีอย่างยั่งยืน
          </p>
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <MapPin className="h-4 w-4 text-sky-600 shrink-0" />
            <span>85 ถนนสถลมาร์ค ตำบลเมืองศรีไค อำเภอวารินชำราบ จังหวัดอุบลราชธานี 34190</span>
          </div>
        </div>

        <div className="space-y-4 md:border-l md:pl-8 md:border-sky-200">
          <h4 className="text-base font-bold text-blue-950">ช่องทางการติดต่อและสอบถาม</h4>
          <div className="space-y-2.5 text-sm text-slate-600">
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-blue-700 shrink-0" />
              <span>045-353-909ต่อ 7036 (ในวันและเวลาราชการ 08:00 - 15:30 น.)</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-blue-700 shrink-0" />
              <span className="font-mono text-xs">primarycareunit.ubuh@ubu.ac.th</span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-blue-900 font-semibold bg-sky-100/80 p-2.5 rounded-xl border border-sky-300">
              <Clock className="h-4 w-4 text-blue-700 shrink-0" />
              <span>กรุณาติดต่อจองคิวตรวจล่วงหน้าอย่างน้อย 3 วันทำการ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
