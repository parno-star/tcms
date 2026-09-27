import React, { useState } from 'react';
import { Employee, Organization, UserRole } from '../types';
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Edit2,
  Trash2,
  KeyRound,
  Lock,
  Unlock,
  Building2,
  Mail,
  Phone,
  Calendar,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Info,
  ArrowRight,
  Eye,
  Check,
  X,
  Database,
  Sparkles,
  Layers,
} from 'lucide-react';

interface TenantUserManagementViewProps {
  employees: Employee[];
  organizations: Organization[];
  activeOrganization: Organization;
  activeRole: UserRole;
  currentEmployee: Employee;
  onSelectEmployee: (emp: Employee) => void;
  onAddEmployee: (emp: Employee) => void;
  onUpdateEmployee: (emp: Employee) => void;
  onDeleteEmployee?: (empId: string) => void;
  onBackToGrid?: () => void;
  isSimulationMode?: boolean;
  isSuperAdminPanel?: boolean;
}

export const TenantUserManagementView: React.FC<TenantUserManagementViewProps> = ({
  employees,
  organizations,
  activeOrganization,
  activeRole,
  currentEmployee,
  onSelectEmployee,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onBackToGrid,
  isSimulationMode = false,
  isSuperAdminPanel = false,
}) => {
  // Filters state
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [selectedOrgFilter, setSelectedOrgFilter] = useState<string>(activeRole === 'super_admin' ? 'all' : activeOrganization.id_organization);

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [detailEmployee, setDetailEmployee] = useState<Employee | null>(null);
  const [rejectingEmployee, setRejectingEmployee] = useState<Employee | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formNik, setFormNik] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCompanyName, setFormCompanyName] = useState('PT Star Office Solusi');
  const [formCompanyPhone, setFormCompanyPhone] = useState('');
  const [formCompanyAddress, setFormCompanyAddress] = useState('');
  const [formCompanyEmail, setFormCompanyEmail] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDepartment, setFormDepartment] = useState('Sales & Commercial Enterprise');
  const [formLevel, setFormLevel] = useState<'Staff / Specialist' | 'Manager / Supervisor' | 'Executive / Director' | 'Administrator' | 'Super Admin'>('Staff / Specialist');
  const [formRole, setFormRole] = useState<UserRole>('konseptor');
  const [formOrgId, setFormOrgId] = useState<string>(activeOrganization.id_organization);
  const [formStatus, setFormStatus] = useState<Employee['status']>('Aktif / Online');
  const [formRegistrationStatus, setFormRegistrationStatus] = useState<'Menunggu Persetujuan' | 'Disetujui' | 'Ditolak'>('Disetujui');
  const [formSignupSource, setFormSignupSource] = useState<Employee['signupSource']>('Form Pendaftaran Web');
  const [formInstitution, setFormInstitution] = useState('PT Star Office Solusi');
  const [formDescription, setFormDescription] = useState('');

  // Toast / notification
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'warning' | 'info'; text: string } | null>(null);

  const showAlert = (text: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  // KPI Calculations
  const isCipkaiSuperAdmin = currentEmployee.email?.toLowerCase() === 'cipkai2017@gmail.com';
  const showCompanyColumn = activeRole === 'super_admin';
  const scopedEmployees = isSuperAdminPanel 
    ? employees 
    : employees.filter((emp) => {
        if (emp.role === 'super_admin' && !isCipkaiSuperAdmin) return false;
        return true;
      });

  const totalCount = scopedEmployees.length;
  const pendingCount = scopedEmployees.filter(
    (e) => e.registrationStatus === 'Menunggu Persetujuan' || e.status === 'Menunggu Persetujuan'
  ).length;
  const activeCount = scopedEmployees.filter(
    (e) =>
      (e.registrationStatus === 'Disetujui' || !e.registrationStatus) &&
      (e.status.includes('Aktif') || e.status === 'In Meeting' || e.status === 'Dinas Luar')
  ).length;
  const rejectedCount = scopedEmployees.filter(
    (e) => e.registrationStatus === 'Ditolak' || e.status === 'Ditolak' || e.status === 'Suspended'
  ).length;

  // Filtered employees for table
  const filteredEmployees = scopedEmployees.filter((emp) => {
    // Org filter
    if (selectedOrgFilter !== 'all' && emp.id_organization !== selectedOrgFilter) return false;

    // Role filter
    if (selectedRoleFilter !== 'all' && emp.role !== selectedRoleFilter) return false;

    // Status filter
    if (statusFilter === 'pending') {
      if (emp.registrationStatus !== 'Menunggu Persetujuan' && emp.status !== 'Menunggu Persetujuan') return false;
    } else if (statusFilter === 'active') {
      if (emp.registrationStatus === 'Menunggu Persetujuan' || emp.registrationStatus === 'Ditolak' || emp.status === 'Ditolak' || emp.status === 'Suspended') return false;
    } else if (statusFilter === 'rejected') {
      if (emp.registrationStatus !== 'Ditolak' && emp.status !== 'Ditolak' && emp.status !== 'Suspended') return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = emp.name.toLowerCase().includes(q);
      const matchEmail = emp.email.toLowerCase().includes(q);
      const matchNik = emp.nik.toLowerCase().includes(q);
      const matchTitle = emp.title.toLowerCase().includes(q);
      const matchDept = emp.department.toLowerCase().includes(q);
      const matchPhone = emp.phone ? emp.phone.toLowerCase().includes(q) : false;
      const matchCompany = (emp.companyName ? emp.companyName.toLowerCase().includes(q) : false) ||
        (emp.institution ? emp.institution.toLowerCase().includes(q) : false) ||
        (emp.institutionOrCompany ? emp.institutionOrCompany.toLowerCase().includes(q) : false);
      const matchCompanyPhone = emp.companyPhone ? emp.companyPhone.toLowerCase().includes(q) : false;
      const matchCompanyEmail = emp.companyEmail ? emp.companyEmail.toLowerCase().includes(q) : false;
      const matchCompanyAddress = emp.companyAddress ? emp.companyAddress.toLowerCase().includes(q) : false;
      const orgName = organizations.find((o) => o.id_organization === emp.id_organization)?.name || '';
      const matchOrgName = orgName.toLowerCase().includes(q);

      if (!matchName && !matchEmail && !matchNik && !matchTitle && !matchDept && !matchPhone && !matchCompany && !matchCompanyPhone && !matchCompanyEmail && !matchCompanyAddress && !matchOrgName) {
        return false;
      }
    }

    return true;
  });

  const sortedFilteredEmployees = [...filteredEmployees].sort((a, b) => {
    const aIsSuper = a.role === 'super_admin' || a.email?.toLowerCase() === 'cipkai2017@gmail.com';
    const bIsSuper = b.role === 'super_admin' || b.email?.toLowerCase() === 'cipkai2017@gmail.com';

    const aIsAdmin = a.role === 'administrator';
    const bIsAdmin = b.role === 'administrator';

    if (isCipkaiSuperAdmin) {
      if (aIsSuper && !bIsSuper) return -1;
      if (!aIsSuper && bIsSuper) return 1;
      if (aIsSuper && bIsSuper) return 0;

      if (aIsAdmin && !bIsAdmin) return -1;
      if (!aIsAdmin && bIsAdmin) return 1;
    } else {
      if (aIsAdmin && !bIsAdmin) return -1;
      if (!aIsAdmin && bIsAdmin) return 1;
    }

    return 0;
  });

  // Action handlers
  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setFormName('');
    setFormNik(`NIK-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
    setFormEmail('');
    setFormPhone('');
    setFormCompanyName(activeOrganization.name);
    setFormCompanyPhone('');
    setFormCompanyAddress('');
    setFormCompanyEmail('');
    setFormTitle('Staff Estimator & Presales');
    setFormDepartment('Sales & Commercial Enterprise');
    setFormLevel('Staff / Specialist');
    setFormRole('konseptor');
    setFormOrgId(activeOrganization.id_organization);
    setFormStatus('Aktif / Online');
    setFormRegistrationStatus('Disetujui');
    setFormSignupSource('Undangan Administrator');
    setFormInstitution(activeOrganization.name);
    setFormDescription('Pengguna resmi yang didaftarkan oleh Administrator Tenant.');
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormName(emp.name);
    setFormNik(emp.nik);
    setFormEmail(emp.email);
    setFormPhone(emp.phone || '');
    setFormCompanyName(emp.companyName || emp.institution || emp.institutionOrCompany || activeOrganization.name);
    setFormCompanyPhone(emp.companyPhone || '');
    setFormCompanyAddress(emp.companyAddress || '');
    setFormCompanyEmail(emp.companyEmail || '');
    setFormTitle(emp.title);
    setFormDepartment(emp.department);
    setFormLevel(emp.level);
    setFormRole(emp.role);
    setFormOrgId(emp.id_organization);
    setFormStatus(emp.status);
    setFormRegistrationStatus(emp.registrationStatus || (emp.status === 'Menunggu Persetujuan' ? 'Menunggu Persetujuan' : emp.status === 'Ditolak' ? 'Ditolak' : 'Disetujui'));
    setFormSignupSource(emp.signupSource || 'Form Pendaftaran Web');
    setFormInstitution(emp.institutionOrCompany || emp.companyName || activeOrganization.name);
    setFormDescription(emp.description || '');
    setIsAddEditModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      showAlert('Nama lengkap dan email wajib diisi.', 'warning');
      return;
    }

    if (formRole === 'administrator') {
      if (activeRole !== 'super_admin' && activeRole !== 'administrator' && currentEmployee.role !== 'super_admin' && currentEmployee.role !== 'administrator') {
        showAlert('Hanya Super Admin dan Administrator yang memiliki wewenang untuk mengatur peran Administrator.', 'warning');
        return;
      }

      const isCurrentAdmin = (activeRole === 'administrator' || currentEmployee.role === 'administrator');
      const isEditingOther = editingEmployee && editingEmployee.id !== currentEmployee.id;
      const isCreatingNew = !editingEmployee;

      if (isCurrentAdmin && (isEditingOther || isCreatingNew)) {
        const demotedCurrent: Employee = {
          ...currentEmployee,
          role: 'pengguna',
        };
        onUpdateEmployee(demotedCurrent);
        showAlert('Anda menetapkan Administrator baru. Sesuai kebijakan, peran Anda dialihkan menjadi Pengguna.');
      }
    }

    if (formRole === 'super_admin' && formEmail.trim().toLowerCase() !== 'cipkai2017@gmail.com') {
      showAlert('Sesuai kebijakan keamanan, akun Super Admin hanya eksklusif untuk cipkai2017@gmail.com.', 'warning');
      return;
    }

    if (editingEmployee) {
      const updated: Employee = {
        ...editingEmployee,
        name: formName,
        nik: formNik,
        email: formEmail,
        phone: formPhone,
        companyName: formCompanyName,
        companyPhone: formCompanyPhone,
        companyAddress: formCompanyAddress,
        companyEmail: formCompanyEmail,
        institution: formCompanyName,
        institutionOrCompany: formCompanyName,
        title: formTitle,
        department: formDepartment,
        level: formLevel,
        role: formRole,
        id_organization: formOrgId,
        status: formStatus,
        registrationStatus: formRegistrationStatus,
        signupSource: formSignupSource,
        description: formDescription,
      };
      onUpdateEmployee(updated);
      showAlert(`Data pengguna ${formName} berhasil diperbarui.`);
    } else {
      const initials = formName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

      const newEmp: Employee = {
        id: `emp-${Date.now().toString().slice(-4)}`,
        id_organization: formOrgId,
        nik: formNik,
        name: formName,
        email: formEmail,
        phone: formPhone,
        companyName: formCompanyName,
        companyPhone: formCompanyPhone,
        companyAddress: formCompanyAddress,
        companyEmail: formCompanyEmail,
        institution: formCompanyName,
        institutionOrCompany: formCompanyName,
        title: formTitle,
        department: formDepartment,
        level: formLevel,
        role: formRole,
        status: formStatus,
        registrationStatus: formRegistrationStatus,
        signupSource: formSignupSource,
        registeredAt: `${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`,
        approvedBy: currentEmployee.name,
        approvedAt: `${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} WIB`,
        description: formDescription,
        avatarBg:
          formRole === 'super_admin'
            ? 'bg-purple-600 text-white'
            : formRole === 'administrator'
            ? 'bg-indigo-600 text-white'
            : formRole === 'penyetuju'
            ? 'bg-emerald-600 text-white'
            : formRole === 'pemeriksa'
            ? 'bg-amber-600 text-white'
            : 'bg-blue-600 text-white',
        avatarText: initials || 'US',
        createdDate: new Date().toISOString().split('T')[0],
      };
      onAddEmployee(newEmp);
      showAlert(`Pengguna baru ${formName} berhasil ditambahkan ke organisasi.`);
    }
    setIsAddEditModalOpen(false);
  };

  // Quick Approval
  const handleApproveUser = (emp: Employee, overrideRole?: UserRole) => {
    const assignedRole = overrideRole || emp.role;
    const nowTime = `${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;
    const updated: Employee = {
      ...emp,
      registrationStatus: 'Disetujui',
      status: 'Aktif / Online',
      role: assignedRole,
      approvedBy: currentEmployee.name,
      approvedAt: nowTime,
      rejectionReason: undefined,
    };
    onUpdateEmployee(updated);
    showAlert(`Pendaftaran ${emp.name} berhasil DISETUJUI dengan peran [${assignedRole.toUpperCase()}]. Akun kini aktif.`);
    if (detailEmployee && detailEmployee.id === emp.id) {
      setDetailEmployee(updated);
    }
  };

  // Rejection with reason
  const handleOpenRejectModal = (emp: Employee) => {
    setRejectingEmployee(emp);
    setRejectReason('Data pendaftaran atau email tidak terdaftar dalam basis data resmi tenant.');
  };

  const handleConfirmReject = () => {
    if (!rejectingEmployee) return;
    const updated: Employee = {
      ...rejectingEmployee,
      registrationStatus: 'Ditolak',
      status: 'Ditolak',
      rejectionReason: rejectReason.trim() || 'Pendaftaran ditolak oleh Administrator Tenant.',
    };
    onUpdateEmployee(updated);
    showAlert(`Pendaftaran ${rejectingEmployee.name} telah DITOLAK.`, 'warning');
    setRejectingEmployee(null);
    if (detailEmployee && detailEmployee.id === rejectingEmployee.id) {
      setDetailEmployee(updated);
    }
  };

  // Quick Role Change
  const handleQuickRoleChange = (emp: Employee, newRole: UserRole) => {
    if (newRole === 'administrator') {
      if (activeRole !== 'super_admin' && activeRole !== 'administrator' && currentEmployee.role !== 'super_admin' && currentEmployee.role !== 'administrator') {
        showAlert('Hanya Super Admin dan Administrator yang memiliki wewenang untuk mengatur peran Administrator.', 'warning');
        return;
      }

      const isCurrentAdmin = (activeRole === 'administrator' || currentEmployee.role === 'administrator');
      const isOtherUser = emp.id !== currentEmployee.id;

      if (isCurrentAdmin && isOtherUser) {
        const demotedCurrent: Employee = {
          ...currentEmployee,
          role: 'pengguna',
        };
        onUpdateEmployee(demotedCurrent);
        showAlert(`Anda menunjuk ${emp.name} sebagai Administrator. Sesuai kebijakan, peran Anda dialihkan menjadi Pengguna.`);
      }
    }

    if (newRole === 'super_admin' && emp.email?.toLowerCase().trim() !== 'cipkai2017@gmail.com') {
      showAlert('Sesuai kebijakan keamanan, akun Super Admin hanya eksklusif untuk cipkai2017@gmail.com.', 'warning');
      return;
    }

    const updated: Employee = {
      ...emp,
      role: newRole,
    };
    onUpdateEmployee(updated);
    if (!((activeRole === 'administrator' || currentEmployee.role === 'administrator') && emp.id !== currentEmployee.id && newRole === 'administrator')) {
      showAlert(`Peran otorisasi untuk ${emp.name} diubah menjadi [${newRole.toUpperCase()}].`);
    }
  };

  // Toggle Suspended / Active
  const handleToggleUserStatus = (emp: Employee) => {
    const newStatus: Employee['status'] = emp.status === 'Suspended' ? 'Aktif / Online' : 'Suspended';
    const updated: Employee = { ...emp, status: newStatus };
    onUpdateEmployee(updated);
    showAlert(`Status akun ${emp.name} diubah menjadi: ${newStatus}`);
  };

  // Reset password toast
  const handleResetPassword = (emp: Employee) => {
    showAlert(`Instruksi dan tautan reset password telah dikirim ke: ${emp.email}`);
  };

  // Delete User
  const handleOpenDeleteModal = (emp: Employee) => {
    if (emp.id === currentEmployee.id) {
      showAlert('Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.', 'warning');
      return;
    }
    setDeletingEmployee(emp);
  };

  const handleConfirmDelete = () => {
    if (!deletingEmployee) return;
    if (onDeleteEmployee) {
      onDeleteEmployee(deletingEmployee.id);
    } else {
      // Fallback: update status to Suspended if delete not provided
      const updated: Employee = { ...deletingEmployee, status: 'Suspended' };
      onUpdateEmployee(updated);
    }
    showAlert(`Akun pengguna ${deletingEmployee.name} berhasil dihapus.`);
    setDeletingEmployee(null);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Toast Alert */}
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
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
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

      {/* Header & Subtitle */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200/90 flex items-center justify-center text-teal-700 shrink-0 shadow-2xs">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Pengaturan Pengguna Aplikasi &amp; Manajemen Pendaftaran
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-900 border border-teal-200">
                Tenant Admin
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Kelola data pendaftaran akun dari form web/sign-up, verifikasi persetujuan pendaftar, penetapan peran (RBAC), edit profil karyawan, dan kontrol akses tenant.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Daftarkan Pengguna Baru</span>
        </button>
      </div>

      {/* 4 Interactive KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-xl border transition cursor-pointer shadow-2xs ${
            statusFilter === 'all'
              ? 'bg-teal-50/70 border-teal-300 ring-2 ring-teal-500/20'
              : 'bg-white border-slate-200/90 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Pengguna</span>
            <Users className="w-4 h-4 text-teal-700" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Semua data akun tenant</div>
        </div>

        <div
          onClick={() => setStatusFilter('pending')}
          className={`p-4 rounded-xl border transition cursor-pointer shadow-2xs ${
            statusFilter === 'pending'
              ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200/90 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
              {pendingCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
              Menunggu Persetujuan
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 mt-1">{pendingCount}</div>
          <div className="text-[11px] text-amber-800 font-medium mt-0.5">
            {pendingCount > 0 ? 'Perlu tindakan admin' : 'Tidak ada antrean'}
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('active')}
          className={`p-4 rounded-xl border transition cursor-pointer shadow-2xs ${
            statusFilter === 'active'
              ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200/90 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Aktif &amp; Disetujui</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-800 mt-1">{activeCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Dapat login &amp; akses sistem</div>
        </div>

        <div
          onClick={() => setStatusFilter('rejected')}
          className={`p-4 rounded-xl border transition cursor-pointer shadow-2xs ${
            statusFilter === 'rejected'
              ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-500/20'
              : 'bg-white border-slate-200/90 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ditolak / Nonaktif</span>
            <UserX className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700 mt-1">{rejectedCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Akses ditolak / dikunci</div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 lg:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-teal-700 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center space-x-1.5 cursor-pointer ${
              statusFilter === 'pending'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <span>Menunggu Persetujuan</span>
            {pendingCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === 'pending' ? 'bg-amber-800 text-white' : 'bg-amber-200 text-amber-900 font-black'}`}>
                {pendingCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Aktif / Disetujui ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('rejected')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              statusFilter === 'rejected'
                ? 'bg-rose-700 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Ditolak ({rejectedCount})
          </button>
        </div>

        {/* Search & Role Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative min-w-[220px] flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, NIK, email, WA..."
              className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          {/* Role Filter */}
          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-semibold focus:bg-white cursor-pointer"
          >
            <option value="all">Semua Peran</option>
            <option value="super_admin">Super Admin</option>
            <option value="administrator">Administrator</option>
            <option value="konseptor">Konseptor</option>
            <option value="pemeriksa">Pemeriksa</option>
            <option value="penyetuju">Penyetuju</option>
            <option value="pengguna">Pengguna</option>
          </select>

          {/* Tenant Filter (If Super Admin) */}
          {activeRole === 'super_admin' && (
            <select
              value={selectedOrgFilter}
              onChange={(e) => setSelectedOrgFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-semibold focus:bg-white cursor-pointer"
            >
              <option value="all">Semua Tenant</option>
              {organizations.map((org) => (
                <option key={org.id_organization} value={org.id_organization}>
                  {org.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Main User & Sign-up Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3 min-w-[220px]">1. Pendaftar (Nama, Telp, Email)</th>
                {showCompanyColumn && (
                  <th className="px-4 py-3 min-w-[240px]">2. Perusahaan (Nama, Telp, Email, Alamat)</th>
                )}
                <th className="px-4 py-3 min-w-[150px]">Peran (Role RBAC)</th>
                <th className="px-4 py-3 min-w-[140px] text-center">Status Akun</th>
                <th className="px-4 py-3 min-w-[160px] text-right">Tindakan Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {sortedFilteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={showCompanyColumn ? 5 : 4} className="px-4 py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">Tidak ada pengguna yang cocok</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Coba sesuaikan kata kunci pencarian atau ganti filter status di atas.
                    </p>
                  </td>
                </tr>
              ) : (
                sortedFilteredEmployees.map((emp) => {
                  const isCurrentUser = currentEmployee.id === emp.id;
                  const isPending = emp.registrationStatus === 'Menunggu Persetujuan' || emp.status === 'Menunggu Persetujuan';
                  const isRejected = emp.registrationStatus === 'Ditolak' || emp.status === 'Ditolak';

                  return (
                    <tr
                      key={emp.id}
                      className={`hover:bg-slate-50/80 transition ${
                        isPending ? 'bg-amber-50/30' : isCurrentUser ? 'bg-teal-50/30' : ''
                      }`}
                    >
                      {/* Column 1: User Profile & Contact */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center space-x-3">
                          <div className="relative shrink-0">
                            {emp.avatarUrl ? (
                              <img
                                src={emp.avatarUrl}
                                alt={emp.name}
                                className="w-9 h-9 rounded-full object-cover border border-slate-200"
                              />
                            ) : (
                              <div
                                className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center ${emp.avatarBg}`}
                              >
                                {emp.avatarText}
                              </div>
                            )}
                            {emp.status.includes('Aktif') && (
                              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                            )}
                            {isPending && (
                              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white animate-ping" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{emp.name}</span>
                              {isCurrentUser && (
                                <span className="text-[9px] bg-teal-700 text-white font-bold px-1.5 py-0.2 rounded">
                                  Anda
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{emp.email}</span>
                            </div>
                            {emp.phone && (
                              <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                                <Phone className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                <span>{emp.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Perusahaan & Kontak Bisnis (Hanya tampil untuk Super Admin) */}
                      {showCompanyColumn && (
                        <td className="px-4 py-3.5">
                          <div className="flex items-start space-x-2.5">
                            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-700 shrink-0 mt-0.5">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-slate-900 text-xs truncate">
                                {emp.companyName ||
                                  emp.institution ||
                                  emp.institutionOrCompany ||
                                  organizations.find((o) => o.id_organization === emp.id_organization)?.name ||
                                  'PT Star Office Solusi'}
                              </div>
                              <div className="text-[10px] text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                                {emp.companyPhone && (
                                  <span className="text-slate-600 font-mono">
                                    Telp: {emp.companyPhone}
                                  </span>
                                )}
                                {emp.companyEmail && (
                                  <>
                                    {emp.companyPhone && <span>•</span>}
                                    <span className="text-slate-500 truncate max-w-[140px]">{emp.companyEmail}</span>
                                  </>
                                )}
                              </div>
                              {emp.companyAddress && (
                                <div className="text-[10px] text-slate-400 truncate max-w-[200px] mt-0.5" title={emp.companyAddress}>
                                  📍 {emp.companyAddress}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      )}

                      {/* Column 3: Role Assignment (Interactive Dropdown for Admin) */}
                      <td className="px-4 py-3.5">
                        <select
                          value={emp.role}
                          disabled={isCurrentUser || (emp.role === 'super_admin' && activeRole !== 'super_admin')}
                          onChange={(e) => handleQuickRoleChange(emp, e.target.value as UserRole)}
                          className={`text-[11px] font-bold rounded-lg px-2 py-1 border transition cursor-pointer ${
                            emp.role === 'super_admin'
                              ? 'bg-purple-50 text-purple-900 border-purple-200'
                              : emp.role === 'administrator'
                              ? 'bg-indigo-50 text-indigo-900 border-indigo-200'
                              : emp.role === 'penyetuju'
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                              : emp.role === 'pemeriksa'
                              ? 'bg-amber-50 text-amber-900 border-amber-200'
                              : emp.role === 'konseptor'
                              ? 'bg-blue-50 text-blue-900 border-blue-200'
                              : 'bg-teal-50 text-teal-900 border-teal-200'
                          } ${isCurrentUser ? 'opacity-90 cursor-not-allowed' : 'hover:ring-1 hover:ring-teal-400'}`}
                        >
                          {emp.email?.toLowerCase().trim() === 'cipkai2017@gmail.com' && (
                            <option value="super_admin">Super Admin</option>
                          )}
                          <option value="administrator">Administrator</option>
                          <option value="konseptor">Konseptor</option>
                          <option value="pemeriksa">Pemeriksa</option>
                          <option value="penyetuju">Penyetuju</option>
                          <option value="pengguna">Pengguna</option>
                        </select>
                        <div className="text-[10px] text-slate-400 mt-1">Klik untuk ubah peran</div>
                      </td>

                      {/* Column 5: Status Badge */}
                      <td className="px-4 py-3.5 text-center">
                        {isPending ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                            <Clock className="w-3 h-3 text-amber-700 animate-spin" style={{ animationDuration: '4s' }} />
                            <span>Menunggu Persetujuan</span>
                          </span>
                        ) : isRejected ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>Pendaftaran Ditolak</span>
                          </span>
                        ) : emp.status === 'Suspended' ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                            <Lock className="w-3 h-3 text-slate-500" />
                            <span>Akun Dinonaktifkan</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            <span>{emp.status}</span>
                          </span>
                        )}
                      </td>

                      {/* Column 6: Admin Action Buttons */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {/* If Pending Approval: Show Direct Approve & Reject Buttons */}
                          {isPending ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApproveUser(emp)}
                                className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-2xs transition cursor-pointer"
                                title="Setujui pendaftaran dan aktifkan akun"
                              >
                                <Check className="w-3 h-3" />
                                <span>Setujui</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenRejectModal(emp)}
                                className="inline-flex items-center space-x-1 px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold transition cursor-pointer"
                                title="Tolak pendaftaran akun"
                              >
                                <X className="w-3 h-3" />
                                <span>Tolak</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setDetailEmployee(emp)}
                                className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition cursor-pointer"
                                title="Lihat detail isian formulir pendaftaran"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              {/* Switch / Login as User (Training Mode or Super Admin Panel) */}
                              {(isSimulationMode || isSuperAdminPanel) && (
                                <button
                                  type="button"
                                  onClick={() => onSelectEmployee(emp)}
                                  className="px-2 py-1 bg-slate-100 hover:bg-teal-100 hover:text-teal-800 rounded-lg text-[11px] font-bold text-slate-700 transition cursor-pointer"
                                  title="Login / Beralih sebagai pengguna ini"
                                >
                                  Masuk
                                </button>
                              )}

                              {/* Detail Sign-up */}
                              <button
                                type="button"
                                onClick={() => setDetailEmployee(emp)}
                                className="p-1 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition cursor-pointer"
                                title="Detail Pendaftaran"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Edit User */}
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(emp)}
                                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                title="Edit Data Pengguna"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Reset Password */}
                              <button
                                type="button"
                                onClick={() => handleResetPassword(emp)}
                                className="p-1 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                                title="Reset Kredensial / Password"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                              </button>

                              {/* Lock / Unlock */}
                              <button
                                type="button"
                                onClick={() => handleToggleUserStatus(emp)}
                                className={`p-1 rounded-lg transition cursor-pointer ${
                                  emp.status.includes('Aktif')
                                    ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                    : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                }`}
                                title={emp.status.includes('Aktif') ? 'Nonaktifkan / Kunci Akun' : 'Aktifkan Akun'}
                              >
                                {emp.status.includes('Aktif') ? (
                                  <Lock className="w-3.5 h-3.5" />
                                ) : (
                                  <Unlock className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {/* Delete User */}
                              {!isCurrentUser && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenDeleteModal(emp)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                  title="Hapus Akun Pengguna"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <div className="flex items-center space-x-2">
            <Database className="w-3.5 h-3.5 text-teal-700" />
            <span>
              Menampilkan <strong>{filteredEmployees.length}</strong> dari <strong>{scopedEmployees.length}</strong> akun pengguna terdaftar.
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Otorisasi Multi-Tenant &amp; RBAC Aktif</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: DETAIL / REVIEW DATA PENDAFTARAN (SIGN-UP INSPECTION) */}
      {/* ========================================================================= */}
      {detailEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="px-6 py-4 bg-teal-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">
                  Detail Pendaftaran Akun Pengguna
                </h3>
                <p className="text-[11px] text-teal-200">
                  Data formulir pendaftaran akun pengguna ke organisasi tenant
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailEmployee(null)}
                className="text-teal-200 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 text-xs">
              {/* Profile Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-3.5">
                <div
                  className={`w-12 h-12 rounded-xl font-bold text-base flex items-center justify-center shrink-0 ${detailEmployee.avatarBg}`}
                >
                  {detailEmployee.avatarText}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{detailEmployee.name}</h4>
                  <div className="text-slate-500 text-[11px] flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>{detailEmployee.email}</span>
                  </div>
                  {detailEmployee.phone && (
                    <div className="text-slate-500 text-[11px] flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{detailEmployee.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Grid of Registration Metadata (7 Data Pokok) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Nama Lengkap</div>
                  <div className="font-bold text-slate-900 mt-0.5">{detailEmployee.name}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">No. Telp / HP</div>
                  <div className="font-semibold text-slate-800 mt-0.5 font-mono">{detailEmployee.phone || '-'}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Email Pendaftar</div>
                  <div className="font-semibold text-slate-800 mt-0.5 truncate">{detailEmployee.email}</div>
                </div>

                {showCompanyColumn && (
                  <>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Nama Perusahaan</div>
                      <div className="font-bold text-teal-800 mt-0.5 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="truncate">{detailEmployee.companyName || detailEmployee.institution || detailEmployee.institutionOrCompany || activeOrganization.name}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">No Telpon Perusahaan</div>
                      <div className="font-semibold text-slate-800 mt-0.5 font-mono">
                        {detailEmployee.companyPhone || '-'}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Email Perusahaan</div>
                      <div className="font-semibold text-slate-800 mt-0.5 truncate">
                        {detailEmployee.companyEmail || '-'}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 col-span-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Alamat Perusahaan</div>
                      <div className="text-slate-700 mt-0.5 text-xs">
                        {detailEmployee.companyAddress || '-'}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Status & Approval Note */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Status &amp; Catatan Persetujuan</div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">
                    Status: {detailEmployee.registrationStatus || detailEmployee.status}
                  </span>
                </div>
                {detailEmployee.approvedBy && (
                  <div className="text-[11px] text-emerald-800 font-medium">
                    Disetujui oleh: <strong>{detailEmployee.approvedBy}</strong> ({detailEmployee.approvedAt})
                  </div>
                )}
                {detailEmployee.rejectionReason && (
                  <div className="text-[11px] text-rose-800 font-medium bg-rose-50 p-2 rounded-lg border border-rose-200">
                    Alasan Penolakan: <strong>{detailEmployee.rejectionReason}</strong>
                  </div>
                )}
                {detailEmployee.description && (
                  <div className="text-[11px] text-slate-600 mt-1">
                    Catatan: {detailEmployee.description}
                  </div>
                )}
              </div>

              {/* Action Buttons inside Detail Modal */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setDetailEmployee(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  Tutup
                </button>

                {(detailEmployee.registrationStatus === 'Menunggu Persetujuan' || detailEmployee.status === 'Menunggu Persetujuan') && (
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleOpenRejectModal(detailEmployee);
                      }}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      Tolak
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleApproveUser(detailEmployee);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
                    >
                      Setujui &amp; Aktifkan Akun
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: TOLAK PENDAFTARAN (REJECTION DIALOG) */}
      {/* ========================================================================= */}
      {rejectingEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-in">
            <div className="px-6 py-4 bg-rose-800 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Tolak Pendaftaran Akun</h3>
                <p className="text-[11px] text-rose-200">
                  Untuk pendaftar: {rejectingEmployee.name} ({rejectingEmployee.email})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRejectingEmployee(null)}
                className="text-rose-200 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 flex items-start space-x-2 text-rose-900">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Pendaftaran akun ini akan ditolak dan pengguna tidak dapat masuk ke sistem tenant. Silakan masukkan alasan penolakan untuk catatan audit.
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Alasan Penolakan *</label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Contoh: NIK atau email tidak terdaftar dalam basis data resmi HRD tenant..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setRejectingEmployee(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  Konfirmasi Tolak Pendaftaran
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: TAMBAH / EDIT PENGGUNA (FORM LENGKAP) */}
      {/* ========================================================================= */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-teal-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">
                  {editingEmployee ? 'Edit Data Pengguna & Hak Akses' : 'Daftarkan Pengguna Baru'}
                </h3>
                <p className="text-[11px] text-teal-200">
                  {editingEmployee ? `Memperbarui data akun untuk: ${editingEmployee.name}` : 'Registrasi akun staf dan penetapan wewenang RBAC'}
                </p>
              </div>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="text-teal-200 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveUser} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              {/* SECTION 1: DATA PENDAFTAR (3 DATA) */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-800 text-xs mb-2.5 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Data Pendaftar / Akun</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">1. Nama Lengkap *</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Nama Lengkap..."
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">2. No. Telp / WhatsApp *</label>
                    <input
                      type="text"
                      required
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="+62 812-xxxx-xxxx"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">3. Email Pendaftar *</label>
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="pendaftar@domain.com"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: DATA PERUSAHAAN (Hanya tampil untuk Super Admin) */}
              {showCompanyColumn && (
                <div className="bg-teal-50/50 p-3.5 rounded-xl border border-teal-200/80">
                  <div className="font-bold text-teal-900 text-xs mb-2.5 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-teal-700 text-white flex items-center justify-center text-[10px]">2</span>
                    <span>Data Profil Perusahaan</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">4. Nama Perusahaan *</label>
                      <input
                        type="text"
                        required
                        value={formCompanyName}
                        onChange={(e) => {
                          setFormCompanyName(e.target.value);
                          setFormInstitution(e.target.value);
                        }}
                        placeholder="PT Nama Perusahaan..."
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">5. No. Telpon Perusahaan</label>
                      <input
                        type="text"
                        value={formCompanyPhone}
                        onChange={(e) => setFormCompanyPhone(e.target.value)}
                        placeholder="(021) xxxxxxx"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">6. Email Perusahaan</label>
                      <input
                        type="email"
                        value={formCompanyEmail}
                        onChange={(e) => setFormCompanyEmail(e.target.value)}
                        placeholder="corporate@perusahaan.com"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">7. Alamat Perusahaan</label>
                    <input
                      type="text"
                      value={formCompanyAddress}
                      onChange={(e) => setFormCompanyAddress(e.target.value)}
                      placeholder="Gedung, Lantai, Jalan, Kota..."
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                </div>
              )}

              {/* SECTION 3: OTORISASI & STATUS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Peran (RBAC) *</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white"
                  >
                    {formEmail.trim().toLowerCase() === 'cipkai2017@gmail.com' && (
                      <option value="super_admin">Super Admin</option>
                    )}
                    <option value="administrator">Administrator</option>
                    <option value="konseptor">Konseptor</option>
                    <option value="pemeriksa">Pemeriksa</option>
                    <option value="penyetuju">Penyetuju</option>
                    <option value="pengguna">Pengguna</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Status Persetujuan</label>
                  <select
                    value={formRegistrationStatus}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setFormRegistrationStatus(val);
                      if (val === 'Disetujui') setFormStatus('Aktif / Online');
                      else if (val === 'Menunggu Persetujuan') setFormStatus('Menunggu Persetujuan');
                      else setFormStatus('Ditolak');
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white"
                  >
                    <option value="Disetujui">Disetujui &amp; Aktif</option>
                    <option value="Menunggu Persetujuan">Menunggu Persetujuan</option>
                    <option value="Ditolak">Ditolak</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Catatan Admin</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Catatan otorisasi pengguna..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  {editingEmployee ? 'Simpan Perubahan' : 'Daftarkan Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: KONFIRMASI HAPUS PENGGUNA */}
      {/* ========================================================================= */}
      {deletingEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-in">
            <div className="px-6 py-4 bg-rose-800 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Hapus Pengguna</h3>
                <p className="text-[11px] text-rose-200">Konfirmasi penghapusan akun tenant</p>
              </div>
              <button
                type="button"
                onClick={() => setDeletingEmployee(null)}
                className="text-rose-200 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 flex items-start space-x-2 text-rose-900">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <p className="font-bold">Apakah Anda yakin ingin menghapus akun ini?</p>
                  <p className="mt-1 text-rose-800 leading-relaxed">
                    Pengguna <strong>{deletingEmployee.name}</strong> ({deletingEmployee.email}) dengan NIK{' '}
                    <strong>{deletingEmployee.nik}</strong> akan dihapus dari daftar pengguna tenant.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setDeletingEmployee(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  Ya, Hapus Pengguna
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
