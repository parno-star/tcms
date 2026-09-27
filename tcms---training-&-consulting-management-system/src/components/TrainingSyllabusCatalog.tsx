import React, { useState, useEffect, useRef } from 'react';
import { TrainingSyllabus } from '../types';
import { TRAINING_SYLLABUSES } from '../data/initialData';
import {
  BookOpen,
  Clock,
  Users,
  DollarSign,
  CheckCircle2,
  ChevronRight,
  Search,
  Sparkles,
  Filter,
  FileSignature,
  Plus,
  Edit3,
  Trash2,
  Copy,
  Download,
  Upload,
  RotateCcw,
  X,
  LayoutGrid,
  List,
  Wand2,
  Tag,
  Check,
  ArrowUp,
  ArrowDown,
  Info,
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'tcms_training_syllabuses_v2';
const CATEGORIES_STORAGE_KEY = 'tcms_training_custom_categories_v1';

interface TrainingSyllabusCatalogProps {
  onApplySyllabusToProject?: (syllabus: TrainingSyllabus) => void;
  onNavigateToEstimator?: () => void;
  onCreateProposalFromSyllabus?: (syllabus: TrainingSyllabus) => void;
}

export const TrainingSyllabusCatalog: React.FC<TrainingSyllabusCatalogProps> = ({
  onApplySyllabusToProject,
  onNavigateToEstimator,
  onCreateProposalFromSyllabus,
}) => {
  // Syllabuses Data State with LocalStorage Persistence
  const [syllabuses, setSyllabuses] = useState<TrainingSyllabus[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Gagal memuat data silabus tersimpan:', e);
    }
    return TRAINING_SYLLABUSES;
  });

  // Save to LocalStorage on state change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(syllabuses));
    } catch (e) {
      console.error('Gagal menyimpan data silabus ke localStorage:', e);
    }
  }, [syllabuses]);

  // Main Sub-View State: 'catalog' | 'editor'
  const [activeSubView, setActiveSubView] = useState<'catalog' | 'editor'>('catalog');

  // Filtering & Selection
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSyllabus, setSelectedSyllabus] = useState<TrainingSyllabus>(
    syllabuses[0] || TRAINING_SYLLABUSES[0]
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Synchronize selectedSyllabus if list changes or selected item is deleted
  useEffect(() => {
    if (syllabuses.length > 0) {
      const exists = syllabuses.find((s) => s.id === selectedSyllabus?.id);
      if (!exists) {
        setSelectedSyllabus(syllabuses[0]);
      } else {
        setSelectedSyllabus(exists);
      }
    }
  }, [syllabuses]);

  // Custom Categories State with LocalStorage Persistence
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Gagal memuat kategori kustom:', e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(customCategories));
    } catch (e) {
      console.error('Gagal menyimpan kategori kustom:', e);
    }
  }, [customCategories]);

  // Inline Add Category Form State
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Categories extraction
  const defaultCategories = [
    'Semua',
    'Leadership & Manajerial',
    'Digital & IT Transformation',
    'Finance & Risk Management',
    'Operations & ESG',
  ];

  const categories = [
    ...defaultCategories,
    ...Array.from(
      new Set([
        ...customCategories,
        ...syllabuses
          .map((s) => s.category)
          .filter((c) => !defaultCategories.includes(c)),
      ])
    ),
  ];

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      showToast(`Kategori "${trimmed}" sudah ada!`);
      setSelectedCategory(categories.find((c) => c.toLowerCase() === trimmed.toLowerCase()) || trimmed);
      setIsAddingCategory(false);
      setNewCategoryName('');
      return;
    }
    const updated = [...customCategories, trimmed];
    setCustomCategories(updated);
    setSelectedCategory(trimmed);
    setIsAddingCategory(false);
    setNewCategoryName('');
    showToast(`Kategori baru "${trimmed}" berhasil ditambahkan!`);
  };

  // Filtered Syllabuses
  const filtered = syllabuses.filter((item) => {
    const matchCat = selectedCategory === 'Semua' || item.category === selectedCategory;
    const matchSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.modules.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  // ==========================================
  // EDITOR FORM MODAL & ACTIONS STATE
  // ==========================================
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSyllabus, setEditingSyllabus] = useState<TrainingSyllabus | null>(null);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');

  // Form Fields State
  const [formCode, setFormCode] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<string>('Leadership & Manajerial');
  const [customCategory, setCustomCategory] = useState('');
  const [formDurationDays, setFormDurationDays] = useState<number>(3);
  const [formRecommendedPax, setFormRecommendedPax] = useState<number>(30);
  const [formTrainerDailyRate, setFormTrainerDailyRate] = useState<number>(15000000);
  const [formDescription, setFormDescription] = useState('');
  const [formModules, setFormModules] = useState<string[]>(['']);
  const [formLearningOutcomes, setFormLearningOutcomes] = useState<string[]>(['']);

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Open Form for Create
  const handleOpenCreateModal = () => {
    setEditingSyllabus(null);
    setEditorMode('create');
    const nextNum = syllabuses.length + 1;
    const codePrefix =
      selectedCategory === 'Leadership & Manajerial'
        ? 'TCMS-LDR'
        : selectedCategory === 'Digital & IT Transformation'
        ? 'TCMS-DIG'
        : selectedCategory === 'Finance & Risk Management'
        ? 'TCMS-RSK'
        : selectedCategory === 'Operations & ESG'
        ? 'TCMS-OPS'
        : 'TCMS-MOD';
    setFormCode(`${codePrefix}-0${nextNum}`);
    setFormTitle('');
    setFormCategory('Leadership & Manajerial');
    setCustomCategory('');
    setFormDurationDays(3);
    setFormRecommendedPax(30);
    setFormTrainerDailyRate(12500000);
    setFormDescription('');
    setFormModules([
      'Modul 1: Konsep dasar dan pemahaman prinsip utama',
      'Modul 2: Implementasi metodologi dan studi kasus praktis',
      'Modul 3: Otomasi, mitigasi risiko, dan evaluasi hasil',
    ]);
    setFormLearningOutcomes([
      'Penguasaan materi pelatihan secara komprehensif',
      'Penyusunan Rencana Aksi (Action Plan) implementasi di tempat kerja',
    ]);
    setIsFormModalOpen(true);
  };

  // Open Form for Edit
  const handleOpenEditModal = (item: TrainingSyllabus) => {
    setEditingSyllabus(item);
    setEditorMode('edit');
    setFormCode(item.code);
    setFormTitle(item.title);
    if (
      [
        'Leadership & Manajerial',
        'Digital & IT Transformation',
        'Finance & Risk Management',
        'Operations & ESG',
      ].includes(item.category)
    ) {
      setFormCategory(item.category);
      setCustomCategory('');
    } else {
      setFormCategory('LAINNYA');
      setCustomCategory(item.category);
    }
    setFormDurationDays(item.durationDays);
    setFormRecommendedPax(item.recommendedPax);
    setFormTrainerDailyRate(item.trainerDailyRate);
    setFormDescription(item.description);
    setFormModules(item.modules.length > 0 ? [...item.modules] : ['']);
    setFormLearningOutcomes(item.learningOutcomes.length > 0 ? [...item.learningOutcomes] : ['']);
    setIsFormModalOpen(true);
  };

  // Duplicate Syllabus
  const handleDuplicateSyllabus = (item: TrainingSyllabus) => {
    const duplicated: TrainingSyllabus = {
      ...item,
      id: `syl-dup-${Date.now()}`,
      code: `${item.code}-COPY`,
      title: `${item.title} (Salinan)`,
    };
    const updated = [duplicated, ...syllabuses];
    setSyllabuses(updated);
    setSelectedSyllabus(duplicated);
    showToast(`Silabus "${item.title}" berhasil diduplikasi.`);
  };

  // Delete Syllabus
  const handleDeleteSyllabus = (id: string, title: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus silabus "${title}"?`)) {
      const updated = syllabuses.filter((s) => s.id !== id);
      setSyllabuses(updated);
      showToast(`Silabus "${title}" berhasil dihapus.`);
    }
  };

  // Save Syllabus Form
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Judul silabus wajib diisi!');
      return;
    }

    const finalCategory =
      formCategory === 'LAINNYA'
        ? customCategory.trim() || 'Umum & Lainnya'
        : formCategory;

    const cleanModules = formModules.map((m) => m.trim()).filter(Boolean);
    const cleanOutcomes = formLearningOutcomes.map((o) => o.trim()).filter(Boolean);

    if (editorMode === 'create') {
      const newSyllabus: TrainingSyllabus = {
        id: `syl-${Date.now()}`,
        code: formCode.trim() || `TCMS-${Date.now().toString().slice(-4)}`,
        title: formTitle.trim(),
        category: finalCategory as any,
        durationDays: Number(formDurationDays) || 1,
        recommendedPax: Number(formRecommendedPax) || 20,
        trainerDailyRate: Number(formTrainerDailyRate) || 10000000,
        description: formDescription.trim() || 'Deskripsi program pelatihan terstandar TCMS.',
        modules: cleanModules.length > 0 ? cleanModules : ['Modul 1: Pengenalan Umum'],
        learningOutcomes: cleanOutcomes.length > 0 ? cleanOutcomes : ['Sertifikat Penyelesaian Pelatihan'],
      };

      const updated = [newSyllabus, ...syllabuses];
      setSyllabuses(updated);
      setSelectedSyllabus(newSyllabus);
      showToast(`Silabus baru "${newSyllabus.title}" berhasil ditambahkan!`);
    } else if (editingSyllabus) {
      const updatedSyllabus: TrainingSyllabus = {
        ...editingSyllabus,
        code: formCode.trim() || editingSyllabus.code,
        title: formTitle.trim(),
        category: finalCategory as any,
        durationDays: Number(formDurationDays) || 1,
        recommendedPax: Number(formRecommendedPax) || 20,
        trainerDailyRate: Number(formTrainerDailyRate) || 10000000,
        description: formDescription.trim(),
        modules: cleanModules.length > 0 ? cleanModules : editingSyllabus.modules,
        learningOutcomes: cleanOutcomes.length > 0 ? cleanOutcomes : editingSyllabus.learningOutcomes,
      };

      const updated = syllabuses.map((s) => (s.id === editingSyllabus.id ? updatedSyllabus : s));
      setSyllabuses(updated);
      setSelectedSyllabus(updatedSyllabus);
      showToast(`Silabus "${updatedSyllabus.title}" berhasil diperbarui!`);
    }

    setIsFormModalOpen(false);
  };

  // AI Assistant Generator
  const handleAiAutoGenerate = () => {
    if (!formTitle.trim()) {
      alert('Tuliskan kata kunci atau nama topik pada Judul Silabus terlebih dahulu.');
      return;
    }

    const topic = formTitle.trim();
    const codeGen = `TCMS-${topic.slice(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;
    setFormCode(codeGen);
    setFormDescription(
      `Program pelatihan intensif terstruktur mengenai ${topic} yang dirancang khusus untuk meningkatkan kapabilitas tim operasional & manajerial korporasi secara terukur.`
    );
    setFormModules([
      `Modul 1: Pengantar Strategis & Kerangka Kerja ${topic}`,
      `Modul 2: Analisis Kasus Industri & Metodologi Best Practice`,
      `Modul 3: Alat Bantu, Otomasi & Simulasi Terapan ${topic}`,
      `Modul 4: Evaluasi Efektivitas, Rencana Tindak Lanjut & Governance`,
    ]);
    setFormLearningOutcomes([
      `Pemahaman mendalam mengenai kerangka kerja dan implementasi ${topic}`,
      `Kemampuan menyusun dokumen rekomendasi dan matriks mitigasi risiko`,
      `Sertifikasi kompetensi resmi dan portofolio studi kasus`,
    ]);
    showToast(`✨ Modul & Deskripsi untuk "${topic}" berhasil digenerate otomatis oleh AI!`);
  };

  // Export JSON Catalog
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(syllabuses, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `katalog_silabus_tcms_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Katalog silabus berhasil diekspor ke file JSON.');
  };

  // Import JSON Catalog
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].title && parsed[0].trainerDailyRate) {
          setSyllabuses(parsed);
          setSelectedSyllabus(parsed[0]);
          showToast(`Berhasil mengimpor ${parsed.length} data silabus katalog!`);
        } else {
          alert('Format JSON file tidak valid untuk Katalog Silabus TCMS.');
        }
      } catch (err) {
        alert('Gagal membaca file JSON. Pastikan file dalam format JSON yang tepat.');
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  // Reset Default Initial Syllabuses
  const handleResetToDefault = () => {
    if (window.confirm('Apakah Anda yakin ingin mengembalikan seluruh katalog silabus ke data acuan standar bawaan?')) {
      setSyllabuses(TRAINING_SYLLABUSES);
      setSelectedSyllabus(TRAINING_SYLLABUSES[0]);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      showToast('Katalog silabus berhasil dikembalikan ke standar awal bawaan.');
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 border border-slate-700 animate-bounce">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Main Header & Sub-View Switcher Bar */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 rounded-2xl border border-teal-800/40 p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-2.5 rounded-xl bg-white/20 text-white backdrop-blur-xs shadow-xs border border-white/20">
              <BookOpen className="w-5 h-5" />
            </span>
            <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight drop-shadow-xs">
              Katalog Silabus Pelatihan &amp; Rate Card Trainer
            </h1>
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-white/20 text-emerald-100 border border-white/30 backdrop-blur-xs">
              {syllabuses.length} Modul Terdaftar
            </span>
          </div>
        </div>

        {/* Navigation & Mode Toggle Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="bg-teal-900/40 backdrop-blur-xs p-1 rounded-xl flex items-center text-xs font-semibold border border-white/20 shadow-inner">
            <button
              onClick={() => setActiveSubView('catalog')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeSubView === 'catalog'
                  ? 'bg-white text-teal-900 shadow-xs font-bold'
                  : 'text-teal-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>📖 Lihat Katalog</span>
            </button>

            <button
              onClick={() => setActiveSubView('editor')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeSubView === 'editor'
                  ? 'bg-white text-teal-900 shadow-xs font-bold'
                  : 'text-teal-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>✏️ Editor Silabus</span>
            </button>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer shrink-0 border border-emerald-300/60 active:scale-95"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>+ Tambah Silabus Baru</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* VIEW 1: KATALOG SILABUS (USER / KONSEPTOR LOOKUP VIEW) */}
      {/* ========================================================= */}
      {activeSubView === 'catalog' && (
        <div className="space-y-4">
          {/* Search & Category Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}

              {/* Inline Add Category Button / Form */}
              {isAddingCategory ? (
                <form
                  onSubmit={handleAddCategorySubmit}
                  className="flex items-center space-x-1 bg-emerald-50/80 p-0.5 rounded-lg border border-emerald-300 animate-fade-in"
                >
                  <input
                    type="text"
                    autoFocus
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nama kategori..."
                    className="px-2.5 py-1 text-xs bg-white border border-emerald-200 rounded-md text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 w-36 sm:w-44 font-medium"
                  />
                  <button
                    type="submit"
                    className="px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-xs font-bold transition cursor-pointer flex items-center space-x-0.5"
                    title="Simpan Kategori Baru"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Simpan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCategory(false);
                      setNewCategoryName('');
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition cursor-pointer"
                    title="Batal"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(true)}
                  className="px-2.5 py-1.5 rounded-lg font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-dashed border-teal-300 transition cursor-pointer flex items-center space-x-1"
                  title="Tambah Kategori Baru"
                >
                  <Plus className="w-3.5 h-3.5 text-teal-700" />
                  <span>Tambah Kategori</span>
                </button>
              )}
            </div>

            <div className="relative shrink-0 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul modul atau kode..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          {/* Two Column Layout: Syllabus List & Detail Pane */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Syllabus Cards */}
            <div className="lg:col-span-7 space-y-3">
              {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-2">
                  <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">Tidak ada silabus ditemukan</p>
                  <p className="text-xs text-slate-500">
                    Coba sesuaikan kata kunci pencarian atau buat silabus baru melalui tombol editor.
                  </p>
                  <button
                    onClick={handleOpenCreateModal}
                    className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1.5 bg-teal-700 text-white rounded-lg text-xs font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Buat Silabus Baru</span>
                  </button>
                </div>
              ) : (
                filtered.map((syllabus) => {
                  const isSelected = selectedSyllabus.id === syllabus.id;
                  return (
                    <div
                      key={syllabus.id}
                      onClick={() => setSelectedSyllabus(syllabus)}
                      className={`bg-white p-5 sm:p-6 rounded-3xl border transition-all duration-300 shadow-xs hover:shadow-sm cursor-pointer relative group ${
                        isSelected
                          ? 'border-teal-500/80 ring-3 ring-teal-500/5'
                          : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {syllabus.code}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-100">
                              {syllabus.category}
                            </span>
                          </div>
                          <h3
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSyllabus(syllabus);
                              setIsDetailModalOpen(true);
                            }}
                            className="text-xl font-extrabold text-slate-900 hover:text-teal-700 mt-2 tracking-tight leading-snug cursor-pointer hover:underline transition"
                            title="Klik judul untuk melihat detail dan pratinjau kurikulum"
                          >
                            {syllabus.title}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                            {syllabus.description}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-slate-400 block font-semibold">Tarif Trainer Acuan</span>
                          <span className="text-xs font-bold text-emerald-700 font-mono">
                            Rp {(syllabus.trainerDailyRate / 1000000).toFixed(1)} Jt <span className="text-[10px] font-normal text-slate-500">/ hari</span>
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{syllabus.durationDays} Hari</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span>Ideal {syllabus.recommendedPax} Pax</span>
                          </span>
                          <span className="flex items-center space-x-1 text-slate-500">
                            <span>{syllabus.modules.length} Modul Sub-Topik</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right Column: Selected Syllabus Detail & Action */}
            <div className="lg:col-span-5">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm sticky top-20 space-y-5 transition-all">
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">
                      DETAIL KURIKULUM &amp; RATE CARD
                    </span>
                    <h2 className="text-xl font-extrabold text-slate-900 mt-1 leading-snug">
                      {selectedSyllabus.title}
                    </h2>
                    <span className="text-xs text-slate-500 font-mono">
                      Kode: {selectedSyllabus.code}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenEditModal(selectedSyllabus)}
                    className="p-1.5 text-slate-600 hover:text-teal-800 bg-slate-50 hover:bg-teal-50/60 rounded-xl text-xs font-bold flex items-center space-x-1 border border-slate-200/60 transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>

                {/* Financial Reference Box */}
                <div className="p-4 bg-slate-50/40 rounded-2xl border border-slate-100/80 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Durasi Pelaksanaan:</span>
                    <span className="font-bold text-slate-900">{selectedSyllabus.durationDays} Hari Efektif</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Kuota Peserta Ideal:</span>
                    <span className="font-bold text-slate-900">{selectedSyllabus.recommendedPax} Peserta</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200/60 pt-2">
                    <span className="text-slate-700 font-semibold">Rate Card Honor Trainer:</span>
                    <span className="font-bold text-emerald-700 font-mono">
                      Rp {selectedSyllabus.trainerDailyRate.toLocaleString('id-ID')} / hari
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-[11px]">Estimasi Honor 1 Lead Trainer ({selectedSyllabus.durationDays}H):</span>
                    <span className="font-mono text-slate-700 font-bold">
                      Rp {(selectedSyllabus.trainerDailyRate * selectedSyllabus.durationDays).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Modules List */}
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Rancangan Modul Pembelajaran ({selectedSyllabus.modules.length} Sub-Topik)
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-700 max-h-48 overflow-y-auto pr-1">
                    {selectedSyllabus.modules.map((mod, idx) => (
                      <li key={idx} className="flex items-start space-x-2 bg-slate-50/70 p-2 rounded-lg border border-slate-100">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
                        <span>{mod}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Outcomes */}
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Hasil Capaian (Learning Outcomes)
                  </h3>
                  <ul className="space-y-1 text-xs text-slate-600">
                    {selectedSyllabus.learningOutcomes.map((outcome, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action CTA */}
                <div className="pt-2 space-y-2">
                  <button
                    onClick={() => {
                      if (onCreateProposalFromSyllabus) onCreateProposalFromSyllabus(selectedSyllabus);
                    }}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                  >
                    <FileSignature className="w-4 h-4 text-emerald-200" />
                    <span>Buat Proposal Penawaran dari Silabus Ini</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onApplySyllabusToProject) onApplySyllabusToProject(selectedSyllabus);
                      if (onNavigateToEstimator) onNavigateToEstimator();
                    }}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-teal-200" />
                    <span>Gunakan Silabus Ini di Estimasi HPP</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 2: EDITOR KATALOG & MANAJEMEN SILABUS (ADMIN / EDITOR) */}
      {/* ========================================================= */}
      {activeSubView === 'editor' && (
        <div className="space-y-5">
          {/* Quick Stats Summary Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Modul Silabus</span>
              <div className="text-xl font-extrabold text-slate-900 mt-1">{syllabuses.length}</div>
              <span className="text-[10px] text-teal-700 font-medium">Terdaftar di Sistem</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Jumlah Kategori</span>
              <div className="text-xl font-extrabold text-slate-900 mt-1">{categories.length - 1}</div>
              <span className="text-[10px] text-teal-700 font-medium">Rumpun Keahlian</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Rata-Rata Rate Card</span>
              <div className="text-xl font-extrabold text-emerald-700 font-mono mt-1">
                Rp{' '}
                {(
                  syllabuses.reduce((acc, curr) => acc + curr.trainerDailyRate, 0) /
                  (syllabuses.length || 1) /
                  1000000
                ).toFixed(1)}{' '}
                Jt
              </div>
              <span className="text-[10px] text-slate-500 font-medium">per Hari Instruktur</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Sub-Topik Modul</span>
              <div className="text-xl font-extrabold text-slate-900 mt-1">
                {syllabuses.reduce((acc, curr) => acc + curr.modules.length, 0)}
              </div>
              <span className="text-[10px] text-teal-700 font-medium">Materi Pembelajaran</span>
            </div>
          </div>

          {/* Action Toolbar for Batch Operations */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleOpenCreateModal}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Silabus</span>
              </button>

              <button
                onClick={handleExportJson}
                className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer border border-slate-200"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor JSON</span>
              </button>

              <label className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer border border-slate-200">
                <Upload className="w-3.5 h-3.5" />
                <span>Impor JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJson}
                  ref={fileInputRef}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleResetToDefault}
                className="flex items-center space-x-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition cursor-pointer border border-rose-200"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Standar Awal</span>
              </button>
            </div>

            <div className="relative shrink-0 w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter nama modul atau kode..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          {/* Table Editor for All Syllabuses */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Daftar Master Katalog Silabus &amp; Tarif Trainer ({filtered.length})
              </h2>
              <span className="text-[11px] text-slate-500">
                Data tersimpan otomatis secara lokal di peramban Anda.
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Kode</th>
                    <th className="py-3 px-4">Judul Silabus Pelatihan</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4 text-center">Durasi</th>
                    <th className="py-3 px-4 text-center">Kuota Pax</th>
                    <th className="py-3 px-4 text-right">Rate Card Honor / Hari</th>
                    <th className="py-3 px-4 text-center">Jumlah Modul</th>
                    <th className="py-3 px-4 text-center">Aksi Pengelolaan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        Tidak ada data silabus terdaftar.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 font-mono font-bold text-teal-800 shrink-0">
                          {item.code}
                        </td>
                        <td className="py-3 px-4">
                          <div
                            onClick={() => {
                              setSelectedSyllabus(item);
                              setIsDetailModalOpen(true);
                            }}
                            className="font-extrabold text-sm text-slate-900 hover:text-teal-700 cursor-pointer hover:underline transition"
                            title="Klik untuk melihat pratinjau detail silabus"
                          >
                            {item.title}
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {item.description}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-medium">
                          {item.durationDays} Hari
                        </td>
                        <td className="py-3 px-4 text-center font-medium">
                          {item.recommendedPax} Pax
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                          Rp {item.trainerDailyRate.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 bg-teal-50 text-teal-800 rounded font-bold text-[11px]">
                            {item.modules.length} Modul
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition"
                              title="Edit Silabus"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDuplicateSyllabus(item)}
                              className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                              title="Duplikat Silabus"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                setSelectedSyllabus(item);
                                setIsDetailModalOpen(true);
                              }}
                              className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                              title="Pratinjau Detail"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteSyllabus(item.id, item.title)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Hapus Silabus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FORM MODAL: TAMBAH & EDIT SILABUS & RATE CARD */}
      {/* ========================================================= */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">
                  EDITOR KATALOG TCMS
                </span>
                <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {editorMode === 'create' ? 'Tambah Silabus Pelatihan Baru' : `Edit Silabus: ${editingSyllabus?.code}`}
                </h2>
                <p className="text-xs text-slate-500">
                  Lengkapi struktur kurikulum, durasi pelaksanaan, kuota peserta, dan rate card honor instruktur.
                </p>
              </div>

              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
              {/* Row 1: Kode & Judul */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-4 space-y-1">
                  <label className="font-bold text-slate-700">Kode Silabus *</label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="Contoh: TCMS-LDR-01"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div className="sm:col-span-8 space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-700">Judul Program Pelatihan *</label>
                    <button
                      type="button"
                      onClick={handleAiAutoGenerate}
                      className="text-[10px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded-lg border border-teal-200 flex items-center space-x-1 cursor-pointer transition"
                    >
                      <Wand2 className="w-3 h-3 text-teal-600" />
                      <span>Otonom AI Generate</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Contoh: Executive Strategic Leadership & Agility"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 text-slate-900"
                  />
                </div>
              </div>

              {/* Row 2: Category & Custom Category */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-6 space-y-1">
                  <label className="font-bold text-slate-700">Kategori Rumpun Keahlian *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                  >
                    <option value="Leadership & Manajerial">Leadership &amp; Manajerial</option>
                    <option value="Digital & IT Transformation">Digital &amp; IT Transformation</option>
                    <option value="Finance & Risk Management">Finance &amp; Risk Management</option>
                    <option value="Operations & ESG">Operations &amp; ESG</option>
                    {customCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="LAINNYA">+ Kategori Kustom Baru</option>
                  </select>
                </div>

                {formCategory === 'LAINNYA' && (
                  <div className="sm:col-span-6 space-y-1">
                    <label className="font-bold text-slate-700">Nama Kategori Kustom *</label>
                    <input
                      type="text"
                      required
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Masukkan nama kategori baru..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                )}
              </div>

              {/* Row 3: Financial Reference Metrics (Durasi, Pax, Rate Card) */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Metrik Acuan Finansial &amp; POS 00 HPP
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600">Durasi (Hari Efektif)</label>
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        min={1}
                        max={30}
                        required
                        value={formDurationDays}
                        onChange={(e) => setFormDurationDays(Number(e.target.value))}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-center font-bold"
                      />
                      <span className="text-slate-500 shrink-0">Hari</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600">Kuota Peserta Ideal</label>
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        min={1}
                        max={200}
                        required
                        value={formRecommendedPax}
                        onChange={(e) => setFormRecommendedPax(Number(e.target.value))}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-center font-bold"
                      />
                      <span className="text-slate-500 shrink-0">Pax</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600">Rate Card Trainer / Hari</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-slate-400 font-bold">
                        Rp
                      </span>
                      <input
                        type="number"
                        step={500000}
                        required
                        value={formTrainerDailyRate}
                        onChange={(e) => setFormTrainerDailyRate(Number(e.target.value))}
                        className="w-full pl-8 pr-2 py-2 bg-white border border-slate-200 rounded-lg font-mono font-bold text-emerald-700"
                      />
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-slate-200 flex justify-between">
                  <span>Estimasi Total Honor 1 Instruktur Utama ({formDurationDays} Hari):</span>
                  <span className="font-mono font-bold text-slate-800">
                    Rp {(formTrainerDailyRate * formDurationDays).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Row 4: Deskripsi Program */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Deskripsi Singkat &amp; Ringkasan Program</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Penjelasan ringkas latar belakang dan fokus utama kurikulum pelatihan ini..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              {/* Row 5: Dynamic List for Sub-Topic Modules */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    Rancangan Modul Pembelajaran Sub-Topik ({formModules.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormModules([...formModules, ''])}
                    className="text-teal-700 hover:text-teal-900 font-bold text-[11px] flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Sub-Topik Modul</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {formModules.map((modText, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono text-slate-400 font-bold w-5 text-right">
                        #{idx + 1}
                      </span>
                      <input
                        type="text"
                        value={modText}
                        onChange={(e) => {
                          const updated = [...formModules];
                          updated[idx] = e.target.value;
                          setFormModules(updated);
                        }}
                        placeholder={`Judul modul sub-topik ${idx + 1}...`}
                        className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (formModules.length > 1) {
                            setFormModules(formModules.filter((_, i) => i !== idx));
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Hapus Sub-Topik Ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 6: Dynamic List for Learning Outcomes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    Hasil Capaian (Learning Outcomes) ({formLearningOutcomes.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormLearningOutcomes([...formLearningOutcomes, ''])}
                    className="text-emerald-700 hover:text-emerald-900 font-bold text-[11px] flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Learning Outcome</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {formLearningOutcomes.map((outcomeText, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 ml-2" />
                      <input
                        type="text"
                        value={outcomeText}
                        onChange={(e) => {
                          const updated = [...formLearningOutcomes];
                          updated[idx] = e.target.value;
                          setFormLearningOutcomes(updated);
                        }}
                        placeholder={`Capaian kompetensi ${idx + 1}...`}
                        className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (formLearningOutcomes.length > 1) {
                            setFormLearningOutcomes(formLearningOutcomes.filter((_, i) => i !== idx));
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Hapus Outcome Ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Silabus Catalog</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SYLLABUS DETAIL MODAL POPUP (PREVIEW OVERLAY) */}
      {/* ========================================================= */}
      {isDetailModalOpen && selectedSyllabus && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {selectedSyllabus.code}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-100">
                    {selectedSyllabus.category}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 mt-1.5 leading-snug">
                  {selectedSyllabus.title}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedSyllabus.description}
                </p>
              </div>

              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            {/* Financial Reference Box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">Durasi Pelaksanaan:</span>
                <span className="font-bold text-slate-900">{selectedSyllabus.durationDays} Hari Efektif</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">Kuota Peserta Ideal:</span>
                <span className="font-bold text-slate-900">{selectedSyllabus.recommendedPax} Peserta</span>
              </div>
              <div className="flex justify-between border-t border-slate-200/60 pt-2">
                <span className="text-slate-700 font-semibold">Rate Card Honor Trainer:</span>
                <span className="font-bold text-emerald-700 font-mono text-sm">
                  Rp {selectedSyllabus.trainerDailyRate.toLocaleString('id-ID')} / hari
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 text-[11px]">Estimasi Honor 1 Lead Trainer ({selectedSyllabus.durationDays}H):</span>
                <span className="font-mono text-slate-800 font-bold">
                  Rp {(selectedSyllabus.trainerDailyRate * selectedSyllabus.durationDays).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Modules List */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Rancangan Modul Pembelajaran ({selectedSyllabus.modules.length} Sub-Topik)
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                {selectedSyllabus.modules.map((mod, idx) => (
                  <li key={idx} className="flex items-start space-x-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                    <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                    <span className="font-medium text-slate-800">{mod}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Outcomes */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Hasil Capaian (Learning Outcomes)
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-600 bg-emerald-50/40 p-3 rounded-xl border border-emerald-100">
                {selectedSyllabus.learningOutcomes.map((outcome, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                    <span className="font-medium text-slate-700">{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleOpenEditModal(selectedSyllabus);
                }}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center space-x-1.5 border border-slate-200"
              >
                <Edit3 className="w-4 h-4 text-slate-500" />
                <span>Edit Silabus Ini</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  if (onCreateProposalFromSyllabus) onCreateProposalFromSyllabus(selectedSyllabus);
                }}
                className="w-full sm:flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                <FileSignature className="w-4 h-4 text-emerald-200" />
                <span>Buat Proposal Penawaran</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  if (onApplySyllabusToProject) onApplySyllabusToProject(selectedSyllabus);
                  if (onNavigateToEstimator) onNavigateToEstimator();
                }}
                className="w-full sm:flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-teal-200" />
                <span>Gunakan di Estimasi HPP</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
