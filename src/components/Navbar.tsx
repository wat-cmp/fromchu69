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
      {/* Top Blue-Cyan Utility Bar (แถบข้อมูลโรงพยาบาลด้านบน) */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-sky-900 text-white text-[11px] py-1.5 px-4 sm:px-6 border-b border-sky-800/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1">
            <span className="flex items-center space-x-1 text-sky-200">
              <Clock className="h-3 w-3 text-sky-400" />
              <span>เปิดบริการ: วันจันทร์ - ศุกร์ 08:00 - 15:30 น.</span>
            </span>
            <span className="hidden sm:inline-block text-sky-500">•</span>
            <span className="flex items-center space-x-1 text-sky-200">
              <Phone className="h-3 w-3 text-sky-400" />
              <span>สายด่วนตรวจสุขภาพ: 045-353-909ต่อ 7036</span>
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sky-200 text-[10px]">
            <span className="bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded border border-sky-400/30 font-medium">
              โรงพยาบาลมหาวิทยาลัยอุบลราชธานี
            </span>
            <span>ระบบศูนย์ตรวจสุขภาพ & เวชศาสตร์วิถีชีวิต</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo & Brand */}
            <div
              className="flex items-center space-x-3.5 cursor-pointer group"
              onClick={() => setActiveTab('info')}
            >
              <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 text-white p-2.5 rounded-2xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Stethoscope className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold tracking-widest text-sky-600 uppercase block font-mono">
                  UBUH Health Checkup
                </span>
                <h1 className="text-base sm:text-lg font-extrabold text-blue-950 tracking-tight leading-tight group-hover:text-blue-700 transition-colors">
                  ศูนย์ตรวจสุขภาพ รพ.มหาวิทยาลัยอุบลราชธานี
                </h1>
              </div>
            </div>

            {/* Nav Ribbon Links (แถบเมนูนำทางสีน้ำเงิน-ฟ้า) */}
            <nav className="hidden md:flex space-x-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
                  activeTab === 'info'
                    ? 'bg-gradient-to-r from-blue-700 to-sky-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-600 hover:text-blue-700 hover:bg-white/80'
                }`}
              >
                <Activity className="h-3.5 w-3.5" />
                <span>ข้อมูลและโปรแกรมตรวจ</span>
              </button>

              <button
                onClick={() => setActiveTab('patient')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
                  activeTab === 'patient'
                    ? 'bg-gradient-to-r from-blue-700 to-sky-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-600 hover:text-blue-700 hover:bg-white/80'
                }`}
              >
                <User className="h-3.5 w-3.5" />
                <span>สำหรับผู้รับบริการ</span>
              </button>

              <button
                onClick={() => setActiveTab('staff')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
                  activeTab === 'staff'
                    ? 'bg-gradient-to-r from-blue-700 to-sky-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-600 hover:text-blue-700 hover:bg-white/80'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>เจ้าหน้าที่และแพทย์</span>
              </button>
            </nav>

            {/* User Profile / Logout status */}
            <div className="flex items-center space-x-3">
              {isLoggedIn && (
                <div className="hidden sm:flex items-center space-x-3 bg-sky-50/80 border border-sky-200/80 px-3.5 py-1.5 rounded-xl shadow-3xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-blue-900">{loggedInPatientName}</span>
                  <button
                    onClick={onLogout}
                    className="text-xs font-bold text-rose-600 hover:text-rose-800 border-l border-sky-200 pl-3 transition-colors cursor-pointer"
                  >
                    ออกจากระบบ
                  </button>
                </div>
              )}

              {isStaffLoggedIn && (
                <div className="hidden sm:flex items-center space-x-3 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-xl shadow-3xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></div>
                  <span className="text-xs font-bold text-blue-950">เจ้าหน้าที่ / แพทย์</span>
                  <button
                    onClick={onStaffLogout}
                    className="text-xs font-bold text-rose-600 hover:text-rose-800 border-l border-blue-200 pl-3 transition-colors cursor-pointer"
                  >
                    ออกจากระบบ
                  </button>
                </div>
              )}

              {/* Mobile Nav Trigger buttons */}
              <div className="md:hidden flex space-x-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`p-2 rounded-lg text-xs font-bold ${
                    activeTab === 'info' ? 'bg-gradient-to-r from-blue-700 to-sky-600 text-white' : 'text-slate-600'
                  }`}
                  title="ข้อมูล"
                >
                  <Activity className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setActiveTab('patient')}
                  className={`p-2 rounded-lg text-xs font-bold ${
                    activeTab === 'patient' ? 'bg-gradient-to-r from-blue-700 to-sky-600 text-white' : 'text-slate-600'
                  }`}
                  title="ผู้รับบริการ"
                >
                  <User className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setActiveTab('staff')}
                  className={`p-2 rounded-lg text-xs font-bold ${
                    activeTab === 'staff' ? 'bg-gradient-to-r from-blue-700 to-sky-600 text-white' : 'text-slate-600'
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
