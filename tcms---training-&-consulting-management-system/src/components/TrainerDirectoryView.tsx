import React, { useState, useEffect } from 'react';
import { TrainerFacilitator } from '../types';
import { TRAINER_FACILITATORS } from '../data/initialData';
import {
  GraduationCap,
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
  ShieldCheck,
  Building,
  UserCheck,
  Users,
  Calendar,
  Sparkles,
  X,
  CreditCard,
  Briefcase,
  Layers,
  SlidersHorizontal,
  LayoutGrid,
  List,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface TrainerDirectoryViewProps {
  isSimulationMode?: boolean;
  onNavigateToSyllabus?: () => void;
  onNavigateToSchedule?: () => void;
  onNavigateToEstimator?: () => void;
}

export const TrainerDirectoryView: React.FC<TrainerDirectoryViewProps> = ({
  isSimulationMode = false,
  onNavigateToSyllabus,
  onNavigateToSchedule,
  onNavigateToEstimator,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyBnsp, setOnlyBnsp] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Notification feedback
  const [notification, setNotification] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals state
  const [selectedTrainer, setSelectedTrainer] = useState<TrainerFacilitator | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<TrainerFacilitator | null>(null);
  const [trainerToDelete, setTrainerToDelete] = useState<TrainerFacilitator | null>(null);

  // Training Mode Data vs Operational Mode Data
  const [trainingTrainers, setTrainingTrainers] = useState<TrainerFacilitator[]>(() => {
    try {
      const stored = localStorage.getItem('tcms_training_trainers');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return TRAINER_FACILITATORS;
  });

  const [operationalTrainers, setOperationalTrainers] = useState<TrainerFacilitator[]>(() => {
    try {
      const stored = localStorage.getItem('tcms_operational_trainers');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return TRAINER_FACILITATORS.filter((t) => t.id === 'tf-01' || t.id === 'tf-02');
  });

  // Form State for Add / Edit
  const [formData, setFormData] = useState<Partial<TrainerFacilitator>>({
    name: '',
    title: '',
    category: 'Master Trainer',
    specialization: [],
    credentials: '',
    dailyRate: 12000000,
    sessionRate: 6500000,
    phone: '',
    email: '',
    city: 'Jakarta',
    status: 'Tersedia',
    certifiedBnsp: true,
    totalHours: 500,
    rating: 4.9,
    bio: '',
    bankAccount: '',
    npwp: '',
  });

  const [specInput, setSpecInput] = useState('');

  const currentPool = isSimulationMode ? trainingTrainers : operationalTrainers;

  // Persist handlers
  const saveTrainersPool = (updated: TrainerFacilitator[]) => {
    if (isSimulationMode) {
      setTrainingTrainers(updated);
      localStorage.setItem('tcms_training_trainers', JSON.stringify(updated));
    } else {
      setOperationalTrainers(updated);
      localStorage.setItem('tcms_operational_trainers', JSON.stringify(updated));
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

  // Filtered trainers
  const filteredTrainers = currentPool.filter((t) => {
    const matchesCategory =
      activeCategory === 'Semua' || t.category === activeCategory;
    const matchesStatus =
      statusFilter === 'Semua' || t.status === statusFilter;
    const matchesBnsp = !onlyBnsp || t.certifiedBnsp;

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      t.name.toLowerCase().includes(q) ||
      t.title.toLowerCase().includes(q) ||
      t.city.toLowerCase().includes(q) ||
      t.credentials.toLowerCase().includes(q) ||
      t.specialization.some((s) => s.toLowerCase().includes(q));

    return matchesCategory && matchesStatus && matchesBnsp && matchesSearch;
  });

  // Summary Metrics
  const totalCount = currentPool.length;
  const bnspCount = currentPool.filter((t) => t.certifiedBnsp).length;
  const readyCount = currentPool.filter((t) => t.status === 'Tersedia').length;
  const avgRating =
    totalCount > 0
      ? (currentPool.reduce((acc, curr) => acc + curr.rating, 0) / totalCount).toFixed(2)
      : '5.0';

  const categories = [
    'Semua',
    'Master Trainer',
    'Fasilitator Teknis',
    'Co-Trainer',
    'Asesor BNSP',
    'Konsultan Ahli',
  ];

  // Actions
  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      title: '',
      category: 'Master Trainer',
      specialization: ['Leadership', 'Strategic Management'],
      credentials: 'Sertifikasi BNSP / Master Trainer Bersertifikat',
      dailyRate: 15000000,
      sessionRate: 8000000,
      phone: '+62 812-0000-0000',
      email: 'trainer@tcms-staroffice.id',
      city: 'Jakarta',
      status: 'Tersedia',
      certifiedBnsp: true,
      totalHours: 800,
      rating: 4.9,
      bio: '',
      bankAccount: 'Bank Mandiri (Atas Nama Pribadi)',
      npwp: '00.000.000.0-000.000',
    });
    setSpecInput('');
    setEditingTrainer(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (t: TrainerFacilitator) => {
    setEditingTrainer(t);
    setFormData({ ...t });
    setSpecInput('');
    setIsAddModalOpen(true);
  };

  const handleSaveTrainer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    if (editingTrainer) {
      const updatedList = currentPool.map((t) =>
        t.id === editingTrainer.id
          ? ({
              ...t,
              ...formData,
              specialization:
                formData.specialization && formData.specialization.length > 0
                  ? formData.specialization
                  : ['Umum'],
            } as TrainerFacilitator)
          : t
      );
      saveTrainersPool(updatedList);
      showNotification(`Data fasilitator "${formData.name}" berhasil diperbarui.`);
    } else {
      const newTrainer: TrainerFacilitator = {
        id: `tf-${Date.now().toString().slice(-6)}`,
        id_organization: 'org-star-01',
        name: formData.name || 'Trainer Baru',
        title: formData.title || 'Fasilitator & Trainer Profesional',
        category: (formData.category as any) || 'Master Trainer',
        specialization:
          formData.specialization && formData.specialization.length > 0
            ? formData.specialization
            : ['Kompetensi Terapan'],
        credentials:
          formData.credentials || 'Certified Professional Trainer (BNSP/Internasional)',
        dailyRate: Number(formData.dailyRate) || 12000000,
        sessionRate: Number(formData.sessionRate) || 6000000,
        phone: formData.phone || '+62 812-0000-0000',
        email: formData.email || 'trainer@tcms-staroffice.id',
        city: formData.city || 'Jakarta',
        status: (formData.status as any) || 'Tersedia',
        certifiedBnsp: formData.certifiedBnsp ?? true,
        totalHours: Number(formData.totalHours) || 500,
        rating: Number(formData.rating) || 4.9,
        bio:
          formData.bio ||
          'Fasilitator berpengalaman dalam eksekusi program pengembangan kompetensi korporat dan BUMN.',
        relevantSyllabusTitles: ['Leadership & People Management', 'Strategic Decision Making'],
        bankAccount: formData.bankAccount || '',
        npwp: formData.npwp || '',
      };

      saveTrainersPool([newTrainer, ...currentPool]);
      showNotification(`Fasilitator "${newTrainer.name}" berhasil didaftarkan ke direktori.`);
    }

    setIsAddModalOpen(false);
    setEditingTrainer(null);
  };

  const handleDeleteTrainer = (t: TrainerFacilitator) => {
    const updated = currentPool.filter((item) => item.id !== t.id);
    saveTrainersPool(updated);
    setTrainerToDelete(null);
    if (selectedTrainer?.id === t.id) setSelectedTrainer(null);
    showNotification(`Fasilitator "${t.name}" telah dihapus dari direktori.`);
  };

  const handleCopyProfile = (t: TrainerFacilitator) => {
    const info = `[PROFIL FASILITATOR TCMS]\nNama: ${t.name}\nJabatan: ${t.title}\nKategori: ${t.category}\nSertifikasi: ${t.credentials}\nRate Card: ${formatCurrency(t.dailyRate)}/hari\nKontak: ${t.phone} | ${t.email}\nDomisili: ${t.city}`;
    navigator.clipboard.writeText(info);
    setCopiedId(t.id);
    setTimeout(() => setCopiedId(null), 2000);
    showNotification(`Biodata & rate card ${t.name} disalin ke clipboard.`);
  };

  const getStatusBadge = (status: TrainerFacilitator['status']) => {
    switch (status) {
      case 'Tersedia':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          label: 'Siap Ditugaskan',
        };
      case 'Sedang Bertugas':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
          label: 'Sedang Mengajar',
        };
      case 'Standby':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          label: 'Standby Jadwal',
        };
      case 'Cuti':
        return {
          bg: 'bg-slate-100 text-slate-600 border-slate-200',
          dot: 'bg-slate-400',
          label: 'Tidak Tersedia / Cuti',
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          label: status,
        };
    }
  };

  const getCategoryBadge = (category: TrainerFacilitator['category']) => {
    switch (category) {
      case 'Master Trainer':
        return 'bg-teal-50 text-teal-800 border-teal-200 font-bold';
      case 'Konsultan Ahli':
        return 'bg-purple-50 text-purple-800 border-purple-200 font-bold';
      case 'Asesor BNSP':
        return 'bg-amber-50 text-amber-800 border-amber-200 font-bold';
      case 'Fasilitator Teknis':
        return 'bg-sky-50 text-sky-800 border-sky-200 font-medium';
      case 'Co-Trainer':
        return 'bg-slate-100 text-slate-700 border-slate-200 font-medium';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-semibold animate-fade-in border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Mode Status Indicator Banner */}
      <div
        className={`px-4 py-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
          isSimulationMode
            ? 'bg-amber-50/80 border-amber-200 text-amber-900'
            : 'bg-teal-50/80 border-teal-200 text-teal-900'
        }`}
      >
        <div className="flex items-center space-x-2">
          <GraduationCap
            className={`w-4 h-4 ${isSimulationMode ? 'text-amber-700' : 'text-teal-700'}`}
          />
          <span className="font-semibold">
            {isSimulationMode
              ? 'Mode Simulasi / Pelatihan Aktif: Menampilkan Master Data Trainer Studi Kasus TCMS.'
              : 'Mode Operasional Riil: Menampilkan Tim Fasilitator & Tenaga Ahli Terverifikasi Perusahaan.'}
          </span>
        </div>
        <div className="text-[11px] text-slate-600">
          Data Rate Card terintegrasi otomatis dengan{' '}
          <strong className="text-slate-900">POS 00 / 01 Estimator HPP</strong> &amp;{' '}
          <strong className="text-slate-900">Jadwal Run-Sheet</strong>.
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-xl text-teal-700">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Direktori Fasilitator &amp; Master Trainer
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Pangkalan data tenaga ahli, instruktur bersertifikasi BNSP/Internasional, rate card honorarium, dan rekam jejak mengajar.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
          {onNavigateToSyllabus && (
            <button
              onClick={onNavigateToSyllabus}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Katalog Silabus</span>
            </button>
          )}

          {onNavigateToSchedule && (
            <button
              onClick={onNavigateToSchedule}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Run-Sheet Jadwal</span>
            </button>
          )}

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Fasilitator</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold">Total Fasilitator</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl font-black text-slate-900">{totalCount} Ahli</div>
          <div className="text-[10px] text-slate-500 mt-1">Terdaftar resmi di TCMS</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold">Sertifikasi BNSP</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black text-slate-900">{bnspCount} Instruktur</div>
          <div className="text-[10px] text-amber-700 font-medium mt-1">Terakreditasi BNSP / Internasional</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold">Siap Ditugaskan</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-700">{readyCount} Tersedia</div>
          <div className="text-[10px] text-slate-500 mt-1">Siap untuk batch jadwal baru</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold">Kepuasan Klien</span>
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
          </div>
          <div className="text-xl font-black text-slate-900">{avgRating} / 5.0</div>
          <div className="text-[10px] text-slate-500 mt-1">Rata-rata evaluasi kelas peserta</div>
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
              placeholder="Cari nama fasilitator, topik keahlian, sertifikasi, atau kota domisili..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition"
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
            {/* Status Select */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="Semua">Semua Status</option>
              <option value="Tersedia">Tersedia (Ready)</option>
              <option value="Sedang Bertugas">Sedang Mengajar</option>
              <option value="Standby">Standby</option>
              <option value="Cuti">Cuti</option>
            </select>

            {/* BNSP Only Checkbox */}
            <label className="flex items-center space-x-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyBnsp}
                onChange={(e) => setOnlyBnsp(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
              />
              <span>Hanya BNSP</span>
            </label>

            {/* View Mode Switcher */}
            <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-teal-900 shadow-xs'
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
                    ? 'bg-white text-teal-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilan Tabel Rekapitulasi"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-semibold text-[11px] pr-1">Kategori:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeCategory === cat
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Trainer List Display */}
      {filteredTrainers.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            Tidak ada fasilitator yang cocok dengan kriteria filter
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Coba ubah kata kunci pencarian, reset filter kategori, atau tambahkan data fasilitator baru ke direktori.
          </p>
          <button
            onClick={() => {
              setActiveCategory('Semua');
              setStatusFilter('Semua');
              setSearchQuery('');
              setOnlyBnsp(false);
            }}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTrainers.map((t) => {
            const statusInfo = getStatusBadge(t.status);
            return (
              <div
                key={t.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-teal-300 hover:shadow-md transition flex flex-col justify-between overflow-hidden"
              >
                {/* Card Top Header */}
                <div className="p-5 space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                        {t.name
                          .split(' ')
                          .filter((w) => !w.includes('.'))
                          .slice(0, 2)
                          .map((w) => w[0])
                          .join('') || 'TR'}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1">
                          {t.name}
                        </h3>
                        <p className="text-[11px] text-teal-800 font-semibold line-clamp-1">
                          {t.title}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Badges: Category & Status */}
                  <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] border ${getCategoryBadge(
                        t.category
                      )}`}
                    >
                      {t.category}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border flex items-center space-x-1 ${statusInfo.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                      <span>{statusInfo.label}</span>
                    </span>

                    {t.certifiedBnsp && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center space-x-1">
                        <Award className="w-3 h-3 text-amber-600" />
                        <span>BNSP</span>
                      </span>
                    )}
                  </div>

                  {/* Credentials / Bio quote */}
                  <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                    {t.credentials}
                  </p>

                  {/* Specialization Tags */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Fokus Keahlian:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {t.specialization.map((spec, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Rate Card & Key Stats Box */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-500">Rate Card Harian (POS 00):</span>
                      <span className="font-extrabold text-teal-950">
                        {formatCurrency(t.dailyRate)} <span className="text-[10px] font-normal text-slate-500">/ hari</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60 text-slate-600">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{t.totalHours} Jam Terbang</span>
                      </span>
                      <span className="flex items-center space-x-1 font-bold text-amber-700">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                        <span>{t.rating.toFixed(2)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Contact info snippet */}
                  <div className="text-[11px] text-slate-500 space-y-0.5">
                    <div className="flex items-center space-x-1.5 truncate">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{t.city}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 truncate">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate font-mono text-[10.5px]">{t.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedTrainer(t)}
                    className="text-xs font-bold text-teal-800 hover:text-teal-950 flex items-center space-x-1 transition cursor-pointer"
                  >
                    <span>Profil Lengkap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleCopyProfile(t)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 rounded-lg transition cursor-pointer"
                      title="Salin Biodata & Kontak"
                    >
                      {copiedId === t.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(t)}
                      className="p-1.5 text-slate-500 hover:text-teal-800 hover:bg-slate-200/70 rounded-lg transition cursor-pointer"
                      title="Edit Fasilitator"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setTrainerToDelete(t)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Hapus Fasilitator"
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
                  <th className="p-3.5 pl-4">Fasilitator / Tenaga Ahli</th>
                  <th className="p-3.5">Kategori</th>
                  <th className="p-3.5">Rate Card Harian</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Sertifikasi</th>
                  <th className="p-3.5">Jam Terbang</th>
                  <th className="p-3.5">Kontak</th>
                  <th className="p-3.5 pr-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredTrainers.map((t) => {
                  const statusInfo = getStatusBadge(t.status);
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 pl-4 align-top">
                        <div className="font-bold text-slate-900">{t.name}</div>
                        <div className="text-[11px] text-teal-800 font-semibold">{t.title}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{t.city}</div>
                      </td>

                      <td className="p-3.5 align-top">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] border ${getCategoryBadge(
                            t.category
                          )}`}
                        >
                          {t.category}
                        </span>
                      </td>

                      <td className="p-3.5 align-top">
                        <div className="font-extrabold text-teal-950">
                          {formatCurrency(t.dailyRate)}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Sesi: {t.sessionRate ? formatCurrency(t.sessionRate) : '-'}
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
                        {t.certifiedBnsp ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center space-x-1">
                            <Award className="w-3 h-3 text-amber-600" />
                            <span>BNSP Terlisensi</span>
                          </span>
                        ) : (
                          <span className="text-[10.5px] text-slate-400">Non-BNSP</span>
                        )}
                      </td>

                      <td className="p-3.5 align-top">
                        <div className="font-bold text-slate-800">{t.totalHours} Jam</div>
                        <div className="text-[10px] text-amber-700 font-semibold flex items-center space-x-0.5">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                          <span>{t.rating.toFixed(2)}</span>
                        </div>
                      </td>

                      <td className="p-3.5 align-top text-slate-600 text-[11px]">
                        <div>{t.phone}</div>
                        <div className="text-slate-400 text-[10px]">{t.email}</div>
                      </td>

                      <td className="p-3.5 pr-4 align-top text-right space-x-1">
                        <button
                          onClick={() => setSelectedTrainer(t)}
                          className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded font-semibold text-[11px] cursor-pointer"
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(t)}
                          className="p-1 text-slate-500 hover:text-teal-800 rounded cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setTrainerToDelete(t)}
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
      {selectedTrainer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex items-start justify-between">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                  {selectedTrainer.name
                    .split(' ')
                    .filter((w) => !w.includes('.'))
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join('') || 'TR'}
                </div>
                <div>
                  <h2 className="text-base font-bold">{selectedTrainer.name}</h2>
                  <p className="text-xs text-teal-300">{selectedTrainer.title}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-950 text-teal-200 border border-teal-800">
                      {selectedTrainer.category}
                    </span>
                    {selectedTrainer.certifiedBnsp && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center space-x-1">
                        <Award className="w-3 h-3 text-amber-400" />
                        <span>Sertifikasi BNSP</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedTrainer(null)}
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
                  Kredensial &amp; Profil Profesional
                </h4>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed text-slate-800">
                  <p className="font-semibold text-teal-900 mb-1">{selectedTrainer.credentials}</p>
                  <p className="text-slate-600 leading-relaxed">{selectedTrainer.bio}</p>
                </div>
              </div>

              {/* Specialization */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                  Materi &amp; Bidang Spesialisasi Utama
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTrainer.specialization.map((sp, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-teal-50 border border-teal-200 text-teal-900 rounded-lg text-xs font-semibold"
                    >
                      {sp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Rate Card & Financial Pos */}
              <div className="grid grid-cols-2 gap-3 bg-teal-50/50 p-4 rounded-xl border border-teal-200">
                <div>
                  <span className="text-[11px] text-teal-800 font-semibold block">
                    Rate Card Honorarium (POS 00 Harian):
                  </span>
                  <div className="text-lg font-black text-teal-950 mt-0.5">
                    {formatCurrency(selectedTrainer.dailyRate)}
                  </div>
                  <span className="text-[10px] text-slate-500">Standar 8 Jam Pelatihan / Hari</span>
                </div>

                <div>
                  <span className="text-[11px] text-teal-800 font-semibold block">
                    Rate Per Sesi (Half-Day):
                  </span>
                  <div className="text-lg font-black text-teal-950 mt-0.5">
                    {selectedTrainer.sessionRate
                      ? formatCurrency(selectedTrainer.sessionRate)
                      : formatCurrency(selectedTrainer.dailyRate / 2)}
                  </div>
                  <span className="text-[10px] text-slate-500">Sesi 3-4 Jam Workshop</span>
                </div>
              </div>

              {/* Banking & NPWP */}
              {(selectedTrainer.bankAccount || selectedTrainer.npwp) && (
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-[11px]">
                  <div>
                    <span className="text-slate-500 font-medium block">Rekening Pembayaran:</span>
                    <span className="font-semibold text-slate-900">
                      {selectedTrainer.bankAccount || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block">NPWP (Tarif PPh 21 Tenaga Ahli):</span>
                    <span className="font-semibold text-slate-900 font-mono">
                      {selectedTrainer.npwp || '-'}
                    </span>
                  </div>
                </div>
              )}

              {/* Contact & Flight Hours */}
              <div className="grid grid-cols-3 gap-3 text-center border-t border-slate-200 pt-3">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 text-[10px] block">Jam Terbang Mengajar</span>
                  <strong className="text-slate-900 text-sm">{selectedTrainer.totalHours} Jam</strong>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 text-[10px] block">Kepuasan Peserta</span>
                  <strong className="text-amber-600 text-sm flex items-center justify-center space-x-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>{selectedTrainer.rating.toFixed(2)} / 5.0</span>
                  </strong>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 text-[10px] block">Domisili Resmi</span>
                  <strong className="text-slate-900 text-sm">{selectedTrainer.city}</strong>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                onClick={() => handleCopyProfile(selectedTrainer)}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Ringkasan Profil</span>
              </button>

              <div className="flex items-center space-x-2">
                {onNavigateToSchedule && (
                  <button
                    onClick={() => {
                      setSelectedTrainer(null);
                      onNavigateToSchedule();
                    }}
                    className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Tugaskan ke Run-Sheet</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedTrainer(null)}
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
            <div className="bg-teal-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <GraduationCap className="w-5 h-5 text-teal-300" />
                <h3 className="font-bold text-sm">
                  {editingTrainer ? 'Perbarui Data Fasilitator' : 'Tambah Fasilitator / Trainer Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-teal-200 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTrainer} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Nama Lengkap &amp; Gelar Akademik / Profesi *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Dr. Rahmat Hidayat, M.M., CPOD"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Kategori Tenaga Ahli *
                  </label>
                  <select
                    value={formData.category || 'Master Trainer'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    <option value="Master Trainer">Master Trainer</option>
                    <option value="Fasilitator Teknis">Fasilitator Teknis</option>
                    <option value="Co-Trainer">Co-Trainer</option>
                    <option value="Asesor BNSP">Asesor BNSP</option>
                    <option value="Konsultan Ahli">Konsultan Ahli</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Status Ketersediaan *
                  </label>
                  <select
                    value={formData.status || 'Tersedia'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    <option value="Tersedia">Tersedia (Ready for Assignment)</option>
                    <option value="Sedang Bertugas">Sedang Mengajar / Bertugas</option>
                    <option value="Standby">Standby</option>
                    <option value="Cuti">Cuti / Non-Aktif</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Jabatan / Title Profesional
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Lead Master Trainer & Culture Transformation Specialist"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Kredensial &amp; Sertifikasi Utama
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Certified Master Trainer BNSP, ATD International, 20+ Tahun BUMN"
                    value={formData.credentials || ''}
                    onChange={(e) => setFormData({ ...formData, credentials: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Rate Card Harian (POS 00 - Rp) *
                  </label>
                  <input
                    type="number"
                    step="500000"
                    required
                    placeholder="15000000"
                    value={formData.dailyRate || ''}
                    onChange={(e) => setFormData({ ...formData, dailyRate: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Rate Card Per Sesi (Rp)
                  </label>
                  <input
                    type="number"
                    step="250000"
                    placeholder="8000000"
                    value={formData.sessionRate || ''}
                    onChange={(e) => setFormData({ ...formData, sessionRate: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
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
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email Resmi</label>
                  <input
                    type="email"
                    placeholder="trainer@domain.com"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Kota Domisili</label>
                  <input
                    type="text"
                    placeholder="Jakarta / Bandung / Surabaya"
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Lisensi Resmi BNSP
                  </label>
                  <div className="flex items-center space-x-3 pt-2">
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="certifiedBnsp"
                        checked={formData.certifiedBnsp === true}
                        onChange={() => setFormData({ ...formData, certifiedBnsp: true })}
                        className="text-teal-600"
                      />
                      <span>Ya, Terlisensi BNSP</span>
                    </label>
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="certifiedBnsp"
                        checked={formData.certifiedBnsp === false}
                        onChange={() => setFormData({ ...formData, certifiedBnsp: false })}
                        className="text-teal-600"
                      />
                      <span>Non-BNSP</span>
                    </label>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Spesialisasi Topik (Pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Strategic Leadership, BUMN Governance, Executive Coaching"
                    value={formData.specialization?.join(', ') || ''}
                    onChange={(e) => {
                      const tags = e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean);
                      setFormData({ ...formData, specialization: tags });
                    }}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Rekening Bank Penerima Honor &amp; NPWP
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
                      placeholder="NPWP Pribadi (untuk PPh 21)"
                      value={formData.npwp || ''}
                      onChange={(e) => setFormData({ ...formData, npwp: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Ringkasan Biodata &amp; Rekam Jejak
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Uraikan pengalaman memfasilitasi kelas BUMN, corporate governance, atau pelatihan strategis..."
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
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
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                >
                  {editingTrainer ? 'Simpan Perubahan' : 'Tambahkan ke Direktori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {trainerToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Hapus Data Fasilitator?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Apakah Anda yakin ingin menghapus data <strong>{trainerToDelete.name}</strong> dari direktori? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setTrainerToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDeleteTrainer(trainerToDelete)}
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
