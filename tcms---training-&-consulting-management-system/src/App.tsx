import React, { useState, useMemo } from 'react';
import { UserRole, ProjectOpportunity, CostItem, ConsumptionHeadcount, PurchaseOrder, AiRecommendation, Employee, CashAdvance, Organization, RoleAccessDefinition, PermissionSetting, MenuAccessSetting } from './types';
import {
  INITIAL_PROJECT,
  INITIAL_COST_ITEMS,
  EMPLOYEES,
  INITIAL_CASH_ADVANCES,
  ORGANIZATIONS,
  ROLE_PERMISSIONS,
  DEFAULT_MENU_ACCESS_SETTINGS,
  ROLE_ACCESS_DEFINITIONS,
  USER_ROLES,
  CLEAN_OPERATIONAL_PROJECT,
  TRAINING_SIMULATION_PROJECT_DRAFT,
  CLEAN_OPERATIONAL_COST_ITEMS,
  CLEAN_OPERATIONAL_PURCHASE_ORDERS,
  CLEAN_OPERATIONAL_CASH_ADVANCES,
} from './data/initialData';
import { calculateProjectTotals, formatCurrency } from './utils/calculator';
import { StarOfficeSidebar, NavigationTab } from './components/StarOfficeSidebar';
import { StarOfficeHeader } from './components/StarOfficeHeader';
import { StarOfficeDashboardOverview } from './components/StarOfficeDashboardOverview';
import { SequentialWorkflowBar } from './components/SequentialWorkflowBar';
import { EmployeeDirectory } from './components/EmployeeDirectory';
import { RoleBanner } from './components/RoleBanner';
import { HppEstimator } from './components/HppEstimator';
import { NegotiationGuardrail } from './components/NegotiationGuardrail';
import { RapAndPoGenerator } from './components/RapAndPoGenerator';
import { ExecutionTracker } from './components/ExecutionTracker';
import { CashAdvanceView } from './components/CashAdvanceView';
import { AiOptimizerModal } from './components/AiOptimizerModal';
import { StarfaAiChatModal } from './components/StarfaAiChatModal';
import { TrainingSyllabusCatalog } from './components/TrainingSyllabusCatalog';
import { VendorDirectoryView } from './components/VendorDirectoryView';
import { TrainerDirectoryView } from './components/TrainerDirectoryView';
import { ExpertDirectoryView } from './components/ExpertDirectoryView';
import { ApprovalQueueView } from './components/ApprovalQueueView';
import { TrainingRunSheetView } from './components/TrainingRunSheetView';
import { ContractDocumentHubView } from './components/ContractDocumentHubView';
import { UserManagementAndAccessView } from './components/UserManagementAndAccessView';
import { UserProfileView } from './components/UserProfileView';
import { DraggableAiButton } from './components/DraggableAiButton';
import { AuthSignInView } from './components/AuthSignInView';
import { ProposalBuilderView } from './components/ProposalBuilderView';
import { Sparkles, CheckCircle2, Calendar, Mail, User } from 'lucide-react';
import { TrainingSyllabus, ProposalDocument } from './types';

export default function App() {
  // Layout Theme State (Classic vs Modern Minimalist vs Sleek Flat)
  const [layoutTheme, setLayoutTheme] = useState<'classic' | 'modern' | 'flat'>(() => {
    return (localStorage.getItem('staroffice_layout_theme') as 'classic' | 'modern' | 'flat') || 'classic';
  });

  const handleToggleLayoutTheme = () => {
    setLayoutTheme((prev) => {
      let next: 'classic' | 'modern' | 'flat' = 'classic';
      if (prev === 'classic') next = 'modern';
      else if (prev === 'modern') next = 'flat';
      else next = 'classic';
      localStorage.setItem('staroffice_layout_theme', next);
      return next;
    });
  };

  // Authentication & Session State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  // Multi-Tenant SaaS Organizations State
  const [organizations, setOrganizations] = useState<Organization[]>(ORGANIZATIONS);
  const [activeOrganization, setActiveOrganization] = useState<Organization>(ORGANIZATIONS[0]);

  // Mode Switcher State: false = Mode Operasional (Nyata / Clean State), true = Mode Simulasi (Demo Training)
  const [isSimulationMode, setIsSimulationMode] = useState<boolean>(false);

  // Training Mode Employees vs Operational Mode Employees
  const [trainingEmployees, setTrainingEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem('tcms_training_employees');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((e: Employee) => {
            if (e.email?.toLowerCase().trim() !== 'cipkai2017@gmail.com' && e.role === 'super_admin') {
              return { ...e, role: 'administrator', level: e.level === 'Super Admin' ? 'Administrator' : e.level };
            }
            return e;
          });
        }
      }
    } catch {}
    return EMPLOYEES;
  });

  const [operationalEmployees, setOperationalEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem('tcms_operational_employees');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((e: Employee) => {
            if (e.email?.toLowerCase().trim() !== 'cipkai2017@gmail.com' && e.role === 'super_admin') {
              return { ...e, role: 'administrator', level: e.level === 'Super Admin' ? 'Administrator' : e.level };
            }
            return e;
          });
        }
      }
    } catch {}
    return [
      EMPLOYEES[0], // Super Admin
      {
        id: 'emp-operational-02',
        id_organization: 'org-star-01',
        nik: 'NIK-2026-001',
        name: 'Muh Tes',
        title: 'System Administrator',
        department: 'Operations',
        level: 'Administrator',
        role: 'administrator',
        avatarBg: 'bg-teal-600 text-white',
        avatarText: 'MT',
        email: 'mtes@gmail.com',
        phone: '08123736677',
        companyName: 'PT Coba Tes',
        companyEmail: 'cobates@gmail.com',
        companyAddress: 'jl. No.10',
        status: 'Aktif / Online',
        description: 'Pengguna operasional bersih.',
        lastLoginAt: '2026-09-22 08:30 WIB',
        createdDate: '2026-09-22',
      }
    ];
  });

  const employeesList = isSimulationMode ? trainingEmployees : operationalEmployees;

  // Dynamic Role Permissions State
  const [rolePermissions, setRolePermissions] = useState<PermissionSetting[]>(ROLE_PERMISSIONS);

  // Dynamic Menu Access Settings State
  const [menuAccessSettings, setMenuAccessSettings] = useState<MenuAccessSetting[]>(() => {
    try {
      const saved = localStorage.getItem('staroffice_menu_access');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_MENU_ACCESS_SETTINGS;
  });

  const handleToggleMenuAccess = (menuId: string, role: UserRole) => {
    setMenuAccessSettings((prev) => {
      const updated = prev.map((item) => {
        if (item.id === menuId) {
          const hasRole = item.allowedRoles.includes(role);
          return {
            ...item,
            allowedRoles: hasRole
              ? item.allowedRoles.filter((r) => r !== role)
              : [...item.allowedRoles, role],
          };
        }
        return item;
      });
      localStorage.setItem('staroffice_menu_access', JSON.stringify(updated));
      return updated;
    });
  };

  const handleResetMenuAccess = () => {
    setMenuAccessSettings(DEFAULT_MENU_ACCESS_SETTINGS);
    localStorage.setItem('staroffice_menu_access', JSON.stringify(DEFAULT_MENU_ACCESS_SETTINGS));
  };

  // Active Logged-in Employee State
  const [currentEmployee, setCurrentEmployee] = useState<Employee>(() => {
    try {
      const saved = localStorage.getItem('tcms_current_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed) {
          if (parsed.email?.toLowerCase().trim() !== 'cipkai2017@gmail.com' && parsed.role === 'super_admin') {
            parsed.role = 'administrator';
            parsed.level = 'Administrator';
          }
          return parsed;
        }
      }
    } catch {}
    return EMPLOYEES[0];
  });

  // Mobile Sidebar State
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

  // Desktop Sidebar Collapse (Icon-only mode) State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Governance Role State (Synced with current employee - strictly super_admin only for cipkai2017@gmail.com)
  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem('tcms_current_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.email?.toLowerCase().trim() === 'cipkai2017@gmail.com') {
          return 'super_admin';
        }
        return parsed.role === 'super_admin' ? 'administrator' : (parsed.role || 'pengguna');
      }
    } catch {}
    return EMPLOYEES[0].role;
  });
  
  // Navigation Tab State (defaults to 'beranda' matching screenshot)
  const [activeTab, setActiveTab] = useState<NavigationTab>('beranda');

  // Initial Proposal Creation trigger from Syllabus
  const [initialProposalFromSyllabus, setInitialProposalFromSyllabus] = useState<TrainingSyllabus | null>(null);
  const handleCreateProposalFromSyllabus = (syllabus: TrainingSyllabus) => {
    setInitialProposalFromSyllabus(syllabus);
    setActiveTab('proposal');
  };

  // Dynamic Project Base Metadata
  const [projectBaseInfo, setProjectBaseInfo] = useState<ProjectOpportunity>(CLEAN_OPERATIONAL_PROJECT);

  // Core Data States (Initialized to Clean Operational State)
  const [costItems, setCostItems] = useState<CostItem[]>(CLEAN_OPERATIONAL_COST_ITEMS);
  const [headcount, setHeadcount] = useState<ConsumptionHeadcount>(CLEAN_OPERATIONAL_PROJECT.headcount);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [projectStatus, setProjectStatus] = useState<string>('Draft');
  const [auditLogs, setAuditLogs] = useState(CLEAN_OPERATIONAL_PROJECT.auditTrail);
  
  // Checker Verification Checklist
  const [verifiedItems, setVerifiedItems] = useState<Record<string, boolean>>({});

  // Purchase Orders State
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(CLEAN_OPERATIONAL_PURCHASE_ORDERS);

  // Cash Advance / Kasbon Operasional Lapangan State
  const [cashAdvances, setCashAdvances] = useState<CashAdvance[]>(CLEAN_OPERATIONAL_CASH_ADVANCES);

  // Tanya Starfa AI Chat Modal (Powered by Gemini AI) State
  const [isStarfaChatOpen, setIsStarfaChatOpen] = useState(false);
  const [starfaInitialPrompt, setStarfaInitialPrompt] = useState<string | undefined>(undefined);

  // AI Optimizer State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<AiRecommendation | null>(null);

  // Notification Banner
  const [notification, setNotification] = useState<string | null>(null);

  // Recalculate Project Financials
  const financials = useMemo(() => {
    return calculateProjectTotals(costItems, discountPercent, projectBaseInfo.targetGrossMarginPercent || 30);
  }, [costItems, discountPercent, projectBaseInfo.targetGrossMarginPercent]);

  // Combined Project Object
  const currentProject: ProjectOpportunity = {
    ...projectBaseInfo,
    headcount,
    discountPercent,
    status: projectStatus as any,
    currentRoleAccess: activeRole,
    directHpp: financials.directHpp,
    presalesOverhead: financials.presalesOverhead,
    totalProjectCost: financials.totalProjectCost,
    normalSellingPrice: financials.normalSellingPrice,
    actualSellingPrice: financials.actualSellingPrice,
    grossProfit: financials.grossProfit,
    grossMarginPercent: financials.grossMarginPercent,
    netProfit: financials.netProfit,
    netMarginPercent: financials.netMarginPercent,
    marginStatus: financials.marginStatus,
    auditTrail: auditLogs,
  };

  // Handler Mode Switcher (Operasional vs Simulasi Demo)
  const handleLoadTrainingPreset = (preset: 'bumn_full' | 'blank_draft' = 'bumn_full') => {
    setIsSimulationMode(true);
    if (preset === 'bumn_full') {
      // Load Full Preloaded Historical Training Case Study (BUMN Leadership 3-Days)
      setProjectBaseInfo(INITIAL_PROJECT);
      setCostItems(INITIAL_COST_ITEMS);
      setHeadcount(INITIAL_PROJECT.headcount);
      setDiscountPercent(INITIAL_PROJECT.discountPercent || 0);
      setProjectStatus(INITIAL_PROJECT.status || 'Pending Review');
      setAuditLogs(INITIAL_PROJECT.auditTrail);
      setPurchaseOrders([
        {
          id: 'po-1',
          poNumber: 'PO-2026-001/HOTEL',
          vendorCategory: 'Hotel & Venue',
          vendorName: 'Grand Hyatt Bintang 4',
          allocatedAmount: 69450000,
          actualSpentAmount: 69450000,
          items: [
            'Paket Fullboard Meeting 35 Pax x 3 Hari',
            'Sewa Meeting Room Grand Ballroom 3 Hari',
            'Kamar Hotel Trainer & Tim (3 Kamar x 3 Malam)',
          ],
          status: 'Issued',
          posCode: 'POS 02 / POS 04',
        },
        {
          id: 'po-2',
          poNumber: 'PO-2026-002/KIT',
          vendorCategory: 'ATK, Kit & Percetakan',
          vendorName: 'CV Sinar Printing & Craft',
          allocatedAmount: 14200000,
          actualSpentAmount: 13800000,
          items: [
            'Executive Training Kit (30 Pax)',
            'Modul Cetak Hardcover (32 Pax incl cadangan)',
            'Plakat Kristal & Sertifikat Kayu Bingkai',
          ],
          status: 'Issued',
          posCode: 'POS 03',
        },
        {
          id: 'po-3',
          poNumber: 'PO-2026-003/TRAVEL',
          vendorCategory: 'Travel & Cargo Logistics',
          vendorName: 'PT Garuda Indonesia & Express Cargo',
          allocatedAmount: 13500000,
          actualSpentAmount: 14200000,
          items: [
            'Tiket Pesawat PP Trainer Utama & Co-Trainer',
            'Pengiriman Cargo Module & Equipment 50kg',
          ],
          status: 'Draft',
          posCode: 'POS 04',
        },
      ]);
      setCashAdvances(INITIAL_CASH_ADVANCES);
      setVerifiedItems({
        'item-1': true,
        'item-2': true,
        'item-5': true,
        'item-8': true,
      });
      showNotification('🧪 Data Pelatihan BUMN 3-Hari (OPP-2026-089) lengkap dengan 15 Pos Biaya, PO, dan Kasbon berhasil dimuat!');
    } else {
      // Load Blank Practice Draft (PRJ-2026-001)
      setProjectBaseInfo(TRAINING_SIMULATION_PROJECT_DRAFT);
      setCostItems(INITIAL_COST_ITEMS);
      setHeadcount(TRAINING_SIMULATION_PROJECT_DRAFT.headcount);
      setDiscountPercent(0);
      setProjectStatus('Draft - Presales Costing');
      setAuditLogs(TRAINING_SIMULATION_PROJECT_DRAFT.auditTrail);
      setPurchaseOrders([]);
      setCashAdvances(INITIAL_CASH_ADVANCES);
      setVerifiedItems({});
      showNotification('🧪 Draf Latihan Baru (PRJ-2026-001) berhasil disiapkan untuk simulasi mandiri.');
    }
  };

  const handleToggleSimulationMode = (enable: boolean) => {
    if (enable) {
      handleLoadTrainingPreset('bumn_full');
    } else {
      // Switch to Clean Operational Real Application Mode
      setIsSimulationMode(false);
      setProjectBaseInfo(CLEAN_OPERATIONAL_PROJECT);
      setCostItems(CLEAN_OPERATIONAL_COST_ITEMS);
      setHeadcount(CLEAN_OPERATIONAL_PROJECT.headcount);
      setDiscountPercent(0);
      setProjectStatus('Draft');
      setAuditLogs(CLEAN_OPERATIONAL_PROJECT.auditTrail);
      setPurchaseOrders(CLEAN_OPERATIONAL_PURCHASE_ORDERS);
      setCashAdvances(CLEAN_OPERATIONAL_CASH_ADVANCES);
      setVerifiedItems({});
      showNotification('🟢 Mode Operasional Aktif: Lembar kerja bersih tanpa data pelatihan simulasi.');
    }
  };

  // Handlers
  const handleToggleVerifyItem = (itemId: string) => {
    setVerifiedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleSelectEmployee = (emp: Employee) => {
    let safeEmp = emp;
    let safeRole = emp.role;
    if (emp.email?.toLowerCase().trim() !== 'cipkai2017@gmail.com' && emp.role === 'super_admin') {
      safeRole = 'administrator';
      safeEmp = { ...emp, role: 'administrator', level: 'Administrator' };
    }
    setCurrentEmployee(safeEmp);
    setActiveRole(safeRole);
    showNotification(`Berhasil masuk sebagai ${safeEmp.name} (${safeEmp.title})`);
  };

  const handleSelectRole = (role: UserRole) => {
    if (role === 'super_admin' && currentEmployee.email?.toLowerCase().trim() !== 'cipkai2017@gmail.com') {
      showNotification('Akses ditolak: Akun Super Admin eksklusif hanya untuk cipkai2017@gmail.com.');
      return;
    }
    setActiveRole(role);
    if (currentEmployee.role !== role) {
      const match = employeesList.find((e) => e.role === role);
      if (match) {
        if (role === 'super_admin' && match.email?.toLowerCase().trim() !== 'cipkai2017@gmail.com') {
          return;
        }
        setCurrentEmployee(match);
        showNotification(`Dioperasikan sebagai ${match.name} (${match.title})`);
      }
    }
  };

  const handleResetCaseStudy = () => {
    if (isSimulationMode) {
      handleLoadTrainingPreset('bumn_full');
    } else {
      setProjectBaseInfo(CLEAN_OPERATIONAL_PROJECT);
      setCostItems(CLEAN_OPERATIONAL_COST_ITEMS);
      setHeadcount(CLEAN_OPERATIONAL_PROJECT.headcount);
      setDiscountPercent(0);
      setProjectStatus('Draft');
      setAuditLogs(CLEAN_OPERATIONAL_PROJECT.auditTrail);
      setPurchaseOrders(CLEAN_OPERATIONAL_PURCHASE_ORDERS);
      setCashAdvances(CLEAN_OPERATIONAL_CASH_ADVANCES);
      setVerifiedItems({});
      showNotification('Lembar kerja operasional dibersihkan kembali ke status awal.');
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 5000);
  };

  const handleAddAuditLog = (action: string, role: UserRole, actorName: string, statusBadge?: string) => {
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      role,
      actorName,
      action,
      statusBadge,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Workflow Action Functions
  const handleSubmitForReview = () => {
    setProjectStatus('Pending Review');
    handleAddAuditLog(
      `Pengajuan Draf HPP oleh ${currentEmployee.name} (${currentEmployee.title}): Total Modal Rp ${financials.totalProjectCost.toLocaleString('id-ID')} & Target Penawaran Rp ${financials.actualSellingPrice.toLocaleString('id-ID')}`,
      currentEmployee.role,
      `${currentEmployee.name} (${currentEmployee.title})`,
      'Submitted for Review'
    );
    const checker = EMPLOYEES.find((e) => e.role === 'pemeriksa') || EMPLOYEES[3];
    setCurrentEmployee(checker);
    setActiveRole('pemeriksa');
    showNotification(`Proposal berhasil diajukan! Tugas otomatis dialihkan ke ${checker.name} (${checker.title})`);
    setActiveTab('estimator');
  };

  const handleVerifyByChecker = () => {
    setProjectStatus('Pending Approval - VP');
    handleAddAuditLog(
      `Verifikasi HPP oleh ${currentEmployee.name} (${currentEmployee.title}): Seluruh komponen POS biaya dan rasio konsumsi terverifikasi sesuai katalog.`,
      currentEmployee.role,
      `${currentEmployee.name} (${currentEmployee.title})`,
      'HPP Verified'
    );
    const approver = EMPLOYEES.find((e) => e.role === 'penyetuju') || EMPLOYEES[5];
    setCurrentEmployee(approver);
    setActiveRole('penyetuju');
    showNotification(`HPP Berhasil Diverifikasi! Tugas dialihkan ke ${approver.name} (${approver.title})`);
    setActiveTab('negotiation');
  };

  const handleApproveByExecutive = (note: string) => {
    setProjectStatus('Approved & Locked');
    handleAddAuditLog(
      `Persetujuan Komersial oleh ${currentEmployee.name} (${currentEmployee.title}): Penawaran Rp ${financials.actualSellingPrice.toLocaleString('id-ID')} disetujui (Net Margin ${financials.netMarginPercent.toFixed(1)}%). Anggaran RAP v1.0 dikunci.`,
      currentEmployee.role,
      `${currentEmployee.name} (${currentEmployee.title})`,
      'RAP Locked v1.0'
    );
    showNotification('Penawaran Disetujui! RAP v1.0 Terkunci & PO Vendor Siap Diterbitkan.');
    setActiveTab('rap');
  };

  const handleRejectProposal = (reason: string) => {
    setProjectStatus('Draft');
    handleAddAuditLog(
      `Revisi/Penolakan oleh ${currentEmployee.name} (${currentEmployee.title}): "${reason}"`,
      currentEmployee.role,
      `${currentEmployee.name} (${currentEmployee.title})`,
      'Revision Requested'
    );
    const designer = EMPLOYEES.find((e) => e.role === 'konseptor') || EMPLOYEES[0];
    setCurrentEmployee(designer);
    setActiveRole('konseptor');
    showNotification(`Proposal dikembalikan ke ${designer.name} untuk revisi scope.`);
    setActiveTab('negotiation');
  };

  const handleIssuePo = (poId: string) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => (po.id === poId ? { ...po, status: 'Issued' } : po))
    );
    showNotification(`Surat Pemesanan (PO) berhasil diterbitkan ke vendor.`);
  };

  const handleAddActualSpend = (poId: string, amount: number) => {
    setPurchaseOrders((prev) =>
      prev.map((po) =>
        po.id === poId
          ? { ...po, actualSpentAmount: po.actualSpentAmount + amount }
          : po
      )
    );
    showNotification(`Realisasi belanja berhasil ditambahkan ke alokasi PO.`);
  };

  const handleAddCashAdvance = (item: CashAdvance) => {
    setCashAdvances((prev) => [item, ...prev]);
    showNotification(`Pengajuan kasbon ${item.code} (${formatCurrency(item.requestedAmount)}) berhasil dikirim!`);
  };

  const handleUpdateCashAdvanceStatus = (id: string, status: CashAdvance['status'], actualSpent?: number) => {
    setCashAdvances((prev) =>
      prev.map((ca) => {
        if (ca.id !== id) return ca;
        const spent = actualSpent !== undefined ? actualSpent : ca.actualRealizedAmount;
        const variance = ca.approvedAmount - spent;
        return {
          ...ca,
          status,
          actualRealizedAmount: spent,
          varianceAmount: variance,
          settlementDate:
            status === 'Settled (Lunas / Selesai Rekonsiliasi)'
              ? new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
              : ca.settlementDate,
          receiptNotes:
            status === 'Settled (Lunas / Selesai Rekonsiliasi)'
              ? `Rekonsiliasi selesai: Struk Rp ${spent.toLocaleString('id-ID')} diaudit. Sisa Rp ${Math.abs(variance).toLocaleString('id-ID')} ${variance >= 0 ? 'kembali ke kasir' : 'reimburse'}.`
              : ca.receiptNotes,
        };
      })
    );
    showNotification(`Status kasbon berhasil diperbarui menjadi "${status}".`);
  };

  // SaaS Multi-Tenant & User Management Handlers
  const handleSelectOrganization = (org: Organization) => {
    setActiveOrganization(org);
    // Find an employee in this org or keep if super_admin
    const orgEmp = employeesList.find((e) => e.id_organization === org.id_organization);
    if (orgEmp && activeRole !== 'super_admin') {
      setCurrentEmployee(orgEmp);
      setActiveRole(orgEmp.role);
    }
    showNotification(`Beralih ke Organisasi Tenant: "${org.name}" (${org.tier})`);
  };

  const handleAddEmployee = (newEmp: Employee) => {
    const sanitizedEmp: Employee = {
      ...newEmp,
      role: newEmp.email?.toLowerCase().trim() === 'cipkai2017@gmail.com' ? 'super_admin' : (newEmp.role === 'super_admin' ? 'administrator' : newEmp.role),
      level: newEmp.email?.toLowerCase().trim() === 'cipkai2017@gmail.com' ? 'Super Admin' : (newEmp.level === 'Super Admin' ? 'Administrator' : newEmp.level),
    };
    if (isSimulationMode) {
      setTrainingEmployees((prev) => {
        const updated = [sanitizedEmp, ...prev];
        try { localStorage.setItem('tcms_training_employees', JSON.stringify(updated)); } catch {}
        return updated;
      });
    } else {
      setOperationalEmployees((prev) => {
        const updated = [sanitizedEmp, ...prev];
        try { localStorage.setItem('tcms_operational_employees', JSON.stringify(updated)); } catch {}
        return updated;
      });
    }
    showNotification(`Pengguna baru "${sanitizedEmp.name}" (${sanitizedEmp.companyName || sanitizedEmp.institution || 'Lembaga'}) berhasil didaftarkan!`);
  };

  const handleUpdateEmployee = (updatedEmp: Employee) => {
    const sanitizedEmp: Employee = {
      ...updatedEmp,
      role: updatedEmp.email?.toLowerCase().trim() === 'cipkai2017@gmail.com' ? 'super_admin' : (updatedEmp.role === 'super_admin' ? 'administrator' : updatedEmp.role),
      level: updatedEmp.email?.toLowerCase().trim() === 'cipkai2017@gmail.com' ? 'Super Admin' : (updatedEmp.level === 'Super Admin' ? 'Administrator' : updatedEmp.level),
    };
    if (isSimulationMode) {
      setTrainingEmployees((prev) => {
        const updated = prev.map((emp) => (emp.id === sanitizedEmp.id ? sanitizedEmp : emp));
        try { localStorage.setItem('tcms_training_employees', JSON.stringify(updated)); } catch {}
        return updated;
      });
    } else {
      setOperationalEmployees((prev) => {
        const updated = prev.map((emp) => (emp.id === sanitizedEmp.id ? sanitizedEmp : emp));
        try { localStorage.setItem('tcms_operational_employees', JSON.stringify(updated)); } catch {}
        return updated;
      });
    }
    if (currentEmployee.id === sanitizedEmp.id) {
      setCurrentEmployee(sanitizedEmp);
      setActiveRole(sanitizedEmp.role);
      try {
        localStorage.setItem('tcms_current_user', JSON.stringify(sanitizedEmp));
      } catch {}
    }
    showNotification(`Data pengguna "${sanitizedEmp.name}" berhasil diperbarui.`);
  };

  const handleDeleteEmployee = (empId: string) => {
    if (isSimulationMode) {
      setTrainingEmployees((prev) => {
        const updated = prev.filter((emp) => emp.id !== empId);
        try { localStorage.setItem('tcms_training_employees', JSON.stringify(updated)); } catch {}
        return updated;
      });
    } else {
      setOperationalEmployees((prev) => {
        const updated = prev.filter((emp) => emp.id !== empId);
        try { localStorage.setItem('tcms_operational_employees', JSON.stringify(updated)); } catch {}
        return updated;
      });
    }
    showNotification(`Pengguna telah dinonaktifkan/dihapus dari tenant.`);
  };

  const handleTogglePermission = (permissionId: string, role: UserRole) => {
    setRolePermissions((prev) =>
      prev.map((perm) => {
        if (perm.id !== permissionId) return perm;
        const exists = perm.allowedRoles.includes(role);
        return {
          ...perm,
          allowedRoles: exists
            ? perm.allowedRoles.filter((r) => r !== role)
            : [...perm.allowedRoles, role],
        };
      })
    );
    showNotification(`Izin hak akses '${permissionId}' untuk peran ${role} berhasil diperbarui.`);
  };

  // Trigger Tanya Starfa AI Chat Modal (Powered by Gemini AI)
  const handleTriggerAiOptimizer = (prompt?: string) => {
    if (typeof prompt === 'string' && prompt.length > 0) {
      setStarfaInitialPrompt(prompt);
    } else {
      setStarfaInitialPrompt(undefined);
    }
    setIsStarfaChatOpen(true);
  };

  // Handle Login with OTP or Google SSO
  const handleLoginSuccess = (employee: Employee, role: UserRole) => {
    const isCipkai = employee.email?.toLowerCase().trim() === 'cipkai2017@gmail.com';
    let finalRole: UserRole = role;
    let finalEmployee: Employee = employee;

    if (isCipkai) {
      finalRole = 'super_admin';
      finalEmployee = {
        ...employee,
        role: 'super_admin',
        level: 'Super Admin',
      };
    } else {
      // Akun selain cipkai2017@gmail.com DILARANG KERAS menjadi super_admin
      if (finalRole === 'super_admin' || finalEmployee.role === 'super_admin') {
        finalRole = 'administrator';
        finalEmployee = {
          ...employee,
          role: 'administrator',
          level: employee.level === 'Super Admin' ? 'Administrator' : employee.level,
        };
      }
    }

    setCurrentEmployee(finalEmployee);
    setActiveRole(finalRole);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('tcms_current_user', JSON.stringify(finalEmployee));
    } catch {}

    if (isCipkai) {
      showNotification(`Selamat datang kembali, Super Admin (${finalEmployee.name})! Akses penuh ke Panel Manajemen Pengguna & Hak Akses telah aktif.`);
      setActiveTab('user_management');
    } else {
      showNotification(`Selamat datang kembali, ${finalEmployee.name} (${finalEmployee.title || finalRole})!`);
      setActiveTab('beranda');
    }
  };

  // Handle Logout / Switch Account
  const handleLogout = () => {
    setIsAuthenticated(false);
    showNotification('Sesi Anda telah diakhiri. Silakan masuk kembali dengan verifikasi OTP.');
  };

  // If not authenticated, display full AuthSignInView
  if (!isAuthenticated) {
    return (
      <AuthSignInView
        onLoginSuccess={handleLoginSuccess}
        employees={employeesList}
        activeOrganization={activeOrganization}
        organizations={organizations}
        onRegisterUser={handleAddEmployee}
        onBackToApp={() => setIsAuthenticated(true)}
      />
    );
  }

  return (
    <div className={`min-h-screen ${layoutTheme !== 'classic' ? 'bg-[#fafbfc]' : 'bg-[#f8fafc]'} text-slate-900 font-sans flex flex-row antialiased overflow-x-hidden`}>
      
      {/* Left Sidebar (Star e-Office style: persistent icon rail when collapsed, full sidebar when expanded) */}
      <StarOfficeSidebar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        activeRole={activeRole}
        onSelectRole={handleSelectRole}
        currentEmployee={currentEmployee}
        isOpenMobile={isSidebarOpenMobile}
        onCloseMobile={() => setIsSidebarOpenMobile(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        onTriggerAiOptimizer={handleTriggerAiOptimizer}
        onResetCaseStudy={handleResetCaseStudy}
        onLogout={handleLogout}
        isSimulationMode={isSimulationMode}
        onToggleSimulationMode={handleToggleSimulationMode}
        menuSettings={menuAccessSettings}
      />

      {/* Main Layout Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 min-h-screen ${layoutTheme !== 'classic' ? 'bg-[#fafbfc]' : 'bg-[#f8fafc]'}`}>
        
        {/* Top Header Bar */}
        <StarOfficeHeader
          onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
          activeRole={activeRole}
          onSelectRole={handleSelectRole}
          currentEmployee={currentEmployee}
          onOpenDirectory={() => setActiveTab('directory')}
          onOpenTrainers={() => setActiveTab('trainers')}
          onOpenExperts={() => setActiveTab('experts')}
          onOpenProfile={() => setActiveTab('profile')}
          onResetCaseStudy={handleResetCaseStudy}
          currentProjectCode={currentProject.code}
          onTriggerAiOptimizer={handleTriggerAiOptimizer}
          activeOrganization={activeOrganization}
          organizations={organizations}
          onSelectOrganization={handleSelectOrganization}
          onOpenUserManagement={() => setActiveTab('user_management')}
          onLogout={handleLogout}
          isSimulationMode={isSimulationMode}
          onToggleSimulationMode={handleToggleSimulationMode}
          layoutTheme={layoutTheme}
          onToggleLayoutTheme={handleToggleLayoutTheme}
        />

        {/* Sequential Workflow Hand-off Bar (shown strictly for core proposal workflow tabs) */}
        {['estimator', 'negotiation', 'rap', 'execution'].includes(activeTab) && (
          <>
            <SequentialWorkflowBar
              project={currentProject}
              currentEmployee={currentEmployee}
              isSimulationMode={isSimulationMode}
              onSelectEmployee={handleSelectEmployee}
              onSubmitForReview={handleSubmitForReview}
              onVerifyByChecker={handleVerifyByChecker}
              onApproveByExecutive={handleApproveByExecutive}
              onRejectProposal={handleRejectProposal}
            />
          </>
        )}

        {/* Toast Notification */}
        {notification && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-3 w-full">
            <div className="p-3 bg-teal-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-between border border-teal-700 animate-fade-in">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal-200" />
                <span>{notification}</span>
              </div>
              <button onClick={() => setNotification(null)} className="text-teal-200 hover:text-white cursor-pointer">
                ×
              </button>
            </div>
          </div>
        )}

        {/* Main Content Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
          
          {/* Star e-Office Beranda / Dashboard Overview */}
          {(activeTab === 'beranda' || activeTab === 'dashboard') && (
            <StarOfficeDashboardOverview
              project={currentProject}
              activeTab={activeTab}
              onSelectTab={(tab) => setActiveTab(tab)}
              onTriggerAiOptimizer={handleTriggerAiOptimizer}
              currentEmployee={currentEmployee}
              costItems={costItems}
              activeRole={activeRole}
              layoutTheme={layoutTheme}
            />
          )}

          {/* Active Module Container */}
          <div>
            {activeTab === 'proposal' && (
              <ProposalBuilderView
                currentProject={currentProject}
                currentCostItems={costItems}
                onNavigateToHpp={() => setActiveTab('estimator')}
                onSyncProposalToHpp={(proposal) => {
                  if (proposal.projectType === 'training' && proposal.participantsCount) {
                    setHeadcount((prev) => ({
                      ...prev,
                      participants: proposal.participantsCount || 30,
                      totalHeadcount: (proposal.participantsCount || 30) + prev.trainers + prev.organizers,
                    }));
                  }
                  setDiscountPercent(0);
                  setNotification(`Data proposal "${proposal.proposalNumber}" (${proposal.clientName}) berhasil disinkronkan ke Kalkulator HPP.`);
                  setActiveTab('estimator');
                }}
                initialSyllabus={initialProposalFromSyllabus}
                onClearInitialSyllabus={() => setInitialProposalFromSyllabus(null)}
              />
            )}

            {activeTab === 'estimator' && (
              <HppEstimator
                costItems={costItems}
                headcount={headcount}
                activeRole={activeRole}
                onUpdateCostItems={(items) => setCostItems(items)}
                onUpdateHeadcount={(hc) => setHeadcount(hc)}
                verifiedItems={verifiedItems}
                onToggleVerifyItem={handleToggleVerifyItem}
                isSimulationMode={isSimulationMode}
                onNavigateToProposal={() => setActiveTab('proposal')}
              />
            )}

            {activeTab === 'negotiation' && (
              <NegotiationGuardrail
                project={currentProject}
                activeRole={activeRole}
                onDiscountChange={(d) => setDiscountPercent(d)}
                onSubmitForReview={handleSubmitForReview}
                onVerifyByChecker={handleVerifyByChecker}
                onApproveByExecutive={handleApproveByExecutive}
                onRejectProposal={handleRejectProposal}
                onTriggerAiOptimizer={handleTriggerAiOptimizer}
                isAiLoading={isAiLoading}
              />
            )}

            {activeTab === 'rap' && (
              <RapAndPoGenerator
                project={currentProject}
                activeRole={activeRole}
                purchaseOrders={purchaseOrders}
                costItems={costItems}
                onIssuePo={handleIssuePo}
              />
            )}

            {activeTab === 'execution' && (
              <ExecutionTracker
                project={currentProject}
                purchaseOrders={purchaseOrders}
                onAddActualSpend={handleAddActualSpend}
              />
            )}

            {activeTab === 'directory' && (
              <EmployeeDirectory
                currentEmployee={currentEmployee}
                onSelectEmployee={handleSelectEmployee}
                employees={employeesList}
                onAddEmployee={handleAddEmployee}
                onUpdateEmployee={handleUpdateEmployee}
                onDeleteEmployee={handleDeleteEmployee}
                activeOrganization={activeOrganization}
                isSimulationMode={isSimulationMode}
                onToggleSimulationMode={handleToggleSimulationMode}
              />
            )}

            {/* Direktori Fasilitator & Trainer Tab */}
            {activeTab === 'trainers' && (
              <TrainerDirectoryView
                isSimulationMode={isSimulationMode}
                onNavigateToSyllabus={() => setActiveTab('silabus')}
                onNavigateToSchedule={() => setActiveTab('kalender')}
                onNavigateToEstimator={() => setActiveTab('estimator')}
              />
            )}

            {/* Direktori Expert & Dewan Pakar Tab */}
            {activeTab === 'experts' && (
              <ExpertDirectoryView
                isSimulationMode={isSimulationMode}
                onNavigateToProposal={() => setActiveTab('proposal')}
                onNavigateToEstimator={() => setActiveTab('estimator')}
              />
            )}

            {/* Data Profil Saya View */}
            {activeTab === 'profile' && (
              <UserProfileView
                currentEmployee={currentEmployee}
                onUpdateEmployee={(updated) => {
                  handleUpdateEmployee(updated);
                  setCurrentEmployee(updated);
                  showNotification('Data profil Anda berhasil diperbarui.');
                }}
                onNavigateHome={() => setActiveTab('beranda')}
              />
            )}

            {/* Pengaturan Sistem (Dashboard Mode Menu Grid) */}
            {activeTab === 'settings' && (
              <UserManagementAndAccessView
                initialSubTab="grid"
                currentEmployee={currentEmployee}
                activeRole={activeRole}
                organizations={organizations}
                activeOrganization={activeOrganization}
                onSelectOrganization={handleSelectOrganization}
                employees={employeesList}
                onAddEmployee={handleAddEmployee}
                onUpdateEmployee={handleUpdateEmployee}
                onDeleteEmployee={handleDeleteEmployee}
                onSelectEmployee={handleSelectEmployee}
                roleDefinitions={ROLE_ACCESS_DEFINITIONS}
                permissions={rolePermissions}
                onTogglePermission={handleTogglePermission}
                menuSettings={menuAccessSettings}
                onToggleMenuAccess={handleToggleMenuAccess}
                onResetMenuAccess={handleResetMenuAccess}
                isSimulationMode={isSimulationMode}
                onToggleSimulationMode={handleToggleSimulationMode}
                onResetCaseStudy={handleResetCaseStudy}
              />
            )}

            {/* Pengaturan Pengguna (User Management Tab) */}
            {activeTab === 'user_settings' && (
              <UserManagementAndAccessView
                initialSubTab="users"
                currentEmployee={currentEmployee}
                activeRole={activeRole}
                organizations={organizations}
                activeOrganization={activeOrganization}
                onSelectOrganization={handleSelectOrganization}
                employees={employeesList}
                onAddEmployee={handleAddEmployee}
                onUpdateEmployee={handleUpdateEmployee}
                onDeleteEmployee={handleDeleteEmployee}
                onSelectEmployee={handleSelectEmployee}
                roleDefinitions={ROLE_ACCESS_DEFINITIONS}
                permissions={rolePermissions}
                onTogglePermission={handleTogglePermission}
                menuSettings={menuAccessSettings}
                onToggleMenuAccess={handleToggleMenuAccess}
                onResetMenuAccess={handleResetMenuAccess}
                isSimulationMode={isSimulationMode}
                onToggleSimulationMode={handleToggleSimulationMode}
                onResetCaseStudy={handleResetCaseStudy}
              />
            )}

            {/* Pengaturan Kewenangan (RBAC Matrix Tab) */}
            {activeTab === 'role_settings' && (
              <UserManagementAndAccessView
                initialSubTab="rbac"
                currentEmployee={currentEmployee}
                activeRole={activeRole}
                organizations={organizations}
                activeOrganization={activeOrganization}
                onSelectOrganization={handleSelectOrganization}
                employees={employeesList}
                onAddEmployee={handleAddEmployee}
                onUpdateEmployee={handleUpdateEmployee}
                onDeleteEmployee={handleDeleteEmployee}
                onSelectEmployee={handleSelectEmployee}
                roleDefinitions={ROLE_ACCESS_DEFINITIONS}
                permissions={rolePermissions}
                onTogglePermission={handleTogglePermission}
                menuSettings={menuAccessSettings}
                onToggleMenuAccess={handleToggleMenuAccess}
                onResetMenuAccess={handleResetMenuAccess}
                isSimulationMode={isSimulationMode}
                onToggleSimulationMode={handleToggleSimulationMode}
                onResetCaseStudy={handleResetCaseStudy}
              />
            )}

            {/* Pengaturan Akses Menu (Menu Visibility Control Tab) */}
            {activeTab === 'menu_settings' && (
              <UserManagementAndAccessView
                initialSubTab="menu_access"
                currentEmployee={currentEmployee}
                activeRole={activeRole}
                organizations={organizations}
                activeOrganization={activeOrganization}
                onSelectOrganization={handleSelectOrganization}
                employees={employeesList}
                onAddEmployee={handleAddEmployee}
                onUpdateEmployee={handleUpdateEmployee}
                onDeleteEmployee={handleDeleteEmployee}
                onSelectEmployee={handleSelectEmployee}
                roleDefinitions={ROLE_ACCESS_DEFINITIONS}
                permissions={rolePermissions}
                onTogglePermission={handleTogglePermission}
                menuSettings={menuAccessSettings}
                onToggleMenuAccess={handleToggleMenuAccess}
                onResetMenuAccess={handleResetMenuAccess}
                isSimulationMode={isSimulationMode}
                onToggleSimulationMode={handleToggleSimulationMode}
                onResetCaseStudy={handleResetCaseStudy}
              />
            )}

            {/* Manajemen Pengguna & Hak Akses (Panel Super Admin) */}
            {activeTab === 'user_management' && (
              <UserManagementAndAccessView
                initialSubTab="training"
                currentEmployee={currentEmployee}
                activeRole={activeRole}
                organizations={organizations}
                activeOrganization={activeOrganization}
                onSelectOrganization={handleSelectOrganization}
                employees={employeesList}
                onAddEmployee={handleAddEmployee}
                onUpdateEmployee={handleUpdateEmployee}
                onSelectEmployee={handleSelectEmployee}
                roleDefinitions={ROLE_ACCESS_DEFINITIONS}
                permissions={rolePermissions}
                onTogglePermission={handleTogglePermission}
                menuSettings={menuAccessSettings}
                onToggleMenuAccess={handleToggleMenuAccess}
                onResetMenuAccess={handleResetMenuAccess}
                isSimulationMode={isSimulationMode}
                onToggleSimulationMode={handleToggleSimulationMode}
                onResetCaseStudy={handleResetCaseStudy}
                onLoadFullTrainingData={handleLoadTrainingPreset}
                onNavigateTab={(tab) => setActiveTab(tab)}
                isSuperAdminPanel={true}
              />
            )}

            {/* Silabus & Rate Card Tab */}
            {activeTab === 'silabus' && (
              <TrainingSyllabusCatalog
                onApplySyllabusToProject={(syllabus) => {
                  setNotification(
                    `Silabus "${syllabus.title}" berhasil diintegrasikan! Rate card trainer Rp ${(
                      syllabus.trainerDailyRate / 1000000
                    ).toFixed(1)} Jt/hari.`
                  );
                  setActiveTab('estimator');
                }}
                onNavigateToEstimator={() => setActiveTab('estimator')}
                onCreateProposalFromSyllabus={handleCreateProposalFromSyllabus}
              />
            )}

            {/* Direktori Mitra & Vendor Tab */}
            {activeTab === 'vendor' && (
              <VendorDirectoryView
                isSimulationMode={isSimulationMode}
                onSelectVendorForPO={(vendor) => {
                  setNotification(`Mitra "${vendor.name}" (${vendor.category}) dipilih untuk pengadaan PO.`);
                  setActiveTab('rap');
                }}
                onNavigateToRap={() => setActiveTab('rap')}
              />
            )}

            {/* Kalender Run-Sheet Pelatihan Tab */}
            {activeTab === 'kalender' && <TrainingRunSheetView />}

            {/* Kelola Surat & SPH/PO Tab */}
            {activeTab === 'surat' && (
              <ContractDocumentHubView onNavigateToProposal={() => setActiveTab('proposal')} />
            )}

            {/* Ruang Saya / Antrean Otorisasi Tab */}
            {activeTab === 'ruangsaya' && (
              <ApprovalQueueView onNavigateTab={(tab) => setActiveTab(tab)} />
            )}

            {/* Kasbon Operasional Lapangan Tab */}
            {activeTab === 'kasbon' && (
              <CashAdvanceView
                cashAdvances={cashAdvances}
                activeRole={activeRole}
                onAddCashAdvance={handleAddCashAdvance}
                onUpdateStatus={handleUpdateCashAdvanceStatus}
              />
            )}
          </div>

        </main>

        {/* Draggable Floating AI Assistant Button (Tanya Starfa AI Chat) */}
        <DraggableAiButton onClick={() => handleTriggerAiOptimizer()} />

      </div>

      {/* Tanya Starfa AI Interactive Chat Modal (Powered by Gemini AI) */}
      <StarfaAiChatModal
        isOpen={isStarfaChatOpen}
        onClose={() => setIsStarfaChatOpen(false)}
        project={currentProject}
        costItems={costItems}
        discountPercent={discountPercent}
        initialPrompt={starfaInitialPrompt}
      />

      {/* AI Optimizer Modal (Fallback / Direct Scope Rationalization) */}
      {isAiModalOpen && (
        <AiOptimizerModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          recommendation={aiRecommendation}
          isLoading={isAiLoading}
        />
      )}

    </div>
  );
}

