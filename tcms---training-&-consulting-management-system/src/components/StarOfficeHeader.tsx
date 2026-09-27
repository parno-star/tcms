import React, { useState } from 'react';
import {
  Menu,
  Globe,
  ChevronDown,
  Search,
  Bell,
  MoreVertical,
  RefreshCw,
  CheckCircle2,
  Building,
  Building2,
  Shield,
  LogOut,
  User,
  Settings,
  UserCheck,
  FlaskConical,
  Activity,
  GraduationCap,
  Award,
  Layout,
  Sparkles,
} from 'lucide-react';
import { UserRole, Employee, Organization } from '../types';
import { USER_ROLES, GLOBAL_ALL_ORGANIZATION } from '../data/initialData';

interface StarOfficeHeaderProps {
  onToggleSidebar: () => void;
  activeRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  currentEmployee: Employee;
  onOpenDirectory: () => void;
  onOpenTrainers?: () => void;
  onOpenExperts?: () => void;
  onOpenProfile?: () => void;
  onResetCaseStudy: () => void;
  currentProjectCode: string;
  onTriggerAiOptimizer?: () => void;
  activeOrganization?: Organization;
  organizations?: Organization[];
  onSelectOrganization?: (org: Organization) => void;
  onOpenUserManagement?: () => void;
  onLogout?: () => void;
  isSimulationMode?: boolean;
  onToggleSimulationMode?: (active: boolean) => void;
  layoutTheme?: 'classic' | 'modern' | 'flat';
  onToggleLayoutTheme?: () => void;
}

export const StarOfficeHeader: React.FC<StarOfficeHeaderProps> = ({
  onToggleSidebar,
  activeRole,
  onSelectRole,
  currentEmployee,
  onOpenDirectory,
  onOpenTrainers,
  onOpenExperts,
  onOpenProfile,
  onResetCaseStudy,
  currentProjectCode,
  onTriggerAiOptimizer,
  activeOrganization,
  organizations = [],
  onSelectOrganization,
  onOpenUserManagement,
  onLogout,
  isSimulationMode = false,
  onToggleSimulationMode,
  layoutTheme = 'classic',
  onToggleLayoutTheme,
}) => {
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200/90 sticky top-0 z-30 select-none">
      <div className="h-14 px-4 lg:px-6 flex items-center justify-between gap-4">
        
        {/* Left: Toggle & Organization Dropdown */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Org Selector with Multi-Tenant SaaS support */}
          <div className="relative">
            <button
              onClick={() => setShowOrgDropdown(!showOrgDropdown)}
              className="flex items-center space-x-2 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs transition cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-teal-600" />
              <span className="font-semibold text-[12px] truncate max-w-[180px]">
                {!isSimulationMode
                  ? '🌐 Semua Organisasi (Global)'
                  : (activeOrganization ? activeOrganization.name : 'PT Star Office Solusi')}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showOrgDropdown && (
              <div className="absolute left-0 mt-1.5 w-72 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs animate-fade-in">
                
                {/* Global Option */}
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  ORGANISASI UTAMA
                </div>
                <button
                  onClick={() => {
                    setShowOrgDropdown(false);
                    if (onSelectOrganization) onSelectOrganization(GLOBAL_ALL_ORGANIZATION);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-purple-50/70 flex items-center justify-between transition ${
                    !isSimulationMode || activeOrganization?.id_organization === 'global-all'
                      ? 'font-bold text-purple-950 bg-purple-50'
                      : 'text-slate-800'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="truncate font-extrabold flex items-center gap-1.5 text-purple-900">
                      <span>🌐 Semua Organisasi (Global)</span>
                    </div>
                    <div className="text-[10px] text-purple-700 font-mono">Konsol Akses Multi-Tenant Super Admin</div>
                  </div>
                  {(!isSimulationMode || activeOrganization?.id_organization === 'global-all') && (
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                  )}
                </button>

                {/* Condition: Show institution list ONLY when Moda Training is active */}
                {isSimulationMode ? (
                  <>
                    {/* Garis Pemisah Antara Label Global dengan Organisasi */}
                    <div className="my-1.5 border-b border-slate-200" />

                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>LEMBAGA (MODA TRAINING)</span>
                      <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-extrabold border border-amber-200">MODA TRAINING</span>
                    </div>

                    {organizations.map((org) => {
                      const isSelected = activeOrganization?.id_organization === org.id_organization;
                      return (
                        <button
                          key={org.id_organization}
                          onClick={() => {
                            setShowOrgDropdown(false);
                            if (onSelectOrganization) onSelectOrganization(org);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-teal-50/60 flex items-center justify-between transition ${
                            isSelected ? 'font-bold text-teal-900 bg-teal-50' : 'text-slate-700'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <div className="truncate font-semibold">{org.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">id: {org.id_organization} • {org.tier}</div>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </>
                ) : (
                  <div className="mt-2 p-2 bg-slate-50 border-t border-slate-200 text-center rounded-b-xl text-[10px] font-medium text-slate-400">
                    Moda Training nonaktif (Kelola dari Panel Super Admin)
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Center: Search input */}
        <div className="flex-1 max-w-lg hidden sm:block">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari Proyek Pelatihan, Silabus, Master Trainer, No. SPH/PO..."
              className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl pl-9 pr-12 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition shadow-2xs"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center space-x-1 text-[10px] text-slate-400 font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
              <span>⌘</span>
              <span>K</span>
            </div>
          </div>
        </div>

        {/* Right: Notifications & More Menu */}
        <div className="flex items-center space-x-2">

          {/* Layout Style Toggle: Classic vs Modern vs Sleek Flat */}
          {onToggleLayoutTheme && (
            <button
              onClick={onToggleLayoutTheme}
              className={`px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition text-xs font-bold shadow-2xs border ${
                layoutTheme === 'modern'
                  ? 'bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 text-white border-teal-500/30'
                  : layoutTheme === 'flat'
                  ? 'bg-slate-950 text-white border-slate-900'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
              title={
                layoutTheme === 'classic'
                  ? 'Coba Tema Modern Minimalis'
                  : layoutTheme === 'modern'
                  ? 'Coba Tema Sleek Ultra-Flat'
                  : 'Kembali ke Tema Klasik e-Office'
              }
            >
              <Layout className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {layoutTheme === 'modern' ? 'Tema Modern ✨' : layoutTheme === 'flat' ? 'Tema Flat 🕊️' : 'Tema Klasik 🏛️'}
              </span>
            </button>
          )}

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => onOpenDirectory()}
              className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 transition cursor-pointer relative"
              title="Notifikasi & Tugas"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-teal-600 text-white text-[9.5px] font-bold flex items-center justify-center leading-none">
                7
              </span>
            </button>
          </div>

          {/* More options 3-dots */}
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 transition cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMoreMenu && (
              <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs animate-fade-in">
                {onOpenProfile && (
                  <button
                    onClick={() => {
                      setShowMoreMenu(false);
                      onOpenProfile();
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center space-x-2 text-slate-700 font-semibold"
                  >
                    <User className="w-3.5 h-3.5 text-teal-600" />
                    <span>Data Profil Saya</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    onResetCaseStudy();
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center space-x-2 text-slate-700"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Reset Kasus Demo</span>
                </button>
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    onOpenDirectory();
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center space-x-2 text-slate-700"
                >
                  <Building className="w-3.5 h-3.5 text-slate-500" />
                  <span>Direktori Karyawan</span>
                </button>

                {onOpenTrainers && (
                  <button
                    onClick={() => {
                      setShowMoreMenu(false);
                      onOpenTrainers();
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center space-x-2 text-slate-700"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-teal-600" />
                    <span>Direktori Fasilitator & Trainer</span>
                  </button>
                )}

                {onOpenExperts && (
                  <button
                    onClick={() => {
                      setShowMoreMenu(false);
                      onOpenExperts();
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center space-x-2 text-slate-700"
                  >
                    <Award className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Direktori Expert & Tenaga Ahli</span>
                  </button>
                )}

                {onLogout && (
                  <div className="pt-1 mt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setShowMoreMenu(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-rose-50 flex items-center space-x-2 text-rose-600 font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>Ganti Akun / Keluar Sesi</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
