import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Employee, UserRole, Organization, RoleAccessDefinition } from '../types';
import { EMPLOYEES, ROLE_ACCESS_DEFINITIONS, ORGANIZATIONS } from '../data/initialData';
import {
  Users,
  UserCheck,
  ShieldCheck,
  Edit3,
  Lock,
  Search,
  CheckCircle2,
  Building2,
  Mail,
  Phone,
  BadgeCheck,
  Shield,
  LayoutList,
  LayoutGrid,
  X,
  Briefcase,
  Info,
  Clock,
  Check,
  XCircle,
  MapPin,
  Calendar,
  Award,
  Eye,
  Trash2,
  Plus,
  FileSpreadsheet,
  Upload,
  Download,
  Printer,
} from 'lucide-react';

interface EmployeeDirectoryProps {
  currentEmployee: Employee;
  onSelectEmployee: (employee: Employee) => void;
  employees?: Employee[];
  onAddEmployee?: (newEmp: Employee) => void;
  onUpdateEmployee?: (updatedEmp: Employee) => void;
  onDeleteEmployee?: (empId: string) => void;
  activeOrganization?: Organization;
  isSimulationMode?: boolean;
  onToggleSimulationMode?: (enable: boolean) => void;
}

export const EmployeeDirectory: React.FC<EmployeeDirectoryProps> = ({
  currentEmployee,
  onSelectEmployee,
  employees = EMPLOYEES,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  activeOrganization,
  isSimulationMode = false,
  onToggleSimulationMode,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('all');
  const [filterTenant, setFilterTenant] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modals States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isPrintSettingsModalOpen, setIsPrintSettingsModalOpen] = useState(false);
  const [selectedPrintColumns, setSelectedPrintColumns] = useState<string[]>(['no', 'nama', 'nip_nik', 'jabatan', 'departemen', 'kedudukan', 'atasan', 'telepon', 'email', 'alamat', 'tgl_lahir', 'role_rbac']);
  
  const [selectedEmployeeForView, setSelectedEmployeeForView] = useState<Employee | null>(null);
  const [selectedEmployeeForEdit, setSelectedEmployeeForEdit] = useState<Employee | null>(null);

  // File Upload Reference
  const fileInputRef = useRef<HTMLInputElement>(null);
  const printContainerRef = useRef<HTMLDivElement>(null);

  // Add Employee Form States
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpNik, setNewEmpNik] = useState('');
  const [newEmpTitle, setNewEmpTitle] = useState('');
  const [newEmpDepartment, setNewEmpDepartment] = useState('');
  const [newEmpKedudukanType, setNewEmpKedudukanType] = useState<'Pusat' | 'Cabang'>('Pusat');
  const [newEmpKedudukanCity, setNewEmpKedudukanCity] = useState('');
  const [newEmpAtasan, setNewEmpAtasan] = useState('Direktur Utama');
  const [newEmpPhone, setNewEmpPhone] = useState('');
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpAlamat, setNewEmpAlamat] = useState('');
  const [newEmpDob, setNewEmpDob] = useState('');
  const [newEmpRole, setNewEmpRole] = useState<UserRole>('pengguna');
  const [newEmpLevel, setNewEmpLevel] = useState<'Staff / Specialist' | 'Manager / Supervisor' | 'Executive / Director' | 'Administrator' | 'Super Admin'>('Staff / Specialist');

  // Edit Employee Form States
  const [editEmpName, setEditEmpName] = useState('');
  const [editEmpNik, setEditEmpNik] = useState('');
  const [editEmpTitle, setEditEmpTitle] = useState('');
  const [editEmpDepartment, setEditEmpDepartment] = useState('');
  const [editEmpKedudukanType, setEditEmpKedudukanType] = useState<'Pusat' | 'Cabang'>('Pusat');
  const [editEmpKedudukanCity, setEditEmpKedudukanCity] = useState('');
  const [editEmpAtasan, setEditEmpAtasan] = useState('');
  const [editEmpPhone, setEditEmpPhone] = useState('');
  const [editEmpEmail, setEditEmpEmail] = useState('');
  const [editEmpAlamat, setEditEmpAlamat] = useState('');
  const [editEmpDob, setEditEmpDob] = useState('');
  const [editEmpRole, setEditEmpRole] = useState<UserRole>('pengguna');
  const [editEmpLevel, setEditEmpLevel] = useState<'Staff / Specialist' | 'Manager / Supervisor' | 'Executive / Director' | 'Administrator' | 'Super Admin'>('Staff / Specialist');

  // Import Paste Area State
  const [importText, setImportText] = useState('');
  const [importNotification, setImportNotification] = useState<string | null>(null);

  // Get Kedudukan helper: "Pusat" or "Cabang - [Nama Kota]"
  const getKedudukan = (emp: Employee) => {
    if (emp.location) {
      if (emp.location.toLowerCase() === 'pusat' || emp.location.toLowerCase().startsWith('pusat')) {
        return 'Pusat';
      }
      if (emp.location.toLowerCase().startsWith('cabang')) {
        return emp.location;
      }
      return `Cabang - ${emp.location}`;
    }
    
    // Default based on ID
    switch (emp.id) {
      case 'emp-001':
      case 'emp-002':
        return 'Pusat';
      case 'emp-101':
        return 'Cabang - Bekasi';
      case 'emp-102':
        return 'Cabang - Depok';
      default:
        const index = parseInt(emp.id.replace(/\D/g, '')) || 0;
        const cities = ['Pusat', 'Cabang - Surabaya', 'Cabang - Bandung', 'Cabang - Medan', 'Cabang - Makassar', 'Cabang - Balikpapan'];
        return cities[index % cities.length];
    }
  };

  // Get Indonesian corporate realistic extra fields (Alamat, Tanggal Lahir, Atasan Jabatan)
  const getEmployeeExtraData = (emp: Employee, index: number) => {
    let alamat = emp.companyAddress || '';
    let tglLahir = emp.createdDate || '';
    let atasanJabatan = emp.approvedBy || '';

    if (!alamat || !tglLahir || !atasanJabatan) {
      switch (emp.id) {
        case 'emp-001': // CIP 2017 (Super Admin)
          alamat = alamat || 'Apartemen Sudirman Residence Tower B, Jakarta Pusat';
          tglLahir = tglLahir || '12 Agustus 1970';
          atasanJabatan = atasanJabatan || 'Dewan Komisaris Utama';
          break;
        case 'emp-002': // Fajar Pratama
          alamat = alamat || 'Jl. Kebon Jeruk No. 45, Jakarta Barat';
          tglLahir = tglLahir || '18 November 1985';
          atasanJabatan = atasanJabatan || 'Direktur Utama';
          break;
        case 'emp-101': // Budi Raharjo
          alamat = alamat || 'Perumahan Grand Galaxy Cluster Venus Blok C/12, Bekasi';
          tglLahir = tglLahir || '23 Mei 1988';
          atasanJabatan = atasanJabatan || 'Senior Manager Sales & Commercial';
          break;
        case 'emp-102': // Edi Tes / Edi Susanto
          alamat = alamat || 'Jl. Margonda Raya No. 102, Depok';
          tglLahir = tglLahir || '04 Juli 1991';
          atasanJabatan = atasanJabatan || 'VP Estimation & Costing';
          break;
        default:
          const cities = ['Jakarta Pusat', 'Jakarta Selatan', 'Bekasi', 'Tangerang Selatan', 'Depok'];
          const streets = ['Jl. Jend. Sudirman No. 8', 'Jl. HR. Rasuna Said Kav. 12', 'Jl. Boulevard Raya Blok M3', 'Jl. Letjen S. Parman No. 20'];
          alamat = alamat || `${streets[index % streets.length]}, ${cities[index % cities.length]}`;
          
          const days = [5, 12, 19, 24, 28];
          const months = ['Januari', 'Maret', 'Mei', 'Agustus', 'Oktober', 'Desember'];
          const years = [1982, 1986, 1989, 1992, 1995];
          tglLahir = tglLahir || `${days[index % days.length]} ${months[index % months.length]} ${years[index % years.length]}`;
          
          if (emp.role === 'penyetuju') {
            atasanJabatan = atasanJabatan || 'Direktur Utama';
          } else if (emp.role === 'pemeriksa') {
            atasanJabatan = atasanJabatan || 'Chief Financial Officer (CFO)';
          } else {
            atasanJabatan = atasanJabatan || 'Head of Department';
          }
          break;
      }
    }

    return { alamat, tglLahir, atasanJabatan };
  };

  // In Clean Operational Mode vs Simulation Mode
  const activeEmployeePool = isSimulationMode
    ? employees
    : employees.filter((e) => e.id === currentEmployee.id || e.id_organization === activeOrganization?.id_organization);

  const baseEmployees = (filterTenant && activeOrganization && activeOrganization.id_organization !== 'global-all')
    ? activeEmployeePool.filter((e) => e.id_organization === activeOrganization.id_organization)
    : activeEmployeePool;

  const filteredEmployees = baseEmployees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.nik.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      selectedRoleFilter === 'all' || emp.role === selectedRoleFilter;

    const matchesLevel =
      selectedLevelFilter === 'all' || emp.level === selectedLevelFilter;

    return matchesSearch && matchesRole && matchesLevel;
  });

  // Role Badge Helper
  const getRoleInfo = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return {
          label: 'Super Admin',
          bg: 'bg-purple-100 text-purple-950 border-purple-300',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-purple-700 shrink-0" />,
        };
      case 'administrator':
        return {
          label: 'Administrator',
          bg: 'bg-indigo-100 text-indigo-950 border-indigo-300',
          icon: <UserCheck className="w-3.5 h-3.5 text-indigo-700 shrink-0" />,
        };
      case 'penyetuju':
        return {
          label: 'Penyetuju (Approver)',
          bg: 'bg-emerald-100 text-emerald-950 border-emerald-300',
          icon: <Lock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />,
        };
      case 'pemeriksa':
        return {
          label: 'Pemeriksa (Checker)',
          bg: 'bg-amber-100 text-amber-950 border-amber-300',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />,
        };
      case 'konseptor':
        return {
          label: 'Konseptor (Maker)',
          bg: 'bg-blue-100 text-blue-950 border-blue-300',
          icon: <Edit3 className="w-3.5 h-3.5 text-blue-700 shrink-0" />,
        };
      default:
        return {
          label: 'Pengguna',
          bg: 'bg-slate-100 text-slate-800 border-slate-300',
          icon: <Users className="w-3.5 h-3.5 text-slate-700 shrink-0" />,
        };
    }
  };

  // Get RBAC Definitions for Employee
  const getRbacDef = (role: UserRole): RoleAccessDefinition => {
    return (
      ROLE_ACCESS_DEFINITIONS.find((r) => r.role === role) ||
      ROLE_ACCESS_DEFINITIONS[ROLE_ACCESS_DEFINITIONS.length - 1]
    );
  };

  // Organization helper
  const getOrgName = (orgId?: string) => {
    if (!orgId || orgId === 'global-all') return 'PT Star Office Solusi';
    const found = ORGANIZATIONS.find((o) => o.id_organization === orgId);
    return found ? found.name : 'PT Star Office Solusi';
  };

  // ============================================
  // CRITICAL FEATURE: ADD NEW EMPLOYEE
  // ============================================
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName || !newEmpNik || !newEmpEmail) {
      alert('Nama, NIP/NIK, dan Email wajib diisi.');
      return;
    }

    const kedudukanStr = newEmpKedudukanType === 'Pusat'
      ? 'Pusat'
      : (newEmpKedudukanCity.trim() ? `Cabang - ${newEmpKedudukanCity.trim()}` : 'Cabang');

    const newEmp: Employee = {
      id: `emp-new-${Date.now()}`,
      id_organization: activeOrganization?.id_organization || 'global-all',
      nik: newEmpNik,
      name: newEmpName,
      title: newEmpTitle || 'Staff',
      department: newEmpDepartment || 'Umum',
      level: newEmpLevel,
      role: newEmpRole,
      avatarBg: 'bg-teal-800 text-white',
      avatarText: newEmpName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'EM',
      email: newEmpEmail,
      phone: newEmpPhone || '—',
      status: 'Aktif / Online',
      description: 'Pengguna baru didaftarkan.',
      location: kedudukanStr,          // Saved as Location to represent Kedudukan
      companyAddress: newEmpAlamat,    // Saved as companyAddress to represent Alamat
      createdDate: newEmpDob,          // Saved as createdDate to represent Tanggal Lahir
      approvedBy: newEmpAtasan,        // Saved as approvedBy to represent Atasan (nama jabatan)
    };

    if (onAddEmployee) {
      onAddEmployee(newEmp);
    }
    
    // Reset Form
    setNewEmpName('');
    setNewEmpNik('');
    setNewEmpTitle('');
    setNewEmpDepartment('');
    setNewEmpKedudukanType('Pusat');
    setNewEmpKedudukanCity('');
    setNewEmpAtasan('Direktur Utama');
    setNewEmpPhone('');
    setNewEmpEmail('');
    setNewEmpAlamat('');
    setNewEmpDob('');
    setNewEmpRole('pengguna');
    setNewEmpLevel('Staff / Specialist');
    setIsAddModalOpen(false);
  };

  // ============================================
  // CRITICAL FEATURE: EDIT EMPLOYEE
  // ============================================
  const openEditModal = (emp: Employee, index: number) => {
    const { alamat, tglLahir, atasanJabatan } = getEmployeeExtraData(emp, index);
    setSelectedEmployeeForEdit(emp);
    setEditEmpName(emp.name);
    setEditEmpNik(emp.nik);
    setEditEmpTitle(emp.title);
    setEditEmpDepartment(emp.department);
    
    // Parse Kedudukan string
    const rawKedudukan = getKedudukan(emp);
    if (rawKedudukan.toLowerCase().startsWith('cabang')) {
      setEditEmpKedudukanType('Cabang');
      const cleanCity = rawKedudukan.replace(/^cabang\s*-\s*/i, '').replace(/^cabang\s*/i, '').trim();
      setEditEmpKedudukanCity(cleanCity);
    } else {
      setEditEmpKedudukanType('Pusat');
      setEditEmpKedudukanCity('');
    }

    setEditEmpAtasan(atasanJabatan);
    setEditEmpPhone(emp.phone);
    setEditEmpEmail(emp.email);
    setEditEmpAlamat(alamat);
    setEditEmpDob(tglLahir);
    setEditEmpRole(emp.role);
    setEditEmpLevel(emp.level);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeForEdit) return;
    if (!editEmpName || !editEmpNik || !editEmpEmail) {
      alert('Nama, NIP/NIK, dan Email wajib diisi.');
      return;
    }

    const kedudukanStr = editEmpKedudukanType === 'Pusat'
      ? 'Pusat'
      : (editEmpKedudukanCity.trim() ? `Cabang - ${editEmpKedudukanCity.trim()}` : 'Cabang');

    const updatedEmp: Employee = {
      ...selectedEmployeeForEdit,
      name: editEmpName,
      nik: editEmpNik,
      title: editEmpTitle,
      department: editEmpDepartment,
      location: kedudukanStr,
      approvedBy: editEmpAtasan,
      phone: editEmpPhone,
      email: editEmpEmail,
      companyAddress: editEmpAlamat,
      createdDate: editEmpDob,
      role: editEmpRole,
      level: editEmpLevel,
      avatarText: editEmpName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'EM',
    };

    if (onUpdateEmployee) {
      onUpdateEmployee(updatedEmp);
    }

    setIsEditModalOpen(false);
    setSelectedEmployeeForEdit(null);
  };

  // ============================================
  // CRITICAL FEATURE: DELETE EMPLOYEE
  // ============================================
  const handleDeleteClick = (emp: Employee) => {
    if (emp.id === currentEmployee.id) {
      alert('Akses ditolak: Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan.');
      return;
    }
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menonaktifkan/menghapus karyawan "${emp.name}" dari sistem?`);
    if (confirmDelete && onDeleteEmployee) {
      onDeleteEmployee(emp.id);
    }
  };

  // Updated handlePrintPdf to trigger the print / download operation using jspdf-autotable
  const triggerPrint = () => {
    setIsPrintSettingsModalOpen(false);

    try {
      const doc = new jsPDF('landscape', 'mm', 'a4');

      // Title & Subtitle Header
      doc.setFontSize(14);
      doc.setTextColor(15, 118, 110); // Teal-700
      doc.text('DAFTAR DATA PERSONALIA KARYAWAN', 14, 15);

      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Dicetak pada: ${new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })} | Total: ${filteredEmployees.length} Karyawan`,
        14,
        21
      );

      // Columns mapping
      const allColumnsMap: { id: string; header: string }[] = [
        { id: 'no', header: 'No.' },
        { id: 'nama', header: 'Nama' },
        { id: 'nip_nik', header: 'NIP / NIK' },
        { id: 'jabatan', header: 'Jabatan' },
        { id: 'departemen', header: 'Departemen' },
        { id: 'kedudukan', header: 'Kedudukan' },
        { id: 'atasan', header: 'Atasan' },
        { id: 'telepon', header: 'Telepon' },
        { id: 'email', header: 'Email' },
        { id: 'alamat', header: 'Alamat' },
        { id: 'tgl_lahir', header: 'Tanggal Lahir' },
        { id: 'role_rbac', header: 'Role RBAC' },
      ];

      const activeColumns = allColumnsMap.filter((col) => selectedPrintColumns.includes(col.id));

      const head = [activeColumns.map((col) => col.header)];

      const tableData = filteredEmployees.map((emp, idx) => {
        const { alamat, tglLahir, atasanJabatan } = getEmployeeExtraData(emp, idx);
        const kedudukan = getKedudukan(emp);
        const roleDef = getRoleInfo(emp.role).label;

        const rowMap: Record<string, string | number> = {
          no: idx + 1,
          nama: emp.name,
          nip_nik: emp.nik || '—',
          jabatan: emp.title || '—',
          departemen: emp.department || '—',
          kedudukan: kedudukan,
          atasan: atasanJabatan,
          telepon: emp.phone || '—',
          email: emp.email,
          alamat: alamat,
          tgl_lahir: tglLahir,
          role_rbac: roleDef,
        };

        return activeColumns.map((col) => rowMap[col.id] ?? '');
      });

      autoTable(doc, {
        startY: 25,
        head: head,
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [15, 118, 110], // Teal-700
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: 'bold',
          halign: 'left',
        },
        bodyStyles: {
          fontSize: 7.5,
          textColor: [30, 41, 59],
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        styles: {
          cellPadding: 2.5,
          overflow: 'linebreak',
        },
        margin: { top: 25, left: 14, right: 14, bottom: 15 },
        didDrawPage: (data) => {
          const pageCount = doc.getNumberOfPages();
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text(
            `Halaman ${data.pageNumber} dari ${pageCount}`,
            doc.internal.pageSize.width - 25,
            doc.internal.pageSize.height - 8
          );
        },
      });

      doc.save('Laporan_Data_Karyawan.pdf');
    } catch (err) {
      console.error('Gagal mengunduh PDF:', err);
      alert('Terjadi kesalahan saat memproses file PDF. Silakan coba lagi.');
    }
  };

  // ============================================
  // Updated Printing Flow: Open Settings First
  // ============================================
  const handlePrintFlow = () => {
    setIsPrintSettingsModalOpen(true);
  };

  // ============================================
  // CRITICAL FEATURE: EXCEL EXPORT (XLSX Format)
  // ============================================
  const handleExportExcel = () => {
    const headers = ['No', 'Nama Karyawan', 'NIP / NIK', 'Jabatan', 'Departemen', 'Kedudukan', 'Atasan', 'Telepon', 'Email', 'Alamat', 'Tanggal Lahir'];
    const rows = filteredEmployees.map((emp, idx) => {
      const { alamat, tglLahir, atasanJabatan } = getEmployeeExtraData(emp, idx);
      const kedudukan = getKedudukan(emp);
      return [
        idx + 1,
        emp.name,
        String(emp.nik),
        emp.title,
        emp.department,
        kedudukan,
        atasanJabatan,
        String(emp.phone),
        emp.email,
        alamat,
        tglLahir
      ];
    });

    const worksheetData = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set cell formatting for text fields to preserve leading zeros
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
    for (let r = 1; r <= range.e.r; r++) {
      // Column C is NIK (index 2)
      const cellNik = worksheet[XLSX.utils.encode_cell({ r, c: 2 })];
      if (cellNik) cellNik.t = 's';
      // Column H is Telepon (index 7)
      const cellPhone = worksheet[XLSX.utils.encode_cell({ r, c: 7 })];
      if (cellPhone) cellPhone.t = 's';
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Karyawan');
    XLSX.writeFile(workbook, 'data_personalia_karyawan.xlsx');
  };

  // ============================================
  // CRITICAL FEATURE: DOWNLOAD TEMPLATE XLSX
  // ============================================
  const handleDownloadTemplate = () => {
    const headers = ['Nama', 'NIP_NIK', 'Jabatan', 'Departemen', 'Kedudukan', 'Atasan', 'Telepon', 'Email', 'Alamat', 'Tanggal_Lahir'];
    const sampleRow = [
      'Adi Susanto',
      '199107042018021004',
      'VP Estimation & Costing',
      'Estimator & Tender',
      'Cabang - Bandung',
      'Direktur Utama',
      '08123456789',
      'adi.susanto@staroffice.id',
      'Jl. Merdeka No. 45, Bandung',
      '04 Juli 1991'
    ];
    
    const worksheetData = [headers, sampleRow];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Ensure numeric strings preserve their format
    const cellNik = worksheet[XLSX.utils.encode_cell({ r: 1, c: 1 })];
    if (cellNik) cellNik.t = 's';
    const cellPhone = worksheet[XLSX.utils.encode_cell({ r: 1, c: 6 })];
    if (cellPhone) cellPhone.t = 's';

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template_Impor');
    XLSX.writeFile(workbook, 'template_impor_karyawan.xlsx');
  };

  // ============================================
  // CRITICAL FEATURE: IMPOR EXCEL / CSV
  // ============================================
  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importText.trim()) {
      alert('Silakan tempel atau unggah data CSV terlebih dahulu.');
      return;
    }

    const lines = importText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) {
      alert('Format tidak valid. Pastikan baris pertama berisi header dan baris selanjutnya berisi data.');
      return;
    }

    let successCount = 0;
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i];
      // Split by commas ignoring commas in quotes
      const cells = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || row.split(',');
      const cleanCells = cells.map(c => c.replace(/^["']|["']$/g, '').replace(/""/g, '"').trim());

      if (cleanCells.length < 2) continue;

      const nama = cleanCells[0] || `Karyawan Impor ${i}`;
      const nik = cleanCells[1] || `NIP-${Date.now()}-${i}`;
      const jabatan = cleanCells[2] || 'Staff';
      const departemen = cleanCells[3] || 'Umum';
      const kedudukan = cleanCells[4] || 'Pusat';
      const atasan = cleanCells[5] || 'Direktur Utama';
      const telepon = cleanCells[6] || '0812-xxxx-xxxx';
      const email = cleanCells[7] || `karyawan.${Date.now()}.${i}@staroffice.id`;
      const alamat = cleanCells[8] || 'Alamat Kantor';
      const dob = cleanCells[9] || '01 Januari 1990';

      const newEmp: Employee = {
        id: `emp-imported-${Date.now()}-${i}`,
        id_organization: activeOrganization?.id_organization || 'global-all',
        nik,
        name: nama,
        title: jabatan,
        department: departemen,
        level: 'Staff / Specialist',
        role: 'pengguna',
        avatarBg: 'bg-teal-700 text-white',
        avatarText: nama.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'IM',
        email,
        phone: telepon,
        status: 'Aktif / Online',
        description: 'Pengguna diimpor via file.',
        location: kedudukan,
        companyAddress: alamat,
        createdDate: dob,
        approvedBy: atasan
      };

      if (onAddEmployee) {
        onAddEmployee(newEmp);
        successCount++;
      }
    }

    setImportNotification(`Berhasil mengimpor ${successCount} data karyawan secara real-time!`);
    setImportText('');
    setTimeout(() => {
      setImportNotification(null);
      setIsImportModalOpen(false);
    }, 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (isExcel) {
      reader.onload = (event) => {
        const data = event.target?.result;
        if (data) {
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
          if (jsonData.length > 0) {
            const csvText = jsonData.map(row => 
              row.map((val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`).join(',')
            ).join('\n');
            setImportText(csvText);
          }
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setImportText(text);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-start space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold shadow-2xs border border-teal-700 shrink-0">
            <Users className="w-6 h-6 text-teal-200" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Direktori Karyawan &amp; Data Personalia
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-teal-50 text-teal-800 border border-teal-200">
                Data Terpusat
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Daftar karyawan aktif terintegrasi dengan struktur kartu data profil masing-masing personel secara lengkap.
            </p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center space-x-1 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                viewMode === 'table'
                  ? 'bg-white text-teal-900 shadow-2xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Tabel Terintegrasi</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                viewMode === 'grid'
                  ? 'bg-white text-teal-900 shadow-2xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kartu Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* Corporate Action Toolbar / Button Ribbons */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-sm print:hidden">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-teal-400" />
          <span className="text-xs font-bold uppercase tracking-wider">Ribbon Operasional Personalia</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Karyawan</span>
          </button>

          <button
            type="button"
            onClick={handlePrintFlow}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border border-slate-700 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-sky-400" />
            <span>Cetak PDF</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border border-slate-700 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Ekspor Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border border-slate-700 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-amber-400" />
            <span>Impor Excel</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border border-slate-700 cursor-pointer"
          >
            <Download className="w-4 h-4 text-teal-400" />
            <span>Download Template</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 print:hidden">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Karyawan</span>
            <Users className="w-4 h-4 text-teal-700" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">{baseEmployees.length} <span className="text-xs font-normal text-slate-500">Karyawan</span></div>
          <div className="text-[10px] text-teal-700 font-semibold">Aktif Lintas-Tenant</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Penyusun HPP (Maker)</span>
            <Edit3 className="w-4 h-4 text-blue-700" />
          </div>
          <div className="text-xl font-extrabold text-blue-950">
            {baseEmployees.filter((e) => getRbacDef(e.role).canEditCosts).length}
          </div>
          <div className="text-[10px] text-blue-800 font-semibold">Memiliki Hak Input Modal</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Auditor Biaya (Checker)</span>
            <CheckCircle2 className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-xl font-extrabold text-amber-950">
            {baseEmployees.filter((e) => getRbacDef(e.role).canVerifyCosts).length}
          </div>
          <div className="text-[10px] text-amber-800 font-semibold">Memiliki Hak Audit POS</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">VP Approver</span>
            <Lock className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl font-extrabold text-emerald-950">
            {baseEmployees.filter((e) => getRbacDef(e.role).canApproveDiscounts).length}
          </div>
          <div className="text-[10px] text-emerald-800 font-semibold">Memiliki Otoritas Diskon</div>
        </div>
      </div>

      {/* Control Filter Panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 print:hidden">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama, NIK, jabatan, departemen, atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Role Filter */}
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-bold focus:outline-hidden focus:border-teal-600"
            >
              <option value="all">Semua Peran RBAC</option>
              <option value="super_admin">Super Admin</option>
              <option value="administrator">Administrator</option>
              <option value="penyetuju">Penyetuju (Approver)</option>
              <option value="pemeriksa">Pemeriksa (Checker)</option>
              <option value="konseptor">Konseptor (Maker)</option>
              <option value="pengguna">Pengguna</option>
            </select>

            {/* Level Filter */}
            <select
              value={selectedLevelFilter}
              onChange={(e) => setSelectedLevelFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-bold focus:outline-hidden focus:border-teal-600"
            >
              <option value="all">Semua Level Jabatan</option>
              <option value="Staff / Specialist">Level 1: Staff / Specialist</option>
              <option value="Manager / Supervisor">Level 2: Manager / Supervisor</option>
              <option value="Executive / Director">Level 3: Executive / Director</option>
              <option value="Administrator">Administrator Tenant</option>
              <option value="Super Admin">Super Admin Global</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW MODE 1: TABEL DATA KARYAWAN (INTEGRASI KARTU DATA PROFIL SAYA) */}
      {/* ========================================================================= */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden print:border-none print:shadow-none">
          {/* Scroll Indicator Guide */}
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center text-[11px] font-bold text-slate-500 print:hidden">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
              <span>Menampilkan Data Karyawan Terintegrasi Lengkap</span>
            </span>
            <span className="text-teal-700 animate-bounce flex items-center space-x-1">
              <span>Geser ke samping untuk melihat kolom lengkap</span>
              <span>➔</span>
            </span>
          </div>

          <style dangerouslySetInnerHTML={{__html: `
            .custom-scrollbar-always-visible::-webkit-scrollbar {
              height: 10px;
              background-color: #f8fafc;
            }
            .custom-scrollbar-always-visible::-webkit-scrollbar-thumb {
              background-color: #cbd5e1;
              border-radius: 6px;
              border: 2px solid #f8fafc;
            }
            .custom-scrollbar-always-visible::-webkit-scrollbar-thumb:hover {
              background-color: #94a3b8;
            }
            @media print {
              body * {
                visibility: hidden;
              }
              .print-container, .print-container * {
                visibility: visible;
              }
              .print-container {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
              }
              .print-hide {
                display: none !important;
                visibility: hidden !important;
              }
            }
          `}} />

          <div className="overflow-x-auto custom-scrollbar-always-visible pb-1 print-container" ref={printContainerRef} style={{ WebkitOverflowScrolling: 'touch' }}>
            <table className="w-full text-left text-xs border-collapse min-w-[1300px]">
              <thead>
                {/* Row 1: Section Group Headers */}
                <tr className="bg-slate-100 text-[11px] font-extrabold uppercase tracking-wider text-slate-700 border-b border-slate-200">
                  <th colSpan={12} className="px-4 py-2.5 bg-slate-100 text-teal-900 border-r border-slate-200">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-teal-700" />
                      <span>DATA PERSONALIA KARYAWAN</span>
                    </div>
                  </th>
                  <th colSpan={1} className="px-4 py-2.5 bg-slate-100 text-right print:hidden">
                    <span>KONTROL</span>
                  </th>
                </tr>

                {/* Row 2: Specific Column Headers */}
                <tr className="bg-slate-50 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className={`px-3 py-3 border-r border-slate-200/80 text-teal-950 w-12 text-center ${selectedPrintColumns.includes('no') ? '' : 'print-hide'}`}>No.</th>
                  <th className={`px-3.5 py-3 border-r border-slate-200/80 text-teal-950 min-w-[150px] ${selectedPrintColumns.includes('nama') ? '' : 'print-hide'}`}>Nama</th>
                  <th className={`px-3 py-3 border-r border-slate-200/80 text-teal-950 min-w-[140px] whitespace-nowrap ${selectedPrintColumns.includes('nip_nik') ? '' : 'print-hide'}`}>NIP / NIK</th>
                  <th className={`px-3.5 py-3 border-r border-slate-200/80 text-teal-950 min-w-[150px] ${selectedPrintColumns.includes('jabatan') ? '' : 'print-hide'}`}>Jabatan</th>
                  <th className={`px-3.5 py-3 border-r border-slate-200/80 text-teal-950 min-w-[130px] ${selectedPrintColumns.includes('departemen') ? '' : 'print-hide'}`}>Departemen</th>
                  <th className={`px-3 py-3 border-r border-slate-200/80 text-teal-950 min-w-[130px] ${selectedPrintColumns.includes('kedudukan') ? '' : 'print-hide'}`}>Kedudukan</th>
                  <th className={`px-3 py-3 border-r border-slate-200/80 text-teal-950 min-w-[150px] ${selectedPrintColumns.includes('atasan') ? '' : 'print-hide'}`}>Atasan</th>
                  <th className={`px-3.5 py-3 border-r border-slate-200/80 text-teal-950 min-w-[120px] ${selectedPrintColumns.includes('telepon') ? '' : 'print-hide'}`}>Telepon</th>
                  <th className={`px-3.5 py-3 border-r border-slate-200/80 text-teal-950 min-w-[150px] ${selectedPrintColumns.includes('email') ? '' : 'print-hide'}`}>Email</th>
                  <th className={`px-3.5 py-3 border-r border-slate-200/80 text-teal-950 min-w-[200px] ${selectedPrintColumns.includes('alamat') ? '' : 'print-hide'}`}>Alamat</th>
                  <th className={`px-3.5 py-3 border-r border-slate-200/80 text-teal-950 min-w-[130px] whitespace-nowrap ${selectedPrintColumns.includes('tgl_lahir') ? '' : 'print-hide'}`}>Tanggal Lahir</th>
                  <th className={`px-3.5 py-3 border-r border-slate-200/80 text-teal-950 min-w-[130px] ${selectedPrintColumns.includes('role_rbac') ? '' : 'print-hide'}`}>Role RBAC</th>
                  <th className="px-3 py-3 text-right print:hidden">Aksi</th>
                </tr>
              </thead>

              {/* TABLE BODY */}
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="text-center py-12 text-slate-400">
                      <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-bold text-slate-600">Tidak ada data karyawan yang sesuai filter.</p>
                      <p className="text-xs text-slate-400 mt-1">Coba ubah kata kunci pencarian atau reset filter role.</p>
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp, idx) => {
                    const isCurrent = currentEmployee.id === emp.id;
                    const { alamat, tglLahir, atasanJabatan } = getEmployeeExtraData(emp, idx);
                    const kedudukan = getKedudukan(emp);

                    return (
                      <tr
                        key={emp.id}
                        className={`hover:bg-slate-50/80 transition ${
                          isCurrent ? 'bg-teal-50/25 font-bold' : ''
                        }`}
                      >
                        {/* 1. No. */}
                        <td className={`px-3 py-3.5 border-r border-slate-100 text-center font-mono text-slate-500 font-bold w-12 ${selectedPrintColumns.includes('no') ? '' : 'print-hide'}`}>
                          {idx + 1}
                        </td>

                        {/* 2. Nama */}
                        <td className={`px-3.5 py-3.5 border-r border-slate-100 min-w-[150px] ${selectedPrintColumns.includes('nama') ? '' : 'print-hide'}`}>
                          <div className="flex items-center space-x-2">
                            {emp.avatarUrl ? (
                              <img
                                src={emp.avatarUrl}
                                alt={emp.name}
                                className="w-8 h-8 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
                              />
                            ) : (
                              <div
                                className={`w-8 h-8 rounded-xl font-bold text-[10px] flex items-center justify-center border border-slate-200 shadow-2xs shrink-0 ${emp.avatarBg}`}
                              >
                                {emp.avatarText}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-extrabold text-slate-900 truncate max-w-[130px] flex items-center gap-1">
                                <span>{emp.name}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Online" />
                              </div>
                              {isCurrent && (
                                <span className="text-[9px] font-extrabold text-teal-700 leading-none">
                                  Akun Aktif Anda
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 3. NIP / NIK */}
                        <td className={`px-3 py-3.5 border-r border-slate-100 font-mono text-[11px] text-slate-700 font-bold whitespace-nowrap min-w-[140px] ${selectedPrintColumns.includes('nip_nik') ? '' : 'print-hide'}`}>
                          {emp.nik || '—'}
                        </td>

                        {/* 4. Jabatan */}
                        <td className={`px-3.5 py-3.5 border-r border-slate-100 text-slate-800 font-bold leading-tight truncate max-w-[150px] min-w-[150px] ${selectedPrintColumns.includes('jabatan') ? '' : 'print-hide'}`}>
                          {emp.title || '—'}
                        </td>

                        {/* 5. Departemen */}
                        <td className={`px-3.5 py-3.5 border-r border-slate-100 text-slate-800 truncate max-w-[130px] min-w-[130px] ${selectedPrintColumns.includes('departemen') ? '' : 'print-hide'}`}>
                          {emp.department || '—'}
                        </td>

                        {/* 6. Kedudukan: Pusat atau Cabang-Nama Kota */}
                        <td className={`px-3 py-3.5 border-r border-slate-100 text-slate-600 min-w-[130px] ${selectedPrintColumns.includes('kedudukan') ? '' : 'print-hide'}`}>
                          <span className="px-2 py-0.5 text-[10.5px] font-bold rounded-md bg-teal-50 text-teal-900 border border-teal-200 shadow-3xs">
                            {kedudukan}
                          </span>
                        </td>

                        {/* 7. Atasan (berisi nama jabatan) */}
                        <td className={`px-3 py-3.5 border-r border-slate-100 text-slate-700 font-semibold min-w-[150px] truncate max-w-[160px] ${selectedPrintColumns.includes('atasan') ? '' : 'print-hide'}`}>
                          {atasanJabatan}
                        </td>

                        {/* 8. Telepon */}
                        <td className={`px-3.5 py-3.5 border-r border-slate-100 font-mono text-slate-600 text-[11px] whitespace-nowrap min-w-[120px] ${selectedPrintColumns.includes('telepon') ? '' : 'print-hide'}`}>
                          {emp.phone || '—'}
                        </td>

                        {/* 9. Email */}
                        <td className={`px-3.5 py-3.5 border-r border-slate-100 font-mono text-teal-800 text-[11px] truncate max-w-[150px] min-w-[150px] ${selectedPrintColumns.includes('email') ? '' : 'print-hide'}`}>
                          {emp.email}
                        </td>

                        {/* 10. Alamat */}
                        <td className={`px-3.5 py-3.5 border-r border-slate-100 text-slate-600 text-[11px] min-w-[200px] truncate max-w-[220px] ${selectedPrintColumns.includes('alamat') ? '' : 'print-hide'}`} title={alamat}>
                          {alamat}
                        </td>

                        {/* 11. Tanggal Lahir */}
                        <td className={`px-3.5 py-3.5 border-r border-slate-100 text-slate-600 text-[11.5px] whitespace-nowrap min-w-[130px] ${selectedPrintColumns.includes('tgl_lahir') ? '' : 'print-hide'}`}>
                          {tglLahir}
                        </td>

                        {/* 12. Role RBAC */}
                        <td className={`px-3.5 py-3.5 border-r border-slate-100 min-w-[130px] ${selectedPrintColumns.includes('role_rbac') ? '' : 'print-hide'}`}>
                          <div className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-lg border text-[10px] font-bold ${getRbacDef(emp.role).role === 'super_admin' ? 'bg-purple-100 text-purple-950 border-purple-300' : getRbacDef(emp.role).role === 'administrator' ? 'bg-indigo-100 text-indigo-950 border-indigo-300' : getRbacDef(emp.role).role === 'penyetuju' ? 'bg-emerald-100 text-emerald-950 border-emerald-300' : getRbacDef(emp.role).role === 'pemeriksa' ? 'bg-amber-100 text-amber-950 border-amber-300' : getRbacDef(emp.role).role === 'konseptor' ? 'bg-blue-100 text-blue-950 border-blue-300' : 'bg-slate-100 text-slate-800 border-slate-300'}`}>
                            {getRoleInfo(emp.role).icon}
                            <span>{getRoleInfo(emp.role).label}</span>
                          </div>
                        </td>

                        {/* 13. Aksi: Lihat, Edit, Hapus */}
                        <td className="px-3 py-3.5 text-right print:hidden whitespace-nowrap min-w-[100px]">
                          <div className="inline-flex items-center space-x-1">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedEmployeeForView(emp);
                                setIsViewModalOpen(true);
                              }}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                              title="Lihat Rincian"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => openEditModal(emp, idx)}
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition"
                              title="Edit Data"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteClick(emp)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                              title="Hapus Karyawan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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
          <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 print:hidden">
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-teal-700 shrink-0" />
              <span>
                Tabel terintegrasi penuh: Menampilkan <strong>{filteredEmployees.length}</strong> data personalia karyawan aktif secara real-time.
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Sistem Manajemen Terintegrasi &amp; Personalia TCMS
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* VIEW MODE 2: KARTU GRID PROFIL + RBAC SUMMARY */
        /* ========================================================================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print:hidden">
          {filteredEmployees.map((emp, idx) => {
            const isCurrent = currentEmployee.id === emp.id;
            const roleInfo = getRoleInfo(emp.role);
            const rbacDef = getRbacDef(emp.role);
            const orgName = getOrgName(emp.id_organization);
            const { alamat, tglLahir, atasanJabatan } = getEmployeeExtraData(emp, idx);
            const kedudukan = getKedudukan(emp);

            return (
              <div
                key={emp.id}
                className={`bg-white rounded-2xl border p-5 transition-all duration-200 flex flex-col justify-between space-y-3.5 shadow-2xs ${
                  isCurrent
                    ? 'border-teal-500 ring-2 ring-teal-500/20 bg-teal-50/10'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-3">
                  {/* Profil Top Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      {emp.avatarUrl ? (
                        <img
                          src={emp.avatarUrl}
                          alt={emp.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
                        />
                      ) : (
                        <div
                          className={`w-10 h-10 rounded-xl font-bold text-xs flex items-center justify-center border border-slate-200 shadow-2xs shrink-0 ${emp.avatarBg}`}
                        >
                          {emp.avatarText}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] font-mono font-bold text-slate-400">{emp.nik}</span>
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" title={emp.status} />
                        </div>
                        <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                          {emp.name}
                        </h3>
                      </div>
                    </div>

                    {isCurrent && (
                      <span className="inline-flex items-center justify-center bg-teal-800 text-white text-[9.5px] font-bold px-2 py-0.5 rounded-md shadow-2xs space-x-1 shrink-0 leading-none">
                        <BadgeCheck className="w-3 h-3 text-teal-200" />
                        <span>Aktif</span>
                      </span>
                    )}
                  </div>

                  {/* Profil Details */}
                  <div className="space-y-1 bg-slate-50/80 p-3 rounded-xl border border-slate-100 text-xs">
                    <p className="font-bold text-slate-800">{emp.title}</p>
                    <p className="text-[11px] text-teal-800 font-semibold flex items-center space-x-1">
                      <Briefcase className="w-3 h-3 text-teal-600" />
                      <span>{emp.department} • Kedudukan: {kedudukan}</span>
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Atasan: <span className="font-bold text-slate-700">{atasanJabatan}</span>
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Email: <span className="font-bold text-slate-700">{emp.email}</span>
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Lahir: <span className="font-bold text-slate-700">{tglLahir}</span>
                    </p>
                  </div>

                  {/* RBAC Role Badge */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-slate-400">PERAN RBAC</span>
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded text-xs font-extrabold border ${roleInfo.bg}`}>
                        {roleInfo.icon}
                        <span>{roleInfo.label}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Group */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  <div className="flex items-center space-x-1 w-full justify-between">
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedEmployeeForView(emp);
                          setIsViewModalOpen(true);
                        }}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                        title="Lihat Detail"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(emp, idx)}
                        className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(emp)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {isCurrent && (
                      <span className="text-[10px] text-teal-800 bg-teal-50 px-2 py-1 rounded-md font-extrabold border border-teal-100">
                        Aktif
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TAMBAH KARYAWAN */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl border border-slate-100 flex flex-col my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-teal-800 text-white rounded-t-2xl">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-teal-300" />
                <h3 className="font-extrabold text-sm sm:text-base tracking-tight">Formulir Tambah Personil Karyawan Baru</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nama Karyawan */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Adi Susanto, S.T."
                    value={newEmpName}
                    onChange={(e) => setNewEmpName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                {/* NIP / NIK */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">NIP / NIK Karyawan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 199107042018021004"
                    value={newEmpNik}
                    onChange={(e) => setNewEmpNik(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                {/* Jabatan */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Jabatan Struktural</label>
                  <input
                    type="text"
                    placeholder="Contoh: VP Estimation & Costing"
                    value={newEmpTitle}
                    onChange={(e) => setNewEmpTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                {/* Departemen */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Departemen / Divisi</label>
                  <input
                    type="text"
                    placeholder="Contoh: Estimator & Tender"
                    value={newEmpDepartment}
                    onChange={(e) => setNewEmpDepartment(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                {/* Kedudukan */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Kedudukan Wilayah *</label>
                  <div className="space-y-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <select
                      value={newEmpKedudukanType}
                      onChange={(e) => {
                        const val = e.target.value as 'Pusat' | 'Cabang';
                        setNewEmpKedudukanType(val);
                        if (val === 'Pusat') {
                          setNewEmpKedudukanCity('');
                        }
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden"
                    >
                      <option value="Pusat">Pusat</option>
                      <option value="Cabang">Cabang</option>
                    </select>

                    {newEmpKedudukanType === 'Cabang' && (
                      <div className="pt-2 border-t border-slate-200 space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Nama Kota Cabang *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ketik kota, contoh: Surabaya"
                          value={newEmpKedudukanCity}
                          onChange={(e) => setNewEmpKedudukanCity(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Atasan (Nama Jabatan) */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Atasan Langsung (Jabatan)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Direktur Utama"
                    value={newEmpAtasan}
                    onChange={(e) => setNewEmpAtasan(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                {/* Telepon */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Nomor Telepon</label>
                  <input
                    type="text"
                    placeholder="Contoh: 08123456789"
                    value={newEmpPhone}
                    onChange={(e) => setNewEmpPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Email Perusahaan *</label>
                  <input
                    type="email"
                    required
                    placeholder="Contoh: adi.susanto@staroffice.id"
                    value={newEmpEmail}
                    onChange={(e) => setNewEmpEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                {/* Tanggal Lahir */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Tanggal Lahir</label>
                  <input
                    type="text"
                    placeholder="Contoh: 04 Juli 1991"
                    value={newEmpDob}
                    onChange={(e) => setNewEmpDob(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                {/* Role RBAC */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Peran RBAC (Kewenangan)</label>
                  <select
                    value={newEmpRole}
                    onChange={(e) => setNewEmpRole(e.target.value as UserRole)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                  >
                    <option value="pengguna">Pengguna (Default)</option>
                    <option value="konseptor">Konseptor (Maker)</option>
                    <option value="pemeriksa">Pemeriksa (Checker)</option>
                    <option value="penyetuju">Penyetuju (Approver)</option>
                    <option value="administrator">Administrator Tenant</option>
                  </select>
                </div>

                {/* Level Jabatan */}
                <div className="col-span-1 sm:col-span-2 space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Level Jabatan</label>
                  <select
                    value={newEmpLevel}
                    onChange={(e) => setNewEmpLevel(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                  >
                    <option value="Staff / Specialist">Level 1: Staff / Specialist</option>
                    <option value="Manager / Supervisor">Level 2: Manager / Supervisor</option>
                    <option value="Executive / Director">Level 3: Executive / Director</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </div>

                {/* Alamat */}
                <div className="col-span-1 sm:col-span-2 space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Alamat Lengkap</label>
                  <textarea
                    rows={3}
                    placeholder="Tulis alamat domisili lengkap karyawan..."
                    value={newEmpAlamat}
                    onChange={(e) => setNewEmpAlamat(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-xs font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Karyawan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT KARYAWAN */}
      {/* ========================================================================= */}
      {isEditModalOpen && selectedEmployeeForEdit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl border border-slate-100 flex flex-col my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-blue-800 text-white rounded-t-2xl">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-blue-300" />
                <h3 className="font-extrabold text-sm sm:text-base tracking-tight">Perbarui Data Karyawan (Edit)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nama Karyawan */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={editEmpName}
                    onChange={(e) => setEditEmpName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden"
                  />
                </div>

                {/* NIP / NIK */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">NIP / NIK Karyawan *</label>
                  <input
                    type="text"
                    required
                    value={editEmpNik}
                    onChange={(e) => setEditEmpNik(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden"
                  />
                </div>

                {/* Jabatan */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Jabatan</label>
                  <input
                    type="text"
                    value={editEmpTitle}
                    onChange={(e) => setEditEmpTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden"
                  />
                </div>

                {/* Departemen */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Departemen / Divisi</label>
                  <input
                    type="text"
                    value={editEmpDepartment}
                    onChange={(e) => setEditEmpDepartment(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden"
                  />
                </div>

                {/* Kedudukan */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Kedudukan Wilayah *</label>
                  <div className="space-y-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <select
                      value={editEmpKedudukanType}
                      onChange={(e) => {
                        const val = e.target.value as 'Pusat' | 'Cabang';
                        setEditEmpKedudukanType(val);
                        if (val === 'Pusat') {
                          setEditEmpKedudukanCity('');
                        }
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden"
                    >
                      <option value="Pusat">Pusat</option>
                      <option value="Cabang">Cabang</option>
                    </select>

                    {editEmpKedudukanType === 'Cabang' && (
                      <div className="pt-2 border-t border-slate-200 space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Nama Kota Cabang *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ketik kota, contoh: Surabaya"
                          value={editEmpKedudukanCity}
                          onChange={(e) => setEditEmpKedudukanCity(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Atasan (Nama Jabatan) */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Atasan Langsung (Jabatan)</label>
                  <input
                    type="text"
                    value={editEmpAtasan}
                    onChange={(e) => setEditEmpAtasan(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden"
                  />
                </div>

                {/* Telepon */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Telepon</label>
                  <input
                    type="text"
                    value={editEmpPhone}
                    onChange={(e) => setEditEmpPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Email Perusahaan *</label>
                  <input
                    type="email"
                    required
                    value={editEmpEmail}
                    onChange={(e) => setEditEmpEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden"
                  />
                </div>

                {/* Tanggal Lahir */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Tanggal Lahir</label>
                  <input
                    type="text"
                    value={editEmpDob}
                    onChange={(e) => setEditEmpDob(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden"
                  />
                </div>

                {/* Peran RBAC */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Peran RBAC</label>
                  <select
                    value={editEmpRole}
                    onChange={(e) => setEditEmpRole(e.target.value as UserRole)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden"
                  >
                    <option value="pengguna">Pengguna (Default)</option>
                    <option value="konseptor">Konseptor (Maker)</option>
                    <option value="pemeriksa">Pemeriksa (Checker)</option>
                    <option value="penyetuju">Penyetuju (Approver)</option>
                    <option value="administrator">Administrator Tenant</option>
                  </select>
                </div>

                {/* Level */}
                <div className="col-span-1 sm:col-span-2 space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Level Struktural</label>
                  <select
                    value={editEmpLevel}
                    onChange={(e) => setEditEmpLevel(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden"
                  >
                    <option value="Staff / Specialist">Level 1: Staff / Specialist</option>
                    <option value="Manager / Supervisor">Level 2: Manager / Supervisor</option>
                    <option value="Executive / Director">Level 3: Executive / Director</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </div>

                {/* Alamat */}
                <div className="col-span-1 sm:col-span-2 space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Alamat</label>
                  <textarea
                    rows={3}
                    value={editEmpAlamat}
                    onChange={(e) => setEditEmpAlamat(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-xs font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Perbarui Data</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DETAIL KARYAWAN (VIEW ONLY) */}
      {/* ========================================================================= */}
      {isViewModalOpen && selectedEmployeeForView && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-slate-100 flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-teal-800 text-white rounded-t-2xl">
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight flex items-center space-x-2">
                <Users className="w-5 h-5 text-teal-300" />
                <span>Kartu Data Personil Lengkap</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const emp = selectedEmployeeForView;
              const { alamat, tglLahir, atasanJabatan } = getEmployeeExtraData(emp, 0);
              const kedudukan = getKedudukan(emp);

              return (
                <div className="p-6 space-y-4">
                  <div className="flex items-center space-x-3.5 pb-4 border-b border-slate-100">
                    <div className={`w-14 h-14 rounded-2xl font-black text-base flex items-center justify-center border shadow-sm shrink-0 ${emp.avatarBg || 'bg-teal-800 text-white'}`}>
                      {emp.avatarText || 'EM'}
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 leading-tight">{emp.name}</h4>
                      <p className="text-xs text-teal-800 font-bold mt-0.5">{emp.title || 'Staff'}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">NIP / NIK: {emp.nik}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-3.5 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Departemen</span>
                      <span className="font-bold text-slate-800">{emp.department || '—'}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Kedudukan</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-teal-50 text-teal-900 border border-teal-100 inline-block mt-0.5">
                        {kedudukan}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Atasan</span>
                      <span className="font-semibold text-slate-800">{atasanJabatan || '—'}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Telepon</span>
                      <span className="font-mono text-slate-700">{emp.phone || '—'}</span>
                    </div>

                    <div className="col-span-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Email Resmi</span>
                      <span className="font-mono text-teal-800 font-semibold">{emp.email}</span>
                    </div>

                    <div className="col-span-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Alamat Domisili</span>
                      <span className="text-slate-600 leading-relaxed block bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-1">{alamat}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Tanggal Lahir</span>
                      <span className="font-semibold text-slate-800">{tglLahir}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Status Keaktifan</span>
                      <span className="inline-flex items-center space-x-1 mt-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-bold text-emerald-800 text-[11px] uppercase">Online / Aktif</span>
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => setIsViewModalOpen(false)}
                      className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-xl transition"
                    >
                      Selesai
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PRINT SETTINGS */}
      {isPrintSettingsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white rounded-t-2xl">
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-400" /> Pengaturan Kolom Cetak PDF
              </h3>
              <button
                type="button"
                onClick={() => setIsPrintSettingsModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">Pilih kolom yang ingin disertakan saat mencetak laporan PDF:</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {id: 'no', label: 'No.'},
                  {id: 'nama', label: 'Nama'},
                  {id: 'nip_nik', label: 'NIP / NIK'},
                  {id: 'jabatan', label: 'Jabatan'},
                  {id: 'departemen', label: 'Departemen'},
                  {id: 'kedudukan', label: 'Kedudukan'},
                  {id: 'atasan', label: 'Atasan'},
                  {id: 'telepon', label: 'Telepon'},
                  {id: 'email', label: 'Email'},
                  {id: 'alamat', label: 'Alamat'},
                  {id: 'tgl_lahir', label: 'Tanggal Lahir'},
                  {id: 'role_rbac', label: 'Role RBAC'},
                ].map(col => (
                  <label key={col.id} className="flex items-center space-x-2 cursor-pointer hover:bg-slate-50 p-2 rounded-lg">
                    <input
                      type="checkbox"
                      checked={selectedPrintColumns.includes(col.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedPrintColumns([...selectedPrintColumns, col.id]);
                        else setSelectedPrintColumns(selectedPrintColumns.filter(c => c !== col.id));
                      }}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-xs font-semibold text-slate-700">{col.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={triggerPrint}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Cetak
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl border border-slate-100 flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white rounded-t-2xl">
              <div className="flex items-center space-x-2">
                <Upload className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-sm sm:text-base tracking-tight">Impor Personalia Karyawan via Excel (.xlsx)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="p-6 space-y-4">
              {importNotification && (
                <div className="p-3 bg-emerald-100 border border-emerald-200 text-emerald-950 text-xs font-bold rounded-xl animate-bounce">
                  {importNotification}
                </div>
              )}

              <div className="space-y-2">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Unggah file Excel (<strong>.xlsx</strong> / <strong>.xls</strong>) atau tempelkan baris teks dengan format terpisah koma di bawah ini. Pastikan Anda mengunduh <strong>Template Excel (.xlsx)</strong> terlebih dahulu agar struktur kolom sesuai.
                </p>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center gap-2">
                  <Upload className="w-8 h-8 text-slate-400" />
                  <div className="text-xs font-semibold text-slate-700">Pilih file Excel (.xlsx / .xls) dari komputer Anda</div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".xlsx, .xls, .csv, .txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[11px] font-bold transition"
                  >
                    Cari File...
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">Tempel atau Preview Data Excel / CSV:</label>
                <textarea
                  rows={6}
                  required
                  placeholder={`Nama,NIP_NIK,Jabatan,Departemen,Kedudukan,Atasan,Telepon,Email,Alamat,Tanggal_Lahir\n"Budi Raharjo","198805232015031002","Senior Manager Sales","Sales","Cabang - Bekasi","VP Commercial","0812999888","budi@staroffice.id","Grand Galaxy, Bekasi","23 Mei 1988"`}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-800 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5 text-teal-600" />
                  <span>Unduh Template</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-xs font-bold transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Impor Sekarang</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
