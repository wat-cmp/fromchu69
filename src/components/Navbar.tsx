import React from 'react';
import { Activity, ShieldCheck, User, Stethoscope, Clock, MapPin } from 'lucide-react';

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
    <header className="bg-white border-b border-[#E0E4D9] shadow-sm sticky top-0 z-40 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('info')}>
            <div className="bg-[#4A6741] text-white p-2.5 rounded-2xl shadow-md shadow-[#4A6741]/10">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-semibold tracking-wider text-[#4A6741] uppercase block font-mono">
                UBUH Checkup Center
              </span>
              <h1 className="text-lg font-bold text-[#4A6741] tracking-tight leading-none">
                ศูนย์ตรวจสุขภาพ รพ.มหาวิทยาลัยอุบลราชธานี
              </h1>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex space-x-1 bg-[#F2F4ED] p-1.5 rounded-xl border border-[#E0E4D9]">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'info'
                  ? 'bg-[#4A6741] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#4A6741] hover:bg-white'
              }`}
            >
              ข้อมูลและโปรแกรมตรวจ
            </button>
            <button
              onClick={() => setActiveTab('patient')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'patient'
                  ? 'bg-[#4A6741] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#4A6741] hover:bg-white'
              }`}
            >
              <span className="flex items-center space-x-1.5">
                <User className="h-4 w-4" />
                <span>สำหรับผู้รับบริการ</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'staff'
                  ? 'bg-[#4A6741] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#4A6741] hover:bg-white'
              }`}
            >
              <span className="flex items-center space-x-1.5">
                <ShieldCheck className="h-4 w-4" />
                <span>เจ้าหน้าที่และแพทย์</span>
              </span>
            </button>
          </nav>

          {/* User Profile / Logout status */}
          <div className="flex items-center space-x-3">
            {isLoggedIn && (
              <div className="hidden sm:flex items-center space-x-3 bg-[#F2F4ED] border border-[#E0E4D9] px-3 py-1.5 rounded-xl">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-semibold text-[#4A6741]">{loggedInPatientName}</span>
                <button
                  onClick={onLogout}
                  className="text-xs font-bold text-red-600 hover:text-red-800 border-l border-[#D0D4C9] pl-3 transition-colors"
                >
                  ออกจากระบบ
                </button>
              </div>
            )}

            {isStaffLoggedIn && (
              <div className="hidden sm:flex items-center space-x-3 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-xl">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></div>
                <span className="text-xs font-semibold text-amber-900">เจ้าหน้าที่ / แพทย์</span>
                <button
                  onClick={onStaffLogout}
                  className="text-xs font-bold text-red-600 hover:text-red-800 border-l border-amber-200 pl-3 transition-colors"
                >
                  ออกจากระบบ
                </button>
              </div>
            )}

            {/* Mobile Nav Trigger icon representation */}
            <div className="md:hidden flex space-x-1">
              <button
                onClick={() => setActiveTab('info')}
                className={`p-2 rounded-lg ${activeTab === 'info' ? 'bg-[#F2F4ED] text-[#4A6741]' : 'text-slate-500'}`}
                title="ข้อมูล"
              >
                <Activity className="h-5 w-5" />
              </button>
              <button
                onClick={() => setActiveTab('patient')}
                className={`p-2 rounded-lg ${activeTab === 'patient' ? 'bg-[#F2F4ED] text-[#4A6741]' : 'text-slate-500'}`}
                title="ผู้รับบริการ"
              >
                <User className="h-5 w-5" />
              </button>
              <button
                onClick={() => setActiveTab('staff')}
                className={`p-2 rounded-lg ${activeTab === 'staff' ? 'bg-[#F2F4ED] text-[#4A6741]' : 'text-slate-500'}`}
                title="เจ้าหน้าที่"
              >
                <ShieldCheck className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
