import React, { useState, useEffect } from 'react';
import { VendorPartner } from '../types';
import { VENDOR_PARTNERS } from '../data/initialData';
import {
  Building2,
  Star,
  ShieldCheck,
  MapPin,
  Search,
  FileCheck,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Phone,
  Mail,
  X,
} from 'lucide-react';

interface VendorDirectoryViewProps {
  onSelectVendorForPO?: (vendor: VendorPartner) => void;
  onNavigateToRap?: () => void;
  isSimulationMode?: boolean;
}

export const VendorDirectoryView: React.FC<VendorDirectoryViewProps> = ({
  onSelectVendorForPO,
  onNavigateToRap,
  isSimulationMode = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Mode Training Vendors: Data rekanan demo/simulasi
  const [trainingVendors, setTrainingVendors] = useState<VendorPartner[]>(() => {
    try {
      const stored = localStorage.getItem('tcms_training_vendors');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return VENDOR_PARTNERS;
  });

  // Mode Operasional Vendors: Data rekanan riil operasional
  const [operationalVendors, setOperationalVendors] = useState<VendorPartner[]>(() => {
    try {
      const stored = localStorage.getItem('tcms_operational_vendors');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tcms_training_vendors', JSON.stringify(trainingVendors));
    } catch {
      // ignore
    }
  }, [trainingVendors]);

  useEffect(() => {
    try {
      localStorage.setItem('tcms_operational_vendors', JSON.stringify(operationalVendors));
    } catch {
      // ignore
    }
  }, [operationalVendors]);

  // Data mitra yang ditampilkan: HANYA data training jika mode training aktif, atau data operasional jika mode operasional
  const activeVendors = isSimulationMode ? trainingVendors : operationalVendors;

  // Modal Tambah Mitra
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorCategory, setNewVendorCategory] = useState<VendorPartner['category']>('Hotel & Venue');
  const [newVendorCity, setNewVendorCity] = useState('');
  const [newVendorCp, setNewVendorCp] = useState('');
  const [newVendorPhone, setNewVendorPhone] = useState('');
  const [newVendorEmail, setNewVendorEmail] = useState('');
  const [newVendorRate, setNewVendorRate] = useState('');
  const [newVendorStatus, setNewVendorStatus] = useState<VendorPartner['activeStatus']>('Mitra Terverifikasi');
  const [notification, setNotification] = useState<string | null>(null);

  const categories = [
    'Semua',
    'Hotel & Venue',
    'Percetakan & Training Kit',
    'Catering & F&B',
    'Souvenir & Plakat',
    'Transportasi & Logistik',
  ];

  const filtered = activeVendors.filter((vendor) => {
    const matchCat = selectedCategory === 'Semua' || vendor.category === selectedCategory;
    const matchSearch =
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorName.trim()) return;

    const newVendor: VendorPartner = {
      id: `vnd-${Date.now()}`,
      name: newVendorName.trim(),
      category: newVendorCategory,
      city: newVendorCity.trim() || 'Jakarta',
      rating: 4.8,
      contactPerson: newVendorCp.trim() || 'PIC Operasional',
      phone: newVendorPhone.trim() || '+62 812-0000-0000',
      email: newVendorEmail.trim() || 'vendor@example.com',
      averageRate: newVendorRate.trim() || 'Tarif penawaran standar',
      activeStatus: newVendorStatus,
      slaComplianceRate: 98.0,
    };

    if (isSimulationMode) {
      setTrainingVendors((prev) => [newVendor, ...prev]);
      setNotification(`Mitra "${newVendor.name}" berhasil ditambahkan ke Direktori Mode Training.`);
    } else {
      setOperationalVendors((prev) => [newVendor, ...prev]);
      setNotification(`Mitra operasional "${newVendor.name}" berhasil didaftarkan ke Direktori Mode Operasional.`);
    }

    setIsAddModalOpen(false);
    setNewVendorName('');
    setNewVendorCity('');
    setNewVendorCp('');
    setNewVendorPhone('');
    setNewVendorEmail('');
    setNewVendorRate('');
  };

  const handleDeleteVendor = (id: string, name: string) => {
    if (isSimulationMode) {
      setTrainingVendors((prev) => prev.filter((v) => v.id !== id));
      setNotification(`Mitra "${name}" telah dihapus dari Direktori Mode Training.`);
    } else {
      setOperationalVendors((prev) => prev.filter((v) => v.id !== id));
      setNotification(`Mitra "${name}" telah dihapus dari Direktori Mode Operasional.`);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Toast Notification */}
      {notification && (
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{notification}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold px-1 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Mode Status & Controller Banner */}
      <div
        className={`rounded-2xl border p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isSimulationMode
            ? 'bg-amber-50/80 border-amber-200 text-amber-900'
            : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}
      >
        <div className="flex items-start sm:items-center space-x-3">
          <div
            className={`p-2 rounded-xl shrink-0 ${
              isSimulationMode ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {isSimulationMode ? <Sparkles className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  isSimulationMode
                    ? 'bg-amber-200/90 text-amber-900 font-mono'
                    : 'bg-slate-200 text-slate-700 font-mono'
                }`}
              >
                {isSimulationMode ? 'Mode Training Aktif' : 'Mode Operasional Aktif'}
              </span>
              <span className="text-xs text-slate-500">
                • {activeVendors.length} Rekanan Terdaftar
              </span>
            </div>
            <p className="text-xs font-medium mt-0.5">
              {isSimulationMode
                ? 'Data rekanan & vendor pelatihan demo aktif (Grand Hyatt, Prima Grafika, Boga Rasa, dll). Siap digunakan untuk simulasi pengadaan PO.'
                : 'Data rekanan demo tersimpan khusus di Mode Training dan tidak ditampilkan di sini. Direktori ini khusus untuk vendor riil operasional.'}
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center space-x-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/60">
          <span className="text-[11px] font-semibold text-slate-500 bg-white/80 border border-slate-200/80 px-2.5 py-1 rounded-lg">
            Mode Training dikelola di Akun Super Admin
          </span>
        </div>
      </div>

      {/* Header & Action Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <Building2 className="w-5 h-5" />
            </span>
            <h1 className="text-base sm:text-lg font-bold text-slate-900">
              Direktori Mitra Rekanan &amp; Vendor Pelatihan
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Basis data rekanan terverifikasi (POS 01 Labor, POS 02 Hospitality, POS 03 Kit, POS 04 Venue, POS 05 Overhead) dengan catatan SLA kepatuhan,
            tarif kontrak payung, dan integrasi penerbitan Surat Perintah Kerja / Purchase Order resmi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama vendor, kota..."
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-600 active:scale-95 text-white text-xs font-bold rounded-lg transition cursor-pointer shadow-xs flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Mitra</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-1.5 text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              selectedCategory === cat
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Vendor Cards Grid or Empty State */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-4 shadow-2xs">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              {!isSimulationMode
                ? 'Data Mitra & Vendor Tersimpan di Mode Training'
                : 'Tidak Ada Mitra yang Sesuai'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {!isSimulationMode
                ? 'Data mitra rekanan demo/simulasi hanya muncul saat Mode Training aktif. Pada Mode Operasional, direktori ini bersih dan siap digunakan untuk mendaftarkan mitra vendor riil organisasi Anda.'
                : 'Tidak ditemukan data mitra rekanan untuk filter pencarian atau kategori yang dipilih.'}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Daftarkan Mitra Baru</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((vendor) => (
            <div
              key={vendor.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:shadow-sm transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-100">
                      {vendor.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1.5 leading-snug">
                      {vendor.name}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-1 shrink-0">
                    <span className="flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>{vendor.activeStatus}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteVendor(vendor.id, vendor.name)}
                      className="p-1 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
                      title="Hapus Rekanan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Vendor Specs */}
                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{vendor.city}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                    <span className="font-semibold text-slate-800">{vendor.rating} / 5.0</span>
                    <span className="text-slate-400">• SLA:</span>
                    <span className="font-semibold text-emerald-700">{vendor.slaComplianceRate}% Tepat Waktu</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Kontak: <strong>{vendor.phone}</strong></span>
                  </div>
                  {vendor.email && (
                    <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{vendor.email}</span>
                    </div>
                  )}
                </div>

                {/* Price range */}
                <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <span className="text-[10px] text-slate-400 block font-semibold">Tarif Kontrak Acuan:</span>
                  <span className="font-semibold text-slate-800">{vendor.averageRate}</span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="text-slate-500 text-[11px]">
                  CP: <span className="font-medium text-slate-700">{vendor.contactPerson}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectVendorForPO) onSelectVendorForPO(vendor);
                    if (onNavigateToRap) onNavigateToRap();
                  }}
                  className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg text-xs transition cursor-pointer shadow-2xs flex items-center space-x-1"
                >
                  <FileCheck className="w-3 h-3" />
                  <span>Pilih &amp; Buat PO</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Tambah Mitra Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="bg-teal-900 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-teal-300" />
                  <span>
                    Tambah Mitra Rekanan ({isSimulationMode ? 'Mode Training' : 'Mode Operasional'})
                  </span>
                </h3>
                <p className="text-[11px] text-teal-200 mt-0.5">
                  Daftarkan vendor mitra baru untuk pengadaan pos anggaran pelatihan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-teal-200 hover:text-white text-xl font-bold cursor-pointer p-1"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddVendor} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Perusahaan / Vendor <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PT Prima Multi Media"
                  value={newVendorName}
                  onChange={(e) => setNewVendorName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kategori POS
                  </label>
                  <select
                    value={newVendorCategory}
                    onChange={(e) => setNewVendorCategory(e.target.value as VendorPartner['category'])}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden bg-white"
                  >
                    <option value="Hotel & Venue">Hotel & Venue</option>
                    <option value="Percetakan & Training Kit">Percetakan & Training Kit</option>
                    <option value="Catering & F&B">Catering & F&B</option>
                    <option value="Souvenir & Plakat">Souvenir & Plakat</option>
                    <option value="Transportasi & Logistik">Transportasi & Logistik</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kota Operasional
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: DKI Jakarta"
                    value={newVendorCity}
                    onChange={(e) => setNewVendorCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contact Person (PIC)
                  </label>
                  <input
                    type="text"
                    placeholder="Nama PIC Account"
                    value={newVendorCp}
                    onChange={(e) => setNewVendorCp(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    No. Telepon / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="+62 812-..."
                    value={newVendorPhone}
                    onChange={(e) => setNewVendorPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Vendor
                </label>
                <input
                  type="email"
                  placeholder="corporate@vendor.co.id"
                  value={newVendorEmail}
                  onChange={(e) => setNewVendorEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tarif Kontrak Acuan (Rate Card)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Rp 450.000 / pax / hari (Fullboard Meeting)"
                  value={newVendorRate}
                  onChange={(e) => setNewVendorRate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Penyimpanan Terisolasi Mode:</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isSimulationMode
                    ? 'Data mitra ini akan disimpan ke dalam Direktori Mode Training (Simulasi) dan hanya tampil saat mode training aktif.'
                    : 'Data mitra ini akan disimpan ke dalam Direktori Mode Operasional untuk kebutuhan riil perusahaan.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Simpan Mitra</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
