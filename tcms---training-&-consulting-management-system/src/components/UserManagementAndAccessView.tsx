import React, { useState, useEffect } from 'react';
import {
  Employee,
  Organization,
  UserRole,
  RoleAccessDefinition,
  PermissionSetting,
  MenuAccessSetting,
} from '../types';
import { DEFAULT_MENU_ACCESS_SETTINGS } from '../data/initialData';
import { TenantUserManagementView } from './TenantUserManagementView';
import {
  Users,
  Shield,
  Building,
  KeyRound,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Search,
  Sliders,
  SlidersHorizontal,
  Database,
  RefreshCw,
  ExternalLink,
  Edit2,
  Trash2,
  Sparkles,
  Layers,
  ArrowRight,
  ArrowLeft,
  LayoutGrid,
  Settings,
  ChevronRight,
  ShieldCheck,
  Building2,
  Server,
  UserCheck,
  Info,
  FlaskConical,
  Activity,
  XCircle,
  Check,
  RotateCcw,
  Save,
  Home,
  LayoutDashboard,
  BookOpen,
  FileSignature,
  TrendingUp,
  CreditCard,
  FileText,
  Calendar,
  Wallet,
  GraduationCap,
  Award,
  Briefcase,
  Play,
  CheckCheck,
} from 'lucide-react';

export type SubTabType = 'grid' | 'users' | 'rbac' | 'menu_access' | 'training';

interface UserManagementAndAccessViewProps {
  employees: Employee[];
  organizations: Organization[];
  activeOrganization: Organization;
  onSelectOrganization: (org: Organization) => void;
  activeRole: UserRole;
  currentEmployee: Employee;
  onSelectEmployee: (emp: Employee) => void;
  onAddEmployee: (emp: Employee) => void;
  onUpdateEmployee: (emp: Employee) => void;
  onDeleteEmployee?: (empId: string) => void;
  roleDefinitions: RoleAccessDefinition[];
  permissions: PermissionSetting[];
  onTogglePermission: (permissionId: string, role: UserRole) => void;
  menuSettings?: MenuAccessSetting[];
  onToggleMenuAccess?: (menuId: string, role: UserRole) => void;
  onResetMenuAccess?: () => void;
  isSimulationMode?: boolean;
  onToggleSimulationMode?: (active: boolean) => void;
  onResetCaseStudy?: () => void;
  onLoadFullTrainingData?: (preset?: 'bumn_full' | 'blank_draft') => void;
  onNavigateTab?: (tab: any) => void;
  initialSubTab?: SubTabType;
  isSuperAdminPanel?: boolean;
}

export const UserManagementAndAccessView: React.FC<UserManagementAndAccessViewProps> = ({
  employees,
  organizations,
  activeOrganization,
  onSelectOrganization,
  activeRole,
  currentEmployee,
  onSelectEmployee,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  roleDefinitions,
  permissions,
  onTogglePermission,
  menuSettings,
  onToggleMenuAccess,
  onResetMenuAccess,
  isSimulationMode = false,
  onToggleSimulationMode,
  onResetCaseStudy,
  onLoadFullTrainingData,
  onNavigateTab,
  initialSubTab,
  isSuperAdminPanel = false,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>(
    initialSubTab && initialSubTab !== ('saas_tenants' as any) && initialSubTab !== ('audit_security' as any)
      ? initialSubTab
      : 'grid'
  );

  useEffect(() => {
    if (initialSubTab) {
      if (initialSubTab === ('saas_tenants' as any) || initialSubTab === ('audit_security' as any)) {
        setActiveSubTab('grid');
      } else {
        setActiveSubTab(initialSubTab);
      }
    }
  }, [initialSubTab]);

  // Local state for menu access settings if managed internally or with prop
  const [localMenuSettings, setLocalMenuSettings] = useState<MenuAccessSetting[]>(() => {
    if (menuSettings && menuSettings.length > 0) return menuSettings;
    const saved = localStorage.getItem('staroffice_menu_access');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEFAULT_MENU_ACCESS_SETTINGS;
  });

  useEffect(() => {
    if (menuSettings && menuSettings.length > 0) {
      setLocalMenuSettings(menuSettings);
    }
  }, [menuSettings]);

  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [menuSelectedCategory, setMenuSelectedCategory] = useState('all');

  // Notification alert state
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'warning' | 'info'; text: string } | null>(null);

  const showAlert = (text: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  const isUserManagementAllowed = activeRole === 'super_admin' || activeRole === 'administrator';

  const settingCards = [
    {
      id: 'users' as SubTabType,
      title: 'Pengaturan Pengguna Aplikasi',
      subtitle: 'Akun Karyawan & Penugasan Peran',
      description: 'Kelola data pengguna, profil NIK, divisi kerja, penetapan peran akses, status akun, dan kredensial login staf.',
      icon: Users,
      iconColor: 'text-teal-700',
      iconBg: 'bg-teal-50 border-teal-200',
      badgeText: isUserManagementAllowed ? `${employees.length} Akun` : 'Khusus Admin',
      borderHover: 'hover:border-teal-400 hover:shadow-md',
      btnColor: 'bg-teal-700 hover:bg-teal-800 text-white',
    },
    {
      id: 'rbac' as SubTabType,
      title: 'Pengaturan Kewenangan',
      subtitle: 'Matriks Hak Akses & Batas Otorisasi',
      description: 'Konfigurasikan matriks hak akses otorisasi penawaran, verifikasi biaya HPP, penguncian RAP v1.0, limit toleransi diskon, dan rilis PO.',
      icon: Shield,
      iconColor: 'text-indigo-700',
      iconBg: 'bg-indigo-50 border-indigo-200',
      badgeText: 'Matriks RBAC',
      borderHover: 'hover:border-indigo-400 hover:shadow-md',
      btnColor: 'bg-indigo-700 hover:bg-indigo-800 text-white',
    },
    {
      id: 'menu_access' as SubTabType,
      title: 'Pengaturan Akses Menu',
      subtitle: 'Visibilitas Modul Navigasi Sidebar',
      description: 'Atur menu-menu apa saja yang tampil dan dapat diakses pada bilah navigasi utama untuk masing-masing tingkatan peran karyawan.',
      icon: SlidersHorizontal,
      iconColor: 'text-sky-700',
      iconBg: 'bg-sky-50 border-sky-200',
      badgeText: 'Navigasi Sidebar',
      borderHover: 'hover:border-sky-400 hover:shadow-md',
      btnColor: 'bg-sky-700 hover:bg-sky-800 text-white',
    },
    {
      id: 'training' as SubTabType,
      title: 'Moda Training & Data Simulasi',
      subtitle: 'Studi Kasus Pelatihan BUMN & Draf Riil',
      description: 'Aktifkan moda pelatihan (training mode) lengkap dengan data-data proyek pelatihan BUMN yang pernah dibuat sebelumnya (HPP Proyek 3-Hari, 15 Pos Biaya, Kasbon Lapangan, PO Vendor, dan Silabus).',
      icon: GraduationCap,
      iconColor: 'text-amber-700',
      iconBg: 'bg-amber-50 border-amber-200',
      badgeText: isSimulationMode ? 'Mode: AKTIF' : 'Mode: NONAKTIF',
      borderHover: 'hover:border-amber-400 hover:shadow-md',
      btnColor: 'bg-amber-700 hover:bg-amber-800 text-white',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Alert toast if any */}
      {alertMsg && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-xs animate-fade-in ${
            alertMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : alertMsg.type === 'warning'
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-blue-50 border-blue-300 text-blue-900'
          }`}
        >
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{alertMsg.text}</span>
          </div>
          <button
            onClick={() => setAlertMsg(null)}
            className="text-slate-400 hover:text-slate-600 text-xs px-2 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 1: GRID VIEW (PENGATURAN SISTEM DASHBOARD - 4 KARTU) */}
      {/* ========================================================================= */}
      {activeSubTab === 'grid' && (
        <div className="space-y-6 animate-fade-in">
          {/* Main Clean Header */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200/90 flex items-center justify-center text-teal-700 shrink-0 shadow-2xs">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  Pengaturan Sistem {isSuperAdminPanel ? '& Panel Super Admin' : ''}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pusat tata kelola akun pengguna, hak akses kewenangan, pengaturan menu, serta moda training dengan data pelatihan historis.
                </p>
              </div>
            </div>
          </div>

          {/* 4 GRID CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {settingCards.map((card) => {
              const IconComp = card.icon;
              return (
                <div
                  key={card.id}
                  onClick={() => setActiveSubTab(card.id)}
                  className={`group bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs transition-all duration-200 cursor-pointer flex flex-col justify-between ${card.borderHover}`}
                >
                  <div className="space-y-4">
                    {/* Top row: Icon + Badge */}
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${card.iconBg} ${card.iconColor} group-hover:scale-105 transition-transform duration-200 shadow-2xs`}>
                        <IconComp className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                        {card.badgeText}
                      </span>
                    </div>

                    {/* Title and Subtitle */}
                    <div>
                      <h2 className="text-base font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                        {card.title}
                      </h2>
                      <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                        {card.subtitle}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  {/* Action Link Footer */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700 group-hover:text-teal-800">
                    <span>Buka {card.title}</span>
                    <div className="w-7 h-7 rounded-xl bg-teal-50 group-hover:bg-teal-600 text-teal-700 group-hover:text-white flex items-center justify-center transition-colors">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DETAIL VIEW TOP NAV (TOMBOL KEMBALI & QUICK SUBTAB SWITCHER) */}
      {/* ========================================================================= */}
      {activeSubTab !== 'grid' && (
        <div className="bg-white text-slate-900 rounded-2xl p-3 border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 animate-fade-in">
          <button
            type="button"
            onClick={() => setActiveSubTab('grid')}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 font-bold text-xs border border-slate-200 hover:border-teal-200 transition cursor-pointer shadow-2xs"
            title="Kembali ke Menu Pengaturan"
          >
            <ArrowLeft className="w-4 h-4 text-teal-700" />
            <span>← Menu Pengaturan</span>
          </button>

          {/* Quick SubTab Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveSubTab('users')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                activeSubTab === 'users'
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Pengguna</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('rbac')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                activeSubTab === 'rbac'
                  ? 'bg-indigo-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Kewenangan RBAC</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('menu_access')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                activeSubTab === 'menu_access'
                  ? 'bg-sky-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Akses Menu</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('training')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                activeSubTab === 'training'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Moda Training</span>
              {isSimulationMode && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse inline-block" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 1: USER MANAGEMENT (MANAJEMEN PENGGUNA & PENDAFTARAN TENANT) */}
      {/* ========================================================================= */}
      {activeSubTab === 'users' && (
        !isUserManagementAllowed ? (
          <div className="bg-white rounded-2xl p-8 border border-amber-200 shadow-2xs text-center space-y-4 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto shadow-2xs">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Akses Terbatas</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto mt-1 leading-relaxed">
                Menu <strong>Pengaturan Pengguna Aplikasi</strong> hanya dapat diakses oleh akun dengan peran <strong>Super Admin</strong> dan <strong>Administrator Lembaga</strong>.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveSubTab('grid')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition cursor-pointer inline-flex items-center space-x-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Pengaturan Sistem</span>
            </button>
          </div>
        ) : (
          <TenantUserManagementView
            employees={employees}
            organizations={organizations}
            activeOrganization={activeOrganization}
            activeRole={activeRole}
            currentEmployee={currentEmployee}
            onSelectEmployee={onSelectEmployee}
            onAddEmployee={onAddEmployee}
            onUpdateEmployee={onUpdateEmployee}
            onDeleteEmployee={onDeleteEmployee}
            onBackToGrid={() => setActiveSubTab('grid')}
            isSimulationMode={isSimulationMode}
            isSuperAdminPanel={isSuperAdminPanel}
          />
        )
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: RBAC PERMISSIONS MATRIX (PENGATURAN HAK AKSES) */}
      {/* ========================================================================= */}
      {activeSubTab === 'rbac' && (
        <div className="space-y-6">
          {/* Role Cards Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {roleDefinitions
              .filter((roleDef) => activeRole === 'super_admin' || roleDef.role !== 'super_admin')
              .map((roleDef) => (
              <div
                key={roleDef.role}
                className={`p-4 rounded-xl border bg-white shadow-xs transition ${
                  activeRole === roleDef.role ? 'ring-2 ring-purple-600 border-purple-400' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${roleDef.badgeColor}`}>
                    {roleDef.name}
                  </span>
                  {activeRole === roleDef.role && (
                    <span className="text-[9px] bg-purple-600 text-white font-bold px-1.5 py-0.2 rounded">
                      Aktif
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed min-h-[50px]">{roleDef.description}</p>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Otoritas RAP:</span>
                  <span className={roleDef.canLockRap ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                    {roleDef.canLockRap ? 'Penuh (Kunci RAP)' : 'Dilarang'}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Kelola User:</span>
                  <span className={roleDef.canManageUsers ? 'text-purple-700 font-bold' : 'text-slate-400'}>
                    {roleDef.canManageUsers ? 'Diizinkan' : 'Dilarang'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Permission Matrix */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Matriks Konfigurasi Hak Akses Fitur &amp; Otorisasi
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Super Admin dan Administrator dapat mengatur wewenang akses per modul untuk memastikan pemisahan tugas (Segregation of Duties).
                </p>
              </div>
              <button
                onClick={() => showAlert('Konfigurasi matriks RBAC telah disimpan ke kebijakan keamanan tenant.', 'success')}
                className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
              >
                Simpan Matriks RBAC
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Modul &amp; Fungsi Sistem</th>
                    {activeRole === 'super_admin' && <th className="px-3 py-3 text-center">Super Admin</th>}
                    <th className="px-3 py-3 text-center">Administrator</th>
                    <th className="px-3 py-3 text-center">Penyetuju (Executive)</th>
                    <th className="px-3 py-3 text-center">Pemeriksa (Finance)</th>
                    <th className="px-3 py-3 text-center">Konseptor (Sales)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {permissions.map((perm) => {
                    const roles: UserRole[] =
                      activeRole === 'super_admin'
                        ? ['super_admin', 'administrator', 'penyetuju', 'pemeriksa', 'konseptor']
                        : ['administrator', 'penyetuju', 'pemeriksa', 'konseptor'];
                    return (
                      <tr key={perm.id} className="hover:bg-slate-50/60 transition">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{perm.name}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{perm.description}</div>
                          <div className="text-[10px] text-purple-600 font-semibold mt-0.5">Modul: {perm.module}</div>
                        </td>

                        {roles.map((r) => {
                          const isAllowed = perm.allowedRoles.includes(r);
                          const isSuperAdminRole = r === 'super_admin'; // Super admin usually cannot be disabled

                          return (
                            <td key={r} className="px-3 py-3 text-center">
                              <button
                                type="button"
                                disabled={isSuperAdminRole}
                                onClick={() => {
                                  if (!isSuperAdminRole) {
                                    onTogglePermission(perm.id, r);
                                    showAlert(`Izin '${perm.name}' untuk peran ${r} berhasil diperbarui.`);
                                  }
                                }}
                                className={`inline-flex items-center justify-center w-6 h-6 rounded-md transition ${
                                  isAllowed
                                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                } ${isSuperAdminRole ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}`}
                                title={isAllowed ? 'Klik untuk cabut izin' : 'Klik untuk berikan izin'}
                              >
                                {isAllowed ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <span className="text-xs font-bold text-slate-300">—</span>}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-purple-50/50 border-t border-purple-100 flex items-start space-x-3 text-xs text-purple-900">
              <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <strong>Prinsip Segregation of Duties (SoD):</strong> Konseptor tidak dapat mengunci RAP v1.0 sendiri atau menerbitkan PO Vendor secara sepihak. Penguncian RAP v1.0 wajib diotorisasi oleh <strong>Penyetuju (Executive)</strong> atau <strong>Super Admin</strong> setelah audit komponen diverifikasi oleh <strong>Pemeriksa (Finance)</strong>.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB: PENGATURAN AKSES MENU */}
      {/* ========================================================================= */}
      {activeSubTab === 'menu_access' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header & Controls Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-teal-700" />
                  <span>Pengaturan Akses Menu &amp; Visibilitas Modul Navigasi</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-3xl">
                  Konfigurasikan visibilitas dan izin pembukaan setiap menu di sidebar aplikasi TCMS untuk masing-masing peran (Super Admin, Administrator, Penyetuju, Pemeriksa, dan Konseptor).
                </p>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const updated = DEFAULT_MENU_ACCESS_SETTINGS;
                    setLocalMenuSettings(updated);
                    localStorage.setItem('staroffice_menu_access', JSON.stringify(updated));
                    if (onResetMenuAccess) onResetMenuAccess();
                    showAlert('Preset Standar Keamanan berhasil dipulihkan.', 'success');
                  }}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer border border-slate-200"
                  title="Kembalikan konfigurasi default"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Preset Standar</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const updated = localMenuSettings.map((item) => {
                      if (item.category === 'Tata Kelola Sistem') {
                        return { ...item, allowedRoles: ['super_admin' as UserRole] };
                      }
                      if (['ruangsaya', 'rap', 'execution'].includes(item.id)) {
                        return { ...item, allowedRoles: ['super_admin' as UserRole, 'penyetuju' as UserRole] };
                      }
                      return item;
                    });
                    setLocalMenuSettings(updated);
                    localStorage.setItem('staroffice_menu_access', JSON.stringify(updated));
                    showAlert('Preset Strict (Prinsip Hak Akses Terkecil) berhasil diterapkan.', 'warning');
                  }}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 transition cursor-pointer border border-amber-200"
                  title="Terapkan pembatasan ketat hak akses"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Strict / Least Privilege</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const updated = localMenuSettings.map((item) => ({
                      ...item,
                      allowedRoles: (item.category === 'Tata Kelola Sistem'
                        ? ['super_admin', 'administrator']
                        : ['super_admin', 'administrator', 'penyetuju', 'pemeriksa', 'konseptor']) as UserRole[],
                    }));
                    setLocalMenuSettings(updated);
                    localStorage.setItem('staroffice_menu_access', JSON.stringify(updated));
                    showAlert('Preset Semua Terbuka (Mode Uji Coba) berhasil diterapkan.', 'success');
                  }}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-50 hover:bg-teal-100 text-teal-800 transition cursor-pointer border border-teal-200"
                  title="Buka akses semua menu untuk testing"
                >
                  <Unlock className="w-3.5 h-3.5 text-teal-700" />
                  <span>Buka Semua (Testing)</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={menuSearchQuery}
                    onChange={(e) => setMenuSearchQuery(e.target.value)}
                    placeholder="Cari menu, deskripsi, atau modul..."
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                <div className="flex items-center space-x-1.5 text-xs">
                  <span className="text-slate-500 font-medium">Kategori:</span>
                  <select
                    value={menuSelectedCategory}
                    onChange={(e) => setMenuSelectedCategory(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                  >
                    <option value="all">Semua Kategori (18 Menu)</option>
                    <option value="Ikhtisar & Otorisasi">1. Ikhtisar &amp; Otorisasi</option>
                    <option value="Hulu: Penawaran & Tender">2. Hulu: Penawaran &amp; Tender</option>
                    <option value="Biaya HPP & Kontrak">3. Biaya HPP &amp; Kontrak</option>
                    <option value="Eksekusi & Operasional">4. Eksekusi &amp; Operasional</option>
                    <option value="Data Pendukung & Rekanan">5. Data Pendukung &amp; Rekanan</option>
                    <option value="Tata Kelola Sistem">6. Tata Kelola Sistem</option>
                  </select>
                </div>
              </div>

              {/* Stats Badge */}
              <div className="flex items-center space-x-2 text-xs text-slate-500 shrink-0">
                <span className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg font-bold text-slate-700">
                  <Layers className="w-3.5 h-3.5 text-teal-700" />
                  <span>
                    {
                      localMenuSettings.filter((item) => {
                        const matchCat = menuSelectedCategory === 'all' || item.category === menuSelectedCategory;
                        const matchQuery =
                          !menuSearchQuery ||
                          item.label.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(menuSearchQuery.toLowerCase());
                        return matchCat && matchQuery;
                      }).length
                    }{' '}
                    Menu Ditampilkan
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Total Menu Terdaftar</div>
              <div className="text-xl font-black text-slate-900 mt-0.5">{localMenuSettings.length} Menu</div>
              <div className="text-[11px] text-teal-700 font-semibold mt-1">6 Kelompok Bisnis</div>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Akses Penuh (5 Peran)</div>
              <div className="text-xl font-black text-emerald-700 mt-0.5">
                {localMenuSettings.filter((m) => m.allowedRoles.length >= 5).length} Menu
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Dapat diakses seluruh staf</div>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Akses Terbatas / Terkunci</div>
              <div className="text-xl font-black text-amber-700 mt-0.5">
                {localMenuSettings.filter((m) => m.allowedRoles.length < 5).length} Menu
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Hanya peran berwenang</div>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Peran Anda Saat Ini</div>
              <div className="text-xl font-black text-teal-800 mt-0.5 capitalize">{activeRole.replace('_', ' ')}</div>
              <div className="text-[11px] text-slate-500 mt-1">
                {localMenuSettings.filter((m) => m.allowedRoles.includes(activeRole)).length} dari{' '}
                {localMenuSettings.length} menu aktif
              </div>
            </div>
          </div>

          {/* Interactive Menu Access Matrix Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-900">
                  Matriks Izin Visibilitas Menu per Peran Pengguna
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Centang atau nonaktifkan kotak peran untuk mengatur apakah menu tersebut muncul dan dapat dibuka oleh pemegang peran terkait.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem('staroffice_menu_access', JSON.stringify(localMenuSettings));
                  showAlert('Konfigurasi hak akses menu berhasil disimpan secara permanen.', 'success');
                }}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Konfigurasi</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3 min-w-[240px]">Menu &amp; Deskripsi Modul</th>
                    <th className="px-3 py-3 text-center min-w-[110px]">
                      <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200">
                        Super Admin
                      </span>
                    </th>
                    <th className="px-3 py-3 text-center min-w-[110px]">
                      <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 border border-indigo-200">
                        Administrator
                      </span>
                    </th>
                    <th className="px-3 py-3 text-center min-w-[110px]">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200">
                        Penyetuju
                      </span>
                    </th>
                    <th className="px-3 py-3 text-center min-w-[110px]">
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                        Pemeriksa
                      </span>
                    </th>
                    <th className="px-3 py-3 text-center min-w-[110px]">
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
                        Konseptor
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {localMenuSettings
                    .filter((item) => {
                      const matchCat = menuSelectedCategory === 'all' || item.category === menuSelectedCategory;
                      const matchQuery =
                        !menuSearchQuery ||
                        item.label.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
                        item.description.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
                        item.category.toLowerCase().includes(menuSearchQuery.toLowerCase());
                      return matchCat && matchQuery;
                    })
                    .map((item) => {
                      const rolesList: { role: UserRole; name: string }[] = [
                        { role: 'super_admin', name: 'Super Admin' },
                        { role: 'administrator', name: 'Administrator' },
                        { role: 'penyetuju', name: 'Penyetuju' },
                        { role: 'pemeriksa', name: 'Pemeriksa' },
                        { role: 'konseptor', name: 'Konseptor' },
                      ];

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition">
                          <td className="px-4 py-3.5">
                            <div className="flex items-start space-x-2.5">
                              <div className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 mt-0.5 shrink-0">
                                {item.id === 'beranda' && <Home className="w-4 h-4 text-teal-700" />}
                                {item.id === 'dashboard' && <LayoutDashboard className="w-4 h-4 text-teal-700" />}
                                {item.id === 'ruangsaya' && <UserCheck className="w-4 h-4 text-indigo-700" />}
                                {item.id === 'silabus' && <BookOpen className="w-4 h-4 text-blue-700" />}
                                {item.id === 'estimator' && <Sliders className="w-4 h-4 text-amber-700" />}
                                {item.id === 'proposal' && <FileSignature className="w-4 h-4 text-purple-700" />}
                                {item.id === 'negotiation' && <TrendingUp className="w-4 h-4 text-emerald-700" />}
                                {item.id === 'rap' && <CreditCard className="w-4 h-4 text-rose-700" />}
                                {item.id === 'surat' && <FileText className="w-4 h-4 text-cyan-700" />}
                                {item.id === 'kalender' && <Calendar className="w-4 h-4 text-orange-700" />}
                                {item.id === 'kasbon' && <Wallet className="w-4 h-4 text-emerald-700" />}
                                {item.id === 'execution' && <CheckCircle2 className="w-4 h-4 text-teal-700" />}
                                {item.id === 'directory' && <Users className="w-4 h-4 text-slate-700" />}
                                {item.id === 'trainers' && <GraduationCap className="w-4 h-4 text-indigo-700" />}
                                {item.id === 'experts' && <Award className="w-4 h-4 text-amber-700" />}
                                {item.id === 'vendor' && <Building2 className="w-4 h-4 text-slate-700" />}
                                {item.id === 'user_settings' && <Users className="w-4 h-4 text-teal-700" />}
                                {item.id === 'role_settings' && <Shield className="w-4 h-4 text-teal-700" />}
                                {item.id === 'menu_settings' && <SlidersHorizontal className="w-4 h-4 text-teal-700" />}
                                {item.id === 'user_management' && <ShieldCheck className="w-4 h-4 text-purple-700" />}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 flex items-center gap-2">
                                  <span>{item.label}</span>
                                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded font-mono">
                                    #{item.id}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.description}</div>
                                <div className="text-[10px] text-teal-700 font-semibold mt-1">
                                  Kelompok: <span className="underline">{item.category}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {rolesList.map(({ role }) => {
                            const isAllowed = item.allowedRoles.includes(role);
                            const isSuperAdmin = role === 'super_admin';

                            return (
                              <td key={role} className="px-3 py-3 text-center">
                                <button
                                  type="button"
                                  disabled={isSuperAdmin && item.id === 'menu_settings'}
                                  onClick={() => {
                                    if (onToggleMenuAccess) {
                                      onToggleMenuAccess(item.id, role);
                                    } else {
                                      const updated = localMenuSettings.map((m) => {
                                        if (m.id === item.id) {
                                          const has = m.allowedRoles.includes(role);
                                          return {
                                            ...m,
                                            allowedRoles: has
                                              ? m.allowedRoles.filter((r) => r !== role)
                                              : [...m.allowedRoles, role],
                                          };
                                        }
                                        return m;
                                      });
                                      setLocalMenuSettings(updated);
                                      localStorage.setItem('staroffice_menu_access', JSON.stringify(updated));
                                    }
                                    showAlert(`Izin menu '${item.label}' untuk peran ${role} berhasil diperbarui.`);
                                  }}
                                  className={`inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                                    isAllowed
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100 shadow-2xs'
                                      : 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200'
                                  } cursor-pointer`}
                                  title={isAllowed ? `Klik untuk menyembunyikan menu dari ${role}` : `Klik untuk membuka menu bagi ${role}`}
                                >
                                  {isAllowed ? (
                                    <div className="flex items-center space-x-1">
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                      <span className="text-[11px]">Aktif</span>
                                    </div>
                                  ) : (
                                    <span className="text-[11px] text-slate-400">Nonaktif</span>
                                  )}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Explanatory banner */}
            <div className="p-4 bg-teal-50/60 border-t border-teal-100 flex items-start space-x-3 text-xs text-teal-950">
              <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <div>
                <strong>Tata Kelola Hak Akses Menu:</strong> Pengaturan di atas mengontrol item menu apa saja yang dirender pada bilah navigasi utama (sidebar) untuk masing-masing peran karyawan. Hal ini memastikan staf hanya melihat menu yang relevan dengan tanggung jawab mereka dan mencegah akses tidak sah ke modul persetujuan eksekutif atau tata kelola master tenant.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: MODA TRAINING & DATA SIMULASI STUDI KASUS */}
      {/* ========================================================================= */}
      {activeSubTab === 'training' && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Control Banner */}
          <div className={`rounded-2xl p-6 border shadow-2xs transition-all ${
            isSimulationMode
              ? 'bg-gradient-to-r from-amber-50 via-orange-50/70 to-amber-100/40 border-amber-300'
              : 'bg-white border-slate-200'
          }`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="flex items-center space-x-2.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-2xs ${
                    isSimulationMode
                      ? 'bg-amber-600 text-white border-amber-500'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-base font-extrabold text-slate-900">
                        Pusat Moda Training & Data Simulasi
                      </h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                        isSimulationMode
                          ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}>
                        {isSimulationMode ? '🧪 Moda Training: Sedang Aktif' : '🟢 Mode Operasional Bersih'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Kelola sesi pelatihan dan muat dataset komprehensif proyek pelatihan BUMN yang pernah dibuat sebelumnya untuk latihan tim.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                {isSimulationMode ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        onToggleSimulationMode?.(false);
                        showAlert('Moda Training dinonaktifkan. Sistem kembali ke data operasional bersih.', 'info');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-300 shadow-2xs transition flex items-center space-x-2 cursor-pointer"
                      title="Matikan Moda Training dan kembali ke lembar kerja bersih"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                      <span>Kembalikan ke Mode Operasional</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onLoadFullTrainingData?.('bumn_full');
                        showAlert('Data studi kasus Proyek Pelatihan BUMN (OPP-2026-089) berhasil dimuat ulang lengkap.', 'success');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-2xs transition flex items-center space-x-2 cursor-pointer"
                      title="Muat ulang seluruh data pelatihan yang pernah dibuat sebelumnya"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-white" />
                      <span>Muat Ulang Data Pelatihan Lengkap</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onLoadFullTrainingData?.('bumn_full');
                      showAlert('Moda Training Aktif: Seluruh data proyek pelatihan BUMN yang pernah dibuat sebelumnya berhasil dimuat.', 'success');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition flex items-center space-x-2 cursor-pointer"
                    title="Aktifkan Moda Training dan muat data yang pernah dibuat sebelumnya"
                  >
                    <Play className="w-3.5 h-3.5 text-white fill-white" />
                    <span>Aktifkan Moda Training (Muat Data Pelatihan BUMN)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Status notice */}
            <div className={`mt-4 pt-3.5 border-t text-xs flex items-center space-x-2 ${
              isSimulationMode
                ? 'border-amber-200/80 text-amber-900'
                : 'border-slate-200 text-slate-600'
            }`}>
              <Info className="w-4 h-4 shrink-0" />
              <span>
                {isSimulationMode
                  ? 'Saat Moda Training aktif, seluruh pengujian kalkulasi biaya, verifikasi pos, pengajuan kasbon, dan simulasi penawaran aman dilakukan tanpa mempengaruhi database operasional asli.'
                  : 'Sistem sedang berada pada Mode Operasional Nyata. Klik tombol di atas untuk masuk ke Moda Training dan menguji alur kerja dengan data simulasi yang telah disiapkan.'}
              </span>
            </div>
          </div>

          {/* Section: Katalog Data Pelatihan yang Pernah Dibuat Sebelumnya */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
                  <Database className="w-4 h-4 text-amber-600" />
                  <span>Koleksi Data-Data Pelatihan yang Pernah Dibuat Sebelumnya</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dataset historis lengkap yang dapat langsung dimuat ke masing-masing modul aplikasi untuk simulasi & verifikasi
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    onLoadFullTrainingData?.('bumn_full');
                    showAlert('Seluruh data studi kasus Pelatihan BUMN 3-Hari berhasil diterapkan.', 'success');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  <span>Terapkan Semua Data</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* CARD 1: HPP Proyek Pelatihan BUMN 3-Hari */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200 font-mono">
                      OPP-2026-089
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      HPP 15 Pos Biaya
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                      Digital Leadership & Transformation Training BUMN 3-Days
                    </h4>
                    <p className="text-xs font-semibold text-teal-700 mt-0.5">
                      PT Telekomunikasi Indonesia BUMN
                    </p>
                  </div>

                  {/* Financial Stats */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Peserta & Durasi:</span>
                      <span className="font-bold text-slate-800">30 Pax + 5 Tim (3 Hari)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Venue Pelatihan:</span>
                      <span className="font-bold text-slate-800">Grand Hyatt Ballroom</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-1">
                      <span className="text-slate-500">Total Modal HPP:</span>
                      <span className="font-mono font-bold text-slate-900">Rp 162.850.000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Nilai Penawaran:</span>
                      <span className="font-mono font-bold text-teal-800">Rp 250.538.461</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Gross Margin:</span>
                      <span className="font-mono font-extrabold text-emerald-700">38.6% (Hijau/Aman)</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Termasuk rincian honor Master Trainer Rp 45 Jt, paket fullboard hotel Rp 69,45 Jt, modul cetak hardcover, tiket Garuda PP, dan video cinematic.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onLoadFullTrainingData?.('bumn_full');
                      onNavigateTab?.('estimator');
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition flex items-center justify-center space-x-1.5 shadow-2xs cursor-pointer"
                  >
                    <span>Buka HPP Estimator</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onLoadFullTrainingData?.('bumn_full');
                      onNavigateTab?.('negotiation');
                    }}
                    className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center justify-center cursor-pointer"
                    title="Buka Matriks Diskon & Guardrail"
                  >
                    <Sliders className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                </div>
              </div>

              {/* CARD 2: Kasbon Operasional Lapangan */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-purple-50 text-purple-800 border border-purple-200 font-mono">
                      CASH ADVANCE
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                      3 Transaksi Riil
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                      Kasbon Operasional & Rekonsiliasi Lapangan
                    </h4>
                    <p className="text-xs font-semibold text-purple-700 mt-0.5">
                      Total Dana Muka: Rp 7.500.000
                    </p>
                  </div>

                  {/* List of 3 Cash Advances */}
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 space-y-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>KASBON-088: Budi Raharjo</span>
                        <span className="font-mono text-emerald-700">Rp 3.500.000</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">Parkir VIP, Tip Porter Bagasi & Konsumsi Panitia</p>
                      <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Settled (Lunas / Sisa Rp 350rb)
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>KASBON-089: Siti Nurhaliza</span>
                        <span className="font-mono text-purple-700">Rp 1.800.000</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">ATK Spidol Khusus, Flipchart & Flashdisk Backup</p>
                      <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 border border-purple-200">
                        Disbursed (Dicairkan)
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>KASBON-090: Ahmad Fauzi</span>
                        <span className="font-mono text-slate-700">Rp 2.200.000</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">Pengawalan Kargo Modul & Antar-Jemput Trainer</p>
                      <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                        Draft Pengajuan
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      onLoadFullTrainingData?.('bumn_full');
                      onNavigateTab?.('kasbon');
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs transition flex items-center justify-center space-x-1.5 shadow-2xs cursor-pointer"
                  >
                    <span>Buka Kasbon Operasional Lapangan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* CARD 3: Purchase Orders (PO) Vendor Rekanan */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200 font-mono">
                      PURCHASE ORDER
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                      3 PO Rekanan
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                      Purchase Orders & Kontrak Vendor Lapangan
                    </h4>
                    <p className="text-xs font-semibold text-blue-700 mt-0.5">
                      Total Komitmen PO: Rp 97.150.000
                    </p>
                  </div>

                  {/* List of 3 Purchase Orders */}
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 space-y-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>PO-001/HOTEL: Grand Hyatt</span>
                        <span className="font-mono text-blue-700">Rp 69.450.000</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">Fullboard Meeting Ballroom & 3 Kamar Tim 3 Hari</p>
                      <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Approved (PO Dirilis)
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>PO-002/KIT: CV Sinar Printing</span>
                        <span className="font-mono text-blue-700">Rp 14.200.000</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">Executive Kit 30 Pax, Modul Hardcover & Plakat</p>
                      <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Approved (PO Dirilis)
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>PO-003/TRAVEL: Garuda Indonesia</span>
                        <span className="font-mono text-blue-700">Rp 13.500.000</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">Tiket PP Trainer Utama & Kargo Equipment 50kg</p>
                      <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                        Draft Pengajuan
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      onLoadFullTrainingData?.('bumn_full');
                      onNavigateTab?.('rap');
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs transition flex items-center justify-center space-x-1.5 shadow-2xs cursor-pointer"
                  >
                    <span>Buka RAP & PO Generator</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* CARD 4: Akun Simulasi Multi-Role */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
                      MULTI-ROLE RBAC
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      7 Akun Simulasi
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                      Profil Staf & Struktur Alur Persetujuan
                    </h4>
                    <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                      Latihan Rotasi Peran & Otorisasi
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 space-y-1.5 text-[11px]">
                    <div className="flex justify-between items-center text-slate-700 py-0.5">
                      <span>• CIP 2017 (Super Admin)</span>
                      <span className="text-[10px] font-bold font-mono text-purple-700">super_admin</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 py-0.5">
                      <span>• Fajar Pratama (Admin)</span>
                      <span className="text-[10px] font-bold font-mono text-teal-700">administrator</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 py-0.5">
                      <span>• Budi Raharjo (Sales Lead)</span>
                      <span className="text-[10px] font-bold font-mono text-slate-600">pengguna</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 py-0.5">
                      <span>• Siska Amanda (Finance)</span>
                      <span className="text-[10px] font-bold font-mono text-slate-600">pengguna</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 py-0.5">
                      <span>• Ahmad Fauzi (Logistics)</span>
                      <span className="text-[10px] font-bold font-mono text-slate-600">pengguna</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 py-0.5">
                      <span>• Dr. Raditya (Master Trainer)</span>
                      <span className="text-[10px] font-bold font-mono text-slate-600">pengguna</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Setiap peran memiliki wewenang berbeda: Sales menyusun HPP, Finance memverifikasi batas margin, dan Direksi menyetujui rilis PO.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('users')}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition flex items-center justify-center space-x-1.5 shadow-2xs cursor-pointer"
                  >
                    <span>Kelola Akun Pengguna</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* CARD 6: Silabus & Run Sheet Rundown Acara */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 font-mono">
                      SILABUS & RUNSHEET
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      5 Silabus Unggulan
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                      Katalog Silabus & Run Sheet Pelatihan 3-Hari
                    </h4>
                    <p className="text-xs font-semibold text-amber-800 mt-0.5">
                      Standar Kurikulum Pelatihan BUMN
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 space-y-1.5 text-[11px] text-slate-700">
                    <div className="p-1.5 bg-white rounded-lg border border-slate-200/80">
                      <strong>1. Digital Leadership for BUMN</strong> (3 Hari)
                      <p className="text-[10px] text-slate-500">Rate Trainer: Rp 15 Jt/hari • Modul Level Eksekutif</p>
                    </div>
                    <div className="p-1.5 bg-white rounded-lg border border-slate-200/80">
                      <strong>2. Service Excellence Transformation</strong> (2 Hari)
                      <p className="text-[10px] text-slate-500">Rate Trainer: Rp 12.5 Jt/hari • Standar Perbankan</p>
                    </div>
                    <div className="p-1.5 bg-white rounded-lg border border-slate-200/80">
                      <strong>3. Financial Modeling Masterclass</strong> (3 Hari)
                      <p className="text-[10px] text-slate-500">Rate Trainer: Rp 14 Jt/hari • Feasibility Study</p>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Termasuk template susunan acara (Run Sheet) rundown menit-demi-menit dengan PIC pelaksana dan perlengkapan.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onNavigateTab?.('silabus')}
                    className="w-full py-2 px-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs transition flex items-center justify-center space-x-1.5 shadow-2xs cursor-pointer"
                  >
                    <span>Buka Katalog Silabus Pelatihan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* CARD 7: Data Nama-Nama Lembaga / Organisasi Moda Training */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200 font-mono">
                      DATA LEMBAGA SIMULASI
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                      {organizations.length} Lembaga Terdaftar
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                      Entitas Nama-Nama Lembaga Dalam Moda Training
                    </h4>
                    <p className="text-xs font-semibold text-teal-700 mt-0.5">
                      Koleksi Organisasi Tenant SaaS Terdaftar
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 space-y-2 text-[11px]">
                    {organizations.map((org) => {
                      const isActive = activeOrganization?.id_organization === org.id_organization;
                      return (
                        <div key={org.id_organization} className="p-2 rounded-lg bg-white border border-slate-200/80 flex items-center justify-between">
                          <div className="min-w-0 pr-2">
                            <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                              <span>{org.name}</span>
                              {isActive && (
                                <span className="px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 text-[9px] font-extrabold shrink-0">Aktif</span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono truncate">
                              id: {org.id_organization} • {org.tier}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              onSelectOrganization(org);
                              showAlert(`Lembaga '${org.name}' dipilih sebagai entitas Moda Training.`, 'success');
                            }}
                            className={`px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer shrink-0 ${
                              isActive
                                ? 'bg-teal-700 text-white shadow-2xs'
                                : 'bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200'
                            }`}
                          >
                            {isActive ? 'Aktif' : 'Pilih'}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Nama-nama lembaga di atas telah dipindahkan dan diintegrasikan ke Moda Training sebagai entitas organisasi simulasi multi-tenant SaaS.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      onLoadFullTrainingData?.('bumn_full');
                      showAlert('Moda Training & Data Lembaga Simulasi Berhasil Dimuat!', 'success');
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition flex items-center justify-center space-x-1.5 shadow-2xs cursor-pointer"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Muat Data Moda Training Lembaga</span>
                  </button>
                </div>
              </div>

              {/* CARD 6: Skenario Latihan Mandiri (Blank Template) */}
              <div className="bg-white rounded-2xl p-5 border border-dashed border-slate-300 shadow-2xs flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                      TEMPLATE BARU
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      Simulasi Mandiri
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                      Draf Kosong Latihan Simulasi (PRJ-2026-001)
                    </h4>
                    <p className="text-xs font-semibold text-slate-600 mt-0.5">
                      Lembar Draf Baru untuk Uji Coba Tim
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-600 space-y-2">
                    <p className="text-[11px] leading-relaxed">
                      Gunakan template draf ini untuk latihan simulasi staf membuat estimasi biaya penawaran baru dari awal (0% discount, 15 pos default terisi).
                    </p>
                    <ul className="text-[10px] text-slate-500 list-disc list-inside space-y-1">
                      <li>Uji verifikasi pos biaya oleh pemeriksa</li>
                      <li>Uji negosiasi diskon guardrail margin</li>
                      <li>Uji coba penerbitan PO vendor baru</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      onLoadFullTrainingData?.('blank_draft');
                      showAlert('Draf latihan baru (PRJ-2026-001) berhasil disiapkan.', 'success');
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition flex items-center justify-center space-x-1.5 shadow-2xs cursor-pointer"
                  >
                    <span>Muat Draf Latihan Baru</span>
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
