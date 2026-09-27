export type UserRole = 'super_admin' | 'administrator' | 'penyetuju' | 'pemeriksa' | 'konseptor' | 'pengguna';

export interface Organization {
  id_organization: string; // Kunci primer isolasi multi-tenant SaaS
  name: string;
  code: string;
  tier: 'SaaS Enterprise' | 'SaaS Professional' | 'SaaS Starter';
  industry: string;
  customDomain: string;
  status: 'Active' | 'Trial' | 'Suspended';
  createdAt: string;
  adminEmail: string;
  totalUsersCount: number;
  dataIsolationMode: 'Strict Tenant Isolation (Row-Level Security)';
  maxProjects: number;
  logoBadge: string;
}

export interface Employee {
  id: string;
  id_organization: string; // Isolasi data tenant
  nik: string;
  name: string;
  title: string;
  department: string;
  level: 'Staff / Specialist' | 'Manager / Supervisor' | 'Executive / Director' | 'Administrator' | 'Super Admin';
  role: UserRole;
  avatarBg: string;
  avatarText: string;
  avatarUrl?: string;
  email: string;
  phone: string;
  status: 'Aktif / Online' | 'In Meeting' | 'Dinas Luar' | 'Suspended' | 'Menunggu Persetujuan' | 'Ditolak';
  description: string;
  location?: string;
  lastLoginAt?: string;
  createdDate?: string;
  // Metadata pendaftaran / sign-up
  signupSource?: 'Form Pendaftaran Web' | 'Undangan Administrator' | 'Integrasi SSO' | 'Import CSV';
  registrationStatus?: 'Menunggu Persetujuan' | 'Disetujui' | 'Ditolak';
  registeredAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  institutionOrCompany?: string;
  institution?: string;
  companyName?: string;
  companyPhone?: string;
  companyAddress?: string;
  companyEmail?: string;
}

export interface UserRoleInfo {
  id: UserRole;
  title: string;
  subtitle: string;
  actorName: string;
  badgeColor: string;
  description: string;
}

export interface PermissionSetting {
  id: string;
  module: string;
  name: string;
  description: string;
  allowedRoles: UserRole[];
}

export interface MenuAccessSetting {
  id: string;
  label: string;
  category: string;
  iconName: string;
  description: string;
  allowedRoles: UserRole[];
}

export interface RoleAccessDefinition {
  role: UserRole;
  name: string;
  badgeColor: string;
  description: string;
  canManageTenants: boolean;
  canManageUsers: boolean;
  canConfigureAccess: boolean;
  canLockRap: boolean;
  canApproveDiscounts: boolean;
  canVerifyCosts: boolean;
  canEditCosts: boolean;
  canIssuePo: boolean;
  canManageCashAdvance: boolean;
  canExportData: boolean;
}

export type CostCategoryKey = 
  | 'presales'
  | 'labor'
  | 'hospitality'
  | 'materials'
  | 'venue'
  | 'overhead';

export interface CostCategoryInfo {
  key: CostCategoryKey;
  label: string;
  posCode: string; // POS 00, POS 01, etc.
  description: string;
  iconName: string;
}

export interface CostItem {
  id: string;
  id_organization?: string; // Isolasi data tenant
  category: CostCategoryKey;
  name: string;
  subCategory?: string;
  unitPrice: number;
  quantity: number;
  unit: string; // pax, hari, orang, paket, jam
  daysOrDuration?: number;
  totalCost: number;
  isVariablePerPax?: boolean;
  wasteFactorPercent?: number; // e.g. 5%
  isPresalesOverhead?: boolean;
  notes?: string;
  // Kepatuhan Pajak Indonesia
  taxType?: 'NON_TAX' | 'PPH21_TRAINER' | 'PPH23_JASA' | 'PB1_HOTEL_10' | 'PPN_11';
  taxRatePercent?: number; // e.g. 2.5%, 2%, 10%, 11%
  taxAmount?: number; // Nominal potongan pajak
}

export interface ConsumptionHeadcount {
  participants: number; // Peserta (e.g. 30)
  trainers: number;     // Trainer (e.g. 2)
  organizers: number;   // Panitia (e.g. 3)
  extraBufferPercent: number; // e.g. 5%
  totalHeadcount: number;
  days: number;
}

export type MarginStatus = 'GREEN' | 'YELLOW' | 'RED';

export interface ProjectOpportunity {
  id: string;
  id_organization?: string; // Isolasi data tenant
  code: string;
  name: string;
  clientName: string;
  clientType: string; // e.g., BUMN, Swasta, Kementerian
  headcount: ConsumptionHeadcount;
  targetGrossMarginPercent: number; // e.g. 35%
  discountPercent: number; // Current discount given
  status: 'Draft' | 'Pending Review' | 'Verified' | 'Pending Approval - VP' | 'Pending Approval - CEO' | 'Approved & Locked' | 'Rejected';
  currentRoleAccess: UserRole;
  
  // Cost Summaries
  directHpp: number;
  presalesOverhead: number;
  totalProjectCost: number; // Total Modal Proyek
  
  // Pricing & Margins
  normalSellingPrice: number; // Nominal sebelum diskon
  actualSellingPrice: number; // Nominal setelah diskon
  grossProfit: number;
  grossMarginPercent: number;
  netProfit: number;
  netMarginPercent: number;
  marginStatus: MarginStatus;

  // RAP & PO Locking
  rapVersion?: string; // e.g. "v1.0"
  rapLockedAt?: string;
  rapLockedBy?: string;

  // Audit Logs
  auditTrail: AuditLog[];
}

export interface AuditLog {
  id: string;
  id_organization?: string; // Isolasi data tenant
  timestamp: string;
  role: UserRole;
  actorName: string;
  action: string;
  note?: string;
  statusBadge?: string;
}

export interface PurchaseOrder {
  id: string;
  id_organization?: string; // Isolasi data tenant
  poNumber: string;
  vendorCategory: string; // Hotel, Catering, ATK/Kit, Travel
  vendorName: string;
  allocatedAmount: number;
  actualSpentAmount: number;
  items: string[];
  status: 'Draft' | 'Issued' | 'In Progress' | 'Fulfilled';
  posCode: string;
}

export interface AiRecommendation {
  summary: string;
  recommendations: Array<{
    category: string;
    action: string;
    estimatedSavings: number;
    impactOnQuality: string;
  }>;
  suggestedAlternativePrice?: number;
}

export interface TrainingSyllabus {
  id: string;
  id_organization?: string; // Isolasi data tenant
  code: string;
  title: string;
  category: 'Leadership & Manajerial' | 'Digital & IT Transformation' | 'Finance & Risk Management' | 'Operations & ESG';
  durationDays: number;
  recommendedPax: number;
  trainerDailyRate: number;
  description: string;
  modules: string[];
  learningOutcomes: string[];
}

export interface VendorPartner {
  id: string;
  id_organization?: string; // Isolasi data tenant
  name: string;
  category: 'Hotel & Venue' | 'Percetakan & Training Kit' | 'Catering & F&B' | 'Souvenir & Plakat' | 'Transportasi & Logistik';
  city: string;
  rating: number;
  contactPerson: string;
  phone: string;
  email: string;
  averageRate: string;
  activeStatus: 'Mitra Prioritas' | 'Mitra Terverifikasi' | 'Under Review';
  slaComplianceRate: number; // e.g. 98%
}

export interface TrainingRunSheetItem {
  id: string;
  id_organization?: string; // Isolasi data tenant
  day: number;
  timeSlot: string;
  sessionTitle: string;
  trainerOrPic: string;
  venueRoom: string;
  logisticsKitNeeded: string;
  status: 'Upcoming' | 'Ready' | 'In Session' | 'Completed';
}

export interface ApprovalQueueItem {
  id: string;
  id_organization?: string; // Isolasi data tenant
  title: string;
  projectCode: string;
  client: string;
  type: 'Margin Guardrail (Diskon)' | 'Verifikasi POS HPP' | 'Penguncian RAP v1.0' | 'Rilis PO Vendor' | 'SLA Kontrak Klien';
  requestedBy: string;
  requestedRole: UserRole;
  submittedAt: string;
  urgentLevel: 'Tinggi' | 'Sedang' | 'Normal';
  impactAmount: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  description: string;
}

export interface CashAdvance {
  id: string;
  id_organization?: string; // Isolasi data tenant
  code: string; // e.g. KASBON-2026-088
  requestorName: string;
  requestorRole: string;
  purpose: string;
  targetPosCategory: string; // POS 02 / POS 04 dll
  requestedAmount: number;
  approvedAmount: number;
  actualRealizedAmount: number; // Realisasi nota fisik
  varianceAmount: number; // Selisih (kembali ke kasir / reimburse)
  status: 'Draft' | 'Approved - Disbursed' | 'Settled (Lunas / Selesai Rekonsiliasi)';
  requestDate: string;
  settlementDate?: string;
  receiptNotes?: string;
}

// ==========================================
// TATA KELOLA PROPOSAL PENAWARAN (HULU B2B)
// ==========================================
export type ProposalProjectType = 'training' | 'consulting';

export interface TrainingModuleItem {
  dayNumber: number;
  title: string;
  durationHours: number;
  topics: string[];
  interactiveMethod: string;
}

export interface TrainingProposalDetails {
  targetAudience: string;
  trainingMethod: 'In-House Training (Offline)' | 'Residential Hotel Workshop' | 'Online Virtual Interactive' | 'Blended Learning Hybrid';
  learningObjectives: string[];
  modules: TrainingModuleItem[];
  trainers: Array<{
    name: string;
    role: string;
    credentials: string;
    specialization: string;
  }>;
  facilitiesIncluded: string[];
  evaluationModel: string;
}

export interface ConsultingMilestoneItem {
  phase: string;
  phaseTitle: string;
  durationWeeks: string;
  keyActivities: string[];
  deliverables: string;
  paymentPercentage: number;
}

export interface ConsultingExpertTeamItem {
  name: string;
  role: 'Lead Consultant / Project Director' | 'Senior Subject Matter Expert' | 'Senior Management Consultant' | 'Business & Data Analyst';
  manDays: number;
  billingRateDaily: number;
}

export interface ConsultingProposalDetails {
  consultingType: 'Tata Kelola & SOP' | 'Kajian Kelayakan & Strategis' | 'Manajemen Risiko & Kepatuhan' | 'Transformasi Digital & AI' | 'Pengembangan Organisasi & SDM';
  problemStatement: string;
  approachFramework: string;
  milestones: ConsultingMilestoneItem[];
  expertTeam: ConsultingExpertTeamItem[];
  finalDeliverables: string[];
}

export interface ProposalSection {
  id: string;
  title: string;
  type: 'text' | 'bullet_list' | 'table_costs' | 'table_syllabus' | 'table_milestones' | 'signatory';
  content: string;
  items?: string[];
}

export interface ProposalDocument {
  id: string;
  id_organization?: string;
  proposalNumber: string;
  projectType: ProposalProjectType;
  title: string;
  clientName: string;
  clientType: 'BUMN' | 'Kementerian / Lembaga' | 'Swasta Enterprise' | 'Pemerintah Daerah' | 'Perbankan';
  clientPicName: string;
  clientPicPosition: string;
  dateCreated: string;
  validityDays: number;
  startDateEst: string;
  durationText: string;
  
  // Link ke HPP & Finansial
  participantsCount?: number;
  internalHppCost: number;
  proposedSellingPrice: number;
  targetMarginPercent: number;
  includePpn11: boolean;
  taxNotes: string;
  paymentTerms: string;
  
  // Status pipeline
  status: 'Draf Penawaran' | 'Review Internal' | 'Terkirim ke Klien' | 'Negosiasi (BAFO)' | 'Disetujui / Menang' | 'Ditolak / Batal';
  signatoryName: string;
  signatoryTitle: string;
  
  // Spesifik tipe
  trainingDetails?: TrainingProposalDetails;
  consultingDetails?: ConsultingProposalDetails;
  
  termsAndConditions: string[];
  sections?: ProposalSection[];
}

export interface ProposalTemplate {
  id: string;
  name: string;
  description: string;
  projectType: ProposalProjectType;
  // Template contents
  title: string;
  durationText: string;
  taxNotes: string;
  paymentTerms: string;
  signatoryName: string;
  signatoryTitle: string;
  termsAndConditions: string[];
  // Specifics
  learningObjectives?: string[];
  consultingProblemStatement?: string;
  consultingFramework?: string;
  sections?: ProposalSection[];
}

export interface TrainerFacilitator {
  id: string;
  id_organization?: string;
  name: string;
  title: string;
  category: 'Master Trainer' | 'Fasilitator Teknis' | 'Co-Trainer' | 'Asesor BNSP' | 'Konsultan Ahli';
  specialization: string[];
  credentials: string;
  dailyRate: number;
  sessionRate?: number;
  phone: string;
  email: string;
  city: string;
  status: 'Tersedia' | 'Sedang Bertugas' | 'Standby' | 'Cuti';
  certifiedBnsp: boolean;
  totalHours: number;
  rating: number;
  bio: string;
  relevantSyllabusTitles?: string[];
  bankAccount?: string;
  npwp?: string;
}

export interface ConsultingExpert {
  id: string;
  id_organization?: string;
  name: string;
  title: string;
  domain:
    | 'Strategi & Transformasi BUMN'
    | 'Tata Kelola & Manajemen Risiko (GRC)'
    | 'Teknologi & Arsitektur Digital'
    | 'Keuangan & Valuasi Korporat'
    | 'ESG & Keberlanjutan'
    | 'Legal & Kepatuhan Regulasi'
    | 'Human Capital Advisory';
  level: 'Dewan Pakar / Senior Advisor' | 'Lead Specialist' | 'Senior Consultant' | 'Subject Matter Expert (SME)';
  credentials: string;
  dailyBillingRate: number;
  monthlyRetainerRate?: number;
  phone: string;
  email: string;
  city: string;
  status: 'Tersedia' | 'Aktif di Proyek' | 'Standby Advisory' | 'Non-Aktif';
  publicationsCount?: number;
  totalConsultingYears: number;
  rating: number;
  bio: string;
  pastClients: string[];
  bankAccount?: string;
  npwp?: string;
}

