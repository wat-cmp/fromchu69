import React from 'react';
import { Activity, ShieldCheck, User, Stethoscope, Clock, Phone, MapPin, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: 'info' | 'patient' | 'staff';
  setActiveTab: (tab: 'info' | 'patient' | 'staff') => void;
  isLoggedIn: boolean;
  loggedInPatientName?: string;
  onLogout: () => void;
  isStaffLoggedIn: boolean;
  onStaffLogout: () => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  isLoggedIn,
  loggedInPatientName,
  onLogout,
  isStaffLoggedIn,
  onStaffLogout,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 no-print shadow-sm">
      {/* Top Emerald-Gold Utility Bar */}
      <div className="bg-gradient-to-r from-[#03241B] via-[#064E3B] to-[#04392B] text-white text-[11px] py-1.5 px-4 sm:px-6 border-b border-[#D4AF37]/35">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1">
            <span className="flex items-center space-x-1.5 text-emerald-100">
              <Clock className="h-3 w-3 text-[#E6C667]" />
              <span>เปิดบริการ: วันจันทร์ - ศุกร์ 08:00 - 15:30 น.</span>
            </span>
            <span className="hidden sm:inline-block text-[#D4AF37]/60">·</span>
            <span className="flex items-center space-x-1.5 text-emerald-100">
              <Phone className="h-3 w-3 text-[#E6C667]" />
              <span>สายด่วนตรวจสุขภาพ: 045-353-909 ต่อ 7036</span>
            </span>
          </div>
          <div className="flex items-center space-x-2 text-emerald-100/90 text-[10px]">
            <span className="text-[#F3D98B] font-semibold">
              โรงพยาบาลมหาวิทยาลัยอุบลราชธานี
            </span>
            <span className="text-[#D4AF37]/60" aria-hidden="true">·</span>
            <span>ระบบศูนย์ตรวจสุขภาพ & เวชศาสตร์วิถีชีวิต</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="bg-white/95 backdrop-blur-md border-b border-[#D4AF37]/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo & Brand */}
            <div
              className="flex items-center space-x-3.5 cursor-pointer group"
              onClick={() => setActiveTab('info')}
            >
              <div className="bg-gradient-to-br from-[#03241B] via-[#064E3B] to-[#065F46] text-[#F3D98B] p-2.5 rounded-2xl shadow-md shadow-emerald-950/20 ring-1 ring-[#D4AF37]/50 group-hover:scale-105 transition-transform">
                <Stethoscope className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold tracking-widest text-[#8A6114] uppercase block font-mono">
                  UBUH Health Checkup
                </span>
                <h1 className="text-base sm:text-lg font-extrabold text-[#03241B] tracking-tight leading-tight group-hover:text-emerald-800 transition-colors">
                  ศูนย์ตรวจสุขภาพ รพ.มหาวิทยาลัยอุบลราชธานี
                </h1>
              </div>
            </div>

            {/* Nav Ribbon Links */}
            <nav className="hidden md:flex space-x-1.5 bg-[#F2F7F4] p-1.5 rounded-2xl border border-[#D4AF37]/25">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === 'info'
                    ? 'bg-gradient-to-r from-[#064E3B] to-[#047857] text-white shadow-sm ring-1 ring-[#D4AF37]/45'
                    : 'text-slate-700 hover:text-[#064E3B] hover:bg-white/80'
                }`}
              >
                <Activity className={`h-3.5 w-3.5 ${activeTab === 'info' ? 'text-[#F3D98B]' : ''}`} />
                <span>ข้อมูลและโปรแกรมตรวจ</span>
              </button>

              <button
                onClick={() => setActiveTab('patient')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === 'patient'
                    ? 'bg-gradient-to-r from-[#064E3B] to-[#047857] text-white shadow-sm ring-1 ring-[#D4AF37]/45'
                    : 'text-slate-700 hover:text-[#064E3B] hover:bg-white/80'
                }`}
              >
                <User className={`h-3.5 w-3.5 ${activeTab === 'patient' ? 'text-[#F3D98B]' : ''}`} />
                <span>สำหรับผู้รับบริการ</span>
              </button>

              <button
                onClick={() => setActiveTab('staff')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === 'staff'
                    ? 'bg-gradient-to-r from-[#064E3B] to-[#047857] text-white shadow-sm ring-1 ring-[#D4AF37]/45'
                    : 'text-slate-700 hover:text-[#064E3B] hover:bg-white/80'
                }`}
              >
                <ShieldCheck className={`h-3.5 w-3.5 ${activeTab === 'staff' ? 'text-[#F3D98B]' : ''}`} />
                <span>เจ้าหน้าที่และแพทย์</span>
              </button>
            </nav>

            {/* User Profile / Logout status */}
            <div className="flex items-center space-x-3">
              {isLoggedIn && (
                <div className="hidden sm:flex items-center space-x-3 bg-[#F2F7F4] border border-[#D4AF37]/40 px-3.5 py-1.5 rounded-xl">
                  <span className="text-xs font-bold text-[#064E3B]">{loggedInPatientName}</span>
                  <button
                    onClick={onLogout}
                    className="text-xs font-bold text-rose-700 hover:text-rose-900 border-l border-[#D4AF37]/30 pl-3 transition-colors cursor-pointer"
                  >
                    ออกจากระบบ
                  </button>
                </div>
              )}

              {isStaffLoggedIn && (
                <div className="hidden sm:flex items-center space-x-3 bg-[#FBF7EC] border border-[#D4AF37]/50 px-3.5 py-1.5 rounded-xl">
                  <span className="text-xs font-bold text-[#03241B]">เจ้าหน้าที่ / แพทย์</span>
                  <button
                    onClick={onStaffLogout}
                    className="text-xs font-bold text-rose-700 hover:text-rose-900 border-l border-[#D4AF37]/40 pl-3 transition-colors cursor-pointer"
                  >
                    ออกจากระบบ
                  </button>
                </div>
              )}

              {/* Mobile Nav Trigger buttons */}
              <div className="md:hidden flex space-x-1 bg-[#F2F7F4] p-1 rounded-xl border border-[#D4AF37]/25">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`p-2 rounded-lg text-xs font-bold ${
                    activeTab === 'info' ? 'bg-gradient-to-r from-[#064E3B] to-[#047857] text-[#F3D98B]' : 'text-slate-600'
                  }`}
                  title="ข้อมูล"
                >
                  <Activity className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setActiveTab('patient')}
                  className={`p-2 rounded-lg text-xs font-bold ${
                    activeTab === 'patient' ? 'bg-gradient-to-r from-[#064E3B] to-[#047857] text-[#F3D98B]' : 'text-slate-600'
                  }`}
                  title="ผู้รับบริการ"
                >
                  <User className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setActiveTab('staff')}
                  className={`p-2 rounded-lg text-xs font-bold ${
                    activeTab === 'staff' ? 'bg-gradient-to-r from-[#064E3B] to-[#047857] text-[#F3D98B]' : 'text-slate-600'
                  }`}
                  title="เจ้าหน้าที่"
                >
                  <ShieldCheck className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
