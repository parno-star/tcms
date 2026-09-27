import React, { useState, useRef, useEffect } from 'react';
import { Employee } from '../types';
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Calendar,
  Briefcase,
  Edit3,
  CheckCircle2,
  ArrowLeft,
  Info,
  Award,
  Users,
  FileText,
  History,
  X,
  Save,
  Shield,
  Sparkles,
  ChevronRight,
  Camera,
  Upload,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  Check,
  Link,
  Sliders,
} from 'lucide-react';

interface UserProfileViewProps {
  currentEmployee: Employee;
  onUpdateEmployee?: (updated: Employee) => void;
  onNavigateHome?: () => void;
}

// Koleksi preset foto eksekutif profesional
const EXECUTIVE_AVATAR_PRESETS = [
  {
    id: 'preset-1',
    label: 'Eksekutif Pria 1',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset-2',
    label: 'Eksekutif Wanita 1',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset-3',
    label: 'Eksekutif Pria 2',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset-4',
    label: 'Eksekutif Wanita 2',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset-5',
    label: 'Eksekutif Pria Senior',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset-6',
    label: 'Eksekutif Wanita Formal',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  },
];

// Helper kompresi gambar client-side (maks 400x400px, 85% JPEG)
const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(dataUrl);
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = () => reject(new Error('Gagal memproses berkas gambar'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Gagal membaca berkas'));
    reader.readAsDataURL(file);
  });
};

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  currentEmployee,
  onUpdateEmployee,
  onNavigateHome,
}) => {
  const [activeTab, setActiveTab] = useState<'contact' | 'colleagues' | 'documents' | 'history'>('contact');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // Get Indonesian corporate realistic extra fields (Alamat, Tanggal Lahir, Atasan Jabatan)
  const getEmployeeExtraData = (emp: Employee) => {
    let alamat = emp.companyAddress || '';
    let tglLahir = emp.createdDate || '';
    let atasanJabatan = emp.approvedBy || '';
    
    const index = parseInt(emp.id.replace(/\D/g, '')) || 0;

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

    return { alamat, tglLahir, atasanJabatan, index: index || 1 };
  };

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

  // File input refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoModalFileInputRef = useRef<HTMLInputElement>(null);
  const editModalFileInputRef = useRef<HTMLInputElement>(null);

  // Temporary photo state for Photo Modal
  const [tempAvatarUrl, setTempAvatarUrl] = useState<string>(currentEmployee.avatarUrl || '');
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Editable Form State
  const [formData, setFormData] = useState({
    name: currentEmployee.name || 'CIP 2017',
    title: currentEmployee.title || 'Belum ada jabatan',
    email: currentEmployee.email || 'cipkai2017@gmail.com',
    phone: currentEmployee.phone || '+628128052324',
    department: currentEmployee.department || 'Manajemen Eksekutif',
    location: currentEmployee.location || 'Jakarta Pusat',
    nik: currentEmployee.nik || 'EMP-2026-001',
    bio: currentEmployee.description || 'Pensiun BUMN',
    avatarUrl: currentEmployee.avatarUrl || '',
    avatarBg: currentEmployee.avatarBg || 'bg-teal-700 text-white',
    startDate: '5 Maret 2024',
    dob: '12 Agustus 1970',
    manager: 'Dewan Komisaris',
    skills: ['Manajemen Proyek BUMN', 'Pengendalian HPP & Margin', 'Tata Kelola TCMS', 'Aplikasi Presales'],
  });

  const [newSkill, setNewSkill] = useState('');

  // Keep form data and temp avatar in sync with currentEmployee prop
  useEffect(() => {
    if (currentEmployee) {
      setFormData((prev) => ({
        ...prev,
        name: currentEmployee.name || prev.name,
        title: currentEmployee.title || prev.title,
        email: currentEmployee.email || prev.email,
        phone: currentEmployee.phone || prev.phone,
        department: currentEmployee.department || prev.department,
        location: currentEmployee.location || prev.location,
        nik: currentEmployee.nik || prev.nik,
        bio: currentEmployee.description || prev.bio,
        avatarUrl: currentEmployee.avatarUrl !== undefined ? currentEmployee.avatarUrl : prev.avatarUrl,
        avatarBg: currentEmployee.avatarBg || prev.avatarBg,
      }));
      setTempAvatarUrl(currentEmployee.avatarUrl || '');
    }
  }, [currentEmployee]);

  // Toast feedback helper
  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Generate initials fallback
  const getInitials = (nameStr: string) => {
    return (
      nameStr
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase() || 'US'
    );
  };

  // Save all profile data
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const initials = getInitials(formData.name);

    if (onUpdateEmployee) {
      onUpdateEmployee({
        ...currentEmployee,
        name: formData.name,
        title: formData.title,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        location: formData.location,
        nik: formData.nik,
        description: formData.bio,
        avatarUrl: formData.avatarUrl,
        avatarText: initials,
      });
    }
    setIsEditModalOpen(false);
    showToast('Data profil dan foto berhasil disimpan.');
  };

  // Direct Photo Change Handler (Upload from file input)
  const handleFileUpload = async (file: File, isFromModal = false) => {
    if (!file.type.startsWith('image/')) {
      setPhotoError('Format berkas harus berupa gambar (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setPhotoError('Ukuran gambar maksimal 8MB.');
      return;
    }

    try {
      setIsUploading(true);
      setPhotoError(null);
      const compressedDataUrl = await compressImageFile(file);

      if (isFromModal) {
        setTempAvatarUrl(compressedDataUrl);
      } else {
        // Direct update from avatar button or edit modal
        setFormData((prev) => ({ ...prev, avatarUrl: compressedDataUrl }));
        setTempAvatarUrl(compressedDataUrl);
        setImageLoadError(false);
        if (onUpdateEmployee) {
          onUpdateEmployee({
            ...currentEmployee,
            avatarUrl: compressedDataUrl,
          });
        }
        showToast('Foto profil berhasil diunggah.');
      }
    } catch (err: any) {
      setPhotoError('Gagal memproses foto. Silakan coba berkas gambar lain.');
    } finally {
      setIsUploading(false);
    }
  };

  // Apply photo from Photo Modal
  const handleSavePhotoModal = () => {
    setFormData((prev) => ({ ...prev, avatarUrl: tempAvatarUrl }));
    setImageLoadError(false);
    if (onUpdateEmployee) {
      onUpdateEmployee({
        ...currentEmployee,
        avatarUrl: tempAvatarUrl,
      });
    }
    setIsPhotoModalOpen(false);
    showToast(tempAvatarUrl ? 'Foto profil berhasil diperbarui.' : 'Foto profil dihapus (menggunakan inisial nama).');
  };

  // Remove photo (revert to initials)
  const handleRemovePhoto = (inModal = false) => {
    if (inModal) {
      setTempAvatarUrl('');
    } else {
      setFormData((prev) => ({ ...prev, avatarUrl: '' }));
      if (onUpdateEmployee) {
        onUpdateEmployee({
          ...currentEmployee,
          avatarUrl: '',
        });
      }
      showToast('Foto profil dihapus (menggunakan inisial nama).');
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const activeAvatarUrl = formData.avatarUrl || currentEmployee.avatarUrl;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10 animate-fade-in">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-semibold animate-fade-in border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Hidden File Input for Direct Avatar Click */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file, false);
          e.target.value = '';
        }}
      />

      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
        <button
          onClick={onNavigateHome}
          className="flex items-center space-x-1.5 text-slate-600 hover:text-teal-700 transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
          <span>Kembali ke Beranda</span>
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-slate-900 font-bold">Data Profil Saya</span>
      </div>

      {/* Page Heading */}
      <div className="text-center py-2">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Data Profil &amp; Identitas Pengguna</h1>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Header Banner Background */}
        <div className="h-28 bg-gradient-to-r from-slate-100 via-teal-50/50 to-slate-100 border-b border-slate-200/60 relative" />

        {/* Profile Details Header */}
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-4">
            {/* Avatar with Camera Overlay & Info */}
            <div className="flex items-end space-x-4">
              <div className="relative group">
                {/* Avatar Display Box */}
                <div
                  onClick={() => {
                    setTempAvatarUrl(activeAvatarUrl || '');
                    setPhotoError(null);
                    setIsPhotoModalOpen(true);
                  }}
                  className="w-24 h-24 rounded-2xl bg-teal-800 text-white flex items-center justify-center text-2xl font-bold border-4 border-white shadow-md overflow-hidden bg-cover bg-center cursor-pointer relative group/avatar transition-transform hover:scale-[1.02]"
                  title="Klik untuk kelola foto profil (Ganti, Unggah, atau Hapus Foto)"
                >
                  {activeAvatarUrl && !imageLoadError ? (
                    <img
                      src={activeAvatarUrl}
                      alt={formData.name}
                      onError={() => setImageLoadError(true)}
                      className="w-full h-full object-cover transition duration-200 group-hover/avatar:scale-105"
                    />
                  ) : (
                    <span className="text-teal-100 font-mono text-2xl font-extrabold">
                      {getInitials(formData.name)}
                    </span>
                  )}

                  {/* Hover Camera Overlay */}
                  <div className="absolute inset-0 bg-slate-900/65 backdrop-blur-2xs opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold space-y-1 text-center p-1">
                    <Camera className="w-5 h-5 text-teal-300" />
                    <span>Kelola Foto</span>
                    <span className="text-[9px] text-teal-200 font-normal">Ganti / Hapus</span>
                  </div>
                </div>

                {/* Camera Quick Button Badge */}
                <button
                  type="button"
                  onClick={() => {
                    setTempAvatarUrl(activeAvatarUrl || '');
                    setPhotoError(null);
                    setIsPhotoModalOpen(true);
                  }}
                  className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white shadow-md border-2 border-white transition transform hover:scale-110 cursor-pointer"
                  title="Klik untuk kelola foto profil"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="pb-1">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold text-slate-900">{formData.name}</h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-purple-100 text-purple-800 border border-purple-200">
                    {currentEmployee.role === 'super_admin' ? 'Super Admin' : currentEmployee.role}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-500 mt-0.5">{formData.title}</p>
              </div>
            </div>

            {/* Actions Right */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs"
              >
                <Edit3 className="w-3.5 h-3.5 text-teal-300" />
                <span>Edit Profil Saya</span>
              </button>
            </div>
          </div>

          {/* Bio / Summary Box */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs text-slate-700 font-medium">
            <span className="text-slate-400 font-mono text-[10px] uppercase block mb-0.5">Catatan &amp; Bio</span>
            <p>{formData.bio}</p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200/80 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('contact')}
          className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer ${
            activeTab === 'contact'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Kontak &amp; Keahlian
        </button>
        <button
          onClick={() => setActiveTab('colleagues')}
          className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer ${
            activeTab === 'colleagues'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Rekan Kerja
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer ${
            activeTab === 'documents'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Dokumen
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer ${
            activeTab === 'history'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Riwayat
        </button>
      </div>

      {/* TAB CONTENT: Kontak & Keahlian */}
      {activeTab === 'contact' && (
        <div className="space-y-6">
          {/* Card 1: DATA KARYAWAN */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-5">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <User className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">DATA KARYAWAN</h3>
            </div>

            {(() => {
              const { alamat, tglLahir, atasanJabatan, index } = getEmployeeExtraData(currentEmployee);
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-xs">
                  {/* Column 1 */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">NO.</span>
                      <span className="col-span-2 font-semibold text-slate-800">{index}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 items-center">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">NAMA</span>
                      <span className="col-span-2 font-bold text-slate-900">{formData.name}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 items-center">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">NIP / NIK</span>
                      <span className="col-span-2 font-semibold text-slate-800">{formData.nik || '—'}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 items-center">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">JABATAN</span>
                      <span className="col-span-2 font-semibold text-slate-800">{formData.title || '—'}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 items-center">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">DEPARTEMEN</span>
                      <span className="col-span-2 font-semibold text-slate-800">{formData.department || '—'}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 items-center">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">KEDUDUKAN</span>
                      <span className="col-span-2 font-semibold text-slate-800">
                        <span className="px-2 py-0.5 text-[10.5px] font-bold rounded-md bg-teal-50 text-teal-900 border border-teal-200 shadow-3xs">
                          {getKedudukan(currentEmployee)}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Column 2 */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">ATASAN</span>
                      <span className="col-span-2 font-semibold text-slate-800">{atasanJabatan}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 items-center">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">TELEPON</span>
                      <span className="col-span-2 font-semibold text-teal-800 font-mono">{formData.phone || '—'}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 items-center">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">EMAIL</span>
                      <span className="col-span-2 font-semibold text-teal-800 font-mono">{formData.email}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 items-center">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">ALAMAT</span>
                      <span className="col-span-2 font-semibold text-slate-800 leading-tight">{alamat}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 items-center">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">TANGGAL LAHIR</span>
                      <span className="col-span-2 font-semibold text-slate-800">{tglLahir}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Information Callout */}
            <div className="pt-3 border-t border-slate-100 flex items-start space-x-2.5 text-slate-500 text-[11px] leading-relaxed bg-slate-50 p-3 rounded-xl">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                Klik pada foto profil Anda untuk mengganti atau menghapus foto profil, atau klik tombol "<strong>Edit Profil Saya</strong>" untuk memperbarui data identitas, kontak telepon, bio, dan keahlian Anda.
              </span>
            </div>
          </div>

          {/* Card 2: KEAHLIAN & KOMPETENSI */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Award className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">KEAHLIAN &amp; KOMPETENSI</h3>
            </div>

            {formData.skills.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">
                Belum ada keahlian yang terdaftar. Gunakan tombol "Edit Profil" untuk menambahkan keahlian Anda.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
                {formData.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200/80 text-xs font-semibold"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Rekan Kerja */}
      {activeTab === 'colleagues' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4 text-xs">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Users className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">REKAN KERJA SATU TIM / ORGANISASI</h3>
          </div>
          <p className="text-slate-600">
            Berikut adalah daftar rekan kerja terdaftar dalam organisasi tenant PT Star Office Solusi:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="p-3 border border-slate-200 rounded-xl bg-slate-50 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-teal-700 text-white font-bold flex items-center justify-center text-xs">
                BS
              </div>
              <div>
                <div className="font-bold text-slate-900">Bambang Setyono</div>
                <div className="text-[11px] text-slate-500">VP Presales &amp; Tendering</div>
              </div>
            </div>
            <div className="p-3 border border-slate-200 rounded-xl bg-slate-50 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-700 text-white font-bold flex items-center justify-center text-xs">
                DW
              </div>
              <div>
                <div className="font-bold text-slate-900">Dwi Wahyuni</div>
                <div className="text-[11px] text-slate-500">Cost Control &amp; Auditor</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Dokumen */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4 text-xs">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <FileText className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">DOKUMEN PERSONEL &amp; KONTRAK</h3>
          </div>
          <div className="space-y-2">
            <div className="p-3 border border-slate-200 rounded-xl flex items-center justify-between hover:bg-slate-50 transition">
              <span className="font-semibold text-slate-800">SK_Pengangkatan_Eksekutif_2024.pdf</span>
              <span className="text-[10px] text-teal-700 font-mono font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                VERIFIED
              </span>
            </div>
            <div className="p-3 border border-slate-200 rounded-xl flex items-center justify-between hover:bg-slate-50 transition">
              <span className="font-semibold text-slate-800">Sertifikat_Pelatihan_Tata_Kelola_HPP.pdf</span>
              <span className="text-[10px] text-teal-700 font-mono font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                VERIFIED
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Riwayat */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4 text-xs">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <History className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">RIWAYAT AKTIVITAS &amp; OTORISASI</h3>
          </div>
          <div className="space-y-3">
            <div className="text-slate-600 border-l-2 border-teal-500 pl-3 py-1">
              <div className="font-bold text-slate-900">Persetujuan RAP Proyek Pelatihan BUMN</div>
              <div className="text-[11px] text-slate-400">Hari ini, 09:15 WIB • Otorisasi Eksekutif</div>
            </div>
            <div className="text-slate-600 border-l-2 border-slate-300 pl-3 py-1">
              <div className="font-bold text-slate-900">Masuk Sesi Sistem (OTP Verified)</div>
              <div className="text-[11px] text-slate-400">Kemarin, 14:20 WIB • IP: 180.252.xx.xx</div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* Modal Edit Profil Saya (Comprehensive Edit) */}
      {/* ========================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">Edit Profil Saya</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Hidden direct file input for Edit Profile Modal */}
            <input
              type="file"
              ref={editModalFileInputRef}
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, false);
                e.target.value = '';
              }}
            />

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              {/* Bagian Foto Profil di Dalam Form Edit */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div
                    onClick={() => editModalFileInputRef.current?.click()}
                    className="w-14 h-14 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold text-base border-2 border-white shadow-xs overflow-hidden shrink-0 cursor-pointer relative group/editAvatar"
                    title="Klik untuk memilih foto dari komputer/HP"
                  >
                    {formData.avatarUrl ? (
                      <img
                        src={formData.avatarUrl}
                        alt="Avatar"
                        className="w-full h-full object-cover group-hover/editAvatar:scale-105 transition"
                      />
                    ) : (
                      <span className="font-mono text-sm font-extrabold text-teal-100">
                        {getInitials(formData.name)}
                      </span>
                    )}
                    <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover/editAvatar:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[9px] font-bold">
                      <Camera className="w-4 h-4 text-teal-300" />
                      <span>Ubah</span>
                    </div>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">Foto Profil Pengguna</span>
                    <span className="text-[10px] text-slate-500">
                      {formData.avatarUrl ? 'Foto kustom aktif' : 'Inisial nama sistem'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center flex-wrap gap-2">
                  {/* Button 1: Unggah Foto Langsung dari Komputer/HP */}
                  <button
                    type="button"
                    onClick={() => editModalFileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-bold flex items-center space-x-1.5 cursor-pointer shadow-2xs text-xs"
                    title="Pilih dan unggah berkas foto langsung dari komputer / HP"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? 'Memproses...' : 'Unggah Foto'}</span>
                  </button>

                  {/* Button 2: Buka Dialog Preset / URL */}
                  <button
                    type="button"
                    onClick={() => {
                      setTempAvatarUrl(formData.avatarUrl || '');
                      setPhotoError(null);
                      setIsPhotoModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg font-bold flex items-center space-x-1.5 cursor-pointer text-xs"
                    title="Pilih dari preset foto eksekutif atau masukkan URL tautan"
                  >
                    <Camera className="w-3.5 h-3.5 text-teal-700" />
                    <span>Preset / URL</span>
                  </button>

                  {formData.avatarUrl && (
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(false)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                      title="Hapus Foto (Kembalikan ke inisial)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jabatan</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Departemen</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. Telepon / WA</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan / Bio Singkat</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              {/* Keahlian & Kompetensi Input */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tambah Keahlian &amp; Kompetensi</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Contoh: Audit HPP, Presales, Konsultansi BUMN"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-semibold"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3 py-1.5 bg-teal-800 text-white rounded-xl font-bold hover:bg-teal-900 cursor-pointer"
                  >
                    Tambah
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {formData.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 bg-teal-50 text-teal-800 border border-teal-200 text-[11px] rounded-lg font-bold"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-teal-600 hover:text-rose-600 ml-1 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold flex items-center space-x-2 shadow-2xs cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL GANTI FOTO PROFIL (FOCUSED PHOTO PICKER) */}
      {/* ========================================== */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-[80] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] z-[90]">
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Camera className="w-4 h-4 text-teal-400" />
                <div>
                  <h3 className="text-sm font-bold leading-tight">Kelola Foto Profil</h3>
                  <p className="text-[10px] text-slate-300">Unggah foto baru, pilih preset, atau hapus foto profil</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              {/* Preview Box */}
              <div className="flex flex-col items-center justify-center text-center space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="w-24 h-24 rounded-full bg-teal-800 text-white flex items-center justify-center text-2xl font-bold border-4 border-white shadow-md overflow-hidden bg-cover bg-center">
                  {tempAvatarUrl ? (
                    <img
                      src={tempAvatarUrl}
                      alt="Pratinjau Foto"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-teal-100 font-mono text-2xl font-extrabold">
                      {getInitials(formData.name)}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-semibold text-slate-600">
                  {tempAvatarUrl ? 'Pratinjau Foto Terpilih' : 'Menggunakan Inisial Nama'}
                </span>
                {tempAvatarUrl && (
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(true)}
                    className="text-[10px] text-rose-600 hover:text-rose-800 font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Hapus &amp; Kembalikan ke Inisial</span>
                  </button>
                )}
              </div>

              {/* Error Alert */}
              {photoError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-[11px] flex items-center space-x-2">
                  <X className="w-3.5 h-3.5 shrink-0" />
                  <span>{photoError}</span>
                </div>
              )}

              {/* Option 1: File Upload from Computer / HP */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  1. Unggah Berkas Foto dari Perangkat
                </label>
                <input
                  type="file"
                  ref={photoModalFileInputRef}
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, true);
                    e.target.value = '';
                  }}
                />
                <div
                  onClick={() => photoModalFileInputRef.current?.click()}
                  className="border-2 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/40 hover:bg-teal-50/80 rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-1 group"
                >
                  <Upload className="w-6 h-6 text-teal-600 group-hover:scale-110 transition" />
                  <span className="font-bold text-slate-800 text-xs">
                    {isUploading ? 'Memproses berkas foto...' : 'Pilih Foto dari Komputer / HP'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Format JPG, PNG, atau WebP (Maks 8MB, otomatis dioptimasi)
                  </span>
                </div>
              </div>

              {/* Option 2: Curated Executive Presets */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  2. Atau Pilih dari Foto Eksekutif / Bisnis
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {EXECUTIVE_AVATAR_PRESETS.map((preset) => {
                    const isSelected = tempAvatarUrl === preset.url;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setTempAvatarUrl(preset.url);
                          setPhotoError(null);
                        }}
                        className={`relative rounded-xl overflow-hidden aspect-square border-2 transition cursor-pointer ${
                          isSelected
                            ? 'border-teal-600 ring-2 ring-teal-500/30 scale-105'
                            : 'border-slate-200 hover:border-teal-400'
                        }`}
                        title={preset.label}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-teal-900/40 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Option 3: Custom URL */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  3. Atau Masukkan Tautan / URL Foto
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/foto-saya.jpg"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customUrlInput.trim()) {
                        setTempAvatarUrl(customUrlInput.trim());
                        setCustomUrlInput('');
                        setPhotoError(null);
                      }
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold cursor-pointer transition"
                  >
                    Terapkan
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
              {formData.avatarUrl ? (
                <button
                  type="button"
                  onClick={() => {
                    handleRemovePhoto(false);
                    setIsPhotoModalOpen(false);
                  }}
                  className="px-3 py-2 rounded-xl text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 font-bold flex items-center space-x-1.5 transition cursor-pointer text-xs"
                  title="Hapus foto profil saat ini dan kembalikan ke inisial nama"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Hapus Foto Profil</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 cursor-pointer text-xs"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSavePhotoModal}
                  className="px-5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold flex items-center space-x-1.5 shadow-2xs cursor-pointer text-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan Foto Profil</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
