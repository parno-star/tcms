import React, { useState } from 'react';
import { ConsultingExpert } from '../types';
import { CONSULTING_EXPERTS } from '../data/initialData';
import {
  Award,
  Search,
  Plus,
  Trash2,
  Edit3,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Clock,
  Star,
  Building,
  Calendar,
  Sparkles,
  X,
  CreditCard,
  Briefcase,
  Layers,
  LayoutGrid,
  List,
  Copy,
  Check,
  ArrowRight,
  BookOpen,
  ShieldCheck,
  FileText,
  Compass,
  Building2,
  ExternalLink,
} from 'lucide-react';

interface ExpertDirectoryViewProps {
  isSimulationMode?: boolean;
  onNavigateToProposal?: () => void;
  onNavigateToEstimator?: () => void;
}

export const ExpertDirectoryView: React.FC<ExpertDirectoryViewProps> = ({
  isSimulationMode = false,
  onNavigateToProposal,
  onNavigateToEstimator,
}) => {
  const [activeDomain, setActiveDomain] = useState<string>('Semua');
  const [activeLevel, setActiveLevel] = useState<string>('Semua');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Notifications
  const [notification, setNotification] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals
  const [selectedExpert, setSelectedExpert] = useState<ConsultingExpert | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpert, setEditingExpert] = useState<ConsultingExpert | null>(null);
  const [expertToDelete, setExpertToDelete] = useState<ConsultingExpert | null>(null);

  // Persistence for Training vs Operational mode
  const [trainingExperts, setTrainingExperts] = useState<ConsultingExpert[]>(() => {
    try {
      const stored = localStorage.getItem('tcms_training_experts');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return CONSULTING_EXPERTS;
  });

  const [operationalExperts, setOperationalExperts] = useState<ConsultingExpert[]>(() => {
    try {
      const stored = localStorage.getItem('tcms_operational_experts');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return CONSULTING_EXPERTS.filter((e) => e.id === 'exp-01' || e.id === 'exp-02');
  });

  const currentPool = isSimulationMode ? trainingExperts : operationalExperts;

  const saveExpertsPool = (updated: ConsultingExpert[]) => {
    if (isSimulationMode) {
      setTrainingExperts(updated);
      localStorage.setItem('tcms_training_experts', JSON.stringify(updated));
    } else {
      setOperationalExperts(updated);
      localStorage.setItem('tcms_operational_experts', JSON.stringify(updated));
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Form State
  const [formData, setFormData] = useState<Partial<ConsultingExpert>>({
    name: '',
    title: '',
    domain: 'Strategi & Transformasi BUMN',
    level: 'Dewan Pakar / Senior Advisor',
    credentials: '',
    dailyBillingRate: 20000000,
    monthlyRetainerRate: 60000000,
    phone: '',
    email: '',
    city: 'Jakarta',
    status: 'Tersedia',
    publicationsCount: 5,
    totalConsultingYears: 15,
    rating: 4.9,
    bio: '',
    pastClients: ['Kementerian BUMN', 'PT Pertamina (Persero)'],
    bankAccount: '',
    npwp: '',
  });

  // Filter logic
  const filteredExperts = currentPool.filter((e) => {
    const matchesDomain = activeDomain === 'Semua' || e.domain === activeDomain;
    const matchesLevel = activeLevel === 'Semua' || e.level === activeLevel;
    const matchesStatus = statusFilter === 'Semua' || e.status === statusFilter;

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      e.name.toLowerCase().includes(q) ||
      e.title.toLowerCase().includes(q) ||
      e.credentials.toLowerCase().includes(q) ||
      e.domain.toLowerCase().includes(q) ||
      e.city.toLowerCase().includes(q) ||
      e.pastClients.some((c) => c.toLowerCase().includes(q));

    return matchesDomain && matchesLevel && matchesStatus && matchesSearch;
  });

  // KPI Metrics
  const totalCount = currentPool.length;
  const phdCount = currentPool.filter(
    (e) =>
      e.name.toLowerCase().includes('dr.') ||
      e.name.toLowerCase().includes('prof.') ||
      e.credentials.toLowerCase().includes('doktor') ||
      e.credentials.toLowerCase().includes('phd')
  ).length;
  const readyCount = currentPool.filter((e) => e.status === 'Tersedia').length;
  const avgExpYears =
    totalCount > 0
      ? Math.round(currentPool.reduce((acc, curr) => acc + curr.totalConsultingYears, 0) / totalCount)
      : 20;

  const domains = [
    'Semua',
    'Strategi & Transformasi BUMN',
    'Tata Kelola & Manajemen Risiko (GRC)',
    'Teknologi & Arsitektur Digital',
    'Keuangan & Valuasi Korporat',
    'ESG & Keberlanjutan',
    'Legal & Kepatuhan Regulasi',
    'Human Capital Advisory',
  ];

  const levels = [
    'Semua',
    'Dewan Pakar / Senior Advisor',
    'Lead Specialist',
    'Senior Consultant',
    'Subject Matter Expert (SME)',
  ];

  // Action handlers
  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      title: '',
      domain: 'Strategi & Transformasi BUMN',
      level: 'Dewan Pakar / Senior Advisor',
      credentials: 'PhD / Master Degree, Mantan Penasihat Kebijakan Publik / BUMN',
      dailyBillingRate: 20000000,
      monthlyRetainerRate: 60000000,
      phone: '+62 811-0000-0000',
      email: 'expert@tcms-staroffice.id',
      city: 'Jakarta',
      status: 'Tersedia',
      publicationsCount: 8,
      totalConsultingYears: 18,
      rating: 4.95,
      bio: '',
      pastClients: ['Kementerian BUMN', 'PT PLN (Persero)', 'Holding BUMN'],
      bankAccount: 'Bank Mandiri (Atas Nama Pribadi)',
      npwp: '00.000.000.0-000.000',
    });
    setEditingExpert(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (e: ConsultingExpert) => {
    setEditingExpert(e);
    setFormData({ ...e });
    setIsAddModalOpen(true);
  };

  const handleSaveExpert = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!formData.name?.trim()) return;

    if (editingExpert) {
      const updatedList = currentPool.map((e) =>
        e.id === editingExpert.id
          ? ({
              ...e,
              ...formData,
              pastClients:
                formData.pastClients && formData.pastClients.length > 0
                  ? formData.pastClients
                  : ['Klien Korporat'],
            } as ConsultingExpert)
          : e
      );
      saveExpertsPool(updatedList);
      showNotification(`Data expert "${formData.name}" berhasil diperbarui.`);
    } else {
      const newExpert: ConsultingExpert = {
        id: `exp-${Date.now().toString().slice(-6)}`,
        id_organization: 'org-star-01',
        name: formData.name || 'Tenaga Ahli Baru',
        title: formData.title || 'Senior Advisory Specialist',
        domain: (formData.domain as any) || 'Strategi & Transformasi BUMN',
        level: (formData.level as any) || 'Dewan Pakar / Senior Advisor',
        credentials: formData.credentials || 'Doktor / Tenaga Ahli Senior Bersertifikat',
        dailyBillingRate: Number(formData.dailyBillingRate) || 20000000,
        monthlyRetainerRate: Number(formData.monthlyRetainerRate) || 60000000,
        phone: formData.phone || '+62 811-0000-0000',
        email: formData.email || 'expert@tcms-staroffice.id',
        city: formData.city || 'Jakarta',
        status: (formData.status as any) || 'Tersedia',
        publicationsCount: Number(formData.publicationsCount) || 5,
        totalConsultingYears: Number(formData.totalConsultingYears) || 15,
        rating: Number(formData.rating) || 4.95,
        bio:
          formData.bio ||
          'Tenaga ahli senior dengan rekam jejak mendampingi proyek restrukturisasi, perumusan kebijakan, dan kajian strategis.',
        pastClients:
          formData.pastClients && formData.pastClients.length > 0
            ? formData.pastClients
            : ['Kementerian BUMN', 'Holding Industri'],
        bankAccount: formData.bankAccount || '',
        npwp: formData.npwp || '',
      };

      saveExpertsPool([newExpert, ...currentPool]);
      showNotification(`Tenaga ahli "${newExpert.name}" berhasil ditambahkan ke direktori.`);
    }

    setIsAddModalOpen(false);
    setEditingExpert(null);
  };

  const handleDeleteExpert = (e: ConsultingExpert) => {
    const updated = currentPool.filter((item) => item.id !== e.id);
    saveExpertsPool(updated);
    setExpertToDelete(null);
    if (selectedExpert?.id === e.id) setSelectedExpert(null);
    showNotification(`Data tenaga ahli "${e.name}" telah dihapus.`);
  };

  const handleCopyExpert = (e: ConsultingExpert) => {
    const info = `[PROFIL TENAGA AHLI & EXPERT TCMS]\nNama: ${e.name}\nJabatan: ${e.title}\nJenjang: ${e.level}\nDomain: ${e.domain}\nKredensial: ${e.credentials}\nBilling Rate Harian: ${formatCurrency(e.dailyBillingRate)}/hari\nRetainer Bulanan: ${e.monthlyRetainerRate ? formatCurrency(e.monthlyRetainerRate) : '-'}/bulan\nKlien Terdahulu: ${e.pastClients.join(', ')}\nKontak: ${e.phone} | ${e.email}`;
    navigator.clipboard.writeText(info);
    setCopiedId(e.id);
    setTimeout(() => setCopiedId(null), 2000);
    showNotification(`Biodata & billing rate ${e.name} berhasil disalin.`);
  };

  const getStatusBadge = (status: ConsultingExpert['status']) => {
    switch (status) {
      case 'Tersedia':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          label: 'Siap Penugasan',
        };
      case 'Aktif di Proyek':
        return {
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          dot: 'bg-indigo-500',
          label: 'Aktif di Proyek',
        };
      case 'Standby Advisory':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          label: 'Standby Dewan Pakar',
        };
      case 'Non-Aktif':
        return {
          bg: 'bg-slate-100 text-slate-600 border-slate-200',
          dot: 'bg-slate-400',
          label: 'Non-Aktif',
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          label: status,
        };
    }
  };

  const getDomainBadge = (domain: ConsultingExpert['domain']) => {
    switch (domain) {
      case 'Strategi & Transformasi BUMN':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Tata Kelola & Manajemen Risiko (GRC)':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Teknologi & Arsitektur Digital':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'Keuangan & Valuasi Korporat':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'ESG & Keberlanjutan':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'Legal & Kepatuhan Regulasi':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'Human Capital Advisory':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getLevelBadge = (level: ConsultingExpert['level']) => {
    switch (level) {
      case 'Dewan Pakar / Senior Advisor':
        return 'bg-indigo-900 text-indigo-100 border-indigo-700 font-bold';
      case 'Lead Specialist':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200 font-bold';
      case 'Senior Consultant':
        return 'bg-slate-100 text-slate-800 border-slate-300 font-semibold';
      case 'Subject Matter Expert (SME)':
        return 'bg-teal-50 text-teal-800 border-teal-200 font-medium';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-semibold animate-fade-in border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Mode Status Indicator Banner */}
      <div
        className={`px-4 py-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
          isSimulationMode
            ? 'bg-amber-50/80 border-amber-200 text-amber-900'
            : 'bg-indigo-50/80 border-indigo-200 text-indigo-900'
        }`}
      >
        <div className="flex items-center space-x-2">
          <Award
            className={`w-4 h-4 ${isSimulationMode ? 'text-amber-700' : 'text-indigo-700'}`}
          />
          <span className="font-semibold">
            {isSimulationMode
              ? 'Mode Simulasi / Kasus Demo Aktif: Menampilkan Master Data Dewan Pakar & Tenaga Ahli Terakreditasi.'
              : 'Mode Operasional Riil: Menampilkan Tim Dewan Pakar & Tenaga Ahli Terverifikasi Perusahaan.'}
          </span>
        </div>
        <div className="text-[11px] text-slate-600">
          Billing Rate Card terintegrasi otomatis dengan{' '}
          <strong className="text-slate-900">POS 01 Tenaga Ahli Konsultansi</strong> &amp;{' '}
          <strong className="text-slate-900">Penyusunan Proposal BAFO</strong>.
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-700">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Direktori Expert &amp; Dewan Pakar
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Basis data Subject Matter Experts (SME), Penasihat Strategis, Lead Specialists, dan billing rate card proyek jasa konsultansi.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
          {onNavigateToProposal && (
            <button
              onClick={onNavigateToProposal}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Kelola Proposal</span>
            </button>
          )}

          {onNavigateToEstimator && (
            <button
              onClick={onNavigateToEstimator}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-slate-500" />
              <span>Estimator POS 01</span>
            </button>
          )}

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Expert</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold">Total Tenaga Ahli</span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-black text-slate-900">{totalCount} Pakar</div>
          <div className="text-[10px] text-slate-500 mt-1">Terdaftar resmi di TCMS</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold">Kualifikasi S3 / Guru Besar</span>
            <BookOpen className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-black text-purple-900">{phdCount} Pakar</div>
          <div className="text-[10px] text-purple-700 font-medium mt-1">Gelar Doktor / Profesor Terakreditasi</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold">Siap Ditugaskan</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-700">{readyCount} Tersedia</div>
          <div className="text-[10px] text-slate-500 mt-1">Siap untuk alokasi proyek baru</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold">Rata-rata Jam Terbang</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-slate-900">{avgExpYears}+ Tahun</div>
          <div className="text-[10px] text-slate-500 mt-1">Pengalaman konsultansi korporat</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama expert, domain keahlian, klien BUMN, kota, atau kredensial..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
            {/* Level Select */}
            <select
              value={activeLevel}
              onChange={(e) => setActiveLevel(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              {levels.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl === 'Semua' ? 'Semua Jenjang' : lvl}
                </option>
              ))}
            </select>

            {/* Status Select */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              <option value="Semua">Semua Status</option>
              <option value="Tersedia">Tersedia (Ready)</option>
              <option value="Aktif di Proyek">Aktif di Proyek</option>
              <option value="Standby Advisory">Standby Advisory</option>
              <option value="Non-Aktif">Non-Aktif</option>
            </select>

            {/* View Mode Switcher */}
            <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilan Grid Kartu Profil"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilan Tabel Rekapitulasi"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Domain Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-semibold text-[11px] pr-1">Domain:</span>
          {domains.map((dom) => (
            <button
              key={dom}
              onClick={() => setActiveDomain(dom)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeDomain === dom
                  ? 'bg-indigo-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {dom}
            </button>
          ))}
        </div>
      </div>

      {/* Expert List Display */}
      {filteredExperts.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            Tidak ada tenaga ahli yang cocok dengan kriteria filter
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Coba ubah kata kunci pencarian, reset filter domain/level, atau daftarkan tenaga ahli baru ke direktori.
          </p>
          <button
            onClick={() => {
              setActiveDomain('Semua');
              setActiveLevel('Semua');
              setStatusFilter('Semua');
              setSearchQuery('');
            }}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExperts.map((e) => {
            const statusInfo = getStatusBadge(e.status);
            return (
              <div
                key={e.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition flex flex-col justify-between overflow-hidden"
              >
                {/* Top Section */}
                <div className="p-5 space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 rounded-xl bg-indigo-900 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                        {e.name
                          .split(' ')
                          .filter((w) => !w.includes('.'))
                          .slice(0, 2)
                          .map((w) => w[0])
                          .join('') || 'EX'}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1">
                          {e.name}
                        </h3>
                        <p className="text-[11px] text-indigo-800 font-semibold line-clamp-1">
                          {e.title}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Badges: Level, Domain & Status */}
                  <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] border ${getLevelBadge(
                        e.level
                      )}`}
                    >
                      {e.level}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${getDomainBadge(
                        e.domain
                      )}`}
                    >
                      {e.domain}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border flex items-center space-x-1 ${statusInfo.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                      <span>{statusInfo.label}</span>
                    </span>
                  </div>

                  {/* Credentials / Bio snippet */}
                  <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                    {e.credentials}
                  </p>

                  {/* Past BUMN / Clients Chips */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Rekam Jejak Klien / Institusi:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {e.pastClients.map((client, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium"
                        >
                          {client}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Billing Rate Card & Stats Box */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-500">Billing Rate (POS 01 Harian):</span>
                      <span className="font-extrabold text-indigo-950">
                        {formatCurrency(e.dailyBillingRate)}{' '}
                        <span className="text-[10px] font-normal text-slate-500">/ hari</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60 text-slate-600">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{e.totalConsultingYears} Th Pengalaman</span>
                      </span>
                      {e.publicationsCount ? (
                        <span className="flex items-center space-x-1 font-semibold text-purple-700">
                          <BookOpen className="w-3 h-3 text-purple-500" />
                          <span>{e.publicationsCount} Publikasi</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1 font-bold text-amber-700">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                          <span>{e.rating.toFixed(2)}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contact info snippet */}
                  <div className="text-[11px] text-slate-500 space-y-0.5">
                    <div className="flex items-center space-x-1.5 truncate">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{e.city}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 truncate">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate font-mono text-[10.5px]">{e.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedExpert(e)}
                    className="text-xs font-bold text-indigo-800 hover:text-indigo-950 flex items-center space-x-1 transition cursor-pointer"
                  >
                    <span>Profil &amp; CV Singkat</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleCopyExpert(e)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 rounded-lg transition cursor-pointer"
                      title="Salin Biodata & Billing Rate"
                    >
                      {copiedId === e.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(e)}
                      className="p-1.5 text-slate-500 hover:text-indigo-800 hover:bg-slate-200/70 rounded-lg transition cursor-pointer"
                      title="Edit Tenaga Ahli"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setExpertToDelete(e)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Hapus Tenaga Ahli"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5 pl-4">Tenaga Ahli / Expert</th>
                  <th className="p-3.5">Jenjang / Level</th>
                  <th className="p-3.5">Domain Keahlian</th>
                  <th className="p-3.5">Billing Rate (POS 01)</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Pengalaman</th>
                  <th className="p-3.5">Kontak</th>
                  <th className="p-3.5 pr-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredExperts.map((e) => {
                  const statusInfo = getStatusBadge(e.status);
                  return (
                    <tr key={e.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 pl-4 align-top">
                        <div className="font-bold text-slate-900">{e.name}</div>
                        <div className="text-[11px] text-indigo-800 font-semibold">{e.title}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{e.city}</div>
                      </td>

                      <td className="p-3.5 align-top">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] border ${getLevelBadge(
                            e.level
                          )}`}
                        >
                          {e.level}
                        </span>
                      </td>

                      <td className="p-3.5 align-top">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${getDomainBadge(
                            e.domain
                          )}`}
                        >
                          {e.domain}
                        </span>
                      </td>

                      <td className="p-3.5 align-top">
                        <div className="font-extrabold text-indigo-950">
                          {formatCurrency(e.dailyBillingRate)}
                          <span className="text-[10px] font-normal text-slate-500"> / hari</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Retainer: {e.monthlyRetainerRate ? formatCurrency(e.monthlyRetainerRate) : '-'}
                        </div>
                      </td>

                      <td className="p-3.5 align-top">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border inline-flex items-center space-x-1 ${statusInfo.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                          <span>{statusInfo.label}</span>
                        </span>
                      </td>

                      <td className="p-3.5 align-top">
                        <div className="font-bold text-slate-800">
                          {e.totalConsultingYears} Tahun
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {e.publicationsCount ? `${e.publicationsCount} Publikasi` : 'Rating 4.95'}
                        </div>
                      </td>

                      <td className="p-3.5 align-top text-slate-600 text-[11px]">
                        <div>{e.phone}</div>
                        <div className="text-slate-400 text-[10px]">{e.email}</div>
                      </td>

                      <td className="p-3.5 pr-4 align-top text-right space-x-1">
                        <button
                          onClick={() => setSelectedExpert(e)}
                          className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded font-semibold text-[11px] cursor-pointer"
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(e)}
                          className="p-1 text-slate-500 hover:text-indigo-800 rounded cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setExpertToDelete(e)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAIL MODAL DRAWER */}
      {selectedExpert && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex items-start justify-between">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-xl bg-indigo-700 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                  {selectedExpert.name
                    .split(' ')
                    .filter((w) => !w.includes('.'))
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join('') || 'EX'}
                </div>
                <div>
                  <h2 className="text-base font-bold">{selectedExpert.name}</h2>
                  <p className="text-xs text-indigo-300">{selectedExpert.title}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-950 text-indigo-200 border border-indigo-800">
                      {selectedExpert.level}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {selectedExpert.domain}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedExpert(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
              {/* Bio & Credentials */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                  Kredensial &amp; Profil Dewan Pakar
                </h4>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed text-slate-800">
                  <p className="font-semibold text-indigo-900 mb-1">{selectedExpert.credentials}</p>
                  <p className="text-slate-600 leading-relaxed">{selectedExpert.bio}</p>
                </div>
              </div>

              {/* Past Clients / Portofolio */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                  Rekam Jejak Klien BUMN &amp; Proyek Strategis
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedExpert.pastClients.map((client, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-lg text-xs font-semibold flex items-center space-x-1"
                    >
                      <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{client}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Billing Rate Card */}
              <div className="grid grid-cols-2 gap-3 bg-indigo-50/50 p-4 rounded-xl border border-indigo-200">
                <div>
                  <span className="text-[11px] text-indigo-800 font-semibold block">
                    Daily Billing Rate (POS 01 Harian):
                  </span>
                  <div className="text-lg font-black text-indigo-950 mt-0.5">
                    {formatCurrency(selectedExpert.dailyBillingRate)}
                  </div>
                  <span className="text-[10px] text-slate-500">Standar 8 Jam Billing Jasa Konsultansi</span>
                </div>

                <div>
                  <span className="text-[11px] text-indigo-800 font-semibold block">
                    Retainer Bulanan (Advisory Retainer):
                  </span>
                  <div className="text-lg font-black text-indigo-950 mt-0.5">
                    {selectedExpert.monthlyRetainerRate
                      ? formatCurrency(selectedExpert.monthlyRetainerRate)
                      : formatCurrency(selectedExpert.dailyBillingRate * 3)}
                  </div>
                  <span className="text-[10px] text-slate-500">Advisory Dewan Pakar Berkala</span>
                </div>
              </div>

              {/* Banking & NPWP */}
              {(selectedExpert.bankAccount || selectedExpert.npwp) && (
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-[11px]">
                  <div>
                    <span className="text-slate-500 font-medium block">Rekening Honorarium:</span>
                    <span className="font-semibold text-slate-900">
                      {selectedExpert.bankAccount || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block">NPWP (Tarif PPh 21 Tenaga Ahli):</span>
                    <span className="font-semibold text-slate-900 font-mono">
                      {selectedExpert.npwp || '-'}
                    </span>
                  </div>
                </div>
              )}

              {/* Key Highlights */}
              <div className="grid grid-cols-3 gap-3 text-center border-t border-slate-200 pt-3">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 text-[10px] block">Lama Pengalaman</span>
                  <strong className="text-slate-900 text-sm">
                    {selectedExpert.totalConsultingYears} Tahun
                  </strong>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 text-[10px] block">Publikasi / Karya</span>
                  <strong className="text-purple-700 text-sm">
                    {selectedExpert.publicationsCount || 0} Karya Ilmiah
                  </strong>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 text-[10px] block">Domisili Resmi</span>
                  <strong className="text-slate-900 text-sm">{selectedExpert.city}</strong>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                onClick={() => handleCopyExpert(selectedExpert)}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Ringkasan Profil</span>
              </button>

              <div className="flex items-center space-x-2">
                {onNavigateToProposal && (
                  <button
                    onClick={() => {
                      setSelectedExpert(null);
                      onNavigateToProposal();
                    }}
                    className="px-3.5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Alokasikan ke Proposal</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedExpert(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-indigo-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Award className="w-5 h-5 text-indigo-300" />
                <h3 className="font-bold text-sm">
                  {editingExpert ? 'Perbarui Data Tenaga Ahli' : 'Tambah Tenaga Ahli / Dewan Pakar Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-indigo-200 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpert} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Nama Lengkap &amp; Gelar Akademik / Sertifikasi Profesi *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Prof. Dr. Ir. Danang Supratman, M.Sc., IPU"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Jenjang / Level Penugasan *
                  </label>
                  <select
                    value={formData.level || 'Dewan Pakar / Senior Advisor'}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="Dewan Pakar / Senior Advisor">Dewan Pakar / Senior Advisor</option>
                    <option value="Lead Specialist">Lead Specialist</option>
                    <option value="Senior Consultant">Senior Consultant</option>
                    <option value="Subject Matter Expert (SME)">Subject Matter Expert (SME)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Domain Keahlian Utama *
                  </label>
                  <select
                    value={formData.domain || 'Strategi & Transformasi BUMN'}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="Strategi & Transformasi BUMN">Strategi &amp; Transformasi BUMN</option>
                    <option value="Tata Kelola & Manajemen Risiko (GRC)">
                      Tata Kelola &amp; Manajemen Risiko (GRC)
                    </option>
                    <option value="Teknologi & Arsitektur Digital">
                      Teknologi &amp; Arsitektur Digital
                    </option>
                    <option value="Keuangan & Valuasi Korporat">
                      Keuangan &amp; Valuasi Korporat
                    </option>
                    <option value="ESG & Keberlanjutan">ESG &amp; Keberlanjutan</option>
                    <option value="Legal & Kepatuhan Regulasi">Legal &amp; Kepatuhan Regulasi</option>
                    <option value="Human Capital Advisory">Human Capital Advisory</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Jabatan / Title Penugasan Konsultansi
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Senior Principal Advisor Tata Kelola & Restrukturisasi"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Kredensial &amp; Posisi Strategis
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Mantan Staf Khusus Kementerian, Fellow Institute, Doktor FEB UI"
                    value={formData.credentials || ''}
                    onChange={(e) => setFormData({ ...formData, credentials: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Daily Billing Rate (POS 01 - Rp) *
                  </label>
                  <input
                    type="number"
                    step="1000000"
                    required
                    placeholder="20000000"
                    value={formData.dailyBillingRate || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, dailyBillingRate: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Retainer Bulanan (Rp)
                  </label>
                  <input
                    type="number"
                    step="1000000"
                    placeholder="60000000"
                    value={formData.monthlyRetainerRate || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, monthlyRetainerRate: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Status Ketersediaan *
                  </label>
                  <select
                    value={formData.status || 'Tersedia'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="Tersedia">Tersedia (Ready for Advisory)</option>
                    <option value="Aktif di Proyek">Aktif di Proyek</option>
                    <option value="Standby Advisory">Standby Dewan Pakar</option>
                    <option value="Non-Aktif">Non-Aktif</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Pengalaman Konsultansi (Tahun)
                  </label>
                  <input
                    type="number"
                    placeholder="18"
                    value={formData.totalConsultingYears || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, totalConsultingYears: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Nomor Telepon / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+62 811-XXXX-XXXX"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email Resmi</label>
                  <input
                    type="email"
                    placeholder="expert@domain.com"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Kota Domisili</label>
                  <input
                    type="text"
                    placeholder="Jakarta / Bandung / Surabaya"
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Jumlah Publikasi / Buku
                  </label>
                  <input
                    type="number"
                    placeholder="10"
                    value={formData.publicationsCount || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, publicationsCount: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Rekam Jejak Klien BUMN / Korporat (Pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Kementerian BUMN, PT Pertamina (Persero), Bank Mandiri"
                    value={formData.pastClients?.join(', ') || ''}
                    onChange={(e) => {
                      const clients = e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean);
                      setFormData({ ...formData, pastClients: clients });
                    }}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Rekening Bank &amp; NPWP
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Bank & No Rekening (misal: Mandiri 127-00-xxxx)"
                      value={formData.bankAccount || ''}
                      onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                    />
                    <input
                      type="text"
                      placeholder="NPWP Pribadi (Tarif PPh 21 Tenaga Ahli)"
                      value={formData.npwp || ''}
                      onChange={(e) => setFormData({ ...formData, npwp: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Ringkasan Biodata &amp; Rekam Jejak Konsultansi
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Uraikan pengalaman memimpin kajian kelayakan, restrukturisasi, kebijakan BUMN, atau advisory strategis..."
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                >
                  {editingExpert ? 'Simpan Perubahan' : 'Tambahkan ke Direktori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {expertToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Hapus Data Tenaga Ahli?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Apakah Anda yakin ingin menghapus <strong>{expertToDelete.name}</strong> dari direktori? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setExpertToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDeleteExpert(expertToDelete)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
