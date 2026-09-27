import React from 'react';
import { UserRole, Employee, MenuAccessSetting } from '../types';
import { DEFAULT_MENU_ACCESS_SETTINGS } from '../data/initialData';
import {
  Home,
  LayoutDashboard,
  Calendar,
  FileText,
  User,
  Users,
  TrendingUp,
  Sliders,
  CreditCard,
  CheckCircle2,
  BookOpen,
  Building2,
  SlidersHorizontal,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Shield,
  ShieldCheck,
  Wallet,
  Sparkles,
  FlaskConical,
  RefreshCw,
  XCircle,
  Settings,
  FileSignature,
  GraduationCap,
  Award,
} from 'lucide-react';

export type NavigationTab =
  | 'beranda'
  | 'proposal'
  | 'dashboard'
  | 'silabus'
  | 'kalender'
  | 'surat'
  | 'ruangsaya'
  | 'negotiation'
  | 'estimator'
  | 'rap'
  | 'execution'
  | 'kasbon'
  | 'directory'
  | 'trainers'
  | 'experts'
  | 'vendor'
  | 'settings'
  | 'user_settings'
  | 'role_settings'
  | 'menu_settings'
  | 'user_management'
  | 'profile';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  activeRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  currentEmployee: Employee;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onTriggerAiOptimizer?: () => void;
  onResetCaseStudy?: () => void;
  onLogout?: () => void;
  isSimulationMode?: boolean;
  onToggleSimulationMode?: (active: boolean) => void;
  menuSettings?: MenuAccessSetting[];
}

interface NavItemDef {
  id: NavigationTab;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  category?: string;
}

export const StarOfficeSidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  activeRole,
  onSelectRole,
  currentEmployee,
  isOpenMobile,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
  onTriggerAiOptimizer,
  onResetCaseStudy,
  onLogout,
  isSimulationMode = false,
  onToggleSimulationMode,
  menuSettings,
}) => {
  // Check if a specific menu ID is permitted for the active role
  const isMenuAllowed = (menuId: NavigationTab) => {
    const settings = menuSettings && menuSettings.length > 0 ? menuSettings : DEFAULT_MENU_ACCESS_SETTINGS;
    const found = settings.find((s) => s.id === menuId);
    if (!found) return true;
    return found.allowedRoles.includes(activeRole);
  };

  const getDisplayRoleName = (role: UserRole) => {
    if (role === 'super_admin') return 'Super Admin';
    if (role === 'administrator') return 'Administrator';
    return 'Pengguna';
  };
  // 1. Ikhtisar & Pengawasan (Overview & Governance)
  const overviewNavItems: NavItemDef[] = [
    { id: 'beranda', label: 'Beranda TCMS', icon: Home },
    { id: 'dashboard', label: 'Dashboard Finansial & Margin', icon: LayoutDashboard },
    { id: 'ruangsaya', label: 'Antrean Otorisasi', icon: UserCheck, badge: '6', badgeColor: 'bg-rose-500 text-white' },
  ];

  // 2. Hulu: Penawaran & Tender (Pre-Sales & Pipeline)
  const preSalesNavItems: NavItemDef[] = [
    { id: 'silabus', label: 'Katalog Silabus & Rate Card', icon: BookOpen, badge: 'Standar', badgeColor: 'bg-teal-100 text-teal-800' },
    { id: 'estimator', label: 'Kalkulator HPP', icon: Sliders },
    { id: 'proposal', label: 'Proposal Penawaran', icon: FileSignature, badge: 'Hulu', badgeColor: 'bg-emerald-100 text-emerald-800' },
    { id: 'negotiation', label: 'Pipeline Tender & BAFO', icon: TrendingUp },
  ];

  // 3. Perencanaan Biaya & Kontrak (Costing & Contracting)
  const costingContractingItems: NavItemDef[] = [
    { id: 'rap', label: 'Penguncian RAP & PO Vendor', icon: CreditCard },
    { id: 'surat', label: 'Dokumen Kontrak, SPH & PO', icon: FileText },
  ];

  // 4. Eksekusi & Operasional Lapangan (Delivery & Field Ops)
  const deliveryOpsItems: NavItemDef[] = [
    { id: 'kalender', label: 'Jadwal & Run-Sheet Pelatihan', icon: Calendar },
    { id: 'kasbon', label: 'Kasbon Lapangan & LPJ', icon: Wallet, badge: '3', badgeColor: 'bg-amber-100 text-amber-800' },
    { id: 'execution', label: 'Pelaksanaan & Realisasi Biaya', icon: CheckCircle2 },
  ];

  // 5. Data Pendukung & Rekanan (Master Data & Partners)
  const masterDataItems: NavItemDef[] = [
    { id: 'directory', label: 'Direktori Karyawan & SDM', icon: Users, badge: 'SDM', badgeColor: 'bg-slate-100 text-slate-700' },
    { id: 'trainers', label: 'Direktori Fasilitator & Trainer', icon: GraduationCap, badge: 'Ahli', badgeColor: 'bg-teal-100 text-teal-800' },
    { id: 'experts', label: 'Direktori Expert & Tenaga Ahli', icon: Award, badge: 'Pakar', badgeColor: 'bg-indigo-100 text-indigo-800' },
    { id: 'vendor', label: 'Direktori Mitra & Vendor', icon: Building2, badge: 'Mitra', badgeColor: 'bg-slate-100 text-slate-700' },
  ];

  const renderNavGroup = (items: NavItemDef[], groupCategory?: string) => {
    const visibleItems = items.filter((item) => isMenuAllowed(item.id));
    if (visibleItems.length === 0) return null;

    return (
      <div className="space-y-0.5 pb-2">
        {groupCategory && (
          isCollapsed ? (
            <div className="my-2 border-t border-slate-100 mx-2" />
          ) : (
            <div className="px-3 pt-2 pb-1 text-[9.5px] font-bold text-slate-400 uppercase tracking-wider text-left">
              {groupCategory}
            </div>
          )
        )}
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <div key={item.id} className="relative group flex justify-center">
              <button
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center transition cursor-pointer ${
                  isCollapsed
                    ? 'justify-center w-10 h-10 p-0 rounded-xl mx-auto my-0.5'
                    : 'text-left px-3 py-2 rounded-xl text-xs font-semibold'
                } ${
                  isActive
                    ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/80 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="relative shrink-0 flex items-center justify-center">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-teal-700' : 'text-slate-500 group-hover:text-slate-700'
                    }`}
                  />
                  {/* Collapsed dot badge for items with badge */}
                  {isCollapsed && item.badge && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 px-0.5 rounded-full bg-teal-700 text-white text-[8px] font-bold flex items-center justify-center ring-1 ring-white shadow-2xs">
                      {item.badge.length > 2 ? '•' : item.badge}
                    </span>
                  )}
                </div>

                {!isCollapsed && (
                  <>
                    <span className="ml-2.5 truncate">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto pl-2 shrink-0">
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full inline-block ${item.badgeColor || 'bg-slate-100 text-slate-600'}`}>
                          {item.badge}
                        </span>
                      </span>
                    )}
                  </>
                )}
              </button>

              {/* Floating Tooltip for Collapsed Mode */}
              {isCollapsed && (
                <div className="hidden group-hover:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 items-center">
                  <div className="bg-teal-950 text-white text-xs font-semibold px-2.5 py-1.5 rounded-xl shadow-xl whitespace-nowrap flex items-center space-x-1.5 border border-teal-700 animate-fade-in pointer-events-none">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="bg-teal-700 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Mobile overlay when expanded */}
      {!isCollapsed && isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container: Persistent Icon Rail when collapsed, Full Sidebar when expanded */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-slate-200 flex flex-col justify-between z-40 transition-all duration-300 ease-in-out select-none shadow-xs shrink-0 ${
          isCollapsed
            ? 'w-[64px] sm:w-[68px]'
            : 'w-64'
        }`}
      >
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none">
          {/* Header Brand */}
          <div className={`border-b border-slate-100 flex items-center transition-all ${isCollapsed ? 'p-2.5 justify-center' : 'px-4 py-3.5 justify-between'}`}>
            <div className="flex items-center space-x-2.5">
              {/* Star TCMS icon logo button */}
              <button
                onClick={onToggleCollapse}
                className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-700 to-teal-800 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs border border-teal-600/30 hover:opacity-90 transition cursor-pointer"
                title={isCollapsed ? 'Klik untuk memperluas nama menu' : 'Kecilkan ke mode ikon'}
              >
                <span className="text-xs font-black tracking-tight text-white">TC</span>
              </button>

              {!isCollapsed && (
                <div className="min-w-0">
                  <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-tight flex items-center gap-1.5">
                    Star TCMS
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-teal-100 text-teal-800 rounded border border-teal-200">
                      Enterprise
                    </span>
                  </h1>
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider truncate">
                    TRAINING &amp; CONSULTING
                  </p>
                </div>
              )}
            </div>

            {/* Collapse toggle button when expanded */}
            {!isCollapsed && onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition cursor-pointer"
                title="Kecilkan Sidebar (Tampilkan Ikon Saja)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* User Profile Card */}
          {isCollapsed ? (
            <div className="p-2 border-b border-slate-100 flex flex-col items-center group relative">
              <button
                onClick={() => {
                  onSelectTab('profile');
                  onCloseMobile();
                }}
                className="relative cursor-pointer transition transform hover:scale-105"
                title={`${currentEmployee.name} - Buka Data Profil Saya`}
              >
                {currentEmployee.avatarUrl ? (
                  <img
                    src={currentEmployee.avatarUrl}
                    alt={currentEmployee.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div
                    className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center shadow-2xs ${currentEmployee.avatarBg || 'bg-teal-700 text-white'}`}
                  >
                    {currentEmployee.avatarText}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </button>

              {/* Floating Tooltip Profile on Collapsed hover */}
              <div className="hidden group-hover:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 items-center">
                <div className="bg-teal-950 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-xl whitespace-nowrap border border-teal-700 animate-fade-in pointer-events-none">
                  <div className="font-bold text-white">{currentEmployee.name}</div>
                  <div className="text-[10px] text-teal-200">{getDisplayRoleName(activeRole)}</div>
                  <div className="text-[9px] text-teal-300 mt-0.5">Klik untuk buka Data Profil Saya</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 border-b border-slate-100 bg-white">
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    onSelectTab('profile');
                    onCloseMobile();
                  }}
                  className="flex items-center space-x-2.5 min-w-0 text-left hover:bg-slate-50 p-1.5 -m-1.5 rounded-xl transition cursor-pointer group flex-1"
                  title="Klik untuk membuka Data Profil Saya"
                >
                  {/* Avatar with active green dot */}
                  <div className="relative shrink-0">
                    {currentEmployee.avatarUrl ? (
                      <img
                        src={currentEmployee.avatarUrl}
                        alt={currentEmployee.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div
                        className={`w-10 h-10 rounded-full font-bold text-xs flex items-center justify-center shadow-2xs ${currentEmployee.avatarBg || 'bg-teal-700 text-white'}`}
                      >
                        {currentEmployee.avatarText}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1.5">
                      <h2 className="text-xs font-bold text-slate-900 group-hover:text-teal-800 truncate">
                        {currentEmployee.name}
                      </h2>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate leading-tight mt-0.5">
                      {currentEmployee.email || 'cipkai2017@gmail.com'}
                    </p>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200/70">
                        {getDisplayRoleName(activeRole)}
                      </span>
                    </div>
                  </div>
                </button>

                {/* Ikon orang centrang di samping akun */}
                <button
                  onClick={() => {
                    onSelectTab('profile');
                    onCloseMobile();
                  }}
                  className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-xl border border-slate-200/80 hover:border-teal-300 transition shrink-0 cursor-pointer flex items-center justify-center group shadow-2xs"
                  title="Buka Data Profil Saya"
                >
                  <UserCheck className="w-4 h-4 text-slate-600 group-hover:text-teal-700 transition" />
                </button>
              </div>
            </div>
          )}

          {/* TCMS Navigation Menu List - Selaras Alur Bisnis Proses */}
          <nav className={`space-y-1 ${isCollapsed ? 'p-1.5' : 'p-2'}`}>
            {renderNavGroup(overviewNavItems, 'Ikhtisar & Otorisasi')}
            {renderNavGroup(preSalesNavItems, 'Hulu: Penawaran & Tender')}
            {renderNavGroup(costingContractingItems, 'Biaya HPP & Kontrak')}
            {renderNavGroup(deliveryOpsItems, 'Eksekusi & Operasional')}
            {renderNavGroup(masterDataItems, 'Data Pendukung & Rekanan')}
          </nav>
        </div>

        {/* Bottom Section for TCMS Executive Governance */}
        <div className={`border-t border-slate-100 bg-slate-50/60 ${isCollapsed ? 'p-1.5 space-y-1.5 flex flex-col items-center' : 'p-3 space-y-1'}`}>
          {!isCollapsed && (
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              TATA KELOLA SISTEM
            </div>
          )}

          {/* MENU PENGATURAN SISTEM (DIATAS PANEL SUPER ADMIN) */}
          <div className="relative group w-full flex justify-center">
            <button
              type="button"
              onClick={() => {
                onSelectTab('settings');
                onCloseMobile();
              }}
              className={`w-full flex items-center transition cursor-pointer ${
                isCollapsed
                  ? 'justify-center w-10 h-10 p-0 rounded-xl mx-auto my-0.5'
                  : 'text-left px-3 py-2 rounded-xl text-xs font-semibold'
              } ${
                activeTab === 'settings' || activeTab === 'user_settings' || activeTab === 'role_settings' || activeTab === 'menu_settings'
                  ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/80 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
              title={isCollapsed ? 'Pengaturan Sistem' : undefined}
            >
              <div className="relative shrink-0 flex items-center justify-center">
                <Settings
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    activeTab === 'settings' || activeTab === 'user_settings' || activeTab === 'role_settings' || activeTab === 'menu_settings'
                      ? 'text-teal-700'
                      : 'text-slate-500 group-hover:text-slate-700'
                  }`}
                />
              </div>
              {!isCollapsed && <span className="ml-2.5 truncate">Pengaturan</span>}
            </button>
            {isCollapsed && (
              <div className="hidden group-hover:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 items-center">
                <div className="bg-teal-950 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap border border-teal-700 animate-fade-in pointer-events-none flex items-center space-x-1.5">
                  <Settings className="w-3.5 h-3.5 text-teal-300" />
                  <span>Pengaturan Sistem</span>
                </div>
              </div>
            )}
          </div>

          {/* TOMBOL SUPER ADMIN - Only visible for super_admin role */}
          {activeRole === 'super_admin' && (
            <div className="relative group w-full flex justify-center">
              <button
                type="button"
                onClick={() => {
                  onSelectTab('user_management');
                  onCloseMobile();
                }}
                className={`w-full flex items-center transition cursor-pointer ${
                  activeTab === 'user_management'
                    ? isCollapsed
                      ? 'justify-center p-2 rounded-xl bg-purple-600 text-white shadow-2xs'
                      : 'text-left justify-between px-3 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white shadow-2xs'
                    : isCollapsed
                    ? 'justify-center p-2 rounded-xl bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200/80 shadow-2xs'
                    : 'text-left justify-between px-3 py-2 rounded-xl text-xs font-bold bg-purple-50/90 text-purple-900 hover:bg-purple-100 border border-purple-200 shadow-2xs'
                }`}
                title={isCollapsed ? 'Panel Super Admin (Pengguna & Training)' : undefined}
              >
                <div className="flex items-center space-x-2">
                  <ShieldCheck className={`w-4 h-4 shrink-0 ${activeTab === 'user_management' ? 'text-white' : 'text-purple-700'}`} />
                  {!isCollapsed && <span>Panel Super Admin</span>}
                </div>
                {!isCollapsed && (
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded font-mono uppercase ${
                    activeTab === 'user_management'
                      ? 'bg-purple-800 text-purple-100'
                      : 'bg-purple-200 text-purple-900'
                  }`}>
                    {isSimulationMode ? 'Training' : 'Admin'}
                  </span>
                )}
              </button>
              {isCollapsed && (
                <div className="hidden group-hover:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 items-center">
                  <div className="bg-purple-950 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap border border-purple-700 animate-fade-in pointer-events-none flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
                    <span>Panel Super Admin (Pengguna &amp; Training)</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Logout */}
          <div className="relative group w-full flex justify-center">
            <button
              onClick={() => {
                if (onLogout) {
                  onLogout();
                } else if (onResetCaseStudy) {
                  onResetCaseStudy();
                }
                onCloseMobile();
              }}
              className={`w-full flex items-center transition cursor-pointer ${
                isCollapsed
                  ? 'justify-center p-2 rounded-xl text-rose-500 hover:bg-rose-50'
                  : 'text-left space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50'
              }`}
              title={isCollapsed ? 'Keluar Sesi / Ganti Akun' : undefined}
            >
              <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
              {!isCollapsed && <span>Keluar Sesi</span>}
            </button>
            {isCollapsed && (
              <div className="hidden group-hover:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 items-center">
                <div className="bg-teal-950 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap border border-teal-700 animate-fade-in pointer-events-none">
                  Keluar Sesi / Ganti Akun
                </div>
              </div>
            )}
          </div>

          {/* Collapse/Expand Toggle Button in Collapsed Mode */}
          {isCollapsed && onToggleCollapse && (
            <div className="pt-1.5 border-t border-slate-200/80 w-full flex justify-center">
              <button
                onClick={onToggleCollapse}
                className="w-8 h-8 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 flex items-center justify-center transition cursor-pointer shadow-2xs border border-teal-200/80 hover:scale-105"
                title="Perluas Sidebar (Tampilkan Teks)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
