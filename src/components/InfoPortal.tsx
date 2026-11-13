import React, { useState, useRef } from 'react';
import {
  CHECKUP_2570_CATEGORIES,
  CHECKUP_2570_PACKAGES,
  CHECKUP_2570_ITEMS,
  FEE_SCHEDULE_2570_CATEGORIES,
  FEE_SCHEDULE_2570_ITEMS,
  Program2570Key,
  Program2570Tier,
  Program2570CategoryId,
  FeeSchedule2570CategoryId,
} from '../data';
import {
  Clock,
  MapPin,
  AlertCircle,
  Phone,
  Mail,
  Check,
  Award,
  Stethoscope,
  ShieldCheck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Table2,
  UserCheck,
  Info,
  Calculator,
  Search,
  Trash2,
  X,
  Plus,
  RotateCcw,
} from 'lucide-react';

interface InfoPortalProps {
  onGoToPatientPortal?: () => void;
}

const TIER_INFO: Record<
  Program2570Tier,
  {
    title: string;
    subtitle: string;
    ageRangeSummary: string;
    description: string;
    defaultKey: Program2570Key;
  }
> = {
  basic: {
    title: 'Basic Program',
    subtitle: 'โปรแกรมตรวจสุขภาพพื้นฐาน',
    ageRangeSummary: 'อายุน้อยกว่า 35 ปี · อายุมากกว่า 35 ปี',
    description: 'ตรวจคัดกรองสุขภาพพื้นฐานประจำปี ครอบคลุมตรวจร่างกาย เอกซเรย์ปอด เม็ดเลือด ปัสสาวะ และเคมีเลือดพื้นฐานเมื่ออายุ > 35 ปี',
    defaultKey: 'basic_over35',
  },
  standard: {
    title: 'Standard Program',
    subtitle: 'โปรแกรมตรวจสุขภาพมาตรฐาน',
    ageRangeSummary: 'อายุน้อยกว่า 30 ปี',
    description: 'เหมาะสำหรับวัยเริ่มทำงาน (อายุน้อยกว่า 30 ปี) เพิ่มการตรวจไขมันดี HDL, ไขมันไม่ดี LDL และภูมิคุ้มกันไวรัสตับอักเสบบี (HBsAb)',
    defaultKey: 'standard_under30',
  },
  advance: {
    title: 'Advance Program',
    subtitle: 'โปรแกรมตรวจสุขภาพเชิงลึก',
    ageRangeSummary: 'อายุ 31–59 ปี · อายุมากกว่า 60 ปี',
    description: 'ครอบคลุมการตรวจคลื่นไฟฟ้าหัวใจ (EKG), ไทรอยด์ (TSH), สารบ่งชี้มะเร็ง และรายการดูแลผู้สูงวัยครบทุกมิติ',
    defaultKey: 'advance_31_59',
  },
};

export default function InfoPortal({ onGoToPatientPortal }: InfoPortalProps) {
  const [viewMode, setViewMode] = useState<'explorer' | 'compare'>('explorer');
  const [selectedTier, setSelectedTier] = useState<Program2570Tier>('basic');
  const [selectedProgramKey, setSelectedProgramKey] = useState<Program2570Key>('basic_over35');
  const [genderFilter, setGenderFilter] = useState<'all' | 'female' | 'male'>('all');
  const [compareCategory, setCompareCategory] = useState<'all' | Program2570CategoryId>('all');

  // Interactive 2570 Fee Schedule Calculator State
  const [selectedFeeIds, setSelectedFeeIds] = useState<string[]>([]);
  const [feeCategoryFilter, setFeeCategoryFilter] = useState<'all' | FeeSchedule2570CategoryId>('all');
  const [feeGenderFilter, setFeeGenderFilter] = useState<'all' | 'female' | 'male'>('all');
  const [feeSearchQuery, setFeeSearchQuery] = useState<string>('');
  const [activePresetLabel, setActivePresetLabel] = useState<string | null>(null);

  const compareScrollRef = useRef<HTMLDivElement>(null);
  const calculatorSectionRef = useRef<HTMLElement>(null);

  const handleSelectTier = (tier: Program2570Tier) => {
    setSelectedTier(tier);
    setSelectedProgramKey(TIER_INFO[tier].defaultKey);
  };

  const handleSelectPackage = (pkgKey: Program2570Key, tier: Program2570Tier) => {
    setSelectedTier(tier);
    setSelectedProgramKey(pkgKey);
  };

  const scrollCompareTable = (direction: 'left' | 'right') => {
    if (compareScrollRef.current) {
      compareScrollRef.current.scrollBy({
        left: direction === 'left' ? -240 : 240,
        behavior: 'smooth',
      });
    }
  };

  const activePackage =
    CHECKUP_2570_PACKAGES.find((p) => p.key === selectedProgramKey) || CHECKUP_2570_PACKAGES[0];
  const tierPackages = CHECKUP_2570_PACKAGES.filter((p) => p.tier === selectedTier);

  // Filter items that belong to the selected program and selected gender
  const matchingItems = CHECKUP_2570_ITEMS.filter((item) => {
    const eligibility = item.programs[selectedProgramKey];
    if (!eligibility.included) return false;
    if (genderFilter !== 'all' && eligibility.gender && eligibility.gender !== genderFilter) {
      return false;
    }
    return true;
  });

  const matchingEstimatedTotal = matchingItems.reduce((sum, item) => sum + item.price, 0);

  // Group matching items by clinical category
  const groupedMatchingItems = CHECKUP_2570_CATEGORIES.map((cat) => ({
    ...cat,
    items: matchingItems.filter((item) => item.category === cat.id),
  })).filter((group) => group.items.length > 0);

  // Items NOT in the selected program (for clear comparison / upgrade awareness)
  const excludedCount = CHECKUP_2570_ITEMS.length - matchingItems.length;

  // Helper to compute program total for a given package & gender
  const getPackageTotalByGender = (pkgKey: Program2570Key, gender: 'female' | 'male' | 'all') => {
    return CHECKUP_2570_ITEMS.reduce((sum, item) => {
      const eligibility = item.programs[pkgKey];
      if (!eligibility.included) return sum;
      if (gender !== 'all' && eligibility.gender && eligibility.gender !== gender) return sum;
      return sum + item.price;
    }, 0);
  };

  // Load items from a 2570 program into the self-service calculator
  const loadProgramIntoCalculator = (
    pkgKey: Program2570Key,
    gender: 'all' | 'female' | 'male',
    shouldScroll = false
  ) => {
    const pkg = CHECKUP_2570_PACKAGES.find((p) => p.key === pkgKey);
    const feeIdSet = new Set(FEE_SCHEDULE_2570_ITEMS.map((f) => f.id));
    const presetIds = CHECKUP_2570_ITEMS.filter((item) => {
      const eligibility = item.programs[pkgKey];
      if (!eligibility.included) return false;
      if (gender !== 'all' && eligibility.gender && eligibility.gender !== gender) return false;
      return feeIdSet.has(item.id);
    }).map((item) => item.id);

    setSelectedFeeIds(presetIds);
    setFeeGenderFilter(gender);
    setFeeCategoryFilter('all');
    setFeeSearchQuery('');
    setActivePresetLabel(pkg ? `${pkg.tierLabel} (${pkg.shortAgeLabel})` : null);

    if (shouldScroll && calculatorSectionRef.current) {
      calculatorSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const toggleFeeItem = (id: string) => {
    setSelectedFeeIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    setActivePresetLabel(null);
  };

  const clearCalculator = () => {
    setSelectedFeeIds([]);
    setActivePresetLabel(null);
  };

  const handleFeeGenderChange = (nextGender: 'all' | 'female' | 'male') => {
    setFeeGenderFilter(nextGender);
    if (nextGender !== 'all') {
      const incompatibleIds = new Set(
        FEE_SCHEDULE_2570_ITEMS.filter(
          (item) => item.genderHint && item.genderHint !== nextGender
        ).map((item) => item.id)
      );
      setSelectedFeeIds((prev) => prev.filter((id) => !incompatibleIds.has(id)));
    }
  };

  const normalizedQuery = feeSearchQuery.trim().toLowerCase();
  const filteredFeeItems = FEE_SCHEDULE_2570_ITEMS.filter((item) => {
    if (feeCategoryFilter !== 'all' && item.category !== feeCategoryFilter) return false;
    if (feeGenderFilter !== 'all' && item.genderHint && item.genderHint !== feeGenderFilter) {
      return false;
    }
    if (normalizedQuery) {
      const haystack = `${item.name} ${item.englishName} ${item.description}`.toLowerCase();
      if (!haystack.includes(normalizedQuery)) return false;
    }
    return true;
  });

  const selectedFeeItems = FEE_SCHEDULE_2570_ITEMS.filter((item) =>
    selectedFeeIds.includes(item.id)
  );
  const calculatorTotalCost = selectedFeeItems.reduce((sum, item) => sum + item.price, 0);

  const handleSelectAllVisible = () => {
    const visibleIds = filteredFeeItems.map((item) => item.id);
    setSelectedFeeIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    setActivePresetLabel(null);
  };

  return (
    <div className="space-y-10">
      {/* 1. Hero Banner */}
      <section className="relative bg-gradient-to-br from-[#03241B] via-[#064E3B] to-[#0A5742] text-white rounded-3xl overflow-hidden shadow-md border border-[#D4AF37]/40">
        <div className="absolute inset-0 opacity-12 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:18px_18px]" />
        <div className="h-1.5 w-full bg-gradient-to-r from-[#B88928] via-[#F3D98B] to-[#B88928]" />

        <div className="relative max-w-6xl mx-auto px-6 py-9 sm:px-10 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-7 space-y-5 text-left flex flex-col justify-between">
            <div className="space-y-4">
              <p className="text-xs font-semibold tracking-wide text-[#F3D98B]">
                ศูนย์ตรวจสุขภาพ · โรงพยาบาลมหาวิทยาลัยอุบลราชธานี
              </p>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-balance">
                โปรแกรมตรวจสุขภาพประจำปี 2570
                <span className="block text-[#E6C667] text-xl sm:text-2xl font-bold mt-1.5">
                  ออกแบบเหมาะสมตามช่วงวัยและความเสี่ยงสุขภาพ
                </span>
              </h2>
              <p className="text-emerald-50/90 text-sm sm:text-base max-w-xl leading-relaxed">
                ให้บริการตรวจสุขภาพประจำปีมาตรฐานโรงพยาบาลมหาวิทยาลัย รองรับสิทธิข้าราชการเบิกจ่ายตรงตามเกณฑ์กรมบัญชีกลาง
                พร้อมระบบประเมินพฤติกรรมสุขภาพเวชศาสตร์วิถีชีวิต (Lifestyle Medicine)
              </p>
            </div>

            <div className="space-y-4 pt-1">
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs sm:text-sm text-emerald-100/90">
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#E6C667] shrink-0" />
                  <span>วันจันทร์ – ศุกร์ เวลา 08:00 – 12:00 น.</span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#E6C667] shrink-0" />
                  <span>ชั้น 3 อาคารโรงพยาบาล ม.อุบลราชธานี</span>
                </span>
              </div>

              {onGoToPatientPortal && (
                <div>
                  <button
                    type="button"
                    onClick={onGoToPatientPortal}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] via-[#ECCF73] to-[#C89D3C] text-[#03241B] hover:brightness-105 font-extrabold text-sm px-5 py-3 rounded-xl shadow-md shadow-emerald-950/30 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <span>ลงทะเบียน / จองคิวตรวจสุขภาพ</span>
                    <ArrowRight className="h-4 w-4 text-[#03241B]" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Direct Billing & Hotline Card */}
          <div className="lg:col-span-5 bg-white/8 backdrop-blur-md border border-[#D4AF37]/35 p-6 rounded-2xl flex flex-col justify-between text-left">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#F3D98B]">
                <Award className="h-5 w-5 shrink-0" />
                <span className="text-xs font-bold tracking-wide">สิทธิข้าราชการเบิกจ่ายตรง · กรมบัญชีกลาง</span>
              </div>
              <p className="text-base font-bold text-white">การเบิกจ่ายค่าตรวจสุขภาพประจำปี</p>
              <p className="text-xs sm:text-sm text-emerald-50/85 leading-relaxed">
                ผู้มีสิทธิสามารถเบิกค่าตรวจสุขภาพประจำปีได้ปีละ 1 ครั้งตามรายการและช่วงอายุที่กระทรวงการคลังกำหนด
                (บุคคลในครอบครัวไม่สามารถใช้สิทธิเบิกได้ตาม พ.ร.ฎ. มาตรา 18)
              </p>
            </div>
            <div className="mt-6 border-t border-[#D4AF37]/25 pt-4 flex items-center justify-between text-xs text-emerald-100/90 gap-3">
              <span>สายด่วนงานตรวจสุขภาพ</span>
              <span className="font-mono tabular-nums text-[#F3D98B] font-bold text-sm whitespace-nowrap">
                045-353-909 ต่อ 7036
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Pre-Examination Preparation Banner */}
      <section className="bg-[#F2F7F4] border border-[#D4AF37]/40 p-5 sm:p-6 rounded-2xl flex gap-4 items-start text-left">
        <div className="bg-[#064E3B] text-[#F3D98B] p-2.5 rounded-xl shrink-0 mt-0.5 ring-1 ring-[#D4AF37]/40">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <h3 className="text-base font-bold text-[#03241B]">
              คำแนะนำและข้อพึงระวังก่อนเข้ารับบริการตรวจสุขภาพ
            </h3>
            <span className="text-xs font-semibold text-[#8A6114]">· กรุณาเตรียมตัวล่วงหน้า</span>
          </div>
          <ul className="text-xs sm:text-sm text-slate-700 space-y-1.5 list-disc list-inside leading-relaxed">
            <li>
              <strong className="text-[#03241B]">งดอาหารและเครื่องดื่มทุกชนิด อย่างน้อย 10 ชั่วโมง</strong>{' '}
              (หรือเริ่มงดตั้งแต่เวลา 20:00 น. คืนก่อนวันตรวจ) สำหรับผู้ที่ตรวจระดับน้ำตาลและไขมันในเลือด
            </li>
            <li>
              สามารถ <strong className="text-[#065F46] underline">ดื่มน้ำเปล่าสะอาดได้เท่านั้น</strong>{' '}
              เพื่อป้องกันภาวะร่างกายขาดน้ำและช่วยให้เจาะเลือดได้สะดวกขึ้น
            </li>
            <li>
              กรุณานำ <strong className="text-[#03241B]">บัตรประจำตัวประชาชนตัวจริง</strong>{' '}
              มาแสดงในวันนัดหมายเพื่อยืนยันตัวตนและตรวจสอบสิทธิ
            </li>
          </ul>
        </div>
      </section>

      {/* 3. Main Checkup Programs 2570 Section */}
      <section className="space-y-6 text-left">
        {/* Section Header + Segmented View Switcher */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#D4AF37]/30 pb-4">
          <div className="space-y-1">
            <p className="text-xs font-bold text-[#8A6114]">
              ออกแบบโดยงานตรวจสุขภาพ โรงพยาบาลมหาวิทยาลัยอุบลราชธานี
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-[#03241B] tracking-tight text-balance">
              โปรแกรมตรวจสุขภาพ ประจำปี 2570
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              เลือกโปรแกรมและช่วงวัยของท่านเพื่อดูรายการตรวจอย่างเป็นหมวดหมู่ หรือสลับดูตารางเปรียบเทียบทั้ง 3 โปรแกรม
            </p>
          </div>

          {/* Functional Segmented View Control */}
          <div className="inline-flex items-center gap-1 p-1 bg-[#F2F7F4] border border-[#D4AF37]/30 rounded-xl self-start md:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('explorer')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                viewMode === 'explorer'
                  ? 'bg-[#064E3B] text-white shadow-xs ring-1 ring-[#D4AF37]/40'
                  : 'text-slate-700 hover:text-[#064E3B]'
              }`}
            >
              <LayoutGrid className={`h-3.5 w-3.5 ${viewMode === 'explorer' ? 'text-[#F3D98B]' : ''}`} />
              <span>เลือกดูตามโปรแกรม (เข้าใจง่าย)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('compare')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                viewMode === 'compare'
                  ? 'bg-[#064E3B] text-white shadow-xs ring-1 ring-[#D4AF37]/40'
                  : 'text-slate-700 hover:text-[#064E3B]'
              }`}
            >
              <Table2 className={`h-3.5 w-3.5 ${viewMode === 'compare' ? 'text-[#F3D98B]' : ''}`} />
              <span>ตารางเปรียบเทียบทั้งหมด</span>
            </button>
          </div>
        </div>

        {/* VIEW MODE A: Patient-Friendly Program Explorer */}
        {viewMode === 'explorer' && (
          <div className="space-y-6">
            {/* Step 1: 3 Tier Cards (Basic / Standard / Advance) */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-slate-600">
                ขั้นตอนที่ 1 · เลือกระดับโปรแกรมตรวจสุขภาพ
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['basic', 'standard', 'advance'] as Program2570Tier[]).map((tier) => {
                  const info = TIER_INFO[tier];
                  const isActive = selectedTier === tier;
                  return (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => handleSelectTier(tier)}
                      className={`text-left p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                        isActive
                          ? 'bg-gradient-to-br from-[#03241B] via-[#064E3B] to-[#08533F] text-white border-[#D4AF37] shadow-md'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-[#C9A24D] hover:bg-[#F2F7F4]/50'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-xs font-bold ${
                              isActive ? 'text-[#F3D98B]' : 'text-[#8A6114]'
                            }`}
                          >
                            {info.subtitle}
                          </span>
                          {isActive && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#F3D98B]">
                              <Check className="h-3.5 w-3.5" />
                              กำลังเลือก
                            </span>
                          )}
                        </div>
                        <h4 className="text-xl font-black tracking-tight">{info.title}</h4>
                        <p
                          className={`text-xs leading-relaxed ${
                            isActive ? 'text-emerald-50/90' : 'text-slate-600'
                          }`}
                        >
                          {info.description}
                        </p>
                      </div>
                      <div
                        className={`pt-3 border-t text-xs font-semibold tabular-nums ${
                          isActive
                            ? 'border-[#D4AF37]/30 text-[#E6C667]'
                            : 'border-slate-100 text-slate-500'
                        }`}
                      >
                        ช่วงวัยที่รองรับ: {info.ageRangeSummary}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2 & Results Container */}
            <div className="bg-white rounded-2xl border border-[#D4AF37]/25 shadow-xs p-5 sm:p-7 space-y-6">
              {/* Age Bracket + Gender Filter Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-end pb-5 border-b border-slate-100">
                <div className="lg:col-span-7 space-y-2">
                  <label className="block text-xs font-bold text-slate-600">
                    ขั้นตอนที่ 2 · เลือกช่วงอายุในโปรแกรม {TIER_INFO[selectedTier].title}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {tierPackages.map((pkg) => {
                      const active = pkg.key === selectedProgramKey;
                      return (
                        <button
                          key={pkg.key}
                          type="button"
                          onClick={() => handleSelectPackage(pkg.key, pkg.tier)}
                          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer whitespace-nowrap ${
                            active
                              ? 'bg-[#064E3B] border-[#D4AF37]/60 text-white shadow-xs'
                              : 'bg-[#F7F9F7] border-slate-200 text-slate-700 hover:border-[#C9A24D] hover:bg-[#F2F7F4]'
                          }`}
                        >
                          {pkg.ageLabel}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-2">
                  <label className="block text-xs font-bold text-slate-600">
                    กรองรายการตรวจเฉพาะเพศ (เพื่อดูรายการที่ตรงกับคุณ)
                  </label>
                  <div className="inline-flex w-full sm:w-auto p-1 bg-[#F2F7F4] border border-[#D4AF37]/25 rounded-xl gap-1">
                    {[
                      { id: 'all', label: 'ทั้งหมด' },
                      { id: 'female', label: 'เพศหญิง' },
                      { id: 'male', label: 'เพศชาย' },
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setGenderFilter(g.id as 'all' | 'female' | 'male')}
                        className={`flex-1 sm:flex-initial px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                          genderFilter === g.id
                            ? 'bg-white text-[#064E3B] shadow-xs ring-1 ring-[#D4AF37]/35'
                            : 'text-slate-600 hover:text-[#064E3B]'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Selection Summary Banner */}
              <div className="bg-[#F2F7F4] border border-[#D4AF37]/45 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-[#8A6114] flex flex-wrap items-center gap-2">
                    <span>โปรแกรม {activePackage.tierLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span>{activePackage.ageLabel}</span>
                    {genderFilter !== 'all' && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{genderFilter === 'female' ? 'เฉพาะเพศหญิงและรายการทั่วไป' : 'เฉพาะเพศชายและรายการทั่วไป'}</span>
                      </>
                    )}
                  </div>
                  <h4 className="text-xl font-black text-[#03241B]">
                    {activePackage.tierLabel} ({activePackage.ageLabel})
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600">{activePackage.targetAudience}</p>
                </div>

                <div className="flex flex-wrap items-center gap-5 shrink-0 border-t lg:border-t-0 lg:border-l border-[#D4AF37]/30 pt-4 lg:pt-0 lg:pl-6">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">จำนวนรายการ</p>
                    <p className="text-2xl font-black text-[#03241B] font-mono tabular-nums">
                      {matchingItems.length}{' '}
                      <span className="text-xs font-sans font-semibold text-slate-600">รายการ</span>
                    </p>
                  </div>

                  <div className="border-l border-[#D4AF37]/30 pl-5">
                    <p className="text-xs text-slate-500 font-medium">ค่าบริการรวม (ปี 2570)</p>
                    <p className="text-2xl font-black text-[#8A6114] font-mono tabular-nums">
                      {matchingEstimatedTotal.toLocaleString()}{' '}
                      <span className="text-xs font-sans font-semibold text-slate-600">บาท</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      loadProgramIntoCalculator(selectedProgramKey, genderFilter, true)
                    }
                    className="inline-flex items-center gap-2 bg-[#064E3B] hover:bg-[#04392B] text-white border border-[#D4AF37]/45 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Calculator className="h-4 w-4 text-[#F3D98B] shrink-0" />
                    <span>นำไปคำนวณ / ปรับรายการเอง</span>
                  </button>
                </div>
              </div>

              {/* Categorized Test List (Easy to Read) */}
              <div className="space-y-7">
                {groupedMatchingItems.map((group) => (
                  <div key={group.id} className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 border-b border-slate-100 pb-2">
                      <div>
                        <h5 className="text-sm sm:text-base font-bold text-[#03241B]">{group.title}</h5>
                        <p className="text-xs text-slate-500">{group.subtitle}</p>
                      </div>
                      <span className="text-xs font-semibold text-[#8A6114] tabular-nums shrink-0">
                        {group.items.length} รายการ
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {group.items.map((item) => {
                        const eligibility = item.programs[selectedProgramKey];
                        return (
                          <div
                            key={item.id}
                            className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-[#F9FBF9] hover:bg-[#F2F7F4] hover:border-[#C9A24D] transition-colors"
                          >
                            <div className="bg-emerald-100 text-[#064E3B] h-6 w-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="h-3.5 w-3.5" />
                            </div>
                            <div className="space-y-1 flex-1 min-w-0">
                              <p className="font-bold text-sm text-[#0F241D]">{item.name}</p>
                              <p className="text-[11px] font-mono text-slate-500">{item.englishName}</p>
                              <p className="text-xs text-slate-600 leading-relaxed">{item.plainSummary}</p>
                              {eligibility.note && (
                                <p className="text-xs font-semibold text-[#065F46] pt-0.5 flex items-center gap-1">
                                  <UserCheck className="h-3.5 w-3.5 text-[#8A6114] shrink-0" />
                                  <span>เงื่อนไขเฉพาะกลุ่ม: {eligibility.note}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer note inside explorer */}
              <div className="bg-[#F7F9F7] border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
                <div className="flex items-start sm:items-center gap-2">
                  <Info className="h-4 w-4 text-[#064E3B] shrink-0 mt-0.5 sm:mt-0" />
                  <span>
                    รายการตรวจทั้งหมดได้รับการพิจารณาโดยแพทย์เพื่อให้สอดคล้องกับความเสี่ยงและภาวะสุขภาพของแต่ละช่วงวัย
                    {excludedCount > 0 && ` · มีอีก ${excludedCount} รายการในโปรแกรมระดับสูงกว่า`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setViewMode('compare')}
                  className="text-[#064E3B] hover:text-[#8A6114] font-bold underline cursor-pointer shrink-0 self-start sm:self-auto"
                >
                  เปรียบเทียบทุกโปรแกรม &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW MODE B: Complete Comparison Matrix Table */}
        {viewMode === 'compare' && (
          <div className="bg-white rounded-2xl border border-[#D4AF37]/30 shadow-xs overflow-hidden">
            {/* Category Filter Toolbar + Mobile Scroll Buttons */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#F2F7F4]/70">
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setCompareCategory('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    compareCategory === 'all'
                      ? 'bg-[#064E3B] text-white ring-1 ring-[#D4AF37]/40'
                      : 'bg-white border border-slate-200 text-slate-700 hover:text-[#064E3B]'
                  }`}
                >
                  ทุกหมวด ({CHECKUP_2570_ITEMS.length})
                </button>
                {CHECKUP_2570_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCompareCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                      compareCategory === cat.id
                        ? 'bg-[#064E3B] text-white ring-1 ring-[#D4AF37]/40'
                        : 'bg-white border border-slate-200 text-slate-700 hover:text-[#064E3B]'
                    }`}
                  >
                    {cat.title.replace(/^\d+\.\s*/, '')}
                  </button>
                ))}
              </div>

              <div className="lg:hidden flex items-center justify-between gap-2 pt-2 border-t border-slate-200">
                <span className="text-xs text-slate-600 font-medium">
                  เลื่อนซ้าย-ขวาเพื่อเปรียบเทียบทั้ง 3 โปรแกรม
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => scrollCompareTable('left')}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-[#064E3B] hover:bg-emerald-50 cursor-pointer"
                    aria-label="เลื่อนซ้าย"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollCompareTable('right')}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-[#064E3B] hover:bg-emerald-50 cursor-pointer"
                    aria-label="เลื่อนขวา"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Matrix Table */}
            <div
              ref={compareScrollRef}
              className="overflow-x-auto w-full overscroll-x-contain touch-pan-x"
            >
              <table className="min-w-[880px] w-full divide-y divide-slate-200 text-left">
                <thead>
                  <tr className="bg-[#03241B] text-white text-xs">
                    <th
                      rowSpan={2}
                      className="sticky left-0 z-20 bg-[#03241B] px-4 py-3.5 font-bold min-w-[260px] border-r border-[#D4AF37]/30"
                    >
                      รายการตรวจ (รายละเอียด)
                    </th>
                    <th colSpan={2} className="px-3 py-2 text-center font-bold border-b border-r border-[#D4AF37]/30 bg-[#064E3B] text-[#F3D98B]">
                      Basic
                    </th>
                    <th className="px-3 py-2 text-center font-bold border-b border-r border-[#D4AF37]/30 bg-[#0A5742] text-[#F3D98B]">
                      Standard
                    </th>
                    <th colSpan={2} className="px-3 py-2 text-center font-bold border-b border-[#D4AF37]/30 bg-[#04392B] text-[#F3D98B]">
                      Advance
                    </th>
                  </tr>
                  <tr className="bg-[#064E3B]/95 text-emerald-100 text-[11px]">
                    <th className="px-3 py-2.5 text-center font-semibold border-r border-[#D4AF37]/25 min-w-[115px]">
                      อายุน้อยกว่า 35 ปี
                    </th>
                    <th className="px-3 py-2.5 text-center font-semibold border-r border-[#D4AF37]/25 min-w-[115px]">
                      อายุมากกว่า 35 ปี
                    </th>
                    <th className="px-3 py-2.5 text-center font-semibold border-r border-[#D4AF37]/25 bg-[#0A5742]/95 min-w-[115px]">
                      อายุน้อยกว่า 30 ปี
                    </th>
                    <th className="px-3 py-2.5 text-center font-semibold border-r border-[#D4AF37]/25 bg-[#04392B]/95 min-w-[125px]">
                      อายุ 31–59 ปี
                    </th>
                    <th className="px-3 py-2.5 text-center font-semibold bg-[#04392B]/95 min-w-[130px]">
                      อายุมากกว่า 60 ปี
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs sm:text-sm bg-white">
                  {CHECKUP_2570_CATEGORIES.filter(
                    (cat) => compareCategory === 'all' || compareCategory === cat.id
                  ).map((cat) => {
                    const catItems = CHECKUP_2570_ITEMS.filter((item) => item.category === cat.id);
                    return (
                      <React.Fragment key={cat.id}>
                        <tr className="bg-[#F2F7F4]">
                          <td
                            colSpan={6}
                            className="px-4 py-2.5 font-bold text-[#03241B] text-xs sm:text-sm"
                          >
                            {cat.title}
                            <span className="font-normal text-slate-500 ml-2 text-xs">
                              — {cat.subtitle}
                            </span>
                          </td>
                        </tr>
                        {catItems.map((item) => (
                          <tr key={item.id} className="hover:bg-[#F9FBF9] transition-colors">
                            <td className="sticky left-0 z-10 bg-white px-4 py-3 border-r border-slate-100 shadow-[2px_0_6px_-2px_rgba(0,0,0,0.05)]">
                              <div className="flex items-baseline justify-between gap-2">
                                <p className="font-bold text-[#0F241D] text-xs sm:text-sm">{item.name}</p>
                                <span className="font-mono tabular-nums font-bold text-xs text-[#8A6114] whitespace-nowrap shrink-0">
                                  {item.price > 0 ? `${item.price.toLocaleString()} บ.` : 'รวมในบริการ'}
                                </span>
                              </div>
                              <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                                {item.englishName}
                              </p>
                            </td>
                            {CHECKUP_2570_PACKAGES.map((pkg) => {
                              const cell = item.programs[pkg.key];
                              return (
                                <td
                                  key={pkg.key}
                                  className={`px-3 py-3 text-center align-middle border-r last:border-r-0 border-slate-100 ${
                                    cell.included ? 'bg-emerald-50/30' : ''
                                  }`}
                                >
                                  {cell.included ? (
                                    <div className="flex flex-col items-center justify-center gap-0.5">
                                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100 text-[#064E3B]">
                                        <Check className="h-4 w-4" />
                                      </span>
                                      {cell.note && (
                                        <span className="text-[11px] font-semibold text-[#064E3B] leading-tight mt-0.5">
                                          {cell.note}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-slate-300 font-mono" aria-label="ไม่รวมในโปรแกรม">
                                      —
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-[#FBF7EC] border-t-2 border-[#D4AF37] text-xs">
                    <td className="sticky left-0 z-10 bg-[#FBF7EC] px-4 py-3.5 font-bold text-[#03241B] border-r border-[#D4AF37]/35">
                      ประมาณการค่าบริการรวม (ตามเกณฑ์ 2570)
                    </td>
                    {CHECKUP_2570_PACKAGES.map((pkg) => {
                      const maleTotal = getPackageTotalByGender(pkg.key, 'male');
                      const femaleTotal = getPackageTotalByGender(pkg.key, 'female');
                      return (
                        <td
                          key={pkg.key}
                          className="px-3 py-3 text-center border-r last:border-r-0 border-[#D4AF37]/35 space-y-1.5"
                        >
                          <div className="font-mono tabular-nums text-[#03241B] font-bold">
                            <div>ชาย {maleTotal.toLocaleString()} บ.</div>
                            <div>หญิง {femaleTotal.toLocaleString()} บ.</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => loadProgramIntoCalculator(pkg.key, 'all', true)}
                            className="text-[11px] font-bold text-[#8A6114] hover:text-[#064E3B] underline cursor-pointer whitespace-nowrap"
                          >
                            นำไปคำนวณ
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="p-4 bg-[#F7F9F7] border-t border-slate-200 text-xs text-slate-600 flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-[#064E3B] shrink-0" />
              <span>
                รายการตรวจทั้งหมดได้รับการพิจารณาโดยแพทย์เพื่อให้สอดคล้องกับความเสี่ยงและภาวะสุขภาพของแต่ละช่วงวัย
              </span>
            </div>
          </div>
        )}
      </section>

      {/* 4. Interactive 2570 Fee Schedule Self-Service Cost Calculator */}
      <section ref={calculatorSectionRef} className="space-y-6 text-left scroll-mt-6">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-[#D4AF37]/30 pb-4">
          <div className="space-y-1">
            <p className="text-xs font-bold text-[#8A6114]">
              อัตราค่าบริการอ้างอิง · รายการตรวจสุขภาพ ประจำปี 2570
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-[#03241B] tracking-tight flex items-center gap-2.5 text-balance">
              <Calculator className="h-6 w-6 text-[#065F46] shrink-0" />
              <span>อัตราค่าบริการและคำนวณค่าใช้จ่ายด้วยตัวเอง</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              ผู้รับบริการสามารถเลือกชุดโปรแกรมแนะนำ หรือเลือกรายการตรวจที่ต้องการจากอัตราค่าบริการ 35 รายการ เพื่อทราบยอดรวมค่าใช้จ่ายล่วงหน้า
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 shrink-0">
            <span className="font-mono tabular-nums font-bold text-[#064E3B]">
              ทั้งหมด {FEE_SCHEDULE_2570_ITEMS.length} รายการ
            </span>
            <span aria-hidden="true">·</span>
            <span>ตรวจร่างกายโดยแพทย์รวมในบริการ</span>
          </div>
        </div>

        {/* Quick-Load Program Presets & Gender Filter */}
        <div className="bg-[#F2F7F4] border border-[#D4AF37]/40 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-[#03241B]">
                ทางลัด: โหลดรายการตรวจจากโปรแกรม 2570 แล้วปรับแต่งเพิ่ม/ลดเองได้
              </p>
              <p className="text-xs text-slate-600">
                เลือกเพศที่ต้องการกรอง แล้วคลิกโปรแกรมเพื่อดึงรายการเข้ามาคำนวณทันที
              </p>
            </div>

            <div className="inline-flex p-1 bg-white border border-[#D4AF37]/30 rounded-xl gap-1 self-start md:self-auto shrink-0">
              {[
                { id: 'all', label: 'ทุกเพศ' },
                { id: 'female', label: 'เพศหญิง' },
                { id: 'male', label: 'เพศชาย' },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => handleFeeGenderChange(g.id as 'all' | 'female' | 'male')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    feeGenderFilter === g.id
                      ? 'bg-[#064E3B] text-white'
                      : 'text-slate-600 hover:text-[#064E3B]'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {CHECKUP_2570_PACKAGES.map((pkg) => {
              const presetText = `${pkg.tierLabel} (${pkg.shortAgeLabel})`;
              const isPresetActive = activePresetLabel === presetText;
              const estPrice = getPackageTotalByGender(pkg.key, feeGenderFilter);
              return (
                <button
                  key={pkg.key}
                  type="button"
                  onClick={() => loadProgramIntoCalculator(pkg.key, feeGenderFilter, false)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center gap-2 ${
                    isPresetActive
                      ? 'bg-[#064E3B] border-[#D4AF37] text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-[#C9A24D] hover:text-[#064E3B]'
                  }`}
                >
                  <span>{presetText}</span>
                  <span
                    className={`font-mono tabular-nums text-[11px] ${
                      isPresetActive ? 'text-[#F3D98B]' : 'text-[#8A6114]'
                    }`}
                  >
                    {estPrice.toLocaleString()} บ.
                  </span>
                </button>
              );
            })}

            {selectedFeeIds.length > 0 && (
              <button
                type="button"
                onClick={clearCalculator}
                className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>ล้างรายการที่เลือก</span>
              </button>
            )}
          </div>
        </div>

        {/* Two-Column Calculator Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Search + Category Filter + Selectable 35 Fee Items */}
          <div className="lg:col-span-8 space-y-4">
            {/* Search & Category Controls */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3.5">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={feeSearchQuery}
                    onChange={(e) => setFeeSearchQuery(e.target.value)}
                    placeholder="ค้นหารายการตรวจ เช่น เบาหวาน, ไทรอยด์, มะเร็ง, EKG, อัลตราซาวด์..."
                    aria-label="ค้นหารายการตรวจสุขภาพ"
                    className="w-full pl-10 pr-9 py-2.5 text-sm bg-[#F7F9F7] border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#065F46] focus:bg-white transition-colors"
                  />
                  {feeSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setFeeSearchQuery('')}
                      aria-label="ล้างคำค้นหา"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {filteredFeeItems.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSelectAllVisible}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#D4AF37]/40 bg-[#FBF7EC] hover:bg-[#F2F7F4] hover:border-[#065F46] text-xs font-bold text-[#064E3B] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5 text-[#8A6114]" />
                    <span>เลือกทั้งหมดที่แสดง ({filteredFeeItems.length})</span>
                  </button>
                )}
              </div>

              {/* Category Filter Buttons */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setFeeCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    feeCategoryFilter === 'all'
                      ? 'bg-[#064E3B] text-white'
                      : 'bg-[#F2F7F4] text-slate-700 hover:text-[#064E3B] hover:bg-emerald-50'
                  }`}
                >
                  ทั้งหมด ({FEE_SCHEDULE_2570_ITEMS.length})
                </button>
                {FEE_SCHEDULE_2570_CATEGORIES.map((cat) => {
                  const count = FEE_SCHEDULE_2570_ITEMS.filter(
                    (i) => i.category === cat.id
                  ).length;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFeeCategoryFilter(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        feeCategoryFilter === cat.id
                          ? 'bg-[#064E3B] text-white'
                          : 'bg-[#F2F7F4] text-slate-700 hover:text-[#064E3B] hover:bg-emerald-50'
                      }`}
                    >
                      {cat.label} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Items Grid */}
            {filteredFeeItems.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3">
                <p className="text-sm font-bold text-slate-800">
                  ไม่พบรายการตรวจที่ตรงกับเงื่อนไขการค้นหา
                </p>
                <p className="text-xs text-slate-500">
                  ลองเปลี่ยนคำค้นหา หรือเลือกดูรายการตรวจทั้งหมด
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFeeSearchQuery('');
                    setFeeCategoryFilter('all');
                    setFeeGenderFilter('all');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#064E3B] text-white text-xs font-bold hover:bg-[#04392B] transition-colors cursor-pointer"
                >
                  แสดงรายการทั้งหมด
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredFeeItems.map((item) => {
                  const isSelected = selectedFeeIds.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => toggleFeeItem(item.id)}
                      className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 min-h-[96px] ${
                        isSelected
                          ? 'bg-[#F2F7F4] border-[#065F46] ring-1 ring-[#D4AF37]/60 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-[#C9A24D] hover:bg-[#F9FBF9]'
                      }`}
                    >
                      <span
                        className={`mt-0.5 h-5 w-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-[#064E3B] border-[#064E3B] text-[#F3D98B]'
                            : 'bg-white border-slate-300 text-transparent'
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </span>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <h4 className="font-bold text-sm text-[#03241B] leading-snug">
                            {item.name}
                          </h4>
                          <span className="font-mono tabular-nums font-bold text-sm text-[#8A6114] whitespace-nowrap shrink-0">
                            {item.price.toLocaleString()} บาท
                          </span>
                        </div>

                        <div className="text-[11px] font-mono text-slate-500 flex flex-wrap items-center gap-1.5">
                          <span>{item.englishName}</span>
                          {item.genderHint && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-sans font-semibold text-[#065F46]">
                                {item.genderHint === 'female' ? 'เฉพาะเพศหญิง' : 'เฉพาะเพศชาย'}
                              </span>
                            </>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Live Expense Calculation Summary Panel */}
          <aside className="lg:col-span-4 lg:sticky lg:top-6 bg-white border border-[#D4AF37]/40 rounded-2xl shadow-xs overflow-hidden">
            <div className="bg-gradient-to-br from-[#03241B] via-[#064E3B] to-[#04392B] text-white p-5 space-y-2 border-b border-[#D4AF37]/45">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#F3D98B]">
                  สรุปประมาณการค่าใช้จ่าย
                </span>
                {activePresetLabel && (
                  <span className="text-[11px] font-semibold text-[#E6C667] truncate">
                    ชุด {activePresetLabel}
                  </span>
                )}
              </div>

              <div className="flex items-baseline justify-between gap-3 pt-1">
                <div>
                  <p className="text-xs text-emerald-100/80">ยอดรวมค่าบริการ</p>
                  <p className="text-3xl font-black font-mono tabular-nums tracking-tight text-white">
                    {calculatorTotalCost.toLocaleString()}{' '}
                    <span className="text-sm font-sans font-semibold text-[#F3D98B]">บาท</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-emerald-100/80">รายการที่เลือก</p>
                  <p className="text-lg font-bold font-mono tabular-nums text-[#F3D98B]">
                    {selectedFeeItems.length} รายการ
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {selectedFeeItems.length === 0 ? (
                <div className="py-6 text-center space-y-2 border border-dashed border-[#D4AF37]/45 rounded-xl bg-[#F7F9F7] px-4">
                  <Calculator className="h-6 w-6 text-[#8A6114] mx-auto" />
                  <p className="text-sm font-bold text-[#03241B]">ยังไม่ได้เลือกรายการตรวจ</p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    คลิกเลือกรายการตรวจทางด้านซ้าย หรือกดปุ่มโปรแกรมด้านบนเพื่อคำนวณค่าใช้จ่ายอัตโนมัติ
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-700">รายการที่เลือกไว้</span>
                    <button
                      type="button"
                      onClick={clearCalculator}
                      className="inline-flex items-center gap-1 text-slate-500 hover:text-red-600 font-semibold cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>ล้างทั้งหมด</span>
                    </button>
                  </div>

                  <ul className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
                    {selectedFeeItems.map((item, idx) => (
                      <li
                        key={item.id}
                        className="py-2 flex items-start justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-800 leading-snug">
                            <span className="font-mono tabular-nums text-slate-400 mr-1.5">
                              {idx + 1}.
                            </span>
                            {item.name}
                          </p>
                          <p className="text-[11px] font-mono text-slate-400 truncate">
                            {item.englishName}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono tabular-nums font-bold text-[#064E3B]">
                            {item.price.toLocaleString()} บ.
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleFeeItem(item.id)}
                            aria-label={`นำ ${item.name} ออก`}
                            className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Notes & Disclaimer */}
              <div className="bg-[#F7F9F7] border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-xs text-slate-600 leading-relaxed">
                <p className="font-bold text-[#03241B] flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-[#8A6114] shrink-0" />
                  <span>หมายเหตุอัตราค่าบริการ ปี 2570</span>
                </p>
                <p>• การตรวจร่างกายและให้คำปรึกษาโดยแพทย์ไม่มีค่าใช้จ่ายเพิ่มเติม</p>
                <p>
                  • สิทธิข้าราชการเบิกจ่ายตรง เบิกได้ตามเกณฑ์อายุและรายการที่กรมบัญชีกลางกำหนด
                </p>
                <p>
                  • ยอดรวมนี้เป็นการประมาณการเบื้องต้น ณ วันเข้ารับบริการจริงอาจมีการปรับรายการตามดุลยพินิจของแพทย์
                </p>
              </div>

              {onGoToPatientPortal && (
                <button
                  type="button"
                  onClick={onGoToPatientPortal}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#064E3B] to-[#047857] hover:from-[#04392B] hover:to-[#065F46] text-white border border-[#D4AF37]/45 font-bold text-sm px-4 py-3 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span>ลงทะเบียน / จองคิวตรวจสุขภาพ</span>
                  <ArrowRight className="h-4 w-4 text-[#F3D98B] shrink-0" />
                </button>
              )}
            </div>
          </aside>
        </div>
      </section>

      {/* 5. Hospital Contact & Appointment CTA */}
      <section className="bg-[#F2F7F4] p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/40 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[#03241B]">
            <ShieldCheck className="h-5 w-5 text-[#8A6114] shrink-0" />
            <h4 className="text-lg font-black">งานตรวจสุขภาพ โรงพยาบาลมหาวิทยาลัยอุบลราชธานี</h4>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            ให้บริการตรวจสุขภาพเชิงรุกและให้คำปรึกษาพฤติกรรมสุขภาพตามแนวทางเวชศาสตร์วิถีชีวิต (Lifestyle Medicine)
            เพื่อช่วยปรับพฤติกรรม ป้องกันความเจ็บป่วยเรื้อรัง และสร้างสุขภาวะที่ดีอย่างยั่งยืน
          </p>
          <div className="flex items-start gap-2 text-xs text-slate-600 pt-1">
            <MapPin className="h-4 w-4 text-[#064E3B] shrink-0 mt-0.5" />
            <span>85 ถนนสถลมาร์ค ตำบลเมืองศรีไค อำเภอวารินชำราบ จังหวัดอุบลราชธานี 34190</span>
          </div>
        </div>

        <div className="space-y-4 md:border-l md:pl-8 md:border-[#D4AF37]/30 flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="text-base font-bold text-[#03241B]">ช่องทางการติดต่อและจองคิวตรวจ</h4>
            <div className="space-y-2 text-sm text-slate-700">
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-[#064E3B] shrink-0" />
                <span className="tabular-nums">045-353-909 ต่อ 7036 (วันราชการ 08:00 – 15:30 น.)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-[#064E3B] shrink-0" />
                <span className="font-mono text-xs">primarycareunit.ubuh@ubu.ac.th</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#03241B] font-semibold pt-1">
                <Clock className="h-4 w-4 text-[#8A6114] shrink-0" />
                <span>กรุณาติดต่อจองคิวตรวจล่วงหน้าอย่างน้อย 3 วันทำการ</span>
              </div>
            </div>
          </div>

          {onGoToPatientPortal && (
            <div>
              <button
                type="button"
                onClick={onGoToPatientPortal}
                className="inline-flex items-center gap-2 bg-[#064E3B] hover:bg-[#04392B] text-white border border-[#D4AF37]/40 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                <span>เข้าสู่ระบบผู้รับบริการเพื่อจองคิว</span>
                <ArrowRight className="h-4 w-4 text-[#F3D98B]" />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
